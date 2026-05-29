import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;

  try {
    const sessions: any[] = [];

    await ensureIndexes(env.DB);

    const auditResults = await env.DB.prepare(`
      SELECT al.user_id, al.exam_id, u.name as user_name,
             MAX(al.timestamp) as last_activity
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      GROUP BY al.user_id, al.exam_id, u.name
      ORDER BY last_activity DESC
    `).all();

    const examResults = await env.DB.prepare(`
      SELECT er.user_id, er.exam_id, er.started_at, er.completed_at, 
             u.name as user_name
      FROM exam_records er
      LEFT JOIN users u ON er.user_id = u.id
    `).all();

    const examMap = new Map<string, any>();
    for (const row of examResults.results || []) {
      const key = `${row.user_id}_${row.exam_id}`;
      examMap.set(key, row);
    }

    const tabSwitchResults = await env.DB.prepare(`
      SELECT al.user_id, al.exam_id, al.event_data
      FROM audit_logs al
      WHERE al.event_type = 'tab_switch'
      AND al.timestamp = (
        SELECT MAX(al2.timestamp) 
        FROM audit_logs al2 
        WHERE al2.user_id = al.user_id 
        AND al2.exam_id = al.exam_id 
        AND al2.event_type = 'tab_switch'
      )
    `).all();

    const tabSwitchMap = new Map<string, number>();
    for (const row of tabSwitchResults.results || []) {
      const key = `${row.user_id}_${row.exam_id}`;
      try {
        const data = typeof row.event_data === 'string' 
          ? JSON.parse(row.event_data) 
          : row.event_data;
        tabSwitchMap.set(key, data.count || 0);
      } catch {
        tabSwitchMap.set(key, 0);
      }
    }

    const allKeys = new Set<string>();
    for (const row of auditResults.results || []) {
      allKeys.add(`${row.user_id}_${row.exam_id}`);
    }
    for (const row of examResults.results || []) {
      allKeys.add(`${row.user_id}_${row.exam_id}`);
    }

    for (const key of allKeys) {
      const auditRow = Array.from(auditResults.results || []).find(
        r => `${r.user_id}_${r.exam_id}` === key
      );
      const examRow = examMap.get(key);

      if (!auditRow && !examRow) continue;

      const userId = auditRow?.user_id || examRow?.user_id;
      const examId = auditRow?.exam_id || examRow?.exam_id;
      const userName = auditRow?.user_name || examRow?.user_name || '未知用户';
      const tabSwitchCount = tabSwitchMap.get(key) || 0;

      let startTime = Date.now();
      let status = 'ongoing';

      if (examRow) {
        if (examRow.started_at) {
          if (typeof examRow.started_at === 'number') {
            startTime = examRow.started_at;
          } else if (typeof examRow.started_at === 'string') {
            const parsed = parseFloat(examRow.started_at);
            startTime = !isNaN(parsed) ? parsed : new Date(examRow.started_at).getTime();
          } else {
            startTime = new Date(examRow.started_at).getTime();
          }
        }
        status = examRow.completed_at ? 'submitted' : 'ongoing';
      } else if (auditRow?.last_activity) {
        startTime = typeof auditRow.last_activity === 'number' 
          ? auditRow.last_activity 
          : Date.now();
      }

      sessions.push({
        examId,
        userId,
        userName,
        status,
        tabSwitchCount,
        startTime,
      });
    }

    sessions.sort((a, b) => b.startTime - a.startTime);

    return new Response(
      JSON.stringify({ ok: true, sessions, total: sessions.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching invigilation data:', error);
    return new Response(
      JSON.stringify({ ok: false, error: '获取监考数据失败', details: error instanceof Error ? error.message : 'unknown' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.endsWith('/reset')) {
    return handleResetTabSwitch(request, env);
  } else if (pathname.endsWith('/clear-violation')) {
    return handleClearViolation(request, env);
  }

  return new Response(
    JSON.stringify({ ok: false, error: '无效的端点' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleResetTabSwitch(request: Request, env: Env) {
  try {
    const body = await request.json();
    const { userId, examId } = body;

    if (!userId || !examId) {
      return new Response(
        JSON.stringify({ ok: false, error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await env.DB.prepare(`
      INSERT INTO audit_logs (user_id, exam_id, event_type, event_data, timestamp)
      VALUES (?, ?, 'tab_switch', ?, ?)
    `).bind(userId, examId, JSON.stringify({ count: 0, reason: 'reset by admin' }), Date.now()).run();

    return new Response(
      JSON.stringify({ ok: true, message: '切屏次数已重置' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error resetting tab switch:', error);
    return new Response(
      JSON.stringify({ ok: false, error: '重置失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleClearViolation(request: Request, env: Env) {
  try {
    const body = await request.json();
    const { userId, examId } = body;

    if (!userId || !examId) {
      return new Response(
        JSON.stringify({ ok: false, error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await env.DB.prepare(`
      DELETE FROM exam_violations WHERE exam_id = ? AND user_id = ?
    `).bind(examId, userId).run();

    return new Response(
      JSON.stringify({ ok: true, message: '违规记录已清除' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error clearing violation:', error);
    return new Response(
      JSON.stringify({ ok: false, error: '清除失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function ensureIndexes(db: D1Database): Promise<void> {
  try {
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_users_created_at 
      ON users (created_at)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_user 
      ON exam_records (user_id)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_user_exam 
      ON exam_records (user_id, exam_id)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_exam 
      ON exam_records (exam_id)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_exam_event 
      ON audit_logs (user_id, exam_id, event_type)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_exam 
      ON audit_logs (user_id, exam_id)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_violations_exam_user 
      ON exam_violations (exam_id, user_id)
    `).run();
  } catch (error) {
    console.warn('Index creation failed (may already exist):', error);
  }
}
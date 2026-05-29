import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;

  try {
    const sessions: any[] = [];

    await ensureIndexes(env.DB);

    // 获取所有用户
    const usersResult = await env.DB.prepare(`SELECT id, name FROM users`).all();
    const userMap = new Map<string, string>();
    for (const row of usersResult.results || []) {
      userMap.set(row.id, row.name);
    }

    // 一次性获取所有需要的 audit_logs 数据（包括最后活动时间和最新切屏计数）
    const auditResult = await env.DB.prepare(`
      SELECT user_id, exam_id, event_type, event_data, timestamp
      FROM audit_logs
      ORDER BY user_id, exam_id, timestamp DESC
    `).all();

    // 处理 audit_logs 数据
    const userExamData = new Map<string, { lastActivity: number; tabSwitchCount: number }>();
    
    for (const row of auditResult.results || []) {
      const key = `${row.user_id}_${row.exam_id}`;
      if (!userExamData.has(key)) {
        userExamData.set(key, { lastActivity: 0, tabSwitchCount: 0 });
      }
      const data = userExamData.get(key)!;
      
      // 更新最后活动时间
      if (row.timestamp > data.lastActivity) {
        data.lastActivity = row.timestamp;
      }
      
      // 如果是切屏事件且还没有切屏计数，更新计数
      if (row.event_type === 'tab_switch' && data.tabSwitchCount === 0) {
        try {
          const eventData = typeof row.event_data === 'string' 
            ? JSON.parse(row.event_data) 
            : row.event_data;
          data.tabSwitchCount = eventData.count || 0;
        } catch {
          // ignore
        }
      }
    }

    // 获取所有考试记录
    const examRecordsResult = await env.DB.prepare(`
      SELECT user_id, exam_id, started_at, completed_at
      FROM exam_records
      ORDER BY started_at DESC
    `).all();

    const examRecordMap = new Map<string, any>();
    for (const row of examRecordsResult.results || []) {
      const key = `${row.user_id}_${row.exam_id}`;
      examRecordMap.set(key, row);
    }

    // 收集所有唯一的 (user_id, exam_id) 组合
    const allKeys = new Set<string>();
    for (const key of userExamData.keys()) allKeys.add(key);
    for (const key of examRecordMap.keys()) allKeys.add(key);

    // 构建最终结果
    for (const key of allKeys) {
      const [userId, examId] = key.split('_');
      const auditData = userExamData.get(key);
      const examRecord = examRecordMap.get(key);
      const userName = userMap.get(userId) || '未知用户';

      let startTime = Date.now();
      let status: 'ongoing' | 'submitted' = 'ongoing';

      if (examRecord) {
        // 处理 started_at
        if (examRecord.started_at) {
          if (typeof examRecord.started_at === 'number') {
            startTime = examRecord.started_at;
          } else if (typeof examRecord.started_at === 'string') {
            const parsed = parseFloat(examRecord.started_at);
            startTime = !isNaN(parsed) ? parsed : new Date(examRecord.started_at).getTime();
          } else {
            startTime = new Date(examRecord.started_at).getTime();
          }
        }
        status = examRecord.completed_at ? 'submitted' : 'ongoing';
      } else if (auditData?.lastActivity) {
        startTime = typeof auditData.lastActivity === 'number' 
          ? auditData.lastActivity 
          : Date.now();
      }

      sessions.push({
        examId,
        userId,
        userName,
        status,
        tabSwitchCount: auditData?.tabSwitchCount || 0,
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
      CREATE INDEX IF NOT EXISTS idx_exam_records_user_completed 
      ON exam_records (user_id, completed_at DESC)
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
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_exam_event_timestamp 
      ON audit_logs (user_id, exam_id, event_type, timestamp)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_exam_event_timestamp 
      ON audit_logs (exam_id, event_type, timestamp)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_exam_user_timestamp 
      ON audit_logs (exam_id, user_id, timestamp DESC)
    `).run();
  } catch (error) {
    console.warn('Index creation failed (may already exist):', error);
  }
}
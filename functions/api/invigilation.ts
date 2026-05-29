import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;

  try {
    const results = await env.DB.prepare(`
      SELECT DISTINCT al.user_id, al.exam_id, u.name as user_name,
             MAX(al.timestamp) as last_activity
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      GROUP BY al.user_id, al.exam_id, u.name
      ORDER BY last_activity DESC
    `).all();

    console.log('Audit records found:', results.results.length);
    if (results.results.length > 0) {
      console.log('First audit record:', JSON.stringify(results.results[0]));
    }

    const sessions: any[] = [];
    
    for (const row of results.results) {
      console.log(`Processing audit record: user_id=${row.user_id}, exam_id=${row.exam_id}`);
      
      const tabSwitchResult = await env.DB.prepare(`
        SELECT event_data, timestamp FROM audit_logs 
        WHERE user_id = ? AND exam_id = ? AND event_type = 'tab_switch'
        ORDER BY timestamp DESC
        LIMIT 1
      `).bind(row.user_id, row.exam_id).first();

      console.log('Tab switch result:', tabSwitchResult);

      let tabSwitchCount = 0;
      if (tabSwitchResult && tabSwitchResult.event_data) {
        try {
          const data = typeof tabSwitchResult.event_data === 'string' 
            ? JSON.parse(tabSwitchResult.event_data) 
            : tabSwitchResult.event_data;
          tabSwitchCount = data.count || 0;
        } catch (e) {
          console.error('Failed to parse audit data:', e);
          tabSwitchCount = 0;
        }
      }

      const examRecord = await env.DB.prepare(`
        SELECT started_at, completed_at FROM exam_records 
        WHERE user_id = ? AND exam_id = ?
      `).bind(row.user_id, row.exam_id).first();

      let startTime = Date.now();
      let status = 'ongoing';

      if (examRecord) {
        if (examRecord.started_at) {
          if (typeof examRecord.started_at === 'number') {
            startTime = examRecord.started_at;
          } else if (typeof examRecord.started_at === 'string') {
            const parsed = parseFloat(examRecord.started_at);
            if (!isNaN(parsed)) {
              startTime = parsed;
            } else {
              startTime = new Date(examRecord.started_at).getTime();
            }
          } else {
            startTime = new Date(examRecord.started_at).getTime();
          }
        }
        status = examRecord.completed_at ? 'submitted' : 'ongoing';
      } else if (row.last_activity) {
        startTime = typeof row.last_activity === 'number' ? row.last_activity : Date.now();
      }

      sessions.push({
        examId: row.exam_id,
        userId: row.user_id,
        userName: row.user_name || '未知用户',
        status,
        tabSwitchCount,
        startTime,
      });
    }

    const examRecordResults = await env.DB.prepare(`
      SELECT er.user_id, er.exam_id, er.started_at, er.completed_at, u.name as user_name
      FROM exam_records er
      LEFT JOIN users u ON er.user_id = u.id
      WHERE NOT EXISTS (
        SELECT 1 FROM audit_logs al 
        WHERE al.user_id = er.user_id AND al.exam_id = er.exam_id
      )
      ORDER BY er.started_at DESC
    `).all();

    console.log('Exam records without audit:', examRecordResults.results.length);

    for (const row of examRecordResults.results) {
      let tabSwitchCount = 0;
      
      let startTime = Date.now();
      if (row.started_at) {
        if (typeof row.started_at === 'number') {
          startTime = row.started_at;
        } else if (typeof row.started_at === 'string') {
          const parsed = parseFloat(row.started_at);
          if (!isNaN(parsed)) {
            startTime = parsed;
          } else {
            startTime = new Date(row.started_at).getTime();
          }
        } else {
          startTime = new Date(row.started_at).getTime();
        }
      }

      sessions.push({
        examId: row.exam_id,
        userId: row.user_id,
        userName: row.user_name || '未知用户',
        status: row.completed_at ? 'submitted' : 'ongoing',
        tabSwitchCount,
        startTime,
      });
    }

    sessions.sort((a, b) => b.startTime - a.startTime);

    console.log('Total sessions to return:', sessions.length);

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
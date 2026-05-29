import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;

  try {
    const results = await env.DB.prepare(`
      SELECT 
        er.user_id,
        er.exam_id,
        er.started_at,
        er.completed_at,
        u.name as user_name
      FROM exam_records er
      LEFT JOIN users u ON er.user_id = u.id
      ORDER BY er.started_at DESC
    `).all();

    const sessions: any[] = [];
    
    for (const row of results.results) {
      const auditResult = await env.DB.prepare(`
        SELECT event_data FROM audit_logs 
        WHERE user_id = ? AND exam_id = ? AND event_type = 'tab_switch'
        ORDER BY timestamp DESC
        LIMIT 1
      `).bind(row.user_id, row.exam_id).first();

      let tabSwitchCount = 0;
      if (auditResult && auditResult.event_data) {
        try {
          const data = JSON.parse(auditResult.event_data);
          tabSwitchCount = data.count || 0;
        } catch {
          tabSwitchCount = 0;
        }
      }

      sessions.push({
        examId: row.exam_id,
        userId: row.user_id,
        userName: row.user_name || '未知用户',
        status: row.completed_at ? 'submitted' : 'ongoing',
        tabSwitchCount,
        startTime: row.started_at ? new Date(row.started_at).getTime() : Date.now(),
      });
    }

    return new Response(
      JSON.stringify({ ok: true, sessions }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching invigilation data:', error);
    return new Response(
      JSON.stringify({ ok: false, error: '获取监考数据失败' }),
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

    const result = await env.DB.prepare(`
      SELECT event_data FROM audit_logs 
      WHERE user_id = ? AND exam_id = ? AND event_type = 'tab_switch'
      ORDER BY timestamp DESC
      LIMIT 1
    `).bind(userId, examId).first();

    if (!result) {
      return new Response(
        JSON.stringify({ ok: false, error: '未找到该会话的切屏记录' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
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
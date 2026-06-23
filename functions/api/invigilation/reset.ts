import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

// POST /api/invigilation/reset - 重置切屏次数
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

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

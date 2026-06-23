import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

// POST /api/invigilation/clear-violation - 清除违规记录
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

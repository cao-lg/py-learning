import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;

  try {
    const results = await env.DB.prepare(`
      SELECT 
        es.exam_id,
        es.user_id,
        es.status,
        es.started_at,
        es.audit,
        u.name as user_name
      FROM exam_sessions es
      LEFT JOIN users u ON es.user_id = u.id
      WHERE es.status != 'deleted'
      ORDER BY es.started_at DESC
    `).all();

    const sessions = results.results.map((row: any) => {
      let tabSwitchCount = 0;
      try {
        if (row.audit && typeof row.audit === 'string') {
          const audit = JSON.parse(row.audit);
          tabSwitchCount = audit.tab_switch || 0;
        } else if (row.audit && typeof row.audit === 'object') {
          tabSwitchCount = row.audit.tab_switch || 0;
        }
      } catch {
        tabSwitchCount = 0;
      }

      return {
        examId: row.exam_id,
        userId: row.user_id,
        userName: row.user_name || '未知用户',
        status: row.status,
        tabSwitchCount,
        startTime: row.started_at ? new Date(row.started_at).getTime() : Date.now(),
      };
    });

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
      SELECT audit FROM exam_sessions WHERE user_id = ? AND exam_id = ?
    `).bind(userId, examId).first();

    if (!result) {
      return new Response(
        JSON.stringify({ ok: false, error: '未找到该会话' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let audit = { focus_loss: 0, tab_switch: 0, paste_attempts: 0, fullscreen_change: 0 };
    try {
      if (result.audit && typeof result.audit === 'string') {
        audit = JSON.parse(result.audit);
      } else if (result.audit && typeof result.audit === 'object') {
        audit = result.audit;
      }
    } catch {
      // 保持默认值
    }

    audit.tab_switch = 0;

    await env.DB.prepare(`
      UPDATE exam_sessions SET audit = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND exam_id = ?
    `).bind(JSON.stringify(audit), userId, examId).run();

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
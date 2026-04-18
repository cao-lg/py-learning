interface Env {
  DB: D1Database;
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const adminPassword = request.headers.get('X-Admin-Password');

  if (request.method === 'GET') {
    try {
      const result = await env.DB.prepare('SELECT exam_id, start_time, end_time FROM exam_schedule').all();
      const schedule: Record<string, { startTime: string | null; endTime: string | null }> = {};
      (result.results || []).forEach((row: { exam_id: string; start_time: string | null; end_time: string | null }) => {
        schedule[row.exam_id] = {
          startTime: row.start_time,
          endTime: row.end_time,
        };
      });
      return new Response(JSON.stringify({ ok: true, schedule }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ ok: false, error: 'Failed to fetch schedule' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'POST') {
    if (!adminPassword) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const { examId, startTime, endTime } = await request.json();

      if (!examId) {
        return new Response(JSON.stringify({ ok: false, error: 'examId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await env.DB.prepare(`
        INSERT OR REPLACE INTO exam_schedule (exam_id, start_time, end_time, updated_at)
        VALUES (?, ?, ?, ?)
      `).bind(examId, startTime || null, endTime || null, Date.now()).run();

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ ok: false, error: 'Failed to update schedule' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

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
      // 首先检查表是否存在
      let tableExists = false;
      try {
        const checkResult = await env.DB.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='exam_schedule'"
        ).first();
        tableExists = !!checkResult;
      } catch (checkError) {
        console.error('Table check error:', checkError);
      }

      if (!tableExists) {
        // 表不存在，尝试创建
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS exam_schedule (
              exam_id TEXT PRIMARY KEY,
              start_time TEXT,
              end_time TEXT,
              updated_at INTEGER NOT NULL
            )
          `).run();
          tableExists = true;
          console.log('Created exam_schedule table');
        } catch (createError) {
          console.error('Failed to create table:', createError);
          return new Response(JSON.stringify({ 
            ok: false, 
            error: 'Table does not exist and failed to create: ' + String(createError),
            tableExists: false
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      const result = await env.DB.prepare('SELECT exam_id, start_time, end_time FROM exam_schedule').all();
      const schedule: Record<string, { startTime: string | null; endTime: string | null }> = {};
      (result.results || []).forEach((row: { exam_id: string; start_time: string | null; end_time: string | null }) => {
        schedule[row.exam_id] = {
          startTime: row.start_time,
          endTime: row.end_time,
        };
      });
      return new Response(JSON.stringify({ ok: true, schedule, tableExists }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify({ ok: false, error: 'Failed to fetch schedule: ' + errorMessage }), {
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

      // 首先确保表存在
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS exam_schedule (
            exam_id TEXT PRIMARY KEY,
            start_time TEXT,
            end_time TEXT,
            updated_at INTEGER NOT NULL
          )
        `).run();
      } catch (tableError) {
        console.error('Failed to ensure table exists:', tableError);
      }

      const stmt = env.DB.prepare(`
        INSERT OR REPLACE INTO exam_schedule (exam_id, start_time, end_time, updated_at)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = await stmt.bind(examId, startTime || null, endTime || null, Date.now()).run();
      
      console.log('Insert result:', result);

      return new Response(JSON.stringify({ 
        ok: true,
        meta: result.meta,
        examId,
        startTime,
        endTime
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to update exam schedule:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify({ ok: false, error: 'Failed to update schedule: ' + errorMessage }), {
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
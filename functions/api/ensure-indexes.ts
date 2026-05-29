interface Env {
  DB: D1Database;
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  try {
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_exam_event 
      ON audit_logs (user_id, exam_id, event_type)
    `).run();
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_exam 
      ON audit_logs (user_id, exam_id)
    `).run();
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_practice_records_user 
      ON practice_records (user_id)
    `).run();
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_user 
      ON exam_records (user_id)
    `).run();

    return new Response(
      JSON.stringify({ ok: true, message: '索引创建完成' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Index creation error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
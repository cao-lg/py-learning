interface Env {
  DB: D1Database;
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const indexesCreated: string[] = [];
  
  try {
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_users_created_at 
      ON users (created_at)
    `).run();
    indexesCreated.push('idx_users_created_at');
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_user 
      ON exam_records (user_id)
    `).run();
    indexesCreated.push('idx_exam_records_user');
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_user_exam 
      ON exam_records (user_id, exam_id)
    `).run();
    indexesCreated.push('idx_exam_records_user_exam');
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_exam 
      ON exam_records (exam_id)
    `).run();
    indexesCreated.push('idx_exam_records_exam');
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_user_completed 
      ON exam_records (user_id, completed_at DESC)
    `).run();
    indexesCreated.push('idx_exam_records_user_completed');
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_exam_event 
      ON audit_logs (user_id, exam_id, event_type)
    `).run();
    indexesCreated.push('idx_audit_logs_user_exam_event');
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_exam 
      ON audit_logs (user_id, exam_id)
    `).run();
    indexesCreated.push('idx_audit_logs_user_exam');
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_exam_event_timestamp 
      ON audit_logs (user_id, exam_id, event_type, timestamp)
    `).run();
    indexesCreated.push('idx_audit_logs_user_exam_event_timestamp');
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_exam_event_timestamp 
      ON audit_logs (exam_id, event_type, timestamp)
    `).run();
    indexesCreated.push('idx_audit_logs_exam_event_timestamp');
    
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_exam_user_timestamp 
      ON audit_logs (exam_id, user_id, timestamp DESC)
    `).run();
    indexesCreated.push('idx_audit_logs_exam_user_timestamp');

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: '所有索引创建完成',
        indexes: indexesCreated
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Index creation error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: String(error),
        indexesCreated 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
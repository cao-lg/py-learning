import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

async function ensureIndexes(db: D1Database): Promise<void> {
  try {
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

    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tab_switch_latest
      ON audit_logs (user_id, exam_id, event_type, timestamp DESC)
    `).run();

    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_exam_timestamp
      ON audit_logs (exam_id, timestamp DESC)
    `).run();

    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_exam_completed
      ON exam_records (exam_id, completed_at DESC)
    `).run();
  } catch (error) {
    console.warn('Index creation failed (may already exist):', error);
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// GET /api/invigilation/export?examId=xxx - 导出指定考试的详细数据
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { env, request } = context;
  const url = new URL(request.url);
  const examId = url.searchParams.get('examId');

  if (!examId) {
    return new Response(
      JSON.stringify({ ok: false, error: '缺少 examId 参数' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await ensureIndexes(env.DB);

    // 获取该考试的所有记录
    const examRecordsResult = await env.DB.prepare(`
      SELECT er.*, u.name as user_name
      FROM exam_records er
      LEFT JOIN users u ON er.user_id = u.id
      WHERE er.exam_id = ?
      ORDER BY er.started_at DESC
    `).bind(examId).all();

    // 获取该考试的审计日志
    const auditLogsResult = await env.DB.prepare(`
      SELECT * FROM audit_logs
      WHERE exam_id = ?
      ORDER BY user_id, timestamp ASC
    `).bind(examId).all();

    // 获取该考试唯一的学生列表及其切屏信息
    const studentSummaryResult = await env.DB.prepare(`
      SELECT 
        al.user_id,
        u.name as user_name,
        MAX(al.timestamp) as last_activity,
        (SELECT event_data FROM audit_logs 
         WHERE user_id = al.user_id AND exam_id = al.exam_id AND event_type = 'tab_switch'
         ORDER BY timestamp DESC LIMIT 1) as latest_tab_switch
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.exam_id = ?
      GROUP BY al.user_id, u.name
    `).bind(examId).all();

    const records = [];
    for (const row of examRecordsResult.results || []) {
      // 解析答案
      let answers = {};
      try {
        answers = typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers;
      } catch {
        answers = {};
      }

      // 计算时长
      let duration = 0;
      if (row.started_at && row.completed_at) {
        const start = typeof row.started_at === 'number' ? row.started_at : new Date(row.started_at).getTime();
        const end = typeof row.completed_at === 'number' ? row.completed_at : new Date(row.completed_at).getTime();
        duration = Math.round((end - start) / 1000); // 秒
      }

      // 获取该学生的切屏次数
      const studentAudit = Array.from(studentSummaryResult.results || []).find(
        (s: any) => s.user_id === row.user_id
      );
      let tabSwitchCount = 0;
      if (studentAudit?.latest_tab_switch) {
        try {
          const data = typeof studentAudit.latest_tab_switch === 'string' 
            ? JSON.parse(studentAudit.latest_tab_switch) 
            : studentAudit.latest_tab_switch;
          tabSwitchCount = data.count || 0;
        } catch {
          tabSwitchCount = 0;
        }
      }

      // 获取该学生的所有审计日志
      const studentAuditLogs = Array.from(auditLogsResult.results || []).filter(
        (log: any) => log.user_id === row.user_id
      );

      records.push({
        userId: row.user_id,
        userName: row.user_name || '未知用户',
        startedAt: row.started_at ? new Date(row.started_at).toISOString() : null,
        completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
        duration: duration,
        durationFormatted: formatDuration(duration),
        score: row.score || 0,
        totalQuestions: row.total_questions || 0,
        tabSwitchCount: tabSwitchCount,
        status: row.completed_at ? '已提交' : (row.started_at ? '进行中' : '未开始'),
        answers: answers,
        auditLogs: studentAuditLogs.map((log: any) => ({
          eventType: log.event_type,
          timestamp: new Date(log.timestamp).toISOString(),
          data: typeof log.event_data === 'string' ? JSON.parse(log.event_data) : log.event_data
        }))
      });
    }

    // 统计信息
    const stats = {
      totalStudents: records.length,
      submitted: records.filter(r => r.status === '已提交').length,
      ongoing: records.filter(r => r.status === '进行中').length,
      avgScore: records.filter(r => r.status === '已提交').length > 0 
        ? Math.round(records.filter(r => r.status === '已提交').reduce((sum, r) => sum + r.score, 0) / records.filter(r => r.status === '已提交').length)
        : 0,
      totalTabSwitches: records.reduce((sum, r) => sum + r.tabSwitchCount, 0)
    };

    return new Response(
      JSON.stringify({ 
        ok: true, 
        examId,
        stats,
        records,
        exportedAt: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error exporting exam data:', error);
    return new Response(
      JSON.stringify({ ok: false, error: '导出失败', details: error instanceof Error ? error.message : 'unknown' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

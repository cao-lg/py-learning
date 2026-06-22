import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

// GET /api/invigilation - 获取监考概览
// GET /api/invigilation?examId=xxx - 导出指定考试的详细数据
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  // 检查是否需要导出数据
  const examId = url.searchParams.get('examId');
  if (examId) {
    return handleExportExam(request, env, examId);
  }
  
  // 否则返回监考概览
  try {
    const sessions: any[] = [];

    await ensureIndexes(env.DB);

    // 获取所有用户
    const usersResult = await env.DB.prepare(`SELECT id, name FROM users`).all();
    const userMap = new Map<string, string>();
    for (const row of usersResult.results || []) {
      userMap.set(row.id, row.name);
    }

    // 一次性获取所有需要的 audit_logs 数据（包括最后活动时间和最新切屏计数）
    const auditResult = await env.DB.prepare(`
      SELECT user_id, exam_id, event_type, event_data, timestamp
      FROM audit_logs
      ORDER BY user_id, exam_id, timestamp DESC
    `).all();

    // 处理 audit_logs 数据
    const userExamData = new Map<string, { lastActivity: number; tabSwitchCount: number }>();
    
    for (const row of auditResult.results || []) {
      // 使用分隔符避免 examId 中包含下划线时的问题
      const key = `${row.user_id}::${row.exam_id}`;
      if (!userExamData.has(key)) {
        userExamData.set(key, { lastActivity: 0, tabSwitchCount: 0 });
      }
      const data = userExamData.get(key)!;
      
      // 更新最后活动时间
      if (row.timestamp > data.lastActivity) {
        data.lastActivity = row.timestamp;
      }
      
      // 如果是切屏事件且还没有切屏计数，更新计数
      if (row.event_type === 'tab_switch' && data.tabSwitchCount === 0) {
        try {
          const eventData = typeof row.event_data === 'string' 
            ? JSON.parse(row.event_data) 
            : row.event_data;
          data.tabSwitchCount = eventData.count || 0;
        } catch {
          // ignore
        }
      }
    }

    // 获取所有考试记录
    const examRecordsResult = await env.DB.prepare(`
      SELECT user_id, exam_id, started_at, completed_at
      FROM exam_records
      ORDER BY started_at DESC
    `).all();

    const examRecordMap = new Map<string, any>();
    for (const row of examRecordsResult.results || []) {
      // 使用分隔符避免 examId 中包含下划线时的问题
      const key = `${row.user_id}::${row.exam_id}`;
      examRecordMap.set(key, row);
    }

    // 收集所有唯一的 (user_id, exam_id) 组合
    const allKeys = new Set<string>();
    for (const key of userExamData.keys()) allKeys.add(key);
    for (const key of examRecordMap.keys()) allKeys.add(key);

    // 构建最终结果
    for (const key of allKeys) {
      const [userId, examId] = key.split('::');
      const auditData = userExamData.get(key);
      const examRecord = examRecordMap.get(key);
      const userName = userMap.get(userId) || '未知用户';

      let startTime = Date.now();
      let status: 'ongoing' | 'submitted' = 'ongoing';

      if (examRecord) {
        // 处理 started_at
        if (examRecord.started_at) {
          if (typeof examRecord.started_at === 'number') {
            startTime = examRecord.started_at;
          } else if (typeof examRecord.started_at === 'string') {
            const parsed = parseFloat(examRecord.started_at);
            startTime = !isNaN(parsed) ? parsed : new Date(examRecord.started_at).getTime();
          } else {
            startTime = new Date(examRecord.started_at).getTime();
          }
        }
        status = examRecord.completed_at ? 'submitted' : 'ongoing';
      } else if (auditData?.lastActivity) {
        startTime = typeof auditData.lastActivity === 'number' 
          ? auditData.lastActivity 
          : Date.now();
      }

      sessions.push({
        examId,
        userId,
        userName,
        status,
        tabSwitchCount: auditData?.tabSwitchCount || 0,
        startTime,
      });
    }

    sessions.sort((a, b) => b.startTime - a.startTime);

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

// GET /api/invigilation/export?examId=xxx - 导出指定考试的详细数据
async function handleExportExam(request: Request, env: Env, examId: string) {
  try {
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

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

async function ensureIndexes(db: D1Database): Promise<void> {
  try {
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_users_created_at 
      ON users (created_at)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_user 
      ON exam_records (user_id)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_user_exam 
      ON exam_records (user_id, exam_id)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_exam 
      ON exam_records (exam_id)
    `).run();
    
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_exam_records_user_completed 
      ON exam_records (user_id, completed_at DESC)
    `).run();
    
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
  } catch (error) {
    console.warn('Index creation failed (may already exist):', error);
  }
}
interface Env {
  DB: D1Database;
}

interface CleanupResponse {
  ok: boolean;
  message?: string;
  deletedRecords?: {
    practiceRecords: number;
    examRecords: number;
    auditLogs: number;
  };
  error?: string;
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 清理无效的练习记录（没有对应用户的记录）
    const deletedPractice = await env.DB.prepare(`
      DELETE FROM practice_records
      WHERE user_id NOT IN (SELECT id FROM users)
    `).run();

    // 清理无效的考试记录（没有对应用户的记录）
    const deletedExam = await env.DB.prepare(`
      DELETE FROM exam_records
      WHERE user_id NOT IN (SELECT id FROM users)
    `).run();

    // 清理无效的审计日志（没有对应用户的记录）
    const deletedAudit = await env.DB.prepare(`
      DELETE FROM audit_logs
      WHERE user_id NOT IN (SELECT id FROM users)
    `).run();

    // 清理分数异常的记录（分数大于总题数的记录）
    const deletedInvalidPractice = await env.DB.prepare(`
      DELETE FROM practice_records
      WHERE score > total_questions
    `).run();

    const deletedInvalidExam = await env.DB.prepare(`
      DELETE FROM exam_records
      WHERE score > total_questions
    `).run();

    const response: CleanupResponse = {
      ok: true,
      message: "数据清理完成",
      deletedRecords: {
        practiceRecords: deletedPractice.changes + (deletedInvalidPractice?.changes || 0),
        examRecords: deletedExam.changes + (deletedInvalidExam?.changes || 0),
        auditLogs: deletedAudit.changes,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

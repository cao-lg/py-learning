interface Env {
  DB: D1Database;
}

interface CleanupRequest {
  type: 'invalid' | 'all';
  password: string;
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

const ADMIN_PASSWORD = 'admin123'; // 管理密码

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body: CleanupRequest = await request.json();
    const { type, password } = body;

    // 验证密码
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ ok: false, error: "密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let deletedPractice = { changes: 0 };
    let deletedExam = { changes: 0 };
    let deletedAudit = { changes: 0 };

    if (type === 'all') {
      // 清理所有记录
      deletedPractice = await env.DB.prepare(`DELETE FROM practice_records`).run();
      deletedExam = await env.DB.prepare(`DELETE FROM exam_records`).run();
      deletedAudit = await env.DB.prepare(`DELETE FROM audit_logs`).run();
    } else {
      // 清理无效的练习记录（没有对应用户的记录）
      deletedPractice = await env.DB.prepare(`
        DELETE FROM practice_records
        WHERE user_id NOT IN (SELECT id FROM users)
      `).run();

      // 清理无效的考试记录（没有对应用户的记录）
      deletedExam = await env.DB.prepare(`
        DELETE FROM exam_records
        WHERE user_id NOT IN (SELECT id FROM users)
      `).run();

      // 清理无效的审计日志（没有对应用户的记录）
      deletedAudit = await env.DB.prepare(`
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

      deletedPractice.changes += deletedInvalidPractice?.changes || 0;
      deletedExam.changes += deletedInvalidExam?.changes || 0;
    }

    const response: CleanupResponse = {
      ok: true,
      message: type === 'all' ? "全部数据清理完成" : "无效数据清理完成",
      deletedRecords: {
        practiceRecords: deletedPractice.changes || 0,
        examRecords: deletedExam.changes || 0,
        auditLogs: deletedAudit.changes || 0,
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

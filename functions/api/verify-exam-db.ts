interface Env {
  DB: D1Database;
}

/**
 * 验证考试数据库API
 * 调用方式：GET /api/verify-exam-db
 */
export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  try {
    // 检查表是否存在
    const tableCheck = await env.DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='exam_questions'
    `).first();

    if (!tableCheck) {
      return new Response(JSON.stringify({
        ok: false,
        error: "Table exam_questions does not exist"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 获取统计信息
    const totalCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM exam_questions`).first<{ count: number }>();
    const byExam = await env.DB.prepare(`
      SELECT exam_id, version, COUNT(*) as count 
      FROM exam_questions 
      GROUP BY exam_id, version 
      ORDER BY exam_id
    `).all<{ exam_id: string; version: string | null; count: number }>();

    const withAnswers = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM exam_questions WHERE expected IS NOT NULL
    `).first<{ count: number }>();

    const withHidden = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM exam_questions WHERE hidden_cases IS NOT NULL AND hidden_cases != 'null'
    `).first<{ count: number }>();

    const sampleQuestions = await env.DB.prepare(`
      SELECT id, exam_id, question_id, type, title, expected IS NOT NULL as has_answer, 
             hidden_cases IS NOT NULL AND hidden_cases != 'null' as has_hidden
      FROM exam_questions 
      LIMIT 5
    `).all<any>();

    return new Response(JSON.stringify({
      ok: true,
      message: "Database verification successful",
      stats: {
        totalQuestions: totalCount?.count || 0,
        questionsWithAnswers: withAnswers?.count || 0,
        questionsWithHiddenCases: withHidden?.count || 0,
        exams: byExam.results || [],
        sampleQuestions: sampleQuestions.results || []
      },
      indexes: [
        "idx_exam_questions_exam_id",
        "idx_exam_questions_version",
        "idx_exam_questions_id_version"
      ]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Verify exam DB error:", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : "Internal error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
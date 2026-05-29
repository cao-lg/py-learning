interface Env {
  DB: D1Database;
}

interface StudentDetailResponse {
  ok: boolean;
  user?: {
    id: string;
    name: string;
    created_at: number;
  };
  examStats?: {
    totalAttempts: number;
    avgScore: number;
    passRate: number;
    examStats: {
      examId: string;
      attempts: number;
      score: number;
      date: string;
    }[];
  };
  error?: string;
}

export async function onRequest({ request, env, params }: { request: Request; env: Env; params: { id: string } }): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { id } = params;

    const user = await env.DB.prepare(`SELECT id, name, created_at FROM users WHERE id = ?`).bind(id).first<{
      id: string;
      name: string;
      created_at: number;
    }>();

    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "用户不存在" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const examStatsRaw = await env.DB.prepare(`
      SELECT exam_id, COUNT(*) as attempts, AVG(score) as avg_score,
             SUM(CASE WHEN score >= 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as pass_rate
      FROM exam_records
      WHERE user_id = ?
      GROUP BY exam_id
      ORDER BY attempts DESC
    `).bind(id).all<{ exam_id: string; attempts: number; avg_score: number; pass_rate: number }>();

    const examStats = examStatsRaw.results || [];
    const totalExamAttempts = examStats.reduce((sum, stat) => sum + stat.attempts, 0);
    const avgExamScore = examStats.length > 0 
      ? examStats.reduce((sum, stat) => sum + stat.avg_score, 0) / examStats.length 
      : 0;
    const overallPassRate = examStats.length > 0 
      ? examStats.reduce((sum, stat) => sum + stat.pass_rate, 0) / examStats.length 
      : 0;

    const examRecordsRaw = await env.DB.prepare(`
      SELECT exam_id, score, completed_at
      FROM exam_records
      WHERE user_id = ?
      ORDER BY completed_at DESC
    `).bind(id).all<{ exam_id: string; score: number; completed_at: number }>();

    const examRecords = (examRecordsRaw.results || []).map((record) => ({
      examId: record.exam_id,
      attempts: 1,
      score: record.score,
      date: new Date(record.completed_at).toLocaleString(),
    }));

    const response: StudentDetailResponse = {
      ok: true,
      user,
      examStats: {
        totalAttempts: totalExamAttempts,
        avgScore: Math.round(avgExamScore * 100) / 100,
        passRate: Math.round(overallPassRate * 100) / 100,
        examStats: examRecords,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Student detail error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
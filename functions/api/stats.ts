interface Env {
  DB: D1Database;
}

interface StatsResponse {
  ok: boolean;
  totalUsers?: number;
  totalExamRecords?: number;
  examStats?: { examId: string; attempts: number; avgScore: number }[];
  studentStats?: {
    activeStudents?: number;
    avgExamPerStudent?: number;
    topStudents?: { userId: string; userName: string; examCount: number; totalScore: number }[];
  };
  examDetailedStats?: {
    totalExams?: number;
    avgAttemptsPerExam?: number;
    avgScorePerExam?: number;
    passRate?: number;
    examStats?: { examId: string; attempts: number; avgScore: number; passRate: number }[];
  };
  error?: string;
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const totalUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>();

    const totalExam = await env.DB.prepare("SELECT COUNT(*) as count FROM exam_records").first<{ count: number }>();

    const examStatsRaw = await env.DB.prepare(`
      SELECT exam_id, COUNT(*) as attempts, AVG(score) as avg_score
      FROM exam_records
      GROUP BY exam_id
      ORDER BY attempts DESC
    `).all<{ exam_id: string; attempts: number; avg_score: number }>();

    const examStats = (examStatsRaw.results || []).map((row) => ({
      examId: row.exam_id,
      attempts: row.attempts,
      avgScore: Math.round(row.avg_score * 100) / 100,
    }));

    const studentStatsRaw = await env.DB.prepare(`
      SELECT u.id as user_id, u.name as user_name,
             COUNT(DISTINCT e.id) as exam_count,
             COALESCE(SUM(e.score), 0) as total_score
      FROM users u
      LEFT JOIN exam_records e ON u.id = e.user_id
      GROUP BY u.id, u.name
      HAVING exam_count > 0
      ORDER BY total_score DESC
      LIMIT 10
    `).all<{ user_id: string; user_name: string; exam_count: number; total_score: number }>();

    const activeStudents = studentStatsRaw.results?.length || 0;
    const studentStats = {
      activeStudents,
      avgExamPerStudent: activeStudents > 0 ? (totalExam?.count || 0) / activeStudents : 0,
      topStudents: (studentStatsRaw.results || []).map((row) => ({
        userId: row.user_id,
        userName: row.user_name,
        examCount: row.exam_count,
        totalScore: row.total_score,
      })),
    };

    const examDetailedStatsRaw = await env.DB.prepare(`
      SELECT exam_id, 
             COUNT(*) as attempts,
             AVG(score) as avg_score,
             SUM(CASE WHEN score >= 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as pass_rate
      FROM exam_records
      GROUP BY exam_id
      ORDER BY attempts DESC
    `).all<{ exam_id: string; attempts: number; avg_score: number; pass_rate: number }>();

    const totalExams = examDetailedStatsRaw.results?.length || 0;
    const overallPassRate = totalExams > 0 ? 
      (examDetailedStatsRaw.results || []).reduce((sum, row) => sum + row.pass_rate, 0) / totalExams : 0;
    const examDetailedStats = {
      totalExams,
      avgAttemptsPerExam: totalExams > 0 ? (totalExam?.count || 0) / totalExams : 0,
      avgScorePerExam: totalExams > 0 ? 
        (examDetailedStatsRaw.results || []).reduce((sum, row) => sum + row.avg_score, 0) / totalExams : 0,
      passRate: Math.round(overallPassRate * 100) / 100,
      examStats: (examDetailedStatsRaw.results || []).map((row) => ({
        examId: row.exam_id,
        attempts: row.attempts,
        avgScore: Math.round(row.avg_score * 100) / 100,
        passRate: Math.round(row.pass_rate * 100) / 100,
      })),
    };

    const stats: StatsResponse = {
      ok: true,
      totalUsers: totalUsers?.count || 0,
      totalExamRecords: totalExam?.count || 0,
      examStats,
      studentStats,
      examDetailedStats,
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
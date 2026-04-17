interface Env {
  DB: D1Database;
}

interface StatsResponse {
  ok: boolean;
  totalUsers?: number;
  totalPracticeRecords?: number;
  totalExamRecords?: number;
  recentActivity?: { date: string; count: number }[];
  topChapters?: { chapterId: string; attempts: number; avgScore: number }[];
  examStats?: { examId: string; attempts: number; avgScore: number }[];
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

    const totalPractice = await env.DB.prepare("SELECT COUNT(*) as count FROM practice_records").first<{ count: number }>();

    const totalExam = await env.DB.prepare("SELECT COUNT(*) as count FROM exam_records").first<{ count: number }>();

    const recentActivityRaw = await env.DB.prepare(`
      SELECT date(completed_at / 1000, 'unixepoch') as date, COUNT(*) as count
      FROM practice_records
      WHERE completed_at > ?
      GROUP BY date
      ORDER BY date DESC
      LIMIT 7
    `).bind(Date.now() - 7 * 24 * 60 * 60 * 1000).all<{ date: string; count: number }>();

    const recentActivity = recentActivityRaw.results || [];

    const topChaptersRaw = await env.DB.prepare(`
      SELECT chapter_id, COUNT(*) as attempts, AVG(score * 100.0 / total_questions) as avg_score
      FROM practice_records
      GROUP BY chapter_id
      ORDER BY attempts DESC
      LIMIT 5
    `).all<{ chapter_id: string; attempts: number; avg_score: number }>();

    const topChapters = (topChaptersRaw.results || []).map((row) => ({
      chapterId: row.chapter_id,
      attempts: row.attempts,
      avgScore: Math.round(row.avg_score * 100) / 100,
    }));

    const examStatsRaw = await env.DB.prepare(`
      SELECT exam_id, COUNT(*) as attempts, AVG(score * 100.0 / total_questions) as avg_score
      FROM exam_records
      GROUP BY exam_id
      ORDER BY attempts DESC
    `).all<{ exam_id: string; attempts: number; avg_score: number }>();

    const examStats = (examStatsRaw.results || []).map((row) => ({
      examId: row.exam_id,
      attempts: row.attempts,
      avgScore: Math.round(row.avg_score * 100) / 100,
    }));

    const stats: StatsResponse = {
      ok: true,
      totalUsers: totalUsers?.count || 0,
      totalPracticeRecords: totalPractice?.count || 0,
      totalExamRecords: totalExam?.count || 0,
      recentActivity,
      topChapters,
      examStats,
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

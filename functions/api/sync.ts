interface Env {
  DB: D1Database;
}

interface SyncRequest {
  userId: string;
  practice?: Record<string, PracticeRecord>;
  exam?: Record<string, ExamRecord>;
  audit?: Record<string, AuditEntry[]>;
  hashes?: Record<string, string>;
}

interface PracticeRecord {
  chapterId: string;
  score: number;
  totalQuestions: number;
  completedAt: number;
  answers: Record<string, string>;
}

interface ExamRecord {
  examId: string;
  score: number;
  totalQuestions: number;
  startedAt: number;
  completedAt: number;
  answers: Record<string, string>;
}

interface AuditEntry {
  type: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body: SyncRequest = await request.json();
    const { userId, practice, exam, audit } = body;

    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "userId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = Date.now();

    if (practice) {
      for (const [chapterId, record] of Object.entries(practice)) {
        await env.DB.prepare(`
          INSERT OR REPLACE INTO practice_records (user_id, chapter_id, score, total_questions, answers, completed_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          userId,
          chapterId,
          record.score,
          record.totalQuestions,
          JSON.stringify(record.answers),
          record.completedAt,
          now
        ).run();
      }
    }

    if (exam) {
      for (const [examId, record] of Object.entries(exam)) {
        await env.DB.prepare(`
          INSERT OR REPLACE INTO exam_records (user_id, exam_id, score, total_questions, answers, started_at, completed_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          userId,
          examId,
          record.score,
          record.totalQuestions,
          JSON.stringify(record.answers),
          record.startedAt,
          record.completedAt,
          now
        ).run();
      }
    }

    if (audit) {
      for (const [examId, entries] of Object.entries(audit)) {
        for (const entry of entries) {
          await env.DB.prepare(`
            INSERT INTO audit_logs (user_id, exam_id, event_type, event_data, timestamp)
            VALUES (?, ?, ?, ?, ?)
          `).bind(
            userId,
            examId,
            entry.type,
            JSON.stringify(entry.data || {}),
            entry.timestamp
          ).run();
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, syncedAt: now }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

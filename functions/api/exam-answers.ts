interface Env {
  DB: D1Database;
}

interface ExamAnswer {
  exam_id: string;
  question_id: string;
  version: string | null;
  expected: string | null;
  hidden_cases: string | null;
  test_config: string;
}

/**
 * 获取考试答案API（用于后端判题）
 * 注意：这个API应该只在考试环境中调用，不暴露给普通用户
 */
export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(request.url);
    const examId = url.searchParams.get("examId");
    const userId = url.searchParams.get("userId");

    if (!examId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing examId parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 简单的安全检查：检查是否有考试正在进行
    // 实际生产环境中应该使用更严格的认证机制
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 获取考试答案
    let query = "SELECT exam_id, question_id, version, expected, hidden_cases, test_config FROM exam_questions WHERE exam_id = ?";
    const params: any[] = [examId];

    // 对于期末考试，根据用户ID分配版本
    if (examId === "final_exam" && userId) {
      const hash = hashCode(userId);
      const versions = ["A", "B", "C"];
      const version = versions[hash % 3];

      query += " AND (version = ? OR version IS NULL)";
      params.push(version);
    }

    query += " ORDER BY question_id";

    const result = await env.DB.prepare(query).bind(...params).all<ExamAnswer>();

    if (!result.results || result.results.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Exam answers not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 构建答案映射
    const answers: Record<string, {
      expected: string | null;
      hiddenCases: any[];
      testConfig: {
        timeout_ms: number;
        weight: number;
      };
    }> = {};

    for (const row of result.results) {
      answers[row.question_id] = {
        expected: row.expected,
        hiddenCases: row.hidden_cases ? JSON.parse(row.hidden_cases) : [],
        testConfig: JSON.parse(row.test_config)
      };
    }

    return new Response(JSON.stringify({
      ok: true,
      examId,
      answers
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // 防止缓存
        "Cache-Control": "no-store",
        "Pragma": "no-cache"
      },
    });

  } catch (error) {
    console.error("Get exam answers error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

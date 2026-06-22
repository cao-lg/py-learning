interface Env {
  DB: D1Database;
}

interface JudgeRequest {
  examId: string;
  userId: string;
  answers: {
    [questionId: string]: {
      code: string;
      output?: string;
    };
  };
}

interface JudgeResult {
  questionId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  details: {
    testCase: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[];
}

interface JudgeResponse {
  ok: boolean;
  results: JudgeResult[];
  totalScore: number;
  maxTotalScore: number;
  passed: boolean;
  error?: string;
}

/**
 * 判题API - 支持多测试用例
 */
export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body: JudgeRequest = await request.json();
    const { examId, userId, answers } = body;

    if (!examId || !userId || !answers) {
      return new Response(JSON.stringify({ ok: false, error: "Missing required parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 获取考试答案
    let query = "SELECT question_id, expected, hidden_cases, test_config FROM exam_questions WHERE exam_id = ?";
    const params: any[] = [examId];

    // 对于期末考试，根据用户ID分配版本
    if (examId === "final_exam" && userId) {
      const hash = hashCode(userId);
      const versions = ["A", "B", "C"];
      const version = versions[hash % 3];

      query += " AND (version = ? OR version IS NULL)";
      params.push(version);
    }

    const result = await env.DB.prepare(query).bind(...params).all();
    const dbAnswers: any[] = result.results || [];

    if (dbAnswers.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Exam not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 构建答案映射
    const answerMap: Record<string, {
      expected: string | null;
      hiddenCases: any[];
      testConfig: { timeout_ms: number; weight: number };
    }> = {};

    for (const row of dbAnswers as any[]) {
      answerMap[row.question_id] = {
        expected: row.expected,
        hiddenCases: row.hidden_cases ? JSON.parse(row.hidden_cases) : [],
        testConfig: JSON.parse(row.test_config)
      };
    }

    // 判题
    const results: JudgeResult[] = [];
    let totalScore = 0;
    let maxTotalScore = 0;

    for (const [questionId, userAnswer] of Object.entries(answers)) {
      const dbAnswer = answerMap[questionId];

      if (!dbAnswer) {
        // 题目不存在，跳过
        continue;
      }

      const { expected, hiddenCases, testConfig } = dbAnswer;
      const maxScore = testConfig.weight * 10; // 每权重10分

      // 收集所有测试用例
      const allTestCases: { name: string; expected: string; input?: string }[] = [];

      // 公开测试用例
      if (expected) {
        allTestCases.push({
          name: "公开测试",
          expected: expected
        });
      }

      // 隐藏测试用例
      if (hiddenCases && hiddenCases.length > 0) {
        for (const hc of hiddenCases) {
          allTestCases.push({
            name: "隐藏测试",
            expected: hc.expected,
            input: hc.input
          });
        }
      }

      // 如果没有任何测试用例，跳过
      if (allTestCases.length === 0) {
        continue;
      }

      // 执行判题（这里简化处理，实际应该调用Python执行器）
      const details: JudgeResult["details"] = [];
      let passedCount = 0;

      for (const testCase of allTestCases) {
        // 实际判题逻辑需要调用Python执行器
        // 这里先做简单的字符串比较
        const actual = userAnswer.output || "";
        const isPassed = normalizeOutput(actual) === normalizeOutput(testCase.expected);

        details.push({
          testCase: testCase.name,
          expected: testCase.expected,
          actual: actual,
          passed: isPassed
        });

        if (isPassed) {
          passedCount++;
        }
      }

      // 计算得分
      const questionScore = Math.round((passedCount / allTestCases.length) * maxScore);
      const passed = passedCount === allTestCases.length; // 必须全部通过才算通过

      results.push({
        questionId,
        score: questionScore,
        maxScore,
        passed,
        details
      });

      totalScore += questionScore;
      maxTotalScore += maxScore;
    }

    const response: JudgeResponse = {
      ok: true,
      results,
      totalScore,
      maxTotalScore,
      passed: totalScore >= maxTotalScore * 0.6 // 60%通过
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
    });

  } catch (error) {
    console.error("Judge error:", error);
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

function normalizeOutput(output: string): string {
  // 标准化输出：去除首尾空白，转换换行符
  return output.trim().replace(/\r\n/g, '\n').replace(/\s+$/gm, '');
}

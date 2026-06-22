interface Env {
  DB: D1Database;
}

interface ExamQuestion {
  id: string;
  exam_id: string;
  question_id: string;
  version: string | null;
  type: string;
  title: string;
  instruction: string;
  initial_code: string;
  expected: string | null;
  mock_inputs: string | null;
  hidden_cases: string | null;
  hints: string | null;
  test_config: string;
  score: number;
}

interface ExamPaper {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalScore: number;
  passingScore: number;
  version: string | null;
  questions: {
    id: string;
    type: string;
    title: string;
    instruction: string;
    initialCode: string;
    hints: { text: string; visible: boolean }[];
    testConfig: {
      timeout_ms: number;
      weight: number;
      // 不包含 expected 和 hidden_cases，这些仅在后端使用
    };
  }[];
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  // 支持 GET 请求
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

    // 获取考试题目列表
    let query = "SELECT * FROM exam_questions WHERE exam_id = ? ORDER BY question_id";
    const params: any[] = [examId];

    // 如果是期末考试，根据用户ID随机分配版本
    if (examId === "final_exam" && userId) {
      // 使用用户ID的哈希值来决定分配哪个版本
      const hash = hashCode(userId);
      const versions = ["A", "B", "C"];
      const version = versions[hash % 3];

      query = "SELECT * FROM exam_questions WHERE exam_id = ? AND (version = ? OR version IS NULL) ORDER BY question_id";
      params.push(version);
    }

    const result = await env.DB.prepare(query).bind(...params).all<ExamQuestion>();

    if (!result.results || result.results.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Exam not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 构建考试试卷（不包含答案）
    const examPaper: ExamPaper = {
      id: examId,
      title: "",
      description: "",
      duration: 60,
      totalScore: 0,
      passingScore: 60,
      version: result.results[0]?.version || null,
      questions: []
    };

    let totalScore = 0;

    for (const row of result.results) {
      // 从第一条记录获取考试基本信息
      if (!examPaper.title) {
        // 从 question title 推断考试标题
        examPaper.title = formatExamTitle(examId);
      }

      // 构建题目（不包含答案）
      const question = {
        id: row.question_id,
        type: row.type,
        title: row.title,
        instruction: row.instruction,
        initialCode: row.initial_code,
        hints: row.hints ? JSON.parse(row.hints) : [],
        testConfig: {
          timeout_ms: JSON.parse(row.test_config).timeout_ms || 5000,
          weight: JSON.parse(row.test_config).weight || 1
        }
      };

      examPaper.questions.push(question);
      totalScore += row.score;
    }

    examPaper.totalScore = totalScore;

    return new Response(JSON.stringify({
      ok: true,
      examPaper
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Get exam paper error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 简单的哈希函数，用于分配版本
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 格式化考试标题
function formatExamTitle(examId: string): string {
  const titleMap: Record<string, string> = {
    "ch01_basics": "第一章测验 - Python 基础",
    "ch02_variables": "第二章测验 - 变量与数据类型",
    "ch03_operators": "第三章测验 - 运算符",
    "ch04_control_flow": "第四章测验 - 控制流",
    "ch05_functions": "第五章测验 - 函数",
    "ch06_data_structures": "第六章测验 - 数据结构",
    "ch07_strings": "第七章测验 - 字符串",
    "ch08_file_io": "第八章测验 - 文件操作",
    "ch09_exception": "第九章测验 - 异常处理",
    "ch10_oop": "第十章测验 - 面向对象编程",
    "mid_term": "期中考试",
    "final_exam": "期末考试",
    "quiz_ch01": "第一章小测"
  };

  return titleMap[examId] || examId;
}

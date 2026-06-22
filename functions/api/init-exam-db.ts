interface Env {
  DB: D1Database;
}

interface ExamQuestionData {
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
  created_at: number;
}

/**
 * 初始化考试数据库API
 * 调用方式：POST /api/init-exam-db
 * 
 * 步骤：
 * 1. 创建exam_questions表
 * 2. 创建索引
 * 3. 从JSON文件读取数据并插入
 */
export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 步骤1：创建表
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS exam_questions (
        id TEXT PRIMARY KEY,
        exam_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        version TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        instruction TEXT NOT NULL,
        initial_code TEXT NOT NULL,
        expected TEXT,
        mock_inputs TEXT,
        hidden_cases TEXT,
        hints TEXT,
        test_config TEXT NOT NULL,
        score INTEGER DEFAULT 10,
        created_at INTEGER NOT NULL,
        updated_at INTEGER
      )
    `).run();

    // 步骤2：创建索引
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id)`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_exam_questions_version ON exam_questions(exam_id, version)`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_exam_questions_id_version ON exam_questions(exam_id, question_id, version)`).run();

    // 步骤3：获取所有考试文件列表
    const examFiles = [
      'ch01_basics', 'ch02_variables', 'ch03_operators', 'ch04_control_flow',
      'ch05_functions', 'ch06_data_structures', 'ch07_strings', 'ch08_file_io',
      'ch09_exception', 'ch10_oop', 'mid_term', 'final_exam',
      'final_exam_A', 'final_exam_B', 'final_exam_C', 'quiz_ch01'
    ];

    let totalInserted = 0;
    const errors: string[] = [];

    // 步骤4：从每个JSON文件读取数据并插入
    for (const examId of examFiles) {
      try {
        // 从静态文件获取数据
        const response = await fetch(new URL(`/data/exam/${examId}.json`, request.url));
        if (!response.ok) {
          errors.push(`Failed to fetch ${examId}.json`);
          continue;
        }

        const examData = await response.json() as any;
        if (!examData.questions || !Array.isArray(examData.questions)) {
          errors.push(`No questions in ${examId}.json`);
          continue;
        }

        // 确定版本
        let version: string | null = null;
        if (examId.includes('_A') || examData.version === 'A') version = 'A';
        else if (examId.includes('_B') || examData.version === 'B') version = 'B';
        else if (examId.includes('_C') || examData.version === 'C') version = 'C';

        // 插入每道题目
        for (const question of examData.questions) {
          const questionId = question.id;
          const id = version ? `${examId}_${questionId}_${version}` : `${examId}_${questionId}`;

          const testConfig = {
            timeout_ms: question.testConfig?.timeout_ms || 5000,
            weight: question.testConfig?.weight || 1
          };

          const row: ExamQuestionData = {
            id,
            exam_id: examId.replace(/_[ABC]$/, ''), // 去除版本后缀
            question_id: questionId,
            version,
            type: question.type,
            title: question.title,
            instruction: question.instruction,
            initial_code: question.initialCode || '',
            expected: question.testConfig?.expected || null,
            mock_inputs: question.testConfig?.mockInputs ? JSON.stringify(question.testConfig.mockInputs) : null,
            hidden_cases: question.testConfig?.hiddenCases ? JSON.stringify(question.testConfig.hiddenCases) : null,
            hints: question.hints ? JSON.stringify(question.hints) : null,
            test_config: JSON.stringify(testConfig),
            score: question.testConfig?.weight ? question.testConfig.weight * 10 : 10,
            created_at: Date.now()
          };

          // 使用INSERT OR REPLACE避免重复
          await env.DB.prepare(`
            INSERT OR REPLACE INTO exam_questions (
              id, exam_id, question_id, version, type, title, instruction,
              initial_code, expected, mock_inputs, hidden_cases, hints,
              test_config, score, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            row.id, row.exam_id, row.question_id, row.version, row.type,
            row.title, row.instruction, row.initial_code, row.expected,
            row.mock_inputs, row.hidden_cases, row.hints, row.test_config,
            row.score, row.created_at
          ).run();

          totalInserted++;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Error processing ${examId}: ${errorMsg}`);
      }
    }

    // 步骤5：验证数据
    const countResult = await env.DB.prepare(`SELECT COUNT(*) as count FROM exam_questions`).first<{ count: number }>();
    const actualCount = countResult?.count || 0;

    return new Response(JSON.stringify({
      ok: true,
      message: "Database initialized successfully",
      stats: {
        tablesCreated: 1,
        indexesCreated: 3,
        questionsInserted: totalInserted,
        actualCount,
        errors: errors.length > 0 ? errors : undefined
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Init exam DB error:", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : "Internal error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
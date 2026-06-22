interface Env {
  DB: D1Database;
}

// 考试答案数据（从exam-answers.ts复制）
const examAnswers: Record<string, Record<string, string>> = {
  ch01_basics: {
    ex1_q1: 'Hello, World!',
    ex1_q2: 'Welcome to Python!',
    ex1_q3: 'Line 1\nLine 2',
    ex1_q4: '2025',
    ex1_q5: '31536000',
  },
  ch02_variables: {
    ex2_q1: 'Alice',
    ex2_q2: '20\n10',
    ex2_q3: '130',
    ex2_q4: 'True',
    ex2_q5: '6',
  },
  ch03_operators: {
    ex3_q1: '3',
    ex3_q2: '2',
    ex3_q3: '1024',
    ex3_q4: 'True',
    ex3_q5: 'True',
    ex3_q6: '30',
  },
  ch04_control_flow: {
    ex4_q1: 'odd',
    ex4_q2: '1\n2\n3\n4\n5',
    ex4_q3: '1\n2\n3\n4',
    ex4_q4: '1\n2\n4\n5',
    ex4_q5: '5\n4\n3\n2\n1',
    ex4_q6: 'completed',
  },
  ch05_functions: {
    ex5_q1: 'Hello!',
    ex5_q2: 'Hello, Alice!',
    ex5_q3: '8',
    ex5_q4: 'Hello, World!',
    ex5_q5: '15',
    ex5_q6: '81',
  },
  ch06_data_structures: {
    ex6_q1: 'apple\norange',
    ex6_q2: '[1, 2, 3, 4]',
    ex6_q3: 'Alice',
    ex6_q4: '{2, 3}',
    ex6_q5: '[1, 4, 9, 16]',
    ex6_q6: 'red\nblue',
  },
  ch07_strings: {
    ex7_q1: 'World',
    ex7_q2: 'HELLO',
    ex7_q3: 'Hello Python',
    ex7_q4: "['apple', 'banana', 'orange']",
    ex7_q5: 'Bob is 25 years old',
    ex7_q6: 'nohtyP',
  },
  ch08_file_io: {
    ex8_q1: 'Hello',
    ex8_q2: '{"Name": "Alice", "age": 20}',
    ex8_q3: '95',
    ex8_q4: 'World',
    ex8_q5: '{\n  "a": 1,\n  "b": 2\n}',
    ex8_q6: 'test',
  },
  ch09_exception: {
    ex9_q1: 'Error: division by zero',
    ex9_q2: 'Invalid number',
    ex9_q3: "invalid literal for int() with base 10: 'xyz'",
    ex9_q4: 'Success',
    ex9_q5: 'Done',
    ex9_q6: 'Invalid value',
  },
  ch10_oop: {
    ex10_q1: 'Alice',
    ex10_q2: 'Woof!',
    ex10_q3: 'Python Basics',
    ex10_q4: 'Tom',
    ex10_q5: '2',
    ex10_q6: '(4, 6)',
  },
  mid_term: {
    em_q1: '37.78',
    em_q2: '120',
    em_q3: '15',
    em_q4: 'nohtyP',
    em_q5: 'True',
  },
  final_exam: {
    fe_q1: '[1, 3, 2]',
    fe_q2: "{'a': 1, 'b': 2, 'c': 3}",
    fe_q3: "{'hello': 2, 'world': 1}",
    fe_q4: '[1, 2, 3, 4, 5]',
    fe_q5: 'True',
    fe_q6: '1 1 2 3 5 8 13 21 34 55',
    fe_q7: '[3, 5]',
    fe_q8: '[0, 1]',
  },
  final_exam_A: {
    feA_q1: '[1, 3, 2]',
    feA_q2: "{'a': 1, 'b': 2, 'c': 3}",
    feA_q3: "{'hello': 2, 'world': 1}",
    feA_q4: '[1, 2, 3, 4, 5]',
    feA_q5: 'True',
    feA_q6: '1 1 2 3 5 8 13 21 34 55',
    feA_q7: '[3, 5]',
    feA_q8: '[0, 1]',
    feA_q9: '10',
    feA_q10: 'Alice,Bob,Charlie',
    feA_q11: 'True',
    feA_q12: '36',
  },
  final_exam_B: {
    feB_q1: '[2, 4, 6]',
    feB_q2: "{'x': 1, 'y': 2}",
    feB_q3: "{'test': 3}",
    feB_q4: '[1, 2, 3, 4, 5, 6]',
    feB_q5: 'False',
    feB_q6: '2 2 4 6 8 10 12 14 16 18',
    feB_q7: '[1, 4]',
    feB_q8: '[0, 2]',
    feB_q9: '15',
    feB_q10: 'David,Eric,Frank',
    feB_q11: 'False',
    feB_q12: '64',
  },
  final_exam_C: {
    feC_q1: '[5, 4, 3, 2, 1]',
    feC_q2: "{'name': 'Alice', 'age': 20}",
    feC_q3: "{'key': 9}",
    feC_q4: '[3, 6, 9]',
    feC_q5: 'True',
    feC_q6: '1 2 4 8 16 32 64 128 256 512',
    feC_q7: '[2, 6]',
    feC_q8: '[1, 3]',
    feC_q9: '21',
    feC_q10: 'George,Henry,Ivy',
    feC_q11: 'True',
    feC_q12: '49',
  },
  quiz_ch01: {
    q1: 'Hello, World!',
    q2: '2025',
    q3: '31536000',
  },
};

/**
 * 导入考试答案API
 * 调用方式：POST /api/import-exam-answers
 */
export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "POST" && request.method !== "GET") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    let totalUpdated = 0;
    const errors: string[] = [];

    // 遍历所有考试
    for (const [examId, answers] of Object.entries(examAnswers)) {
      // 遍历所有题目的答案
      for (const [questionId, expected] of Object.entries(answers)) {
        try {
          // 构建查询条件
          let query = `UPDATE exam_questions SET expected = ? WHERE exam_id = ? AND question_id = ?`;
          let params: any[] = [expected, examId, questionId];

          // 如果examId包含版本（如final_exam_A），需要特殊处理
          if (examId.includes('_A') || examId.includes('_B') || examId.includes('_C')) {
            const baseExamId = examId.replace(/_[ABC]$/, '');
            const version = examId.slice(-1);
            query = `UPDATE exam_questions SET expected = ? WHERE exam_id = ? AND question_id = ? AND version = ?`;
            params = [expected, baseExamId, questionId, version];
          }

          const result = await env.DB.prepare(query).bind(...params).run();
          
          if (result.meta?.changes > 0) {
            totalUpdated++;
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          errors.push(`${examId}.${questionId}: ${errorMsg}`);
        }
      }
    }

    // 验证更新结果
    const updatedCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM exam_questions WHERE expected IS NOT NULL
    `).first<{ count: number }>();

    return new Response(JSON.stringify({
      ok: true,
      message: "Answers imported successfully",
      stats: {
        answersAttempted: totalUpdated,
        questionsWithAnswers: updatedCount?.count || 0,
        errors: errors.length > 0 ? errors : undefined
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Import answers error:", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : "Internal error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
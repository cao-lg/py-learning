interface Env {
  DB: D1Database;
}

// 隐藏测试用例数据
const hiddenTestCases: Record<string, Record<string, { expected: string }[]>> = {
  // 期末考试A卷
  final_exam_A: {
    feA_q1: [ // 列表去重
      { expected: '[5, 3, 5, 7, 7]' }, // 不同输入
      { expected: "['x', 'y', 'x', 'z']" },
      { expected: '[1]' }, // 边界：单元素
      { expected: '[]' }, // 边界：空列表
    ],
    feA_q2: [ // 字典合并
      { expected: "{'a': 5, 'b': 6, 'c': 7}" }, // 不同输入
      { expected: "{'name': 'Alice', 'age': 25}" },
      { expected: "{'x': 1}" }, // 边界：空字典
    ],
    feA_q3: [ // 字符串计数
      { expected: "{'a': 3, 'b': 2, 'c': 1}" }, // 不同输入
      { expected: "{'python': 2, 'java': 1}" },
      { expected: '{}' }, // 边界：空字符串
    ],
    feA_q4: [ // 列表排序
      { expected: '[5, 4, 3, 2, 1]' }, // 不同输入
      { expected: '[0, 1, 2, 3, 4]' },
      { expected: '[100]' }, // 边界：单元素
    ],
    feA_q5: [ // 判断回文
      { expected: 'False' }, // 不同输入
      { expected: 'True' }, // 'aba' 类型的回文
      { expected: 'True' }, // 单字符
    ],
    feA_q7: [ // 计算总和
      { expected: '21' }, // 不同输入
      { expected: '0' }, // 边界：空列表
      { expected: '-10' }, // 包含负数
    ],
    feA_q8: [ // 字符串反转
      { expected: "'abc'" }, // 不同输入
      { expected: "''" }, // 边界：空字符串
      { expected: "'a'" }, // 边界：单字符
    ],
    feA_q9: [ // 列表元素平方
      { expected: '[4, 16, 36]' }, // 不同输入
      { expected: '[0, 1, 4]' }, // 包含0和1
      { expected: '[]' }, // 边界：空列表
    ],
    feA_q10: [ // 字符串分割
      { expected: "['a', 'b', 'c']" }, // 不同分隔符
      { expected: "['hello']" }, // 无分隔符
    ],
    feA_q11: [ // 判断数字
      { expected: 'False' }, // 不同输入
      { expected: 'True' }, // 浮点数
    ],
  },
  // 期末考试B卷
  final_exam_B: {
    feB_q1: [ // 列表去重
      { expected: '[1, 2, 3]' },
      { expected: "['b', 'a', 'b']" },
      { expected: '[]' },
    ],
    feB_q2: [ // 字典合并
      { expected: "{'m': 1, 'n': 2}" },
      { expected: "{'key': 99}" },
    ],
    feB_q3: [ // 字符串计数
      { expected: "{'test': 5}" },
      { expected: '{}' },
    ],
    feB_q4: [ // 列表排序
      { expected: '[10, 20, 30]' },
      { expected: '[1]' },
    ],
    feB_q5: [ // 判断回文
      { expected: 'False' },
      { expected: 'True' },
    ],
    feB_q7: [ // 计算总和
      { expected: '6' },
      { expected: '100' },
    ],
    feB_q8: [ // 字符串反转
      { expected: "'edcba'" },
      { expected: "''" },
    ],
    feB_q9: [ // 列表元素平方
      { expected: '[25, 36, 49]' },
      { expected: '[]' },
    ],
    feB_q10: [ // 字符串分割
      { expected: "['a', 'b']" },
    ],
    feB_q11: [ // 判断数字
      { expected: 'True' },
    ],
  },
  // 期末考试C卷
  final_exam_C: {
    feC_q1: [ // 列表去重
      { expected: '[1, 2, 3]' },
      { expected: "['z', 'y', 'z']" },
      { expected: '[]' },
    ],
    feC_q2: [ // 字典合并
      { expected: "{'name': 'Bob', 'score': 85}" },
    ],
    feC_q3: [ // 字符串计数
      { expected: "{'code': 4}" },
    ],
    feC_q4: [ // 列表排序
      { expected: '[7, 8, 9]' },
    ],
    feC_q5: [ // 判断回文
      { expected: 'True' },
    ],
    feC_q7: [ // 计算总和
      { expected: '36' },
    ],
    feC_q8: [ // 字符串反转
      { expected: "'zyx'" },
    ],
    feC_q9: [ // 列表元素平方
      { expected: '[49, 64, 81]' },
    ],
    feC_q10: [ // 字符串分割
      { expected: "['i', 'j', 'k']" },
    ],
    feC_q11: [ // 判断数字
      { expected: 'False' },
    ],
  },
};

/**
 * 更新隐藏测试用例API
 * 调用方式：POST /api/update-hidden-cases
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
    let totalSkipped = 0;
    const errors: string[] = [];

    // 遍历所有考试
    for (const [examId, questions] of Object.entries(hiddenTestCases)) {
      // 遍历所有题目的隐藏测试用例
      for (const [questionId, cases] of Object.entries(questions)) {
        try {
          // 确定版本
          let baseExamId = examId;
          let version: string | null = null;
          
          if (examId.includes('_A')) {
            baseExamId = 'final_exam';
            version = 'A';
          } else if (examId.includes('_B')) {
            baseExamId = 'final_exam';
            version = 'B';
          } else if (examId.includes('_C')) {
            baseExamId = 'final_exam';
            version = 'C';
          }

          // 更新隐藏测试用例
          let query = `UPDATE exam_questions SET hidden_cases = ? WHERE exam_id = ? AND question_id = ?`;
          let params: any[] = [JSON.stringify(cases), baseExamId, questionId];

          if (version) {
            query += ` AND version = ?`;
            params.push(version);
          }

          const result = await env.DB.prepare(query).bind(...params).run();
          
          if (result.meta?.changes > 0) {
            totalUpdated++;
          } else {
            totalSkipped++;
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          errors.push(`${examId}.${questionId}: ${errorMsg}`);
        }
      }
    }

    // 验证更新结果
    const updatedCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM exam_questions 
      WHERE hidden_cases IS NOT NULL AND hidden_cases != '[]' AND hidden_cases != 'null'
    `).first<{ count: number }>();

    return new Response(JSON.stringify({
      ok: true,
      message: "Hidden test cases updated successfully",
      stats: {
        questionsUpdated: totalUpdated,
        questionsSkipped: totalSkipped,
        totalWithHiddenCases: updatedCount?.count || 0,
        errors: errors.length > 0 ? errors : undefined
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Update hidden cases error:", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : "Internal error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

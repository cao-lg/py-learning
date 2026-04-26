interface Env {
  DB: D1Database;
}

interface ExportResponse {
  ok: boolean;
  data?: {
    students: {
      id: string;
      name: string;
      created_at: number;
      examRecords: {
        exam_id: string;
        score: number;
        total_questions: number;
        completed_at: number;
        exam_title: string;
      }[];
      practiceRecords: {
        chapter_id: string;
        score: number;
        total_questions: number;
        completed_at: number;
      }[];
    }[];
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
    // 验证管理员密码
    const adminPassword = request.headers.get("X-Admin-Password");
    if (adminPassword !== "__admin__admin123") {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 获取所有用户
    const users = await env.DB.prepare(`SELECT id, name, created_at FROM users`).all<{
      id: string;
      name: string;
      created_at: number;
    }>();

    const students = [];

    for (const user of users.results || []) {
      // 获取用户的考试记录
      const examRecords = await env.DB.prepare(`
        SELECT exam_id, score, total_questions, completed_at 
        FROM exam_records 
        WHERE user_id = ? 
        ORDER BY completed_at DESC
      `).bind(user.id).all<{
        exam_id: string;
        score: number;
        total_questions: number;
        completed_at: number;
      }>();

      // 获取用户的练习记录
      const practiceRecords = await env.DB.prepare(`
        SELECT chapter_id, score, total_questions, completed_at 
        FROM practice_records 
        WHERE user_id = ? 
        ORDER BY completed_at DESC
      `).bind(user.id).all<{
        chapter_id: string;
        score: number;
        total_questions: number;
        completed_at: number;
      }>();

      // 为考试记录添加标题
      const examRecordsWithTitle = (examRecords.results || []).map(record => {
        // 根据 exam_id 生成标题
        let exam_title = record.exam_id;
        if (record.exam_id.includes('_A')) exam_title = '期末考试 A卷';
        else if (record.exam_id.includes('_B')) exam_title = '期末考试 B卷';
        else if (record.exam_id.includes('_C')) exam_title = '期末考试 C卷';
        else if (record.exam_id === 'mid_term') exam_title = '期中考试';
        else if (record.exam_id.startsWith('ch')) exam_title = `${record.exam_id} 测验`;
        
        return {
          ...record,
          exam_title
        };
      });

      students.push({
        id: user.id,
        name: user.name,
        created_at: user.created_at,
        examRecords: examRecordsWithTitle,
        practiceRecords: practiceRecords.results || [],
      });
    }

    const response: ExportResponse = {
      ok: true,
      data: {
        students
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

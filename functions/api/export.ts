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
    }[];
  };
  error?: string;
}

const examTitleMap: Record<string, string> = {
  'mid_term': '期中考试',
  'ch01_basics': '第一章测验',
  'ch02_variables': '第二章测验',
  'ch03_operators': '第三章测验',
  'ch04_control_flow': '第四章测验',
  'ch05_functions': '第五章测验',
  'ch06_data_structures': '第六章测验',
  'ch07_strings': '第七章测验',
  'ch08_file_io': '第八章测验',
  'ch09_exception': '第九章测验',
  'ch10_oop': '第十章测验',
  'final_exam_A': '期末考试A卷',
  'final_exam_B': '期末考试B卷',
  'final_exam_C': '期末考试C卷',
};

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const adminPassword = request.headers.get("X-Admin-Password");
    if (adminPassword !== "__admin__admin123") {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const usersResult = await env.DB.prepare(`SELECT id, name, created_at FROM users`).all<{
      id: string;
      name: string;
      created_at: number;
    }>();

    const examRecordsResult = await env.DB.prepare(`
      SELECT user_id, exam_id, score, total_questions, completed_at 
      FROM exam_records 
      ORDER BY user_id, completed_at DESC
    `).all<{
      user_id: string;
      exam_id: string;
      score: number;
      total_questions: number;
      completed_at: number;
    }>();

    const examMap = new Map<string, any[]>();
    for (const record of examRecordsResult.results || []) {
      const exam_title = examTitleMap[record.exam_id] || record.exam_id;
      const examRecord = {
        exam_id: record.exam_id,
        score: record.score,
        total_questions: record.total_questions,
        completed_at: record.completed_at,
        exam_title
      };
      if (!examMap.has(record.user_id)) {
        examMap.set(record.user_id, []);
      }
      examMap.get(record.user_id)!.push(examRecord);
    }

    const students = (usersResult.results || []).map(user => ({
      id: user.id,
      name: user.name,
      created_at: user.created_at,
      examRecords: examMap.get(user.id) || [],
    }));

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
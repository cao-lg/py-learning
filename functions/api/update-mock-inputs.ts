interface Env {
  DB: D1Database;
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { examId, version, questions } = await request.json();

    if (!examId || !Array.isArray(questions)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let updatedCount = 0;

    for (const q of questions) {
      const mockInputs = q.testConfig?.mockInputs
        ? JSON.stringify(q.testConfig.mockInputs)
        : null;

      const query = `
        UPDATE exam_questions
        SET mock_inputs = ?
        WHERE exam_id = ? AND question_id = ?
      `;

      const params = [mockInputs, examId, q.id];

      if (version) {
        params.push(version);
        const result = await env.DB.prepare(
          query + " AND version = ?"
        ).bind(...params).run();
        if (result.meta.changes > 0) updatedCount++;
      } else {
        const result = await env.DB.prepare(query).bind(...params).run();
        if (result.meta.changes > 0) updatedCount++;
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      message: "Mock inputs updated successfully",
      stats: { updatedCount }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Update mock inputs error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

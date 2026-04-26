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
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid name" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 生成唯一用户ID
    const id = crypto.randomUUID();
    const now = Date.now();

    // 存储用户信息
    await env.DB.prepare(`
      INSERT INTO users (id, name, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).bind(id, name, now, now).run();

    return new Response(JSON.stringify({ ok: true, id, name }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("User registration error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

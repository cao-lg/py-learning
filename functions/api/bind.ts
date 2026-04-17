interface Env {
  DB: D1Database;
}

const bindSchema = {
  name: "bind",
  json: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 50,
    },
  },
};

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

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid name" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = generateUUID();
    const createdAt = Date.now();

    await env.DB.prepare(`
      INSERT INTO users (id, name, created_at)
      VALUES (?, ?, ?)
    `).bind(userId, name.trim(), createdAt).run();

    return new Response(JSON.stringify({ ok: true, userId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Bind error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

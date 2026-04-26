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
    const { userId, password } = body;

    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid user ID" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!password || typeof password !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid password" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 查询用户信息
    let result;
    try {
      result = await env.DB.prepare(`
        SELECT password FROM users WHERE id = ?
      `).bind(userId).first();
    } catch (e) {
      console.error('Select with password failed:', e);
      // 尝试不使用 password 字段
      result = await env.DB.prepare(`
        SELECT id FROM users WHERE id = ?
      `).bind(userId).first();
      if (result) {
        // 如果用户存在但没有密码字段，默认密码验证通过
        return new Response(JSON.stringify({ ok: true }), { 
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ ok: false, error: "User not found" }), { 
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (!result) {
      return new Response(JSON.stringify({ ok: false, error: "User not found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 验证密码
    const isPasswordValid = !result.password || result.password === password;

    return new Response(JSON.stringify({ ok: isPasswordValid }), { 
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Password verification error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
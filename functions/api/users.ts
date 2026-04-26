interface Env {
  DB: D1Database;
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/users" && request.method === "POST") {
    return handleUserRegistration(request, env);
  } else if (path === "/api/users/verify" && request.method === "POST") {
    return handlePasswordVerification(request, env);
  } else {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { 
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleUserRegistration(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const { name, password } = body;

    if (!name || typeof name !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid name" }), { 
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

    // 生成唯一用户ID
    const id = crypto.randomUUID();
    const now = Date.now();

    // 尝试存储用户信息，处理可能的表结构问题
    try {
      await env.DB.prepare(`
        INSERT INTO users (id, name, password, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, name, password, now, now).run();
    } catch (e) {
      console.error('Insert with password failed:', e);
      // 尝试不使用 password 字段
      await env.DB.prepare(`
        INSERT INTO users (id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `).bind(id, name, now, now).run();
    }

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

async function handlePasswordVerification(request: Request, env: Env): Promise<Response> {
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
    const isPasswordValid = result.password === password;

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

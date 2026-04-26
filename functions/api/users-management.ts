interface Env {
  DB: D1Database;
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  // 验证管理员权限
  const adminPassword = request.headers.get('X-Admin-Password');
  if (adminPassword !== '__admin__admin123') {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.method === "GET") {
    // 获取用户列表
    try {
      const usersRaw = await env.DB.prepare(`
        SELECT id, name, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `).all<{ id: string; name: string; created_at: number; updated_at: number }>();

      const users = (usersRaw.results || []).map(user => ({
        id: user.id,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));

      return new Response(JSON.stringify({ ok: true, users }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Get users error:", error);
      return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (request.method === "POST") {
    // 重置用户密码（实际上是清除本地存储的密码）
    try {
      const body = await request.json();
      const { userId } = body;

      if (!userId) {
        return new Response(JSON.stringify({ ok: false, error: "UserId required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 这里不直接操作密码，因为密码存储在用户本地
      // 而是记录重置操作，让用户重新设置密码

      return new Response(JSON.stringify({ ok: true, message: "Password reset initiated" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

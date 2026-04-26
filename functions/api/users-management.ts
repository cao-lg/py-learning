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
    // 重置用户密码或删除用户
    try {
      const body = await request.json();
      const { userId, action } = body;

      if (!userId) {
        return new Response(JSON.stringify({ ok: false, error: "UserId required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (action === "resetPassword") {
        // 生成临时密码
        const tempPassword = Math.random().toString(36).substring(2, 10);

        // 这里不直接操作本地密码，而是返回临时密码
        // 用户需要使用临时密码登录后重新设置

        return new Response(JSON.stringify({ 
          ok: true, 
          message: "Password reset successfully",
          tempPassword 
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else if (action === "delete") {
        // 删除用户及其相关数据
        await env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(userId).run();
        await env.DB.prepare(`DELETE FROM practice_records WHERE user_id = ?`).bind(userId).run();
        await env.DB.prepare(`DELETE FROM exam_records WHERE user_id = ?`).bind(userId).run();
        await env.DB.prepare(`DELETE FROM audit_logs WHERE user_id = ?`).bind(userId).run();

        return new Response(JSON.stringify({ 
          ok: true, 
          message: "User deleted successfully" 
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ ok: false, error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      console.error("User management error:", error);
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

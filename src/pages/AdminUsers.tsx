import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../store/idb';

interface User {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

const ADMIN_PASSWORD = '__admin__admin123';

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    loadUsers();
  }, []);

  const checkAdmin = async () => {
    const pwd = await storage.getUserPassword();
    if (pwd !== ADMIN_PASSWORD) {
      navigate('/admin/login');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users-management', {
        headers: { 'X-Admin-Password': ADMIN_PASSWORD }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setUsers(data.users || []);
        } else {
          setError(data.error || 'Failed to load users');
        }
      } else {
        setError('Failed to connect to API');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (window.confirm('确定要重置此用户的密码吗？用户将需要重新设置密码。')) {
      try {
        const response = await fetch('/api/users-management', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Password': ADMIN_PASSWORD
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          setMessage({ type: 'success', text: '密码重置成功' });
          // 这里可以添加本地存储的密码清除逻辑
        } else {
          setMessage({ type: 'error', text: '密码重置失败' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: '密码重置失败' });
      } finally {
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleLogout = async () => {
    await storage.setUserPassword('');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">错误: {error}</p>
          <button onClick={loadUsers} className="mt-4 btn btn-primary">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">用户管理</h1>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="btn btn-secondary">
            返回统计
          </Link>
          <Link to="/admin/settings" className="btn btn-secondary">
            考试设置
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            退出登录
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">用户列表</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  用户ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  姓名
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  创建时间
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{user.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      重置密码
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    暂无用户数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

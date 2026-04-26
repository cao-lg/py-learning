import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';

interface User {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

const ADMIN_PASSWORD = '__admin__admin123';

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // 筛选和排序用户
    let result = [...users];

    // 搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) => 
          user.name.toLowerCase().includes(query) || 
          user.id.toLowerCase().includes(query)
      );
    }

    // 排序
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc' 
          ? a.createdAt - b.createdAt 
          : b.createdAt - a.createdAt;
      }
    });

    setFilteredUsers(result);
  }, [users, searchQuery, sortBy, sortOrder]);

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
    if (window.confirm('确定要重置此用户的密码吗？系统将生成临时密码。')) {
      try {
        const response = await fetch('/api/users-management', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Password': ADMIN_PASSWORD
          },
          body: JSON.stringify({ userId, action: 'resetPassword' }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            setMessage({ 
              type: 'success', 
              text: `密码重置成功！临时密码：${data.tempPassword}\n请将此密码告知用户` 
            });
          } else {
            setMessage({ type: 'error', text: '密码重置失败' });
          }
        } else {
          setMessage({ type: 'error', text: '密码重置失败' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: '密码重置失败' });
      } finally {
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('确定要删除此用户吗？此操作将删除用户的所有数据，且无法恢复。')) {
      try {
        const response = await fetch('/api/users-management', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Password': ADMIN_PASSWORD
          },
          body: JSON.stringify({ userId, action: 'delete' }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            setMessage({ type: 'success', text: '用户删除成功' });
            // 重新加载用户列表
            loadUsers();
          } else {
            setMessage({ type: 'error', text: '用户删除失败' });
          }
        } else {
          setMessage({ type: 'error', text: '用户删除失败' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: '用户删除失败' });
      } finally {
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="用户管理">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="用户管理">
        <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">错误: {error}</p>
          <button onClick={loadUsers} className="mt-4 btn btn-primary">
            重试
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="用户管理">
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* 搜索和筛选区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="搜索用户名称或ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt')}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="name">名称</option>
              <option value="createdAt">创建时间</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            <span>刷新</span>
          </button>
        </div>
      </div>

      {/* 用户统计 */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">总用户数</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">搜索结果</h3>
          <p className="text-2xl font-bold text-purple-600">{filteredUsers.length}</p>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  用户ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  姓名
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  创建时间
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  更新时间
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {user.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.updatedAt).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        重置密码
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1.5 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">👥</span>
                      <p className="mb-1">{users.length === 0 ? '暂无用户数据' : '没有匹配的用户'}</p>
                      <p className="text-sm text-gray-400">
                        {users.length === 0 ? '用户注册后会显示在这里' : '请尝试其他搜索条件'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
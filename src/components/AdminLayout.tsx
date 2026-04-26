import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = '__admin__admin123';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // 检查管理员权限
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken !== ADMIN_PASSWORD && location.pathname !== '/admin/login') {
    navigate('/admin/login');
    return null;
  }

  // 如果是登录页面，不显示布局
  if (location.pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { path: '/admin', label: '统计概览', icon: '📊' },
    { path: '/admin/users', label: '用户管理', icon: '👥' },
    { path: '/admin/settings', label: '考试设置', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <div className="flex">
        <aside className="w-64 bg-white dark:bg-gray-800 min-h-screen shadow-lg border-r border-gray-200 dark:border-gray-700 fixed">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-xl">🔐</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">管理后台</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Python 学练测评考</p>
              </div>
            </div>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>🚪</span>
              <span>退出登录</span>
            </button>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="ml-64 flex-1 p-8">
          <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
              <Link
                to="/"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2"
              >
                <span>←</span>
                <span>返回首页</span>
              </Link>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
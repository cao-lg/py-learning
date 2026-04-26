import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'admin123';

export function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminToken', '__admin__' + ADMIN_PASSWORD);
      navigate('/admin');
    } else {
      setError('密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">管理员登录</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">请输入管理员密码</p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="请输入密码"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            登录
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
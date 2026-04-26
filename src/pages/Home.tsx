import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { evaluatorRouter } from '../evaluator/router';

export function HomePage() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [targetPage, setTargetPage] = useState('/practice');
  const navigate = useNavigate();

  const checkUserExists = async (userId: string) => {
    try {
      const response = await fetch('/api/users-management', {
        headers: { 'X-Admin-Password': '__admin__admin123' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          return data.users.some((user: { id: string }) => user.id === userId);
        }
      }
      return false;
    } catch (error) {
      console.error('Check user exists error:', error);
      return true; // 出错时默认认为用户存在，避免误删数据
    }
  };

  useEffect(() => {
    // 从本地存储获取用户信息（仅用于显示，实际验证需要后台）
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    
    if (storedUserId && storedUserName) {
      // 检查用户是否在后台存在
      checkUserExists(storedUserId).then(exists => {
        if (!exists) {
          // 用户不存在，清理本地数据
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          setUserId('');
          setUserName('');
          setTempName('');
        } else {
          setUserId(storedUserId);
          setUserName(storedUserName);
          setTempName(storedUserName);
        }
      });
    }
    evaluatorRouter.init();
  }, []);



  const registerUser = async (name: string, password: string) => {
    try {
      // 开发环境使用模拟数据
      if (import.meta.env.DEV) {
        console.log('Development mode: using mock data for user registration');
        // 模拟注册成功
        return {
          ok: true,
          id: 'mock-' + Date.now(),
          name
        };
      }

      // 生产环境使用真实 API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password })
      });
      
      if (!response.ok) {
        throw new Error('Failed to register user');
      }
      
      const data = await response.json();
      if (!data.ok) {
        throw new Error('Failed to register user');
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const verifyPassword = async (userId: string, password: string) => {
    try {
      // 开发环境使用模拟数据
      if (import.meta.env.DEV) {
        console.log('Development mode: using mock data for password verification');
        // 模拟验证成功
        return true;
      }

      // 生产环境使用真实 API
      const response = await fetch('/api/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });
      
      if (!response.ok) {
        // 检查是否是用户不存在的错误
        if (response.status === 404) {
          // 用户不存在，清理本地数据
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          setUserId('');
          setUserName('');
          setTempName('');
          return false;
        }
        // 其他错误，如密码错误，不清理用户数据
        return false;
      }
      
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Password verification error:', error);
      // 网络错误，不清理用户数据
      return false;
    }
  };

  const handleSave = async () => {
    if (tempName.trim() && tempPassword.trim()) {
      try {
        // 调用后台API注册用户
        const userData = await registerUser(tempName.trim(), tempPassword);
        // 仅在本地存储用户ID和用户名（用于显示）
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userName', userData.name);
        setUserId(userData.id);
        setUserName(userData.name);
        setIsEditing(false);
        setIsPasswordRequired(false);
        setTempPassword('');
        
        // 如果之前是因为点击考试或练习按钮而触发的身份设置，导航到目标页面
        if (targetPage) {
          navigate(targetPage);
        }
      } catch (error) {
        console.error('Save error:', error);
        setPasswordError('注册失败，请重试');
      }
    }
  };

  const handlePasswordVerify = async () => {
    if (userId && inputPassword) {
      const isVerified = await verifyPassword(userId, inputPassword);
      if (isVerified) {
        setIsPasswordRequired(false);
        setInputPassword('');
        setPasswordError('');
        // 添加authenticated=true参数，避免在ExamListPage中再次验证密码
        navigate(`${targetPage}?authenticated=true`);
      } else {
        setPasswordError('密码错误，请重试');
      }
    } else {
      setPasswordError('请输入密码');
    }
  };



  return (
    <div className="text-center py-12">
      <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
        Python 基础学练测评考平台
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        面向高校/培训机构的 Python 基础教学闭环平台，覆盖"学-练-测-评"全流程
      </p>

      <div className="mb-8">
        {userName ? (
          <div className="inline-flex items-center gap-3 bg-purple-100 dark:bg-purple-900/30 px-5 py-2.5 rounded-full">
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              当前身份：{userName}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-purple-500 hover:text-purple-600 dark:hover:text-purple-300"
            >
              修改
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-5 py-2.5 rounded-full text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <span>👤</span>
            <span>请先设置身份</span>
          </button>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {userId ? '修改身份' : '设置身份'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {userId ? '修改您的身份信息' : '设置您的姓名和密码，用于保护您的学习记录'}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">姓名</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="请输入姓名"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                  密码 {userId && <span className="text-gray-400 text-xs">(不修改请留空)</span>}
                </label>
                <input
                  type="password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder={userId ? '请输入新密码' : '设置密码'}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setTempName(userName);
                  setTempPassword('');
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!tempName.trim() || (!userId && !tempPassword.trim())}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {isPasswordRequired && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              请输入密码
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              请输入您的密码以继续
            </p>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => {
                setInputPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="请输入密码"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-2"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordVerify()}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-4">{passwordError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsPasswordRequired(false);
                  setInputPassword('');
                  setPasswordError('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePasswordVerify}
                disabled={!inputPassword}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <Link
          to="/learn"
          className="block p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">学 (Learn)</h2>
          <p className="text-gray-600 dark:text-gray-400">
            静态 Markdown 课程章节，配套代码高亮与随堂练习
          </p>
        </Link>

        <button
          onClick={() => {
            if (userId) {
              setTargetPage('/practice');
              setIsPasswordRequired(true);
            } else {
              setIsEditing(true);
            }
          }}
          className="block p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 text-left"
        >
          <div className="text-4xl mb-4">💻</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">练 (Practice)</h2>
          <p className="text-gray-600 dark:text-gray-400">
            即时评测，多题型支持，实时反馈，代码本地持久化
          </p>
        </button>

        <button
          onClick={() => {
            if (userId) {
              setTargetPage('/exam');
              setIsPasswordRequired(true);
            } else {
              setIsEditing(true);
            }
          }}
          className="block p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 text-left"
        >
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">考 (Exam)</h2>
          <p className="text-gray-600 dark:text-gray-400">
            完全隔离模式，确定性打乱，断网保护，审计日志
          </p>
        </button>
      </div>

      <div className="mt-16">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
          技术栈
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {['React 18', 'TypeScript', 'Vite', 'Pyodide', 'Tailwind CSS', 'Cloudflare Workers'].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

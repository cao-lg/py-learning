import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../store/idb';
import { evaluatorRouter } from '../evaluator/router';

export function HomePage() {
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    storage.getUserName().then(name => {
      if (name) {
        setUserName(name);
        setTempName(name);
      }
    });
    storage.getUserPassword().then(pwd => {
      if (pwd) {
        setUserPassword(pwd);
      }
    });
    evaluatorRouter.init();
  }, []);

  const handleSave = async () => {
    if (tempName.trim() && tempPassword.trim()) {
      await storage.setUserName(tempName.trim());
      await storage.setUserId(tempName.trim().toLowerCase().replace(/\s+/g, '_'));
      await storage.setUserPassword(tempPassword);
      setUserName(tempName.trim());
      setUserPassword(tempPassword);
      setIsEditing(false);
      setIsPasswordRequired(false);
      setTempPassword('');
    }
  };

  const handlePasswordVerify = async () => {
    if (inputPassword === userPassword) {
      setIsPasswordRequired(false);
      setInputPassword('');
      setPasswordError('');
      navigate('/practice');
    } else {
      setPasswordError('密码错误，请重试');
    }
  };

  const handleExamPasswordVerify = async () => {
    if (inputPassword === userPassword) {
      setIsPasswordRequired(false);
      setInputPassword('');
      setPasswordError('');
      navigate('/exam');
    } else {
      setPasswordError('密码错误，请重试');
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
              {userPassword ? '修改身份' : '设置身份'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {userPassword ? '修改您的身份信息' : '设置您的姓名和密码，用于保护您的学习记录'}
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
                  密码 {userPassword && <span className="text-gray-400 text-xs">(不修改请留空)</span>}
                </label>
                <input
                  type="password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder={userPassword ? '请输入新密码' : '设置密码'}
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
                disabled={!tempName.trim() || (!userPassword && !tempPassword.trim())}
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
              onKeyDown={(e) => e.key === 'Enter' && (userPassword ? handlePasswordVerify() : handleExamPasswordVerify())}
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
                onClick={handleExamPasswordVerify}
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
            if (userPassword) {
              setIsPasswordRequired(true);
            } else {
              navigate('/practice');
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
            if (userPassword) {
              setIsPasswordRequired(true);
            } else {
              navigate('/exam');
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

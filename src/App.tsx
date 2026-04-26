import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { evaluatorRouter } from './evaluator/router';
import { PracticePage } from './pages/Practice';
import { ExamPage } from './pages/Exam';
import { ExamListPage } from './pages/ExamList';
import { AdminPage } from './pages/Admin';
import { AdminLoginPage } from './pages/AdminLogin';
import { AdminSettingsPage } from './pages/AdminSettings';
import { AdminUsersPage } from './pages/AdminUsers';
import { HomePage } from './pages/Home';
import { LearnPage } from './pages/Learn';
import { storage } from './store/idb';

function ProtectedNav() {
  const [userPassword, setUserPassword] = useState('');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [targetPath, setTargetPath] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    storage.getUserPassword().then(pwd => {
      if (pwd) {
        setUserPassword(pwd);
      }
    });
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (userPassword && (path.startsWith('/practice') || path.startsWith('/exam'))) {
      setTargetPath(path);
      setIsPasswordRequired(true);
    } else {
      navigate(path);
    }
  };

  const handlePasswordVerify = () => {
    if (inputPassword === userPassword) {
      setIsPasswordRequired(false);
      setInputPassword('');
      setPasswordError('');
      navigate(targetPath);
    } else {
      setPasswordError('密码错误，请重试');
    }
  };

  return (
    <>
      <nav className="flex gap-6">
        <a href="/learn" onClick={(e) => handleNavClick(e, '/learn')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
          学
        </a>
        <a href="/practice" onClick={(e) => handleNavClick(e, '/practice')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
          练
        </a>
        <a href="/exam" onClick={(e) => handleNavClick(e, '/exam')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
          考
        </a>
        <a href="/admin" onClick={(e) => handleNavClick(e, '/admin')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
          管理
        </a>
      </nav>
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
    </>
  );
}

export function App() {
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    evaluatorRouter
      .init()
      .then(() => setIsPyodideReady(true))
      .catch((err) => setInitError(err.message));
  }, []);

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-900/20 rounded-lg border border-red-700">
          <h2 className="text-red-400 text-xl mb-2">初始化 Python 环境失败</h2>
          <p className="text-gray-400">{initError}</p>
        </div>
      </div>
    );
  }

  if (!isPyodideReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">正在加载 Python 环境...</p>
          <p className="text-gray-500 text-sm mt-2">首次加载可能需要几秒钟</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-purple-600 dark:text-purple-400">
              Python Learning
            </a>
            <ProtectedNav />
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<Navigate to="/learn/python-basics" replace />} />
          <Route path="/learn/*" element={<LearnPage />} />
          <Route path="/practice" element={<Navigate to="/practice/ch01_basics" replace />} />
          <Route path="/practice/:chapterId" element={<PracticePage />} />
          <Route path="/exam" element={<ExamListPage />} />
          <Route path="/exam/:examId" element={<ExamPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

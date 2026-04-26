import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkExamAvailability, formatDateTime, type ExamStatus } from '../utils/exam-schedule';

interface ExamInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalScore: number;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  startTime?: string;
  endTime?: string;
}

interface ExamIndex {
  exams: ExamInfo[];
}

export function ExamListPage() {
  const [exams, setExams] = useState<ExamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [examStatus, setExamStatus] = useState<Record<string, ExamStatus>>({});
  const [userId, setUserId] = useState('');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

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
          navigate('/');
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

  const checkAuth = async () => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId || '');
    
    if (storedUserId) {
      // 开发环境自动通过认证，方便测试
      if (import.meta.env.DEV) {
        console.log('Development mode: skipping password verification');
        setIsAuthenticated(true);
        return;
      }
      
      // 检查是否已经在HomePage中验证过密码
      // 通过URL参数来判断
      const urlParams = new URLSearchParams(window.location.search);
      const authenticated = urlParams.get('authenticated');
      
      if (authenticated === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsPasswordRequired(true);
      }
    } else {
      navigate('/');
    }
  };

  const handlePasswordVerify = async () => {
    if (userId && inputPassword) {
      const isVerified = await verifyPassword(userId, inputPassword);
      if (isVerified) {
        setIsPasswordRequired(false);
        setIsAuthenticated(true);
        setInputPassword('');
        setPasswordError('');
      } else {
        setPasswordError('密码错误，请重试');
      }
    } else {
      setPasswordError('请输入密码');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetch('/data/exam/_index.json')
        .then(async (examRes) => {
          if (!examRes.ok) {
            throw new Error('Failed to load exam index');
          }
          const data: ExamIndex = await examRes.json();
          
          // 直接使用数据，不依赖exam-schedule API
          setExams(data.exams);
          const status: Record<string, ExamStatus> = {};
          data.exams.forEach(exam => {
            status[exam.id] = checkExamAvailability(exam).status;
          });
          setExamStatus(status);
        })
        .catch(error => {
          console.error('Error loading exams:', error);
          // 即使出错，也设置一个空数组，避免页面一直显示加载中
          setExams([]);
          setExamStatus({});
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (isPasswordRequired) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            请输入密码
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            请输入您的密码以继续考试
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
              onClick={() => navigate('/')}
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
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return difficulty;
    }
  };

  const getStatusBadge = (exam: ExamInfo) => {
    const availability = checkExamAvailability(exam);
    switch (availability.status) {
      case 'not_started':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            未开始 · {formatDateTime(availability.startsAt!)}
          </span>
        );
      case 'ended':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            已结束
          </span>
        );
      case 'available':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            可参加
          </span>
        );
      case 'no_schedule':
        return null;
    }
  };

  const handleExamClick = (exam: ExamInfo) => {
    const availability = checkExamAvailability(exam);
    if (availability.status === 'not_started') {
      alert(`考试尚未开始\n开始时间：${formatDateTime(availability.startsAt!)}`);
      return;
    }
    if (availability.status === 'ended') {
      alert('考试已结束');
      return;
    }
    navigate(`/exam/${exam.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Python 考试中心
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          选择一场考试开始你的测评
        </p>
      </div>

      <div className="grid gap-6">
        {exams.map((exam) => {
          const isAvailable = examStatus[exam.id] === 'available' || examStatus[exam.id] === 'no_schedule';
          return (
            <div
              key={exam.id}
              onClick={() => handleExamClick(exam)}
              className={`block bg-white dark:bg-gray-800 rounded-xl border p-6 hover:shadow-lg transition-all duration-200 group cursor-pointer ${
                isAvailable 
                  ? 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600' 
                  : 'border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {exam.title}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                      {getDifficultyText(exam.difficulty)}
                    </span>
                    {getStatusBadge(exam)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {exam.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span>⏱</span> {exam.duration} 分钟
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>📝</span> {exam.questionCount} 题
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>🎯</span> 满分 {exam.totalScore} 分
                    </span>
                    {exam.startTime && exam.endTime && (
                      <span className="flex items-center gap-1.5">
                        <span>📅</span> {formatDateTime(exam.startTime)} - {formatDateTime(exam.endTime)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isAvailable 
                      ? 'bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <span className="text-2xl">📝</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">考试须知</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• 考试采用完全隔离模式，确保公平性</li>
          <li>• 题目顺序会根据你的身份信息随机打乱</li>
          <li>• 切换标签页或复制粘贴会被记录审计</li>
          <li>• 考试时间结束会自动提交</li>
          <li>• 断网情况下答案会本地保存</li>
          <li>• 请在规定时间内完成考试</li>
        </ul>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { Terminal } from '../components/Terminal';
import { evaluatorRouter } from '../evaluator/router';
import { storage } from '../store/idb';
import type { Question, EvalResult, PracticeSet } from '../types';

interface ChapterInfo {
  id: string;
  title: string;
  questionCount: number;
}

export function PracticePage() {
  const { chapterId } = useParams<{ chapterId?: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<EvalResult | null>(null);
  const [logs, setLogs] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const currentChapterId = chapterId || 'ch01_basics';

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
        throw new Error('Failed to verify password');
      }
      
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  };

  const checkAuth = useCallback(async () => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId || '');
    
    if (storedUserId) {
      setIsPasswordRequired(true);
    } else {
      navigate('/');
    }
  }, [navigate]);

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

  const loadChapterIndex = useCallback(async () => {
    try {
      const response = await fetch('/data/practice/_index.json');
      if (response.ok) {
        const data = await response.json();
        setChapters(data.chapters);
      }
    } catch (e) {
      console.error('Failed to load chapter index:', e);
    }
  }, []);

  const loadPracticeSet = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/data/practice/${id}.json`);
      if (!response.ok) throw new Error('Failed to load practice set');
      const data = await response.json();
      setPracticeSet(data);
      if (data.questions.length > 0) {
        setCurrentQuestion(data.questions[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSavedCode = useCallback(async () => {
    if (!currentQuestion) return;
    const savedCode = await storage.getPracticeCode(currentQuestion.id);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(currentQuestion.initialCode);
    }
  }, [currentQuestion]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    checkAuth();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      loadChapterIndex();
    }
  }, [isAuthenticated, loadChapterIndex]);

  useEffect(() => {
    if (currentChapterId && isAuthenticated) {
      /* eslint-disable react-hooks/set-state-in-effect */
      loadPracticeSet(currentChapterId);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [currentChapterId, isAuthenticated, loadPracticeSet]);

  useEffect(() => {
    if (currentQuestion) {
      /* eslint-disable react-hooks/set-state-in-effect */
      loadSavedCode();
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [currentQuestion, loadSavedCode]);

  const saveCode = useCallback(async (newCode: string) => {
    if (!currentQuestion) return;
    await storage.savePracticeCode(currentQuestion.id, newCode);
  }, [currentQuestion]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveCode(newCode);
    setResult(null);
  };

  const syncPracticeRecord = async (chapterId: string, score: number, totalQuestions: number, answers: Record<string, string>) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          practice: {
            [chapterId]: {
              chapterId,
              score,
              totalQuestions,
              completedAt: Date.now(),
              answers
            }
          }
        })
      });

      if (!response.ok) {
        console.error('Sync failed:', await response.text());
      } else {
        console.log('Practice record synced successfully');
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const handleRun = () => {
    if (!currentQuestion) return;
    setIsRunning(true);
    setResult(null);
    setLogs('');

    evaluatorRouter.evaluate(currentQuestion, code, (evalResult) => {
      setResult(evalResult);
      setIsRunning(false);
      
      // 同步练习记录到后台
      if (evalResult) {
        const chapterId = currentChapterId;
        // EvalResult 中的 score 已经是百分比值，我们需要转换为题目数量
        const score = evalResult.passed ? 1 : 0;
        const totalQuestions = 1;
        const answers = { [currentQuestion.id]: code };
        
        syncPracticeRecord(chapterId, score, totalQuestions, answers);
      }
    });
  };

  const handleReset = async () => {
    if (!currentQuestion) return;
    const confirmed = window.confirm('Reset code to initial template?');
    if (confirmed) {
      setCode(currentQuestion.initialCode);
      await storage.clearPracticeCode(currentQuestion.id);
      setResult(null);
    }
  };

  const handleQuestionSelect = (question: Question) => {
    setCurrentQuestion(question);
    setResult(null);
  };

  const handleChapterChange = (newChapterId: string) => {
    window.location.replace(`/practice/${newChapterId}`);
  };

  if (isPasswordRequired) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            请输入密码
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            请输入您的密码以继续练习
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button onClick={() => loadPracticeSet(currentChapterId)} className="btn btn-primary mt-4">
          重试
        </button>
      </div>
    );
  }

  if (!practiceSet || !currentQuestion) {
    return <div className="text-center py-12 text-gray-500">没有加载练习集</div>;
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      <aside className="w-72 flex-shrink-0 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">练习章节</h2>
          <select
            value={currentChapterId}
            onChange={(e) => handleChapterChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title} ({ch.questionCount}题)
              </option>
            ))}
          </select>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{practiceSet.title}</h3>
          <p className="text-sm text-gray-500">{practiceSet.description}</p>
        </div>
        
        <nav className="p-2">
          {practiceSet.questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => handleQuestionSelect(q)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                currentQuestion.id === q.id
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-sm font-medium">{index + 1}.</span>{' '}
              <span className="text-sm">{q.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {currentQuestion.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {currentQuestion.instruction}
          </p>
          {/* 显示测试用例 */}
          {currentQuestion.testConfig.expected && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">期望输出：</h4>
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                {currentQuestion.testConfig.expected}
              </pre>
            </div>
          )}
          {currentQuestion.testConfig.mockInputs && currentQuestion.testConfig.mockInputs.length > 0 && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">模拟输入：</h4>
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                {currentQuestion.testConfig.mockInputs.join('\n')}
              </pre>
            </div>
          )}
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          <div className="flex-1 flex flex-col min-w-0 editor-container">
            <Editor
              value={code}
              onChange={handleCodeChange}
              theme={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="btn btn-primary"
              >
                {isRunning ? '运行中...' : '运行'}
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
                重置
              </button>
            </div>
          </div>

          <div className="w-1/2 flex flex-col min-w-0">
            <Terminal logs={logs} result={result} isRunning={isRunning} />
          </div>
        </div>
      </div>
    </div>
  );
}

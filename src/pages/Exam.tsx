import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { Terminal } from '../components/Terminal';
import { ExamTimer } from '../components/ExamTimer';
import { evaluatorRouter } from '../evaluator/router';
import { storage } from '../store/idb';
import { syncQueue } from '../store/sync-queue';
import { generateDeterministicSeed, shuffleArray } from '../utils/crypto';
import { checkExamAvailability, formatDateTime } from '../utils/exam-schedule';
import type { ExamSet, ExamQuestion, ExamSession, EvalResult, SyncPayload, Question, TestConfig, ExamInfo } from '../types';

const MAX_TAB_SWITCHES = 3;

export function ExamPage() {
  const { examId } = useParams<{ examId?: string }>();
  const navigate = useNavigate();
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, EvalResult>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [violation, setViolation] = useState(false);
  const [violationMessage, setViolationMessage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [audit] = useState<ExamSession['audit']>({
    focus_loss: 0,
    tab_switch: 0,
    paste_attempts: 0,
    fullscreen_change: 0,
  });

  const lastSyncRef = useRef<number>(0);
  const versionIdRef = useRef<string>('');
  const tabSwitchCountRef = useRef<number>(0);
  const violationRef = useRef<boolean>(false);

  const syncServerStatus = async (versionId: string, userId: string) => {
    try {
      const statusResponse = await fetch(`/api/invigilation/status?userId=${userId}&examId=${versionId}`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.ok) {
          if (statusData.tabSwitchCount !== undefined) {
            setTabSwitchCount(statusData.tabSwitchCount);
            tabSwitchCountRef.current = statusData.tabSwitchCount;
            audit.tab_switch = statusData.tabSwitchCount;
            audit.focus_loss = statusData.tabSwitchCount;

            const currentSession = await storage.getExamSession(versionId, userId);
            if (currentSession) {
              const updatedSession = {
                ...currentSession,
                audit: {
                  ...currentSession.audit,
                  tab_switch: statusData.tabSwitchCount,
                  focus_loss: statusData.tabSwitchCount,
                }
              };
              await storage.saveExamSession(updatedSession);
              setSession(updatedSession);
            }
          }
          if (statusData.hasViolation) {
            setViolation(true);
            setViolationMessage(statusData.violationReason || '您因违反考试规则已被禁止参加本次考试');
            await storage.saveExamViolation(versionId, {
              reason: statusData.violationReason || '违规',
              timestamp: Date.now(),
              tabSwitchCount: statusData.tabSwitchCount || 3,
            });
            return true;
          } else {
            // 服务器没有违规记录，清除本地违规记录
            const localViolation = await storage.getExamViolation(versionId);
            if (localViolation) {
              await storage.clearExamViolation(versionId);
              setViolation(false);
              setViolationMessage(null);
              violationRef.current = false;
            }
            // 如果服务器也没有已提交记录，重置本地session允许重新考试
            if (!statusData.hasSubmittedRecord) {
              const localSession = await storage.getExamSession(versionId, userId);
              if (localSession && localSession.status !== 'ongoing') {
                await storage.clearExamDraft(versionId);
                // 重置本地session为全新状态，让学生有完整的考试时长
                await storage.saveExamSession({
                  ...localSession,
                  status: 'ongoing',
                  score: undefined,
                  submitted_at: undefined,
                  startedAt: Date.now(),
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Failed to sync server status:', err);
    }
    return false;
  };

  const loadExam = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem('userId');
      const storedUserName = localStorage.getItem('userName');
      console.log('ExamPage - userId:', userId, 'userName:', storedUserName);
      if (!userId) {
        console.log('ExamPage - No userId found');
        throw new Error('请先设置身份');
      }
      if (storedUserName) {
        setUserName(storedUserName);
      }

      const [examIndexResponse, scheduleResponse] = await Promise.all([
        fetch('/data/exam/_index.json'),
        fetch('/api/exam-schedule')
      ]);

      let examInfo: any = null;
      let hasMultipleVersions = false;
      let scheduleData: Record<string, { startTime: string | null; endTime: string | null; duration?: number | null }> = {};

      if (scheduleResponse.ok) {
        try {
          const scheduleJson = await scheduleResponse.json();
          scheduleData = scheduleJson.schedule || {};
        } catch {
          // 忽略schedule解析错误
        }
      }

      if (examIndexResponse.ok) {
        const examIndex = await examIndexResponse.json();
        examInfo = examIndex.exams.find((e: ExamInfo) => e.id === examId);
        if (examInfo) {
          hasMultipleVersions = examInfo.hasMultipleVersions;

          const examSchedule = scheduleData[examId || ''];
          if (examSchedule) {
            if (examSchedule.startTime) {
              examInfo.startTime = examSchedule.startTime;
            }
            if (examSchedule.endTime) {
              examInfo.endTime = examSchedule.endTime;
            }
            if (examSchedule.duration !== undefined && examSchedule.duration !== null) {
              examInfo.duration = examSchedule.duration;
            }
          }
          
          const availability = checkExamAvailability(examInfo);
          if (availability.status === 'not_started') {
            setError(`考试尚未开始\n开始时间：${formatDateTime(availability.startsAt!)}`);
            setLoading(false);
            return;
          }
          if (availability.status === 'ended') {
            setError('考试已结束');
            setLoading(false);
            return;
          }
        }
      }

      // 检查是否有现有会话
      const existingSessionCheck = await storage.getExamSession(examId || 'mid_term', userId);
      let versionId: string = examId || 'mid_term';
      
      // 如果有多版本考试
      if (hasMultipleVersions && examId === 'final_exam') {
        const openVersions = (examInfo as any)?.openVersions as string[] | undefined;
        
        // 如果配置了开放版本，跳回考试列表让学生选择
        if (openVersions && openVersions.length > 0) {
          navigate('/exams');
          return;
        }
        
        if (existingSessionCheck && existingSessionCheck.exam_id !== examId) {
          versionId = existingSessionCheck.exam_id;
        } else {
          const versions = ['final_exam_A', 'final_exam_B', 'final_exam_C'];
          const seed = await generateDeterministicSeed(userId, examId || 'final_exam');
          const seedNumber = parseInt(seed, 16) || 0;
          const versionIndex = Math.abs(seedNumber % 3);
          versionId = versions[versionIndex];
        }
      }

      versionIdRef.current = versionId;

      // 先从服务端同步最新状态
      const hasViolationFromServer = await syncServerStatus(versionId, userId);
      if (hasViolationFromServer) {
        setLoading(false);
        return;
      }

      // 检查是否因违规被禁止参加考试
      const violationCheck = await storage.getExamViolation(versionId);
      if (violationCheck) {
        setViolation(true);
        setViolationMessage('您因切屏次数过多已被禁止参加本次考试');
        setLoading(false);
        return;
      }

      // 尝试从API获取考试数据
      let data: ExamSet;
      try {
        const apiUrl = `/api/exam-paper?examId=${examId}&userId=${userId}`;
        const apiResponse = await fetch(apiUrl);

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          if (apiData.ok && apiData.examPaper) {
            // 从API获取的数据
            data = {
              id: apiData.examPaper.id,
              title: apiData.examPaper.title,
              description: apiData.examPaper.description,
              duration: apiData.examPaper.duration,
              totalScore: apiData.examPaper.totalScore,
              passingScore: apiData.examPaper.passingScore,
              version: apiData.examPaper.version,
              questions: apiData.examPaper.questions
            };
            console.log('ExamPage - Loaded from API:', data.id);
          } else {
            throw new Error(apiData.error || 'API returned no data');
          }
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.warn('ExamPage - API failed, falling back to JSON:', apiError);
        // API失败时回退到JSON文件
        const response = await fetch(`/data/exam/${versionId}.json`);
        if (!response.ok) throw new Error('Failed to load exam');
        data = await response.json();
      }

      // 如果管理员设置了时长，覆盖JSON中的默认时长
      const examSchedule = scheduleData[examId || ''];
      if (examSchedule?.duration !== undefined && examSchedule?.duration !== null) {
        data.duration = examSchedule.duration;
      }

      const seed = await generateDeterministicSeed(userId, versionId);
      const shuffledQuestions = shuffleArray(data.questions, seed);

      setExamSet(data);
      setQuestions(shuffledQuestions);

      const existingSession = await storage.getExamSession(versionId, userId);
      if (existingSession) {
        if (existingSession.audit) {
          audit.focus_loss = existingSession.audit.focus_loss || 0;
          audit.tab_switch = existingSession.audit.tab_switch || 0;
          audit.paste_attempts = existingSession.audit.paste_attempts || 0;
          audit.fullscreen_change = existingSession.audit.fullscreen_change || 0;
          setTabSwitchCount(existingSession.audit.tab_switch || 0);
          tabSwitchCountRef.current = existingSession.audit.tab_switch || 0;
        }
        if (existingSession.status !== 'ongoing') {
          setIsSubmitted(true);
          setSession(existingSession);
          if (existingSession.score !== undefined) {
            setResults({});
          }
          const draft = await storage.getExamDraft(versionId);
          if (draft) setAnswers(draft);
        } else {
          setSession(existingSession);
          const draft = await storage.getExamDraft(versionId);
          if (draft) setAnswers(draft);
        }
        // 使用已有session的开始时间，保证刷新页面后计时器继续
        setStartTime(existingSession.startedAt || Date.now());
      } else {
        const now = Date.now();
        const newSession: ExamSession = {
          exam_id: versionId,
          user_id: userId,
          seed,
          status: 'ongoing',
          startedAt: now,
          audit,
        };
        await storage.saveExamSession(newSession);
        setSession(newSession);
        setStartTime(now);
      }

      const savedDraft = await storage.getExamDraft(versionId);
      if (savedDraft) {
        setAnswers(savedDraft);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async (reason: string) => {
    if (!examSet || !session) return;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const score = calculateScore();

    // 保存违规记录
    await storage.saveExamViolation(examSet.id, {
      reason,
      timestamp: Date.now(),
      tabSwitchCount,
    });

    const updatedSession: ExamSession = {
      ...session,
      status: 'submitted',
      score,
      submitted_at: new Date().toISOString(),
    };

    const payload = {
      userId,
      practice: {},
      exam: {
        [examSet.id]: {
          examId: examSet.id,
          score,
          totalQuestions: questions.length,
          startedAt: startTime,
          completedAt: Date.now(),
          answers,
        },
      },
      audit: {
        [examSet.id]: [
          { type: 'focus_loss', timestamp: Date.now(), data: { count: audit.focus_loss } },
          { type: 'tab_switch', timestamp: Date.now(), data: { count: tabSwitchCount, reason } },
          { type: 'paste_attempts', timestamp: Date.now(), data: { count: audit.paste_attempts } },
          { type: 'fullscreen_change', timestamp: Date.now(), data: { count: audit.fullscreen_change } },
        ],
      },
    };

    await syncQueue.enqueue(payload as SyncPayload);
    await storage.saveExamSession(updatedSession);
    await storage.clearExamDraft(examSet.id);

    setSession(updatedSession);
    setIsSubmitted(true);
    setViolation(true);
    setViolationMessage(reason);
  };

  const setupAuditListeners = () => {
    const handleVisibilityChange = async () => {
      if (document.hidden && !violationRef.current) {
        audit.focus_loss++;
        audit.tab_switch++;
        tabSwitchCountRef.current++;
        const newCount = tabSwitchCountRef.current;
        setTabSwitchCount(newCount);
        triggerSync(true);

        if (session) {
          const updatedSession = {
            ...session,
            audit: {
              ...session.audit,
              focus_loss: audit.focus_loss,
              tab_switch: audit.tab_switch,
              paste_attempts: audit.paste_attempts,
              fullscreen_change: audit.fullscreen_change,
            }
          };
          await storage.saveExamSession(updatedSession);
          setSession(updatedSession);
        }

        if (newCount >= MAX_TAB_SWITCHES) {
          handleAutoSubmit(`切屏次数过多（${newCount}次），考试自动终止`);
        } else {
          const remaining = MAX_TAB_SWITCHES - newCount;
          alert(`⚠️ 切屏警告！\n\n您已离开考试页面 ${newCount} 次。\n再离开 ${remaining} 次将自动终止考试！\n\n请保持在本页面进行考试。`);
        }
      } else if (!document.hidden && !violationRef.current) {
        const userId = localStorage.getItem('userId');
        const versionId = versionIdRef.current;
        if (userId && versionId) {
          await syncServerStatus(versionId, userId);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('paste', () => {
      audit.paste_attempts++;
    });

    document.addEventListener('fullscreenchange', () => {
      audit.fullscreen_change++;
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  const calculateScore = (): number => {
    const passedCount = Object.values(results).filter((r) => r.passed).length;
    return questions.length > 0 ? (passedCount / questions.length) * 100 : 0;
  };

  const triggerSync = useCallback(async (force = false) => {
    if (!examSet || !session) return;
    const now = Date.now();
    if (!force && now - lastSyncRef.current < 30000) return; // 延长到 30 秒
    lastSyncRef.current = now;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // 只同步 audit 数据（监考需要），不同步完整的考试答案
    const payload: SyncPayload = {
      userId,
      practice: {},
      audit: {
        [examSet.id]: [
          { type: 'focus_loss', timestamp: Date.now(), data: { count: audit.focus_loss } },
          { type: 'tab_switch', timestamp: Date.now(), data: { count: tabSwitchCount } },
        ],
      },
    };

    // 只有提交考试时才同步完整的 exam 数据
    if (isSubmitted) {
      payload.exam = {
        [examSet.id]: {
          examId: examSet.id,
          answers,
          score: calculateScore(),
          totalQuestions: questions.length,
          startedAt: startTime,
          completedAt: Date.now(),
        },
      };
    }

    await syncQueue.enqueue(payload);
  }, [examSet, session, answers, audit, tabSwitchCount, isSubmitted]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    loadExam();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    violationRef.current = violation;
  }, [violation]);

  useEffect(() => {
    if (!loading && !violation && examSet) {
      const cleanup = setupAuditListeners();
      syncQueue.startAutoSync(30000);

      const userId = localStorage.getItem('userId');
      const versionId = versionIdRef.current;
      
      const statusInterval = setInterval(() => {
        if (userId && versionId && !violationRef.current) {
          syncServerStatus(versionId, userId);
        }
      }, 30000);

      return () => {
        syncQueue.stopAutoSync();
        clearInterval(statusInterval);
        if (cleanup) cleanup();
      };
    }
  }, [loading, violation, examSet]);

  const handleAnswerChange = (questionId: string, code: string) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: code };
      storage.saveExamDraft(examSet?.id || '', updated);
      triggerSync();
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!examSet || !session) return;

    const confirmed = window.confirm('确定要提交考试吗？提交后将无法修改。');
    if (!confirmed) return;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const score = calculateScore();

    const updatedSession: ExamSession = {
      ...session,
      status: 'submitted',
      score,
      submitted_at: new Date().toISOString(),
    };

    const payload = {
      userId,
      practice: {},
      exam: {
        [examSet.id]: {
          examId: examSet.id,
          score,
          totalQuestions: questions.length,
          startedAt: startTime,
          completedAt: Date.now(),
          answers,
        },
      },
      audit: {
        [examSet.id]: [
          { type: 'focus_loss', timestamp: Date.now(), data: { count: audit.focus_loss } },
          { type: 'tab_switch', timestamp: Date.now(), data: { count: tabSwitchCount } },
          { type: 'paste_attempts', timestamp: Date.now(), data: { count: audit.paste_attempts } },
          { type: 'fullscreen_change', timestamp: Date.now(), data: { count: audit.fullscreen_change } },
        ],
      },
    };

    await syncQueue.enqueue(payload as SyncPayload);
    await storage.saveExamSession(updatedSession);
    await storage.clearExamDraft(examSet.id);

    setSession(updatedSession);
    setIsSubmitted(true);
  };

  const handleExpire = () => {
    handleSubmit();
  };

  const handleShowAnswer = (questionId: string) => {
    const question = questions[currentIndex];
    const testConfig = question.testConfig as TestConfig;
    const questionForEval: Question = {
      id: question.id,
      type: question.type,
      title: question.title,
      instruction: question.instruction,
      initialCode: question.initialCode,
      testConfig: {
        timeout_ms: testConfig.timeout_ms,
        weight: testConfig.weight,
        expected: testConfig.expected,
        mockInputs: testConfig.mockInputs || [],
        hiddenCases: testConfig.hiddenCases,
        constraints: testConfig.constraints,
      },
    };
    evaluatorRouter.evaluate(
      questionForEval,
      answers[questionId] || question.initialCode,
      (result) => {
        // 考试模式下 worker 已经不返回 details，保留防御性清理
        if (result.details) {
          delete result.details.expected;
          delete result.details.actual;
        }
        setResults((prev) => ({ ...prev, [questionId]: result }));
      },
      examSet?.id,
      questionId
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (violation) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold mb-4 text-red-600">考试已终止</h1>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800 mb-8">
          <p className="text-red-700 dark:text-red-400 text-lg">
            {violationMessage || '您因违反考试规则已被禁止继续参加本次考试'}
          </p>
          {tabSwitchCount > 0 && (
            <p className="text-red-600 dark:text-red-500 mt-2">
              切屏次数：{tabSwitchCount} / {MAX_TAB_SWITCHES}
            </p>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          如有异议，请联系监考老师。
        </p>
        <a href="/" className="btn btn-primary">
          返回首页
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <a href="/" className="btn btn-primary mt-4 inline-block">
          返回首页
        </a>
      </div>
    );
  }

  if (!examSet || questions.length === 0) {
    return <div className="text-center py-12 text-gray-500">考试加载中...</div>;
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">考试已提交</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          您的考试已成功提交。
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">您的成绩</h2>
          <p className="text-5xl font-bold text-purple-600">{Math.round(session?.score ?? calculateScore())}%</p>
        </div>
        <a href="/" className="btn btn-secondary mt-8 inline-block">
          返回首页
        </a>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      <aside className="w-48 flex-shrink-0 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {userName && (
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>👤</span>
              <span className="font-medium text-gray-900 dark:text-white">{userName}</span>
            </div>
          )}
          <h2 className="font-semibold text-gray-900 dark:text-white">{examSet.title}</h2>
          <ExamTimer duration={examSet.duration} startTime={startTime} onExpire={handleExpire} />
          {tabSwitchCount > 0 && (
            <div className="mt-2 text-xs text-orange-500">
              ⚠️ 切屏 {tabSwitchCount}/{MAX_TAB_SWITCHES}
            </div>
          )}
        </div>
        <nav className="p-2">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                currentIndex === index
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : results[q.id]?.passed
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : answers[q.id]
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-sm font-medium">Q{index + 1}</span>
              {answers[q.id] && (
                <span className="ml-1 text-xs">({results[q.id]?.passed ? '✓' : '○'})</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={handleSubmit} className="btn btn-primary w-full">
            提交考试
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Q{currentIndex + 1}: {currentQuestion.title}
            </h3>
            <span className="text-sm text-gray-500">
              {currentQuestion.type}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {currentQuestion.instruction}
          </p>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            <Editor
              value={answers[currentQuestion.id] || currentQuestion.initialCode}
              onChange={(code) => handleAnswerChange(currentQuestion.id, code)}
              theme={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
            />
          </div>

          <div className="w-1/2 flex flex-col min-w-0">
            <Terminal
              logs=""
              result={results[currentQuestion.id]}
              isRunning={false}
            />
            <button
              onClick={() => handleShowAnswer(currentQuestion.id)}
              className="btn btn-secondary mt-4"
            >
              检查答案
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

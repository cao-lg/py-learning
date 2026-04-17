import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { Terminal } from '../components/Terminal';
import { ExamTimer } from '../components/ExamTimer';
import { evaluatorRouter } from '../evaluator/router';
import { storage } from '../store/idb';
import { syncQueue } from '../store/sync-queue';
import { generateDeterministicSeed, generateSubmissionHash, shuffleArray } from '../utils/crypto';
import type { ExamSet, ExamQuestion, ExamSession, EvalResult, SyncPayload, Question } from '../types';

export function ExamPage() {
  const { examId } = useParams<{ examId?: string }>();
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
  const [audit] = useState<ExamSession['audit']>({
    focus_loss: 0,
    tab_switch: 0,
    paste_attempts: 0,
    fullscreen_change: 0,
  });

  const lastSyncRef = useRef<number>(0);

  const loadExam = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await storage.getUserId();
      if (!userId) {
        throw new Error('Please bind your identity first');
      }

      const response = await fetch(`/data/exam/${examId || 'mid_term'}.json`);
      if (!response.ok) throw new Error('Failed to load exam');
      const data: ExamSet = await response.json();

      const seed = await generateDeterministicSeed(userId, data.id);
      const shuffledQuestions = shuffleArray(data.questions, seed);

      setExamSet(data);
      setQuestions(shuffledQuestions);
      setStartTime(Date.now());

      const existingSession = await storage.getExamSession(data.id, userId);
      if (existingSession && existingSession.status !== 'ongoing') {
        setIsSubmitted(true);
        const draft = await storage.getExamDraft(data.id);
        if (draft) setAnswers(draft);
      } else {
        const newSession: ExamSession = {
          exam_id: data.id,
          user_id: userId,
          seed,
          status: 'ongoing',
          audit,
        };
        await storage.saveExamSession(newSession);
        setSession(newSession);
      }

      const savedDraft = await storage.getExamDraft(data.id);
      if (savedDraft) {
        setAnswers(savedDraft);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const setupAuditListeners = () => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        audit.focus_loss++;
        triggerSync();
      }
    });

    document.addEventListener('paste', () => {
      audit.paste_attempts++;
    });

    document.addEventListener('fullscreenchange', () => {
      audit.fullscreen_change++;
    });
  };

  const calculateScore = (): number => {
    const passedCount = Object.values(results).filter((r) => r.passed).length;
    return questions.length > 0 ? (passedCount / questions.length) * 100 : 0;
  };

  const triggerSync = useCallback(async () => {
    if (!examSet || !session) return;
    const now = Date.now();
    if (now - lastSyncRef.current < 10000) return;
    lastSyncRef.current = now;

    const userId = await storage.getUserId();
    if (!userId) return;

    const payload: SyncPayload & { exam: Record<string, { answers: Record<string, string>; score: number; status: string }> } = {
      user_id: userId,
      practice: {},
      exam: {
        [examSet.id]: {
          answers,
          score: calculateScore(),
          status: 'ongoing',
        },
      },
      audit: {
        [examSet.id]: audit,
      },
      hashes: {},
    };

    await syncQueue.enqueue(payload);
  }, [examSet, session, answers, audit]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    loadExam();
    setupAuditListeners();
    /* eslint-enable react-hooks/set-state-in-effect */
    syncQueue.startAutoSync(30000);

    return () => {
      syncQueue.stopAutoSync();
    };
  }, [examId]);

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

    const confirmed = window.confirm('Are you sure you want to submit? This action cannot be undone.');
    if (!confirmed) return;

    const userId = await storage.getUserId();
    if (!userId) return;

    const score = calculateScore();
    const submissionHash = await generateSubmissionHash(
      JSON.stringify(answers),
      Date.now(),
      session.seed
    );

    const updatedSession: ExamSession = {
      ...session,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    };

    const payload = {
      user_id: userId,
      practice: {},
      exam: {
        [examSet.id]: {
          score,
          status: 'submitted',
        },
      },
      audit: {
        [examSet.id]: audit,
      },
      hashes: {
        [examSet.id]: submissionHash,
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
    const questionForEval: Question = {
      id: question.id,
      type: question.type,
      title: question.title,
      instruction: question.instruction,
      initialCode: question.initialCode,
      testConfig: {
        timeout_ms: question.testConfig.timeout_ms,
      },
    };
    evaluatorRouter.evaluate(
      questionForEval,
      answers[questionId] || question.initialCode,
      (result) => {
        setResults((prev) => ({ ...prev, [questionId]: result }));
      }
    );
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
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <a href="/" className="btn btn-primary mt-4 inline-block">
          Go Home
        </a>
      </div>
    );
  }

  if (!examSet || questions.length === 0) {
    return <div className="text-center py-12 text-gray-500">No exam loaded</div>;
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Exam Submitted</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your exam has been submitted successfully.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Your Score</h2>
          <p className="text-5xl font-bold text-purple-600">{Math.round(calculateScore())}%</p>
        </div>
        <a href="/" className="btn btn-secondary mt-8 inline-block">
          Back to Home
        </a>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      <aside className="w-48 flex-shrink-0 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">{examSet.title}</h2>
          <ExamTimer duration={examSet.duration} startTime={startTime} onExpire={handleExpire} />
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
            Submit Exam
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
              Check Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

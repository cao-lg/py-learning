import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { Terminal } from '../components/Terminal';
import { evaluatorRouter } from '../evaluator/router';
import { storage } from '../store/idb';
import type { Question, EvalResult, PracticeSet } from '../types';

export function PracticePage() {
  const { chapterId } = useParams<{ chapterId?: string }>();
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<EvalResult | null>(null);
  const [logs, setLogs] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPracticeSet();
  }, [chapterId]);

  useEffect(() => {
    if (currentQuestion) {
      loadSavedCode();
    }
  }, [currentQuestion]);

  const loadPracticeSet = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/data/practice/${chapterId || 'ch01_basics'}.json`);
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
  };

  const loadSavedCode = async () => {
    if (!currentQuestion) return;
    const savedCode = await storage.getPracticeCode(currentQuestion.id);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(currentQuestion.initialCode);
    }
  };

  const saveCode = useCallback(async (newCode: string) => {
    if (!currentQuestion) return;
    await storage.savePracticeCode(currentQuestion.id, newCode);
  }, [currentQuestion]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveCode(newCode);
    setResult(null);
  };

  const handleRun = () => {
    if (!currentQuestion) return;
    setIsRunning(true);
    setResult(null);
    setLogs('');

    evaluatorRouter.evaluate(currentQuestion, code, (evalResult) => {
      setResult(evalResult);
      setIsRunning(false);
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
        <button onClick={loadPracticeSet} className="btn btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!practiceSet || !currentQuestion) {
    return <div className="text-center py-12 text-gray-500">No practice set loaded</div>;
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      <aside className="w-64 flex-shrink-0 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">{practiceSet.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{practiceSet.description}</p>
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
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
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
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button onClick={handleReset} className="btn btn-secondary">
                Reset
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

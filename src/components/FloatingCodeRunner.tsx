import { useState } from 'react';
import { Editor } from './Editor';
import { evaluatorRouter } from '../evaluator/router';
import type { EvalResult } from '../types';

interface FloatingCodeRunnerProps {
  initialCode?: string;
}

export function FloatingCodeRunner({ initialCode = '' }: FloatingCodeRunnerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput('');
    setError('');

    const question = {
      id: 'inline-runner',
      type: 'output' as const,
      title: 'Inline Runner',
      instruction: '',
      initialCode: code,
      testConfig: {
        expected: null as unknown as string,
        timeout_ms: 5000,
      },
    };

    evaluatorRouter.evaluate(question, code, (evalResult: EvalResult) => {
      if (evalResult.passed) {
        setOutput(evalResult.details?.actual || '执行完成');
      } else {
        setOutput(evalResult.details?.actual || '');
        if (evalResult.message && !evalResult.message.includes('mismatch')) {
          setError(evalResult.message);
        }
      }
      setIsRunning(false);
    });
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isExpanded ? 'w-[600px]' : 'w-12'
      }`}
    >
      {isExpanded ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-purple-600 text-white">
            <span className="font-medium">Code Runner</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-purple-700 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="h-[200px] border-b border-gray-200 dark:border-gray-700">
            <Editor
              value={code}
              onChange={setCode}
              theme={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
            />
          </div>
          
          <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-900">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="btn btn-primary flex-1"
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={() => { setCode(''); setOutput(''); setError(''); }}
              className="btn btn-secondary"
            >
              Clear
            </button>
          </div>
          
          {(output || error) && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-900 text-gray-100 font-mono text-sm max-h-[150px] overflow-y-auto">
              {error && <p className="text-red-400 mb-2">{error}</p>}
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Open Code Runner"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
      )}
    </div>
  );
}

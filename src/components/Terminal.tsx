import type { EvalResult } from '../types';

interface TerminalProps {
  logs: string;
  result?: EvalResult | null;
  isRunning?: boolean;
}

export function Terminal({ logs, result, isRunning }: TerminalProps) {
  return (
    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm min-h-[200px]">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-gray-400 text-xs">Output</span>
      </div>

      {isRunning && (
        <div className="flex items-center gap-2 text-yellow-400">
          <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full" />
          <span>Running...</span>
        </div>
      )}

      {logs && (
        <pre className="whitespace-pre-wrap text-green-400 mb-3">{logs}</pre>
      )}

      {result && (
        <div
          className={`p-3 rounded-lg ${
            result.passed
              ? 'bg-green-900/30 border border-green-700'
              : 'bg-red-900/30 border border-red-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`w-2 h-2 rounded-full ${
                result.passed ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
              {result.passed ? 'PASSED' : 'FAILED'}
            </span>
            <span className="text-gray-400">
              Score: {Math.round(result.score * 100)}%
            </span>
          </div>
          <p className="text-gray-200">{result.message}</p>
          {result.details && (
            <div className="mt-3 space-y-2 text-xs">
              {result.details.expected && (
                <div>
                  <span className="text-gray-400">Expected: </span>
                  <pre className="text-green-300 inline">{result.details.expected}</pre>
                </div>
              )}
              {result.details.actual && (
                <div>
                  <span className="text-gray-400">Actual: </span>
                  <pre className="text-red-300 inline">{result.details.actual}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!logs && !result && !isRunning && (
        <p className="text-gray-500 italic">Run your code to see output here</p>
      )}
    </div>
  );
}

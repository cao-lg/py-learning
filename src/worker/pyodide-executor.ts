import type { TestConfig, PyodideWorkerMessage, PyodideWorkerResponse, EvalResult } from '../types';
import { compareOutputs } from '../utils/normalize';

declare function importScripts(...urls: string[]): void;
declare const loadPyodide: (config: { indexURL: string }) => Promise<PyodideInstance>;

let pyodide: PyodideInstance | null = null;
const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const CACHE_NAME = 'pyodide-wasm-cache-v1';

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string[]) => Promise<void>;
}

async function cachePyodideAssets(): Promise<void> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(PYODIDE_CDN + 'pyodide.asm.wasm');
    if (!response) {
      const wasmResponse = await fetch(PYODIDE_CDN + 'pyodide.asm.wasm');
      await cache.put(PYODIDE_CDN + 'pyodide.asm.wasm', wasmResponse);
    }
  } catch {
    console.warn('Cache API not available, loading Pyodide from network');
  }
}

async function initPyodide(): Promise<void> {
  await cachePyodideAssets();
  
  importScripts(PYODIDE_CDN + 'pyodide.js');
  
  pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });
  
  await pyodide.loadPackage(['micropip']);
}

function generateMockInputTemplate(mockInputs: string[]): string {
  const inputsJson = JSON.stringify(mockInputs);
  return `
__mock_inputs__ = ${inputsJson}
__mock_index__ = 0

def mock_input(prompt=""):
    global __mock_index__
    if __mock_index__ < len(__mock_inputs__):
        res = __mock_inputs__[__mock_index__]
        __mock_index__ += 1
        return res
    raise EOFError("No more mock inputs")

import sys
input = mock_input
`;
}

function evaluateOutput(code: string, config: TestConfig): EvalResult {
  if (!pyodide) {
    return { passed: false, score: 0, message: 'Pyodide not initialized' };
  }

  try {
    const wrappedCode = `
import sys
from io import StringIO
_old_stdout = sys.stdout
sys.stdout = StringIO()
${code}
_output = sys.stdout.getvalue()
sys.stdout = _old_stdout
_output
`;
    
    const result = pyodide.runPythonAsync(wrappedCode);
    const capturedOutput = typeof result === 'string' ? result : String(result || '');
    const { matched, diff } = compareOutputs(config.expected || '', capturedOutput);

    if (matched) {
      return {
        passed: true,
        score: config.weight ?? 1,
        message: 'All test cases passed!'
      };
    }

    return {
      passed: false,
      score: 0,
      message: `Output mismatch. ${diff.length} line(s) differ.`,
      details: {
        expected: config.expected || '',
        actual: capturedOutput,
      }
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return {
      passed: false,
      score: 0,
      message: `Runtime error: ${error}`,
    };
  }
}

function evaluateInteractive(code: string, config: TestConfig): EvalResult {
  if (!pyodide) {
    return { passed: false, score: 0, message: 'Pyodide not initialized' };
  }

  const mockSetup = generateMockInputTemplate(config.mockInputs || []);

  try {
    const wrappedCode = `
import sys
from io import StringIO
${mockSetup}
sys.stdout = StringIO()
${code}
_output = sys.stdout.getvalue()
_output
`;
    
    const result = pyodide.runPythonAsync(wrappedCode);
    const stdout = typeof result === 'string' ? result : String(result || '');
    const { matched, diff } = compareOutputs(config.expected || '', stdout);

    if (matched) {
      return {
        passed: true,
        score: config.weight ?? 1,
        message: 'All test cases passed!'
      };
    }

    return {
      passed: false,
      score: 0,
      message: `Output mismatch. ${diff.length} line(s) differ.`,
      details: {
        expected: config.expected || '',
        actual: stdout,
      }
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return {
      passed: false,
      score: 0,
      message: `Runtime error: ${error}`,
    };
  }
}

function evaluateFunction(code: string, config: TestConfig): EvalResult {
  if (!pyodide) {
    return { passed: false, score: 0, message: 'Pyodide not initialized' };
  }

  try {
    const testCode = `
${code}

def _test_function():
    results = []
    test_cases = ${JSON.stringify(config.mockInputs || [])}
    for case in test_cases:
        try:
            args = case.get('args', [])
            expected = case.get('expected')
            result = _student_func(*args)
            if str(result) == str(expected):
                results.append(True)
            else:
                results.append({'expected': expected, 'actual': result})
        except Exception as e:
            results.append({'error': str(e)})
    return results

_test_function()
`;

    const result = pyodide.runPythonAsync(testCode);
    
    if (Array.isArray(result) && result.every((r: unknown) => r === true)) {
      return {
        passed: true,
        score: config.weight ?? 1,
        message: 'All test cases passed!'
      };
    }

    return {
      passed: false,
      score: 0,
      message: 'Some test cases failed',
      details: {
        actual: JSON.stringify(result),
      }
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return {
      passed: false,
      score: 0,
      message: `Runtime error: ${error}`,
    };
  }
}

self.onmessage = async (e: MessageEvent<PyodideWorkerMessage>) => {
  const { type, code, testConfig, questionType, id } = e.data;

  if (type === 'init') {
    try {
      await initPyodide();
      const response: PyodideWorkerResponse = { type: 'ready' };
      self.postMessage(response);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      const response: PyodideWorkerResponse = { type: 'error', error: `Failed to initialize Pyodide: ${error}` };
      self.postMessage(response);
    }
    return;
  }

  if (type === 'run' && code && testConfig && questionType) {
    let result: EvalResult;

    switch (questionType) {
      case 'output':
        result = evaluateOutput(code, testConfig);
        break;
      case 'interactive':
        result = evaluateInteractive(code, testConfig);
        break;
      case 'function':
        result = evaluateFunction(code, testConfig);
        break;
      default:
        result = evaluateOutput(code, testConfig);
    }

    const response: PyodideWorkerResponse = { type: 'result', id, result };
    self.postMessage(response);
  }
};

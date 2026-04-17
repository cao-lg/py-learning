import type { Question, EvalResult } from '../types';

let routerInstance: EvaluatorRouter | null = null;

export class EvaluatorRouter {
  private worker: Worker;
  private pendingCallbacks: Map<string, (result: EvalResult) => void> = new Map();
  private initPromise: Promise<void> | null = null;
  private isReady: boolean = false;

  constructor() {
    this.worker = new Worker(
      new URL('../worker/pyodide-executor.ts', import.meta.url),
      { type: 'module' }
    );

    this.worker.onmessage = (e) => {
      const { type, id, result } = e.data;
      if (type === 'result' && id) {
        const callback = this.pendingCallbacks.get(id);
        if (callback && result) {
          callback(result);
          this.pendingCallbacks.delete(id);
        }
      }
    };
  }

  async init(): Promise<void> {
    if (this.isReady) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'ready') {
          this.isReady = true;
          this.worker.removeEventListener('message', handler);
          resolve();
        } else if (e.data.type === 'error') {
          this.worker.removeEventListener('message', handler);
          reject(new Error(e.data.error));
        }
      };
      this.worker.addEventListener('message', handler);
      this.worker.postMessage({ type: 'init' });
    });

    return this.initPromise;
  }

  evaluate(
    question: Question,
    code: string,
    callback: (result: EvalResult) => void
  ): void {
    const id = `${question.id}-${Date.now()}`;
    this.pendingCallbacks.set(id, callback);

    this.worker.postMessage({
      type: 'run',
      id,
      code,
      testConfig: question.testConfig,
      questionType: question.type,
    });
  }

  terminate(): void {
    this.worker.terminate();
  }
}

export function getEvaluatorRouter(): EvaluatorRouter {
  if (!routerInstance) {
    routerInstance = new EvaluatorRouter();
  }
  return routerInstance;
}

export const evaluatorRouter = getEvaluatorRouter();

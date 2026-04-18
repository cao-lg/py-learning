export interface TestConfig {
  expected?: string | null;
  mockInputs?: string[];
  weight?: number;
  timeout_ms: number;
  constraints?: Record<string, unknown>;
  hiddenCases?: unknown[];
}

export interface Hint {
  text: string;
  visible: boolean;
}

export interface Question {
  id: string;
  type: 'output' | 'function' | 'interactive' | 'unittest' | 'constraint' | 'debug';
  title: string;
  instruction: string;
  initialCode: string;
  testConfig: TestConfig;
  hints?: Hint[];
}

export interface ExamQuestion extends Omit<Question, 'testConfig'> {
  testConfig: Omit<TestConfig, 'expected' | 'hiddenCases'>;
  deterministicSeed?: never;
}

export interface PracticeSet {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface ExamSet {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: ExamQuestion[];
  deterministicSeed?: string;
  startTime?: string;
  endTime?: string;
}

export interface ExamInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalScore: number;
  questionCount: number;
  difficulty: string;
  startTime?: string;
  endTime?: string;
}

export interface EvalResult {
  passed: boolean;
  score: number;
  message: string;
  details?: {
    expected?: string;
    actual?: string;
    hint?: string;
  };
}

export interface UserProgress {
  practice: Record<string, string>;
  exams: Record<string, { score: number; status: string }>;
}

export interface ExamSession {
  exam_id: string;
  user_id: string;
  seed: string;
  status: 'ongoing' | 'submitted' | 'expired';
  score?: number;
  audit: {
    focus_loss: number;
    tab_switch: number;
    paste_attempts: number;
    fullscreen_change: number;
  };
  submitted_at?: string;
}

export interface SyncPayload {
  userId: string;
  practice: Record<string, {
    chapterId: string;
    score: number;
    totalQuestions: number;
    completedAt: number;
    answers: Record<string, string>;
  }>;
  exam: Record<string, {
    examId: string;
    score: number;
    totalQuestions: number;
    startedAt: number;
    completedAt: number;
    answers: Record<string, string>;
  }>;
  audit: Record<string, {
    type: string;
    timestamp: number;
    data?: Record<string, unknown>;
  }[]>;
}

export interface PyodideWorkerMessage {
  type: 'init' | 'run' | 'stop';
  code?: string;
  testConfig?: TestConfig;
  questionType?: Question['type'];
  id?: string;
  examId?: string;
  questionId?: string;
}

export interface PyodideWorkerResponse {
  type: 'ready' | 'result' | 'error' | 'log';
  id?: string;
  result?: EvalResult;
  logs?: string;
  error?: string;
}

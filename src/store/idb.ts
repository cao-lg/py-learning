import { get, set, del, keys, clear } from 'idb-keyval';
import type { ExamSession } from '../types';

const KEYS = {
  PRACTICE_CODE: 'practice_code_',
  EXAM_DRAFT: 'exam_draft_',
  EXAM_SESSION: 'exam_session_',
  EXAM_VIOLATION: 'exam_violation_',
  SYNC_QUEUE: 'sync_queue',
} as const;

interface ExamViolation {
  reason: string;
  timestamp: number;
  tabSwitchCount: number;
}

export interface ExportData {
  version: string;
  exportTime: number;
  userId: string;
  userName: string;
  practiceCodes: Record<string, string>;
  examDrafts: Record<string, Record<string, string>>;
  examSessions: ExamSession[];
  examViolations: Record<string, ExamViolation>;
}

export const storage = {
  async savePracticeCode(questionId: string, code: string): Promise<void> {
    await set(KEYS.PRACTICE_CODE + questionId, code);
  },

  async getPracticeCode(questionId: string): Promise<string | undefined> {
    return get<string>(KEYS.PRACTICE_CODE + questionId);
  },

  async clearPracticeCode(questionId: string): Promise<void> {
    await del(KEYS.PRACTICE_CODE + questionId);
  },

  async saveExamDraft(examId: string, answers: Record<string, string>): Promise<void> {
    await set(KEYS.EXAM_DRAFT + examId, answers);
  },

  async getExamDraft(examId: string): Promise<Record<string, string> | undefined> {
    return get<Record<string, string>>(KEYS.EXAM_DRAFT + examId);
  },

  async clearExamDraft(examId: string): Promise<void> {
    await del(KEYS.EXAM_DRAFT + examId);
  },

  async saveExamSession(session: ExamSession): Promise<void> {
    await set(KEYS.EXAM_SESSION + session.exam_id + '_' + session.user_id, session);
  },

  async getExamSession(examId: string, userId: string): Promise<ExamSession | undefined> {
    return get<ExamSession>(KEYS.EXAM_SESSION + examId + '_' + userId);
  },

  async saveExamViolation(examId: string, violation: ExamViolation): Promise<void> {
    await set(KEYS.EXAM_VIOLATION + examId, violation);
  },

  async getExamViolation(examId: string): Promise<ExamViolation | undefined> {
    return get<ExamViolation>(KEYS.EXAM_VIOLATION + examId);
  },

  async clearExamViolation(examId: string): Promise<void> {
    await del(KEYS.EXAM_VIOLATION + examId);
  },

  async addToSyncQueue(payload: unknown): Promise<void> {
    const queue = (await get<unknown[]>(KEYS.SYNC_QUEUE)) || [];
    queue.push(payload);
    await set(KEYS.SYNC_QUEUE, queue);
  },

  async getSyncQueue(): Promise<unknown[]> {
    return (await get<unknown[]>(KEYS.SYNC_QUEUE)) || [];
  },

  async clearSyncQueue(): Promise<void> {
    await set(KEYS.SYNC_QUEUE, []);
  },

  async exportAllData(): Promise<ExportData> {
    const allKeys = await keys();
    
    const practiceCodes: Record<string, string> = {};
    const examDrafts: Record<string, Record<string, string>> = {};
    const examSessions: ExamSession[] = [];
    const examViolations: Record<string, ExamViolation> = {};

    for (const key of allKeys) {
      const keyStr = String(key);
      
      if (keyStr.startsWith(KEYS.PRACTICE_CODE)) {
        const questionId = keyStr.replace(KEYS.PRACTICE_CODE, '');
        const code = await get<string>(key);
        if (code) {
          practiceCodes[questionId] = code;
        }
      } else if (keyStr.startsWith(KEYS.EXAM_DRAFT)) {
        const examId = keyStr.replace(KEYS.EXAM_DRAFT, '');
        const draft = await get<Record<string, string>>(key);
        if (draft) {
          examDrafts[examId] = draft;
        }
      } else if (keyStr.startsWith(KEYS.EXAM_SESSION)) {
        const session = await get<ExamSession>(key);
        if (session) {
          examSessions.push(session);
        }
      } else if (keyStr.startsWith(KEYS.EXAM_VIOLATION)) {
        const examId = keyStr.replace(KEYS.EXAM_VIOLATION, '');
        const violation = await get<ExamViolation>(key);
        if (violation) {
          examViolations[examId] = violation;
        }
      }
    }

    return {
      version: '1.0',
      exportTime: Date.now(),
      userId: localStorage.getItem('userId') || '',
      userName: localStorage.getItem('userName') || '',
      practiceCodes,
      examDrafts,
      examSessions,
      examViolations,
    };
  },

  async importData(data: ExportData): Promise<void> {
    if (data.userId) {
      localStorage.setItem('userId', data.userId);
    }
    if (data.userName) {
      localStorage.setItem('userName', data.userName);
    }

    for (const [questionId, code] of Object.entries(data.practiceCodes)) {
      await set(KEYS.PRACTICE_CODE + questionId, code);
    }

    for (const [examId, draft] of Object.entries(data.examDrafts)) {
      await set(KEYS.EXAM_DRAFT + examId, draft);
    }

    for (const session of data.examSessions) {
      const key = KEYS.EXAM_SESSION + session.exam_id + '_' + session.user_id;
      await set(key, session);
    }

    for (const [examId, violation] of Object.entries(data.examViolations)) {
      await set(KEYS.EXAM_VIOLATION + examId, violation);
    }
  },

  async clearAllData(): Promise<void> {
    await clear();
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  },

  async getAllPracticeCodes(): Promise<Record<string, string>> {
    const allKeys = await keys();
    const practiceCodes: Record<string, string> = {};
    
    for (const key of allKeys) {
      const keyStr = String(key);
      if (keyStr.startsWith(KEYS.PRACTICE_CODE)) {
        const questionId = keyStr.replace(KEYS.PRACTICE_CODE, '');
        const code = await get<string>(key);
        if (code) {
          practiceCodes[questionId] = code;
        }
      }
    }
    
    return practiceCodes;
  },
};

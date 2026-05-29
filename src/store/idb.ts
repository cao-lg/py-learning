import { get, set, del } from 'idb-keyval';
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
};

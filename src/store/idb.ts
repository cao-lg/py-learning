import { get, set, del } from 'idb-keyval';
import type { ExamSession } from '../types';

const KEYS = {
  USER_ID: 'user_id',
  USER_NAME: 'user_name',
  PRACTICE_CODE: 'practice_code_',
  EXAM_DRAFT: 'exam_draft_',
  EXAM_SESSION: 'exam_session_',
  SYNC_QUEUE: 'sync_queue',
} as const;

export const storage = {
  async getUserId(): Promise<string | undefined> {
    return get<string>(KEYS.USER_ID);
  },

  async setUserId(userId: string): Promise<void> {
    await set(KEYS.USER_ID, userId);
  },

  async getUserName(): Promise<string | undefined> {
    return get<string>(KEYS.USER_NAME);
  },

  async setUserName(name: string): Promise<void> {
    await set(KEYS.USER_NAME, name);
  },

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

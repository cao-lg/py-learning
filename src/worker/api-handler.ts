import { z } from 'zod';

const bindSchema = z.object({
  name: z.string().min(1),
});

const syncSchema = z.object({
  user_id: z.string(),
  practice: z.record(z.string()).optional(),
  exam: z.record(z.any()).optional(),
  audit: z.record(z.any()).optional(),
  hashes: z.record(z.string()).optional(),
});

export { bindSchema, syncSchema };

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function validateTimestamp(timestamp: number, deadline: number): boolean {
  return timestamp <= deadline;
}

export function buildSyncResponse(success: boolean, message?: string) {
  return { ok: success, message };
}

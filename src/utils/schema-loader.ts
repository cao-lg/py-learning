import { z } from 'zod';

export const testConfigSchema = z.object({
  expected: z.string().nullable().optional(),
  mockInputs: z.array(z.string()).optional(),
  weight: z.number().min(0).max(1).optional(),
  timeout_ms: z.number().min(1000),
  constraints: z.record(z.unknown()).optional(),
  hiddenCases: z.array(z.unknown()).optional(),
});

export const hintSchema = z.object({
  text: z.string(),
  visible: z.boolean(),
});

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['output', 'function', 'interactive', 'unittest', 'constraint', 'debug']),
  title: z.string(),
  instruction: z.string(),
  initialCode: z.string(),
  testConfig: testConfigSchema,
  hints: z.array(hintSchema).optional(),
});

export const practiceSetSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.array(questionSchema),
});

export const examQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['output', 'function', 'interactive', 'unittest', 'constraint', 'debug']),
  title: z.string(),
  instruction: z.string(),
  initialCode: z.string(),
  testConfig: testConfigSchema.omit({ expected: true, hiddenCases: true }),
  hints: z.array(hintSchema).optional(),
});

export const examSetSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  duration: z.number(),
  questions: z.array(examQuestionSchema),
  deterministicSeed: z.string().optional(),
});

export type PracticeSet = z.infer<typeof practiceSetSchema>;
export type ExamSet = z.infer<typeof examSetSchema>;

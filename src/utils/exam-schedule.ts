import type { ExamInfo } from '../types';

export type ExamStatus = 'not_started' | 'available' | 'ended' | 'no_schedule';

export interface ExamAvailability {
  status: ExamStatus;
  message: string;
  startsAt?: string;
  endsAt?: string;
}

export function checkExamAvailability(exam: ExamInfo): ExamAvailability {
  const now = Date.now();

  if (!exam.startTime && !exam.endTime) {
    return {
      status: 'no_schedule',
      message: '此考试没有时间限制',
    };
  }

  const startTime = exam.startTime ? new Date(exam.startTime).getTime() : null;
  const endTime = exam.endTime ? new Date(exam.endTime).getTime() : null;

  if (startTime && now < startTime) {
    return {
      status: 'not_started',
      message: '考试尚未开始',
      startsAt: exam.startTime,
    };
  }

  if (endTime && now > endTime) {
    return {
      status: 'ended',
      message: '考试已结束',
      endsAt: exam.endTime,
    };
  }

  return {
    status: 'available',
    message: '可以参加考试',
  };
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

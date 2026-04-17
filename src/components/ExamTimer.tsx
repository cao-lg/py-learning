import { useState, useEffect, useCallback } from 'react';

interface ExamTimerProps {
  duration: number;
  onExpire: () => void;
  startTime: number;
}

export function ExamTimer({ duration, onExpire, startTime }: ExamTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, duration * 60 - elapsed);
  });

  const verifyTime = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, duration * 60 - elapsed);
    setRemainingSeconds(remaining);
    return remaining;
  }, [duration, startTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = verifyTime();
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [verifyTime, onExpire]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const isLow = remainingSeconds < 300;
  const isCritical = remainingSeconds < 60;

  return (
    <div
      className={`font-mono text-lg px-4 py-2 rounded-lg ${
        isCritical
          ? 'bg-red-900/50 text-red-400 animate-pulse'
          : isLow
          ? 'bg-yellow-900/50 text-yellow-400'
          : 'bg-gray-800 text-gray-200'
      }`}
    >
      {hours > 0 && `${hours.toString().padStart(2, '0')}:`}
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}

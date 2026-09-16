import React, { useState, useEffect, useRef } from 'react';

export const QuizTimer = ({ expiresAt, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!expiresAt) return 0;
    const target = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((target - Date.now()) / 1000));
  });

  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateRemaining = () => {
      const target = new Date(expiresAt).getTime();
      return Math.max(0, Math.floor((target - Date.now()) / 1000));
    };

    const initial = calculateRemaining();
    setSecondsLeft(initial);

    if (initial <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          if (onExpire) onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const isUrgent = secondsLeft > 0 && secondsLeft < 60;
  const isWarning = secondsLeft >= 60 && secondsLeft <= 300;

  return (
    <div
      className={`quiz-timer ${
        isUrgent ? 'timer-urgent' : isWarning ? 'timer-warning' : 'timer-normal'
      }`}
    >
      <span className="timer-icon">⏱️</span>
      <div className="timer-display">
        <span className="timer-label">Time Remaining</span>
        <span className="timer-clock">{formatTime(secondsLeft)}</span>
      </div>
    </div>
  );
};

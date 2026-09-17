import React, { useState, useEffect, useRef } from 'react';

export const QuizTimer = ({ expiresAt, remainingSeconds, onExpire }) => {
  const endTimeRef = useRef(null);
  const hasExpiredRef = useRef(false);

  // Helper to determine initial seconds from authoritative remainingSeconds or fallback expiresAt
  const getInitialSeconds = () => {
    if (remainingSeconds !== undefined && remainingSeconds !== null && !isNaN(remainingSeconds)) {
      const sec = Math.floor(Number(remainingSeconds));
      return sec > 0 ? sec : 0;
    }
    if (expiresAt) {
      const target = new Date(expiresAt).getTime();
      if (!isNaN(target)) {
        const sec = Math.floor((target - Date.now()) / 1000);
        return sec > 0 ? sec : 0;
      }
    }
    return null;
  };

  const [secondsLeft, setSecondsLeft] = useState(() => {
    const sec = getInitialSeconds();
    if (sec !== null && sec > 0) {
      endTimeRef.current = Date.now() + sec * 1000;
    }
    return sec;
  });

  useEffect(() => {
    const sec = getInitialSeconds();
    if (sec === null || isNaN(sec)) {
      // Invalid or missing value - do not auto-submit
      return;
    }

    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + sec * 1000;
      setSecondsLeft(sec);
    }

    const interval = setInterval(() => {
      if (endTimeRef.current === null) return;
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
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
  }, [remainingSeconds, expiresAt, onExpire]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
      return '--:--';
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const isUrgent = secondsLeft !== null && secondsLeft > 0 && secondsLeft < 60;
  const isWarning = secondsLeft !== null && secondsLeft >= 60 && secondsLeft <= 300;

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


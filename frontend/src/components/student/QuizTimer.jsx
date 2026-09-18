import React, { useState, useEffect, useRef } from 'react';

export const QuizTimer = ({ remainingSeconds, expiresAt, attemptId, onExpire }) => {
  console.log('[TIMER] QuizTimer props:', {
    remainingSeconds,
    expiresAt,
    attemptId,
  });

  const endTimeRef = useRef(null);
  const hasExpiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Step 3 & 4: Strictly parse remainingSeconds.
  // DO NOT use new Date(expiresAt).
  // DO NOT convert undefined/null/NaN to 0.
  const getValidSeconds = (val) => {
    if (val === undefined || val === null || val === '') return null;
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) return null;
    return Math.floor(num);
  };

  const initial = getValidSeconds(remainingSeconds);
  console.log('[TIMER] Initial remainingSeconds:', remainingSeconds);
  console.log('[TIMER] Calculated initial seconds:', initial);

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (initial !== null && initial > 0) {
      endTimeRef.current = Date.now() + initial * 1000;
      return initial;
    }
    return null;
  });

  useEffect(() => {
    const validSec = getValidSeconds(remainingSeconds);

    // If remainingSeconds is missing, invalid, or non-positive, do NOT start timer and DO NOT call onExpire()
    if (validSec === null || validSec <= 0) {
      console.warn('[TIMER] No valid remainingSeconds provided. Timer inactive.', remainingSeconds);
      return;
    }

    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + validSec * 1000;
      setSecondsLeft(validSec);
    }

    const interval = setInterval(() => {
      if (endTimeRef.current === null) return;
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);

      // ONLY if an active timer genuinely reaches 0
      if (remaining <= 0) {
        clearInterval(interval);
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          console.log('[TIMER] onExpire triggered');
          console.log('[TIMER] onExpire callback invoked');
          if (onExpireRef.current) {
            onExpireRef.current();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds <= 0) {
      if (totalSeconds === 0 && hasExpiredRef.current) {
        return '00:00';
      }
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

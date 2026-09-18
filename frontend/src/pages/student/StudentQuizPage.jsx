import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { QuizTimer } from '../../components/student/QuizTimer';
import { QuizQuestion } from '../../components/student/QuizQuestion';
import { QuizNavigation } from '../../components/student/QuizNavigation';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import {
  getQuizById,
  getActiveQuizzes,
  startQuiz,
  getAttempt,
  getAttemptQuestions,
  submitQuiz,
  formatApiError,
} from '../../api/studentQuizApi';

export const StudentQuizPage = () => {
  const { quizId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(null);

  // Fullscreen state
  const [showFullscreenGate, setShowFullscreenGate] = useState(!document.fullscreenElement);
  const [fullscreenError, setFullscreenError] = useState(null);

  // Anti-cheating state (Two-strike system)
  const [violationCount, setViolationCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [violationWarning, setViolationWarning] = useState(null);

  // Refs for stable callbacks, event handlers, and preventing duplicate submissions
  const hasSubmittedRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const violationCountRef = useRef(0);
  const lastViolationTimeRef = useRef(0);
  const lastUnloadHandledTimeRef = useRef(0);
  const hasEnteredFullscreenRef = useRef(!!document.fullscreenElement);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Initialize and continuously sync attemptIdRef and quizRef
  const attemptIdRef = useRef(searchParams.get('attemptId') || null);
  if (attempt?.attemptId) {
    attemptIdRef.current = String(attempt.attemptId);
  }
  const currentUrlAttemptId = searchParams.get('attemptId');
  if (currentUrlAttemptId && !attemptIdRef.current) {
    attemptIdRef.current = String(currentUrlAttemptId);
  }

  const quizRef = useRef(quiz);
  quizRef.current = quiz;

  // Submit quiz function - single source of truth for submission
  const performSubmit = useCallback(
    async (reason = null) => {
      const currentAttemptId =
        attemptIdRef.current ||
        attempt?.attemptId ||
        searchParams.get('attemptId') ||
        new URLSearchParams(window.location.search).get('attemptId');

      // Step 3: Guard against multiple concurrent submission calls
      if (hasSubmittedRef.current || isSubmittingRef.current) {
        console.warn('[SUBMIT] Submission blocked by guard', {
          hasSubmitted: hasSubmittedRef.current,
          isSubmitting: isSubmittingRef.current,
        });
        return;
      }

      if (!currentAttemptId) {
        console.warn('[QUIZ] Submission blocked: attemptId is unavailable');
        return;
      }

      console.log('[SUBMIT] performSubmit called', {
        reason,
        attemptId: currentAttemptId,
        answerCount: Object.keys(answersRef.current || {}).length,
        hasSubmitted: hasSubmittedRef.current,
        isSubmitting: isSubmittingRef.current,
      });

      // Synchronously lock submission immediately BEFORE network and fullscreen exit
      hasSubmittedRef.current = true;
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setShowSubmitModal(false);

      if (reason) {
        setSubmissionMessage(reason);
      }

      console.log('[QUIZ] performSubmit started', {
        attemptId: currentAttemptId,
      });

      // Format answers map safely (fallback to localStorage if answersRef is empty)
      let currentAnswers = answersRef.current || {};
      if (Object.keys(currentAnswers).length === 0) {
        try {
          const stored = localStorage.getItem(`quiz_answers_${currentAttemptId}`);
          if (stored) {
            currentAnswers = JSON.parse(stored) || {};
          }
        } catch (e) {}
      }
      const formattedAnswers = {};
      Object.entries(currentAnswers).forEach(([qId, val]) => {
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          formattedAnswers[String(qId)] = String(val).trim().toUpperCase();
        }
      });

      try {
        console.log('[QUIZ] Sending submit request', {
          attemptId: currentAttemptId,
          answersCount: Object.keys(formattedAnswers).length,
        });

        // Step 5 & 6: Submit answers to backend FIRST
        await submitQuiz(currentAttemptId, formattedAnswers);
        console.log('[QUIZ] Submit successful');

        // Step 15: Clean up local storage for THIS attempt only after successful submission
        try {
          localStorage.removeItem(`quiz_answers_${currentAttemptId}`);
          localStorage.removeItem(`quiz_current_question_${currentAttemptId}`);
          localStorage.removeItem(`quiz_violation_count_${currentAttemptId}`);
        } catch (cleanupErr) {
          console.warn('[QUIZ] Storage cleanup ignored:', cleanupErr);
        }

        // Step 5 & 6: Exit fullscreen AFTER submission succeeds
        if (document.fullscreenElement) {
          try {
            await document.exitFullscreen();
          } catch (fsErr) {
            console.warn('[QUIZ] Fullscreen exit after submit ignored:', fsErr);
          }
        }

        const immediate = quizRef.current?.immediateResult ?? quiz?.immediateResult ?? true;
        const targetRoute = immediate ? `/student/result/${currentAttemptId}` : '/student';
        console.warn('[QUIZ] Redirecting from exam:', { reason: 'Submission completed', target: targetRoute });
        navigate(targetRoute, { replace: true });
      } catch (err) {
        console.error('[QUIZ] API error:', err);
        const errMsg =
          err.response?.data?.message ||
          (typeof err.response?.data === 'string' ? err.response?.data : '');

        // If backend reports already submitted, cleanly proceed to result / dashboard
        if (errMsg.toLowerCase().includes('already been submitted')) {
          console.warn('[QUIZ] Redirecting from exam:', 'Attempt already submitted on server');
          try {
            localStorage.removeItem(`quiz_answers_${currentAttemptId}`);
            localStorage.removeItem(`quiz_current_question_${currentAttemptId}`);
            localStorage.removeItem(`quiz_violation_count_${currentAttemptId}`);
          } catch (cleanupErr) {}
          if (document.fullscreenElement) {
            try {
              await document.exitFullscreen();
            } catch (ignored) {}
          }
          const immediate = quizRef.current?.immediateResult ?? quiz?.immediateResult ?? true;
          const targetRoute = immediate ? `/student/result/${currentAttemptId}` : '/student';
          navigate(targetRoute, { replace: true });
          return;
        }

        // On real failure, reset guard and show error
        hasSubmittedRef.current = false;
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setSubmissionMessage(null);
        setError(formatApiError(err, 'Failed to submit quiz. Please try again.'));
      }
    },
    [attempt, navigate, quiz, searchParams]
  );

  // Stable ref for performSubmit so callbacks/listeners never close over stale functions
  const performSubmitRef = useRef(performSubmit);
  performSubmitRef.current = performSubmit;

  // Centralized security violation handler - Two-Strike rule
  const registerViolation = useCallback(
    (reason) => {
      // 1. If submission has already started or finished, ignore
      if (hasSubmittedRef.current || isSubmittingRef.current) {
        return;
      }
      // 2. If student has not entered fullscreen yet (gate overlay), ignore
      if (!hasEnteredFullscreenRef.current || showFullscreenGate) {
        return;
      }

      // 3. Deduplicate events occurring within 1000ms (e.g. blur followed by visibilitychange)
      const now = Date.now();
      if (now - lastViolationTimeRef.current < 1000) {
        console.log('[SECURITY] Ignoring duplicate browser event:', reason);
        return;
      }
      lastViolationTimeRef.current = now;

      const currentAttemptId =
        attemptIdRef.current ||
        attempt?.attemptId ||
        searchParams.get('attemptId');

      console.log('[SECURITY] Prohibited activity detected');
      console.log('[SECURITY] Reason:', reason);
      console.log('[SECURITY] Attempt ID:', currentAttemptId);

      // Read latest persisted count from localStorage (fallback to ref)
      let currentCount = violationCountRef.current || 0;
      if (currentAttemptId) {
        try {
          const stored = localStorage.getItem(`quiz_violation_count_${currentAttemptId}`);
          if (stored !== null) {
            const parsed = parseInt(stored, 10);
            if (!isNaN(parsed) && parsed >= 0) {
              currentCount = parsed;
            }
          }
        } catch (e) {}
      }

      const nextCount = Math.min(currentCount + 1, 2);
      violationCountRef.current = nextCount;
      setViolationCount(nextCount);

      if (currentAttemptId) {
        try {
          localStorage.setItem(`quiz_violation_count_${currentAttemptId}`, String(nextCount));
        } catch (e) {
          console.warn('[SECURITY] Failed to persist violation count:', e);
        }
      }

      console.log('[SECURITY] Previous violation count:', currentCount);
      console.log('[SECURITY] New violation count:', nextCount);

      if (nextCount === 1) {
        console.log('[SECURITY] First violation -> showing warning');
        setShowWarningModal(true);
      } else if (nextCount >= 2) {
        console.log('[SECURITY] Second violation -> auto submitting');
        setShowWarningModal(false);
        performSubmitRef.current?.(
          'Violation Limit Reached. Another prohibited activity was detected. Your quiz is being automatically submitted.'
        );
      }
    },
    [showFullscreenGate, attempt, searchParams]
  );

  // Continue quiz handler after first warning popup
  const handleContinueAfterWarning = async () => {
    setShowWarningModal(false);
    // If fullscreen was exited, try to restore fullscreen with this click gesture
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (fsErr) {
        console.warn('[SECURITY] Fullscreen re-entry failed:', fsErr);
        setShowFullscreenGate(true);
      }
    }
  };

  // Handle unload submission & refresh 2-strike tracking
  const handleUnloadSubmit = useCallback(() => {
    if (hasSubmittedRef.current || isSubmittingRef.current) return;
    const currentAttemptId =
      attemptIdRef.current ||
      attempt?.attemptId ||
      searchParams.get('attemptId');
    if (!currentAttemptId || !hasEnteredFullscreenRef.current) return;

    // Deduplicate between beforeunload and pagehide
    const now = Date.now();
    if (now - lastUnloadHandledTimeRef.current < 2000) {
      console.log('[SECURITY] Ignoring duplicate unload event');
      return;
    }
    lastUnloadHandledTimeRef.current = now;

    // Read current violation count
    let currentCount = violationCountRef.current || 0;
    try {
      const stored = localStorage.getItem(`quiz_violation_count_${currentAttemptId}`);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          currentCount = parsed;
        }
      }
    } catch (e) {}

    const nextCount = Math.min(currentCount + 1, 2);
    violationCountRef.current = nextCount;

    console.log('[SECURITY] Unload/Refresh detected on attempt:', currentAttemptId);
    console.log('[SECURITY] Previous violation count:', currentCount);
    console.log('[SECURITY] New violation count on unload:', nextCount);

    try {
      localStorage.setItem(`quiz_violation_count_${currentAttemptId}`, String(nextCount));
    } catch (e) {}

    // First refresh: record violation 1, do NOT submit
    if (nextCount < 2) {
      console.log('[SECURITY] First refresh recorded. Not submitting; attempt will resume on reload.');
      return;
    }

    // Second refresh: submit current attempt using keepalive fetch
    console.log('[SECURITY] Second refresh / unload violation reached! Auto-submitting via keepalive fetch.');
    hasSubmittedRef.current = true;
    isSubmittingRef.current = true;

    let currentAnswers = answersRef.current || {};
    if (Object.keys(currentAnswers).length === 0) {
      try {
        const stored = localStorage.getItem(`quiz_answers_${currentAttemptId}`);
        if (stored) {
          currentAnswers = JSON.parse(stored) || {};
        }
      } catch (e) {}
    }
    const formattedAnswers = {};
    Object.entries(currentAnswers).forEach(([qId, val]) => {
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        formattedAnswers[String(qId)] = String(val).trim().toUpperCase();
      }
    });

    try {
      localStorage.removeItem(`quiz_answers_${currentAttemptId}`);
      localStorage.removeItem(`quiz_current_question_${currentAttemptId}`);
      localStorage.removeItem(`quiz_violation_count_${currentAttemptId}`);
    } catch (e) {}

    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
    const url = `${apiUrl}/api/quizzes/attempts/${currentAttemptId}/submit`;
    const payload = JSON.stringify({ answers: formattedAnswers });

    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: payload,
        keepalive: true,
      });
    } catch (fetchErr) {
      try {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } catch (bErr) {
        console.error('[QUIZ] Unload submit beacon error:', bErr);
      }
    }
  }, [attempt, searchParams]);

  // Fullscreen gate enter handler
  const handleEnterFullscreen = async () => {
    setFullscreenError(null);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setShowFullscreenGate(false);
      hasEnteredFullscreenRef.current = true;
      try {
        window.history.pushState(null, '', window.location.href);
      } catch (e) {}
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      setFullscreenError('Fullscreen mode is required to take this quiz.');
    }
  };

  // Step 14: Log initial submission state once on mount
  useEffect(() => {
    console.log('[QUIZ] Initial submission state:', {
      hasSubmitted: hasSubmittedRef.current,
      isSubmitting: isSubmittingRef.current,
    });
  }, []);

  // Initial attempt and questions loader - AttemptId is the source of truth
  useEffect(() => {
    let isMounted = true;

    const initializeQuiz = async () => {
      setLoading(true);
      setError(null);
      const paramAttemptId = searchParams.get('attemptId');
      console.log('[QUIZ] URL attemptId:', paramAttemptId);

      try {
        // 1. Fetch active quiz settings for display and security rules (copy, paste, tab-switch)
        let currentQuiz = null;
        try {
          currentQuiz = await getQuizById(quizId);
        } catch (quizErr) {
          console.error('[QUIZ] API error:', quizErr);
          const allQuizzes = await getActiveQuizzes();
          currentQuiz = allQuizzes.find((q) => String(q.id) === String(quizId));
        }

        if (!currentQuiz) {
          if (isMounted) {
            setError('Quiz not found or is no longer active.');
            setLoading(false);
          }
          return;
        }

        console.log('[QUIZ] Duration:', currentQuiz.durationMinutes);
        console.log('[VIOLATION CONFIG]', {
          detectTabSwitch: currentQuiz?.detectTabSwitch,
          autoSubmitOnViolation: currentQuiz?.autoSubmitOnViolation,
          violationThreshold: currentQuiz?.violationThreshold,
        });

        if (isMounted) {
          setQuiz(currentQuiz);
          quizRef.current = currentQuiz;
        }

        // 2. Obtain attempt (validate existing attempt from URL or start/resume from backend)
        let attemptData = null;

        if (paramAttemptId) {
          // AttemptId in URL takes absolute priority as authoritative source of truth.
          // Historical Result / alreadySubmitted on the quiz is completely ignored.
          console.log('[QUIZ] Validating attempt:', paramAttemptId);
          try {
            attemptData = await getAttempt(paramAttemptId);
            console.log('[QUIZ] Attempt validation success:', attemptData);
            if (attemptData?.submitted) {
              console.warn('[QUIZ] Redirecting from exam: Attempt has already been submitted');
              try {
                localStorage.removeItem(`quiz_answers_${paramAttemptId}`);
                localStorage.removeItem(`quiz_current_question_${paramAttemptId}`);
                localStorage.removeItem(`quiz_violation_count_${paramAttemptId}`);
              } catch (cleanupErr) {}
              const immediate = currentQuiz.immediateResult ?? true;
              const targetRoute = immediate ? `/student/result/${paramAttemptId}` : '/student';
              navigate(targetRoute, { replace: true });
              return;
            }
          } catch (attemptErr) {
            console.error('[QUIZ] API error:', attemptErr);
            const msg =
              attemptErr.response?.data?.message ||
              (typeof attemptErr.response?.data === 'string' ? attemptErr.response?.data : '');
            if (msg.toLowerCase().includes('already been submitted')) {
              console.warn('[QUIZ] Redirecting from exam:', 'Attempt has already been submitted');
              try {
                localStorage.removeItem(`quiz_answers_${paramAttemptId}`);
                localStorage.removeItem(`quiz_current_question_${paramAttemptId}`);
                localStorage.removeItem(`quiz_violation_count_${paramAttemptId}`);
              } catch (cleanupErr) {}
              const immediate = currentQuiz.immediateResult ?? true;
              const targetRoute = immediate ? `/student/result/${paramAttemptId}` : '/student';
              navigate(targetRoute, { replace: true });
              return;
            }
            throw attemptErr;
          }
        } else {
          // Only when NO attemptId exists in URL do we request the backend to start or resume an attempt
          console.log('[QUIZ] startQuiz called');
          attemptData = await startQuiz(quizId);
          console.log('[QUIZ] startQuiz returned:', attemptData);

          const newAttemptId = String(attemptData.attemptId);
          if (isMounted) {
            setSearchParams({ attemptId: newAttemptId }, { replace: true });
          }
        }

        if (!attemptData) {
          throw new Error('Could not establish an active quiz attempt.');
        }

        const resolvedAttemptId = String(attemptData.attemptId || paramAttemptId);

        if (isMounted) {
          setAttempt(attemptData);
          attemptIdRef.current = resolvedAttemptId;
        }

        // 3. Fetch attempt questions for this specific attempt
        console.log('[QUIZ] Loading questions for attempt:', resolvedAttemptId);
        const questionList = await getAttemptQuestions(resolvedAttemptId);
        console.log('[QUIZ] Questions loaded:', questionList ? questionList.length : 0);

        if (!questionList || questionList.length === 0) {
          if (isMounted) {
            setError('No questions have been configured for this quiz.');
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setQuestions(questionList);

          // Step 8: Restore saved draft answers for this specific attempt
          const savedAnswersStr = localStorage.getItem(`quiz_answers_${resolvedAttemptId}`);
          let initialAnswers = {};
          if (savedAnswersStr) {
            try {
              const parsed = JSON.parse(savedAnswersStr);
              if (parsed && typeof parsed === 'object') {
                const validQIds = new Set(questionList.map((q) => String(q.id)));
                Object.entries(parsed).forEach(([qId, val]) => {
                  if (validQIds.has(String(qId)) && typeof val === 'string' && val.trim() !== '') {
                    initialAnswers[String(qId)] = val.trim().toUpperCase();
                  }
                });
                console.log('[QUIZ] Restored answers from storage for attempt', resolvedAttemptId, 'count:', Object.keys(initialAnswers).length);
              }
            } catch (parseErr) {
              console.warn('[QUIZ] Failed to parse saved answers:', parseErr);
            }
          }
          setAnswers(initialAnswers);
          answersRef.current = initialAnswers;

          // Step 7: Restore saved question index for this specific attempt
          const savedIndexStr = localStorage.getItem(`quiz_current_question_${resolvedAttemptId}`);
          let initialIndex = 0;
          if (savedIndexStr !== null && savedIndexStr !== '') {
            const parsed = parseInt(savedIndexStr, 10);
            if (Number.isInteger(parsed) && parsed >= 0 && parsed < questionList.length) {
              initialIndex = parsed;
              console.log('[QUIZ] Restored question index from storage for attempt', resolvedAttemptId, 'index:', initialIndex);
            }
          }
          setCurrentIndex(initialIndex);

          // Restore saved violation count for this specific attempt (Two-strike system)
          const savedViolationStr = localStorage.getItem(`quiz_violation_count_${resolvedAttemptId}`);
          let initialViolations = 0;
          if (savedViolationStr !== null && savedViolationStr !== '') {
            const parsed = parseInt(savedViolationStr, 10);
            if (!isNaN(parsed) && parsed >= 0) {
              initialViolations = Math.min(parsed, 2);
              console.log('[SECURITY] Restored violation count from storage for attempt', resolvedAttemptId, 'count:', initialViolations);
            }
          }
          setViolationCount(initialViolations);
          violationCountRef.current = initialViolations;

          // If the attempt has 1 violation on restore (e.g. from prior tab switch or first refresh), show the first warning popup
          if (initialViolations === 1) {
            setShowWarningModal(true);
          }
        }
      } catch (err) {
        console.error('[QUIZ] Exam initialization failed:', err);
        if (isMounted) {
          setError(formatApiError(err, 'Failed to load quiz attempt.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeQuiz();

    return () => {
      isMounted = false;
    };
  }, [quizId]); // Note: Do NOT include searchParams here to prevent circular re-renders

  // Anti-cheating and security event listeners
  useEffect(() => {
    if (!quiz || isSubmitting) return;

    // A. Fullscreen change detection
    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;

      if (inFullscreen) {
        hasEnteredFullscreenRef.current = true;
        setShowFullscreenGate(false);
      } else {
        // Fullscreen was exited
        // 1. If application already submitted or is submitting, ignore (normal cleanup)
        if (hasSubmittedRef.current || isSubmittingRef.current) return;
        // 2. If student has not entered fullscreen yet (gate overlay), ignore
        if (!hasEnteredFullscreenRef.current) return;
        // 3. User exited fullscreen during an active exam session -> violation
        registerViolation('Fullscreen mode exited.');
      }
    };

    // B. Visibility change detection (Tab switch / minimization)
    const handleVisibilityChange = () => {
      if (quizRef.current?.detectTabSwitch === false) return;
      if (document.visibilityState === 'hidden') {
        registerViolation('Tab switch detected.');
      }
    };

    // C. Window blur detection (Loss of window focus)
    const handleBlur = () => {
      if (quizRef.current?.detectTabSwitch === false) return;
      registerViolation('Window blur detected.');
    };

    // D. Clipboard prevention & violation (Copy, Paste, Cut)
    const handleCopy = (e) => {
      if (!quizRef.current?.allowCopy) {
        e.preventDefault();
        registerViolation('Copy attempt detected.');
      }
    };

    const handlePaste = (e) => {
      if (!quizRef.current?.allowPaste) {
        e.preventDefault();
        registerViolation('Paste attempt detected.');
      }
    };

    const handleCut = (e) => {
      if (!quizRef.current?.allowCopy || !quizRef.current?.allowPaste) {
        e.preventDefault();
        registerViolation('Cut attempt detected.');
      }
    };

    // E. Right-click context menu prevention & violation
    const handleContextMenu = (e) => {
      if (!quizRef.current?.allowRightClick) {
        e.preventDefault();
        registerViolation('Right click detected.');
      }
    };

    // F. Prohibited keyboard shortcut detection
    const handleKeyDown = (e) => {
      if (hasSubmittedRef.current || isSubmittingRef.current) return;
      if (!hasEnteredFullscreenRef.current || showFullscreenGate) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key ? e.key.toLowerCase() : '';

      // F12 (Developer tools)
      if (e.key === 'F12') {
        e.preventDefault();
        registerViolation('Prohibited shortcut: F12 (Developer Tools).');
        return;
      }

      // Developer Tools: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (isCtrlOrCmd && e.shiftKey) {
        if (key === 'i' || key === 'j' || key === 'c') {
          e.preventDefault();
          registerViolation(
            `Prohibited shortcut: Ctrl+Shift+${key.toUpperCase()} (Developer Tools).`
          );
          return;
        }
      }

      // Print: Ctrl+P / Cmd+P
      if (isCtrlOrCmd && key === 'p') {
        e.preventDefault();
        registerViolation('Print attempt detected: Ctrl+P.');
        return;
      }

      // View Source: Ctrl+U / Cmd+U
      if (isCtrlOrCmd && key === 'u') {
        e.preventDefault();
        registerViolation('Prohibited shortcut: Ctrl+U (View Source).');
        return;
      }

      // Copy shortcut: Ctrl+C / Cmd+C (when allowCopy is false)
      if (isCtrlOrCmd && key === 'c' && !e.shiftKey) {
        if (!quizRef.current?.allowCopy) {
          e.preventDefault();
          registerViolation('Copy shortcut detected: Ctrl+C.');
          return;
        }
      }

      // Paste shortcut: Ctrl+V / Cmd+V (when allowPaste is false)
      if (isCtrlOrCmd && key === 'v') {
        if (!quizRef.current?.allowPaste) {
          e.preventDefault();
          registerViolation('Paste shortcut detected: Ctrl+V.');
          return;
        }
      }

      // Cut shortcut: Ctrl+X / Cmd+X (when allowCopy or allowPaste is false)
      if (isCtrlOrCmd && key === 'x') {
        if (!quizRef.current?.allowCopy || !quizRef.current?.allowPaste) {
          e.preventDefault();
          registerViolation('Cut shortcut detected: Ctrl+X.');
          return;
        }
      }

      // Select All shortcut: Ctrl+A / Cmd+A (when allowCopy is false)
      if (isCtrlOrCmd && key === 'a') {
        if (!quizRef.current?.allowCopy) {
          e.preventDefault();
          registerViolation('Select all shortcut detected: Ctrl+A.');
          return;
        }
      }

      // Normal keys (letters, numbers, arrows, Tab, Enter, Backspace) are NOT blocked
    };

    // G. Print dialog detection (beforeprint)
    const handleBeforePrint = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      registerViolation('Print attempt detected.');
    };

    // H. Browser navigation detection (popstate)
    const handlePopState = () => {
      if (hasSubmittedRef.current || isSubmittingRef.current) return;
      window.history.pushState(null, '', window.location.href);
      registerViolation('Browser navigation detected.');
    };

    // Push initial history entry to catch back-navigation
    try {
      window.history.pushState(null, '', window.location.href);
    } catch (e) {}

    // Register all event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('cut', handleCut);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleUnloadSubmit);
    window.addEventListener('pagehide', handleUnloadSubmit);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('cut', handleCut);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleUnloadSubmit);
      window.removeEventListener('pagehide', handleUnloadSubmit);
    };
  }, [quiz, isSubmitting, registerViolation, handleUnloadSubmit, showFullscreenGate]);

  // Answer selection handler
  const handleSelectAnswer = (qId, optionKey) => {
    if (isSubmitting || hasSubmittedRef.current) return;
    const currentAttemptId = attemptIdRef.current;
    setAnswers((prev) => {
      const updated = {
        ...prev,
        [qId]: optionKey,
      };
      answersRef.current = updated;
      if (currentAttemptId) {
        try {
          localStorage.setItem(`quiz_answers_${currentAttemptId}`, JSON.stringify(updated));
        } catch (storageErr) {
          console.warn('[QUIZ] Failed to persist answers to storage:', storageErr);
        }
      }
      return updated;
    });
  };

  // Timer expiration callback - uses same central performSubmit
  const handleTimerExpire = useCallback(() => {
    console.log('[QUIZ] Timer requested submission');
    if (!hasSubmittedRef.current && !isSubmittingRef.current) {
      performSubmitRef.current('Time expired. Automatically submitting quiz.');
    }
  }, []);

  // Navigation handlers with persistence
  const updateCurrentIndex = (newIdx) => {
    setCurrentIndex(newIdx);
    const currentAttemptId = attemptIdRef.current;
    if (currentAttemptId) {
      try {
        localStorage.setItem(`quiz_current_question_${currentAttemptId}`, String(newIdx));
      } catch (storageErr) {
        console.warn('[QUIZ] Failed to persist question index:', storageErr);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0 && (quiz?.allowPreviousQuestion ?? true)) {
      updateCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      updateCurrentIndex(currentIndex + 1);
    }
  };

  const handleSelectIndex = (idx) => {
    if (!quiz?.allowPreviousQuestion && idx < currentIndex) return;
    if (idx >= 0 && idx < questions.length) {
      updateCurrentIndex(idx);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Preparing your examination attempt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-page-wrapper">
        <main className="student-main-content">
          <div className="empty-state-card">
            <div className="empty-state-icon">⚠️</div>
            <h4>Unable to Open Quiz</h4>
            <p>{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/student')}
            >
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div
      className={`student-quiz-environment ${
        !quiz?.allowCopy ? 'no-copy-zone' : ''
      }`}
    >
      {/* Fullscreen Gate Overlay */}
      {showFullscreenGate && !loading && !error && !isSubmitting && !hasSubmittedRef.current && (
        <div className="fullscreen-gate-overlay">
          <div className="fullscreen-gate-modal">
            <div className="gate-icon">⛶</div>
            <h3>Fullscreen Mode Required</h3>
            <p>
              Fullscreen mode is required to take this quiz. Please enter fullscreen to continue your assessment.
            </p>
            {fullscreenError && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                <span>{fullscreenError}</span>
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleEnterFullscreen}
            >
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Top Examination Status Bar */}
      <header className="exam-top-bar">
        <div className="exam-top-bar-inner">
          <div className="exam-title-box">
            <span className="exam-badge">Assessment In Progress</span>
            <h2 className="exam-quiz-title">{quiz?.title}</h2>
          </div>

          <div className="exam-controls-box">
            {attempt && attempt.remainingSeconds != null ? (
              <QuizTimer
                remainingSeconds={attempt.remainingSeconds}
                expiresAt={attempt?.expiresAt}
                attemptId={attempt?.attemptId}
                onExpire={handleTimerExpire}
              />
            ) : (
              <div className="quiz-timer timer-normal">
                <span className="timer-icon">⏱️</span>
                <div className="timer-display">
                  <span className="timer-label">Time Remaining</span>
                  <span className="timer-clock">--:--</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Warning Banners */}
      {violationWarning && (
        <div className="alert alert-warning alert-sticky">
          <span>⚠️ {violationWarning}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setViolationWarning(null)}
          >
            &times;
          </button>
        </div>
      )}

      {submissionMessage && (
        <div className="alert alert-info alert-sticky">
          <span>{submissionMessage}</span>
        </div>
      )}

      {/* Main Examination Layout */}
      <main className="exam-content-container">
        <div className="exam-layout">
          {/* Left / Center: Question Card */}
          <div className="exam-question-area">
            {currentQuestion ? (
              <QuizQuestion
                question={currentQuestion}
                questionIndex={currentIndex}
                totalQuestions={questions.length}
                selectedAnswer={answers[currentQuestion.id]}
                onSelectAnswer={handleSelectAnswer}
                allowCopy={quiz?.allowCopy}
              />
            ) : (
              <div className="empty-state">No question available</div>
            )}
          </div>

          {/* Right: Question Navigation Palette */}
          <aside className="exam-palette-area">
            <QuizNavigation
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              allowPreviousQuestion={quiz?.allowPreviousQuestion ?? true}
              onSelectIndex={handleSelectIndex}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmitPrompt={() => setShowSubmitModal(true)}
              isSubmitting={isSubmitting}
            />
          </aside>
        </div>
      </main>

      {/* Submission Confirmation Modal */}
      <ConfirmModal
        isOpen={showSubmitModal}
        title="Submit Examination"
        message={`You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit your assessment?`}
        confirmText="Yes, Submit Quiz"
        cancelText="Keep Answering"
        isDestructive={false}
        isLoading={isSubmitting}
        onConfirm={() => performSubmit('Quiz submitted by student.')}
        onCancel={() => setShowSubmitModal(false)}
      />

      {/* First Violation Warning Modal */}
      {showWarningModal && !showFullscreenGate && !isSubmitting && !hasSubmittedRef.current && (
        <div className="security-modal-overlay">
          <div className="security-modal-card">
            <div className="security-modal-icon">⚠️</div>
            <h3 className="security-modal-title">Warning</h3>
            <p className="security-modal-highlight">Prohibited activity detected.</p>
            <p className="security-modal-text">
              This is your first warning.
              <br />
              If another prohibited activity is detected, your quiz will be automatically submitted.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg security-modal-btn"
              onClick={handleContinueAfterWarning}
            >
              Continue Quiz
            </button>
          </div>
        </div>
      )}

      {/* Second Violation Submitting Overlay */}
      {isSubmitting && (violationCount >= 2 || submissionMessage?.includes('Violation Limit')) && (
        <div className="security-submitting-overlay">
          <div className="security-modal-card">
            <div className="security-modal-icon">⚠️</div>
            <h3 className="security-modal-title">Violation Limit Reached</h3>
            <p className="security-modal-text">
              Another prohibited activity was detected.
              <br />
              Your quiz is being automatically submitted.
            </p>
            <div className="spinner" style={{ margin: '20px auto 12px auto' }}></div>
            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Submitting...</p>
          </div>
        </div>
      )}
    </div>
  );
};

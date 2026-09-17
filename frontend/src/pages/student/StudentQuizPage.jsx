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

  // Anti-cheating state
  const [violationCount, setViolationCount] = useState(0);
  const [violationWarning, setViolationWarning] = useState(null);

  // Refs for stable callbacks, event handlers, and preventing duplicate submissions
  const hasSubmittedRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const violationCountRef = useRef(0);
  const hasEnteredFullscreenRef = useRef(!!document.fullscreenElement);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const attemptIdRef = useRef(null);
  const quizRef = useRef(null);
  quizRef.current = quiz;

  // Submit quiz function - single source of truth for submission
  const performSubmit = useCallback(async (reason = null) => {
    if (hasSubmittedRef.current || isSubmittingRef.current) return;
    const currentAttemptId = attemptIdRef.current;
    if (!currentAttemptId) return;

    hasSubmittedRef.current = true;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setShowSubmitModal(false);

    if (reason) {
      setSubmissionMessage(reason);
    }

    // Exit fullscreen if currently active
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (ignored) {}
    }

    // Format answers map
    const formattedAnswers = {};
    Object.entries(answersRef.current).forEach(([qId, val]) => {
      formattedAnswers[String(qId)] = String(val);
    });

    try {
      await submitQuiz(currentAttemptId, formattedAnswers);

      // Navigate according to quiz.immediateResult setting
      if (quizRef.current?.immediateResult) {
        navigate(`/student/result/${currentAttemptId}`, { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : '');
      if (errMsg.toLowerCase().includes('already been submitted')) {
        if (quizRef.current?.immediateResult) {
          navigate(`/student/result/${currentAttemptId}`, { replace: true });
        } else {
          navigate('/student', { replace: true });
        }
        return;
      }

      hasSubmittedRef.current = false;
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setSubmissionMessage(null);
      setError(formatApiError(err, 'Failed to submit quiz. Please try again.'));
    }
  }, [navigate]);

  // Anti-cheating violation handler
  const registerViolation = useCallback((violationTypeMessage) => {
    if (hasSubmittedRef.current || isSubmittingRef.current) return;
    if (!quizRef.current?.detectTabSwitch) return;

    const threshold = quizRef.current.violationThreshold || 3;
    const nextCount = violationCountRef.current + 1;
    violationCountRef.current = Math.min(nextCount, threshold);
    setViolationCount(violationCountRef.current);

    if (nextCount >= threshold) {
      setViolationWarning(
        `Violation limit reached (${threshold} of ${threshold}). Automatically submitting exam...`
      );
      if (quizRef.current.autoSubmitOnViolation) {
        performSubmit('Violation threshold exceeded. Auto-submitting quiz...');
      }
    } else {
      setViolationWarning(
        `${violationTypeMessage} (Violation ${nextCount} of ${threshold})`
      );
    }
  }, [performSubmit]);

  // Fullscreen gate enter handler
  const handleEnterFullscreen = async () => {
    setFullscreenError(null);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setShowFullscreenGate(false);
        hasEnteredFullscreenRef.current = true;
      } else {
        setShowFullscreenGate(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      setFullscreenError('Fullscreen mode is required to take this quiz.');
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;

      if (inFullscreen) {
        hasEnteredFullscreenRef.current = true;
        setShowFullscreenGate(false);
      } else {
        // User exited fullscreen during an active exam session
        if (hasEnteredFullscreenRef.current && !hasSubmittedRef.current && !isSubmittingRef.current) {
          if (quizRef.current?.detectTabSwitch) {
            registerViolation('Warning: Exiting fullscreen mode is not permitted.');
          }
          setShowFullscreenGate(true);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [registerViolation]);

  // Initial attempt and questions loader - AttemptId is the source of truth
  useEffect(() => {
    let isMounted = true;

    const initializeQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch active quiz settings
        let currentQuiz = null;
        try {
          currentQuiz = await getQuizById(quizId);
        } catch {
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

        if (isMounted) {
          setQuiz(currentQuiz);
          quizRef.current = currentQuiz;
        }

        // 2. Obtain attempt (either validate existing attempt from URL or start/resume from backend)
        let attemptData = null;
        const paramAttemptId = searchParams.get('attemptId');

        if (paramAttemptId) {
          // AttemptId in URL takes priority as source of truth
          try {
            attemptData = await getAttempt(paramAttemptId);
          } catch (attemptErr) {
            const msg = attemptErr.response?.data?.message || '';
            if (msg.toLowerCase().includes('already been submitted')) {
              if (currentQuiz.immediateResult) {
                navigate(`/student/result/${paramAttemptId}`, { replace: true });
                return;
              }
            }
            throw attemptErr;
          }
        } else {
          // No attemptId in URL -> startQuiz resumes unexpired attempt or creates a new one
          attemptData = await startQuiz(quizId);
          if (isMounted) {
            setSearchParams({ attemptId: String(attemptData.attemptId) }, { replace: true });
          }
        }

        if (!attemptData) {
          throw new Error('Could not establish an active quiz attempt.');
        }

        if (isMounted) {
          setAttempt(attemptData);
          attemptIdRef.current = attemptData.attemptId;
        }

        // 3. Fetch attempt questions
        const questionList = await getAttemptQuestions(attemptData.attemptId);
        if (!questionList || questionList.length === 0) {
          if (isMounted) {
            setError('No questions have been configured for this quiz.');
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setQuestions(questionList);
        }
      } catch (err) {
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

  // Anti-cheating event listeners (Copy, Paste, Right-Click, VisibilityChange)
  useEffect(() => {
    if (!quiz || isSubmitting) return;

    // A. Copy prevention
    const handleCopy = (e) => {
      if (!quizRef.current?.allowCopy) {
        e.preventDefault();
      }
    };

    // B. Paste prevention
    const handlePaste = (e) => {
      if (!quizRef.current?.allowPaste) {
        e.preventDefault();
      }
    };

    // C. Right-click context menu prevention
    const handleContextMenu = (e) => {
      if (!quizRef.current?.allowRightClick) {
        e.preventDefault();
      }
    };

    // D. Tab-switch detection (fires when tab becomes hidden)
    const handleVisibilityChange = () => {
      if (!quizRef.current?.detectTabSwitch) return;

      if (document.visibilityState === 'hidden') {
        registerViolation('Warning: Leaving the quiz window is not permitted.');
      }
    };

    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quiz, isSubmitting, registerViolation]);

  // Answer selection handler
  const handleSelectAnswer = (qId, optionKey) => {
    if (isSubmitting || hasSubmittedRef.current) return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionKey,
    }));
  };

  // Timer expiration callback - uses same central performSubmit
  const handleTimerExpire = useCallback(() => {
    if (!hasSubmittedRef.current && !isSubmittingRef.current) {
      performSubmit('Your quiz time has expired. Submitting your answers...');
    }
  }, [performSubmit]);

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0 && (quiz?.allowPreviousQuestion ?? true)) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSelectIndex = (idx) => {
    if (!quiz?.allowPreviousQuestion && idx < currentIndex) return;
    if (idx >= 0 && idx < questions.length) {
      setCurrentIndex(idx);
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
      {showFullscreenGate && !loading && !error && (
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
            {attempt?.expiresAt && (
              <QuizTimer
                expiresAt={attempt.expiresAt}
                onExpire={handleTimerExpire}
              />
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
        onConfirm={() => performSubmit()}
        onCancel={() => setShowSubmitModal(false)}
      />
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { QuizTimer } from '../../components/student/QuizTimer';
import { QuizQuestion } from '../../components/student/QuizQuestion';
import { QuizNavigation } from '../../components/student/QuizNavigation';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import {
  getActiveQuizzes,
  startQuiz,
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

  // Anti-cheating state
  const [violationCount, setViolationCount] = useState(0);
  const [violationWarning, setViolationWarning] = useState(null);

  // Keep a ref to prevent multiple submissions
  const hasSubmittedRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const attemptIdRef = useRef(null);

  // Submit quiz function
  const performSubmit = useCallback(async (reason = null) => {
    if (hasSubmittedRef.current) return;
    const currentAttemptId = attemptIdRef.current;
    if (!currentAttemptId) return;

    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    setShowSubmitModal(false);

    if (reason) {
      setSubmissionMessage(reason);
    }

    // Convert keys to string IDs
    const formattedAnswers = {};
    Object.entries(answersRef.current).forEach(([qId, val]) => {
      formattedAnswers[String(qId)] = String(val);
    });

    try {
      await submitQuiz(currentAttemptId, formattedAnswers);
      navigate(`/student/result/${currentAttemptId}`, { replace: true });
    } catch (err) {
      hasSubmittedRef.current = false;
      setIsSubmitting(false);
      setSubmissionMessage(null);
      setError(formatApiError(err, 'Failed to submit quiz. Please try again.'));
    }
  }, [navigate]);

  // Initial attempt and questions loader
  useEffect(() => {
    const initializeQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch active quiz settings
        const allQuizzes = await getActiveQuizzes();
        const currentQuiz = allQuizzes.find((q) => String(q.id) === String(quizId));
        if (!currentQuiz) {
          setError('Quiz not found or is no longer active.');
          setLoading(false);
          return;
        }
        setQuiz(currentQuiz);

        // 2. Obtain attempt (either from URL or resume/start from backend)
        let attemptData = null;
        const paramAttemptId = searchParams.get('attemptId');

        // startQuiz resumes an unexpired attempt or creates a new one
        attemptData = await startQuiz(quizId);
        setAttempt(attemptData);
        attemptIdRef.current = attemptData.attemptId;

        // Keep URL updated with attemptId for seamless page reloads
        if (paramAttemptId !== String(attemptData.attemptId)) {
          setSearchParams({ attemptId: String(attemptData.attemptId) }, { replace: true });
        }

        // 3. Fetch attempt questions
        const questionList = await getAttemptQuestions(attemptData.attemptId);
        if (!questionList || questionList.length === 0) {
          setError('No questions have been configured for this quiz.');
          setLoading(false);
          return;
        }
        setQuestions(questionList);
      } catch (err) {
        setError(formatApiError(err, 'Failed to load quiz attempt.'));
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [quizId, searchParams, setSearchParams]);

  // Auto-submit when violation limit is reached
  useEffect(() => {
    if (!quiz || !quiz.detectTabSwitch || !quiz.autoSubmitOnViolation) return;
    const threshold = quiz.violationThreshold || 3;

    if (violationCount >= threshold && !hasSubmittedRef.current) {
      performSubmit('Violation threshold exceeded. Auto-submitting quiz...');
    }
  }, [violationCount, quiz, performSubmit]);

  // Anti-cheating event listeners
  useEffect(() => {
    if (!quiz || isSubmitting || hasSubmittedRef.current) return;

    // A. Copy prevention
    const handleCopy = (e) => {
      if (!quiz.allowCopy) {
        e.preventDefault();
      }
    };

    // B. Paste prevention
    const handlePaste = (e) => {
      if (!quiz.allowPaste) {
        e.preventDefault();
      }
    };

    // C. Right-click context menu prevention
    const handleContextMenu = (e) => {
      if (!quiz.allowRightClick) {
        e.preventDefault();
      }
    };

    // D. Tab-switch detection
    const handleVisibilityChange = () => {
      if (!quiz.detectTabSwitch) return;

      if (document.visibilityState === 'hidden') {
        setViolationCount((prev) => {
          const next = prev + 1;
          const max = quiz.violationThreshold || 3;
          setViolationWarning(
            `Warning: Leaving the quiz window is not permitted. (Violation ${next} of ${max})`
          );
          return next;
        });
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
  }, [quiz, isSubmitting]);

  // Answer selection handler
  const handleSelectAnswer = (qId, optionKey) => {
    if (isSubmitting || hasSubmittedRef.current) return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionKey,
    }));
  };

  // Timer expiration callback
  const handleTimerExpire = useCallback(() => {
    if (!hasSubmittedRef.current) {
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

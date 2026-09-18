import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StudentNavbar } from './StudentNavbar';
import { getActiveQuizzes, getQuizById, startQuiz, formatApiError } from '../../api/studentQuizApi';

export const QuizInstructions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        let found = null;
        try {
          found = await getQuizById(quizId);
        } catch {
          const data = await getActiveQuizzes();
          const quizzes = Array.isArray(data)
            ? data
            : data && Array.isArray(data.data)
            ? data.data
            : [];
          found = quizzes.find((q) => String(q.id) === String(quizId));
        }

        if (!found) {
          setError('The requested quiz was not found or is currently inactive.');
          return;
        }
        setQuiz(found);
      } catch (err) {
        setError(formatApiError(err, 'Failed to load quiz details.'));
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleStart = async () => {
    setStarting(true);
    setError(null);
    try {
      if (quiz?.activeAttemptId) {
        // Request fullscreen directly from the user click gesture
        try {
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
        } catch (fsErr) {
          console.warn('Fullscreen request denied or unsupported:', fsErr);
        }
        // Resume existing active attempt directly without calling startQuiz
        navigate(`/student/quiz/${quizId}?attemptId=${quiz.activeAttemptId}`);
        return;
      }

      const attempt = await startQuiz(quizId);

      // Request fullscreen directly from the user click gesture
      try {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (fsErr) {
        console.warn('Fullscreen request denied or unsupported:', fsErr);
      }

      // Navigate to the active quiz taking view with the newly returned attemptId
      navigate(`/student/quiz/${quizId}?attemptId=${attempt.attemptId}`);
    } catch (err) {
      setError(formatApiError(err, 'Failed to start quiz attempt.'));
      setStarting(false);
    }
  };

  return (
    <div className="student-page-wrapper">
      <StudentNavbar />

      <main className="student-main-content">
        <div className="breadcrumb-bar">
          <Link to="/student" className="breadcrumb-link">
            &larr; Back to Available Quizzes
          </Link>
        </div>

        {error && (
          <div className="alert alert-error alert-dismissible">
            <span>{error}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}

        {loading ? (
          <div className="section-loading">
            <div className="spinner"></div>
            <p>Loading assessment instructions...</p>
          </div>
        ) : !quiz ? (
          <div className="empty-state-card">
            <h4>Quiz Unavailable</h4>
            <p>This assessment is not available at this time.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/student')}
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="instructions-card">
            <div className="instructions-header">
              <span className="instructions-badge">Examination Guidelines</span>
              <h2 className="instructions-quiz-title">{quiz.title}</h2>
              <p className="instructions-desc">
                {quiz.description || 'Please read all assessment instructions carefully before beginning.'}
              </p>
            </div>

            <div className="instructions-meta-grid">
              <div className="meta-box">
                <span className="meta-icon">⏱️</span>
                <div className="meta-content">
                  <span className="meta-label">Time Allowed</span>
                  <span className="meta-val">{quiz.durationMinutes} Minutes</span>
                </div>
              </div>

              <div className="meta-box">
                <span className="meta-icon">🔐</span>
                <div className="meta-content">
                  <span className="meta-label">Environment</span>
                  <span className="meta-val">Secure Examination</span>
                </div>
              </div>

              {(quiz.totalQuestions || quiz.questionCount) && (
                <div className="meta-box">
                  <span className="meta-icon">📝</span>
                  <div className="meta-content">
                    <span className="meta-label">Questions</span>
                    <span className="meta-val">{quiz.totalQuestions || quiz.questionCount} Questions</span>
                  </div>
                </div>
              )}
            </div>

            <div className="instructions-body">
              {quiz.activeAttemptId && (
                <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                  <span>ℹ️ You have an active, in-progress attempt for this quiz. Resuming will return you directly to your assessment session.</span>
                </div>
              )}

              {!quiz.activeAttemptId && quiz.alreadySubmitted && !quiz.retakeApproved && (
                <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
                  <span>⚠️ You have already submitted this quiz. A retake requires administrator approval before you can start again.</span>
                </div>
              )}

              {!quiz.activeAttemptId && quiz.alreadySubmitted && quiz.retakeApproved && (
                <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                  <span>✅ Your retake request has been approved by the administrator. Starting now will generate a fresh attempt with full time.</span>
                </div>
              )}

              <h4>Important Rules & Instructions:</h4>
              <ul className="instructions-list">
                <li>Once you start the quiz, the authoritative server-side timer will begin.</li>
                <li>Your answers are securely recorded and evaluated on the server.</li>
                <li className="rule-highlight">
                  This assessment is conducted in a secure environment. Prohibited activities (such as switching tabs, exiting fullscreen, or using unauthorized shortcuts) will trigger a warning, and repeated violations will automatically submit your quiz.
                </li>
                <li>Ensure you have a reliable internet connection before proceeding.</li>
                <li>When the time reaches zero, your answers will be automatically submitted.</li>
              </ul>
            </div>

            <div className="instructions-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/student')}
                disabled={starting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-lg ${
                  quiz.activeAttemptId
                    ? 'btn-warning'
                    : quiz.alreadySubmitted && quiz.retakeApproved
                    ? 'btn-success'
                    : 'btn-primary'
                }`}
                onClick={handleStart}
                disabled={starting || (!quiz.activeAttemptId && quiz.alreadySubmitted && !quiz.retakeApproved)}
              >
                {starting
                  ? 'Starting Attempt...'
                  : quiz.activeAttemptId
                  ? 'Resume Quiz \u2192'
                  : quiz.alreadySubmitted && quiz.retakeApproved
                  ? 'Start Retake Now \u2192'
                  : quiz.alreadySubmitted
                  ? 'Already Submitted'
                  : 'Start Quiz Now \u2192'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { getAttemptResult, formatApiError } from '../../api/studentQuizApi';
import { formatKolkataDateTime } from '../../utils/dateFormat';

export const StudentResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAttemptResult(attemptId);
        setResult(data);
      } catch (err) {
        setError(formatApiError(err, 'Failed to fetch assessment result.'));
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  return (
    <div className="student-page-wrapper">
      <StudentNavbar />

      <main className="student-main-content">
        <div className="breadcrumb-bar">
          <Link to="/student" className="breadcrumb-link">
            &larr; Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="section-loading">
            <div className="spinner"></div>
            <p>Loading your submission result...</p>
          </div>
        ) : error ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">⚠️</div>
            <h4>Result Not Available</h4>
            <p>{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/student')}
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="result-container">
            <div className="result-card">
              <div className="result-header">
                <div className="result-success-icon">✓</div>
                <span className="status-pill status-active">Submitted</span>
                <h2 className="result-title">{result.quizTitle || 'Quiz Assessment'}</h2>
                <p className="result-subtitle">
                  Your assessment has been successfully received by the examination server.
                </p>
              </div>

              <div className="result-body">
                {result.score !== null && result.score !== undefined ? (
                  <div className="score-display-box">
                    <span className="score-label">Your Score</span>
                    <div className="score-numbers">
                      <span className="score-earned">{result.score}</span>
                      <span className="score-divider">/</span>
                      <span className="score-total">{result.totalQuestions}</span>
                    </div>
                    {result.totalQuestions > 0 && (
                      <span className="score-percent">
                        {Math.round((result.score / result.totalQuestions) * 100)}% Accuracy
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="score-hidden-box">
                    <span className="score-hidden-icon">📋</span>
                    <h4>Your result has been submitted.</h4>
                    <p>
                      Score display has been restricted by the administrator. Your evaluation has
                      been safely recorded in the database.
                    </p>
                  </div>
                )}

                <div className="result-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Total Questions</span>
                    <span className="detail-val">{result.totalQuestions}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted At</span>
                    <span className="detail-val">{formatKolkataDateTime(result.submittedAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Attempt Reference</span>
                    <span className="detail-val">#{attemptId}</span>
                  </div>
                </div>
              </div>

              <div className="result-footer">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => navigate('/student')}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

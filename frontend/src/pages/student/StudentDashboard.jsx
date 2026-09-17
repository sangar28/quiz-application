import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { StudentQuizCard } from '../../components/student/StudentQuizCard';
import { getActiveQuizzes, formatApiError } from '../../api/studentQuizApi';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getActiveQuizzes();
        if (Array.isArray(data)) {
          setQuizzes(data);
        } else if (data && Array.isArray(data.data)) {
          setQuizzes(data.data);
        } else if (data && Array.isArray(data.quizzes)) {
          setQuizzes(data.quizzes);
        } else {
          setQuizzes([]);
        }
      } catch (err) {
        setError(formatApiError(err, 'Failed to fetch available quizzes.'));
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="student-page-wrapper">
      <StudentNavbar />

      <main className="student-main-content">
        {/* Welcome Section */}
        <section className="student-welcome-banner">
          <div className="welcome-text">
            <h2>Welcome, {user?.name || 'Student'}</h2>
            <p className="welcome-email">{user?.email || ''}</p>
            <p className="welcome-sub">
              Access your assigned examination assessments and view available tests below.
            </p>
          </div>
        </section>

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

        {/* Main Available Quizzes Section */}
        <section className="available-quizzes-section">
          <div className="section-header-bar">
            <div>
              <h3 className="section-heading">Available Quizzes</h3>
              <p className="section-subheading">
                Quizzes currently active and open for examination.
              </p>
            </div>
            <span className="badge badge-info">
              {Array.isArray(quizzes) ? quizzes.length : 0}{' '}
              {(Array.isArray(quizzes) ? quizzes.length : 0) === 1 ? 'Quiz' : 'Quizzes'} Available
            </span>
          </div>

          {loading ? (
            <div className="section-loading">
              <div className="spinner"></div>
              <p>Loading available assessments...</p>
            </div>
          ) : !Array.isArray(quizzes) || quizzes.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">📝</div>
              <h4>No quizzes are currently available.</h4>
              <p>Please check back later when your instructor activates an assessment.</p>
            </div>
          ) : (
            <div className="student-quiz-grid">
              {quizzes.map((quiz) => (
                <StudentQuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

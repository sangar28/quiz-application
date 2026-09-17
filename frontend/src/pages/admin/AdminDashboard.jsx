import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { QuizCard } from '../../components/admin/QuizCard';
import { QuizFormModal } from '../../components/admin/QuizFormModal';
import { QuizEditModal } from '../../components/admin/QuizEditModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { getAllQuizzes, updateQuiz, deleteQuiz, formatApiError } from '../../api/quizAdminApi';
import { getAllResults } from '../../api/resultAdminApi';

export const AdminDashboard = () => {
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState(null);
  const [quizToDelete, setQuizToDelete] = useState(null);

  // Action loading states
  const [actionQuizId, setActionQuizId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [quizzesData, resultsData] = await Promise.all([
        getAllQuizzes(),
        getAllResults().catch(() => []),
      ]);
      setQuizzes(quizzesData || []);
      setTotalResults(resultsData?.totalElements ?? (Array.isArray(resultsData) ? resultsData.length : 0));
    } catch (err) {
      setError(formatApiError(err, 'Unable to load dashboard data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Activate / Deactivate toggle
  const handleToggleActive = async (quiz) => {
    setActionQuizId(quiz.id);
    setError(null);
    setSuccessMessage(null);

    const updatedPayload = {
      title: quiz.title,
      description: quiz.description || '',
      durationMinutes: quiz.durationMinutes,
      active: !quiz.active,
      showScore: quiz.showScore,
      showCorrectAnswers: quiz.showCorrectAnswers,
      allowCopy: quiz.allowCopy,
      allowPaste: quiz.allowPaste,
      allowRightClick: quiz.allowRightClick,
      detectTabSwitch: quiz.detectTabSwitch,
      autoSubmitOnViolation: quiz.autoSubmitOnViolation,
      violationThreshold: quiz.violationThreshold,
      allowPreviousQuestion: quiz.allowPreviousQuestion,
      randomQuestions: quiz.randomQuestions,
      randomOptions: quiz.randomOptions,
      immediateResult: quiz.immediateResult,
    };

    try {
      const updated = await updateQuiz(quiz.id, updatedPayload);
      setQuizzes((prev) =>
        prev.map((q) => (q.id === updated.id ? updated : q))
      );
      setSuccessMessage(
        `Quiz "${updated.title}" is now ${updated.active ? 'Active' : 'Inactive'}.`
      );
    } catch (err) {
      setError(formatApiError(err, 'Failed to update quiz status.'));
    } finally {
      setActionQuizId(null);
    }
  };

  // Delete quiz
  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteQuiz(quizToDelete.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizToDelete.id));
      setSuccessMessage(`Quiz "${quizToDelete.title}" was successfully deleted.`);
      setQuizToDelete(null);
      await fetchDashboardData();
    } catch (err) {
      setError(formatApiError(err, 'Failed to delete quiz.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats calculation
  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter((q) => q.active).length;

  return (
    <div className="admin-page-wrapper">
      <AdminNavbar />

      <main className="admin-main-content">
        {/* Welcome Section */}
        <section className="welcome-banner">
          <div className="welcome-text">
            <h2>Welcome, {user?.name || 'Administrator'}</h2>
            <p className="welcome-sub">
              Manage examination schedules, question banks, and student assessment metrics.
            </p>
          </div>
        </section>

        {/* Feedback Banners */}
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

        {successMessage && (
          <div className="alert alert-success alert-dismissible">
            <span>{successMessage}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setSuccessMessage(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-icon stat-blue">📚</div>
            <div className="stat-info">
              <span className="stat-number">{totalQuizzes}</span>
              <span className="stat-title">Total Quizzes</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-green">⚡</div>
            <div className="stat-info">
              <span className="stat-number">{activeQuizzes}</span>
              <span className="stat-title">Active Quizzes</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-purple">📝</div>
            <div className="stat-info">
              <span className="stat-number">{totalResults}</span>
              <span className="stat-title">Submissions</span>
            </div>
          </div>
        </section>

        {/* Quiz Management Section */}
        <section id="quizzes-section" className="quizzes-section">
          <div className="section-header-bar">
            <div>
              <h3 className="section-heading">Quiz Management</h3>
              <p className="section-subheading">
                Create new assessments, configure anti-cheating, and manage daily questions.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              + Create New Quiz
            </button>
          </div>

          {loading ? (
            <div className="section-loading">
              <div className="spinner"></div>
              <p>Loading quizzes...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">📋</div>
              <h4>No quizzes created yet</h4>
              <p>Get started by creating your first assessment for students.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                + Create New Quiz
              </button>
            </div>
          ) : (
            <div className="quiz-grid">
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onEdit={(q) => setQuizToEdit(q)}
                  onToggleActive={handleToggleActive}
                  onDelete={(q) => setQuizToDelete(q)}
                  isToggling={actionQuizId === quiz.id}
                  isDeleting={quizToDelete?.id === quiz.id && isDeleting}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Quiz Modal */}
      <QuizFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onQuizCreated={(created) => {
          setQuizzes((prev) => [created, ...prev]);
          setSuccessMessage(`Quiz "${created.title}" created successfully!`);
        }}
      />

      {/* Edit Quiz Modal */}
      <QuizEditModal
        isOpen={Boolean(quizToEdit)}
        quiz={quizToEdit}
        onClose={() => setQuizToEdit(null)}
        onQuizUpdated={(updated) => {
          setQuizzes((prev) =>
            prev.map((q) => (q.id === updated.id ? updated : q))
          );
          setSuccessMessage(`Quiz "${updated.title}" updated successfully!`);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(quizToDelete)}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? All questions associated with this quiz will also be deleted."
        confirmText="Delete Quiz"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setQuizToDelete(null)}
      />
    </div>
  );
};

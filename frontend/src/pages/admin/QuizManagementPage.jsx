import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { QuestionList } from '../../components/admin/QuestionList';
import { ExcelUpload } from '../../components/admin/ExcelUpload';
import { QuizSettings } from '../../components/admin/QuizSettings';
import {
  getAllQuizzes,
  getQuizQuestions,
  addQuestion,
  deleteQuestion,
  updateQuiz,
  formatApiError,
} from '../../api/quizAdminApi';

export const QuizManagementPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [allQuizzes, setAllQuizzes] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionPage, setQuestionPage] = useState(0);
  const [totalQuestionPages, setTotalQuestionPages] = useState(1);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'upload' | 'settings'

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [togglingActive, setTogglingActive] = useState(false);

  // Load questions for specific page
  const loadQuestions = useCallback(async (targetQuizId, pageToLoad = 0) => {
    setQuestionsLoading(true);
    try {
      const pageData = await getQuizQuestions(targetQuizId, pageToLoad, 10);
      const items = pageData?.content || [];
      setQuestions(items);
      setQuestionPage(pageData?.number ?? pageToLoad);
      setTotalQuestionPages(pageData?.totalPages ?? 1);
      setTotalQuestionsCount(pageData?.totalElements ?? items.length);
    } catch (err) {
      setError(formatApiError(err, 'Failed to load questions.'));
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  // Load quiz details and initial question list
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qList = await getAllQuizzes();
      const availableQuizzes = qList || [];
      setAllQuizzes(availableQuizzes);

      if (availableQuizzes.length === 0) {
        setQuiz(null);
        setQuestions([]);
        setTotalQuestionsCount(0);
        setTotalQuestionPages(1);
        return;
      }

      let current = null;
      if (quizId) {
        current = availableQuizzes.find((q) => String(q.id) === String(quizId));
        if (!current) {
          setError(`Quiz with ID ${quizId} was not found.`);
          setQuiz(null);
          setQuestions([]);
          setTotalQuestionsCount(0);
          setTotalQuestionPages(1);
          return;
        }
      } else {
        // When on /admin/quizzes without a specific quizId, default to the first quiz
        current = availableQuizzes[0];
      }

      setQuiz(current);
      await loadQuestions(current.id, 0);
    } catch (err) {
      setError(formatApiError(err, 'Failed to load quiz details.'));
    } finally {
      setLoading(false);
    }
  }, [quizId, loadQuestions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Switch selected quiz via dropdown
  const handleSelectQuiz = (selectedId) => {
    navigate(`/admin/quizzes/${selectedId}`);
  };

  // Refresh question list
  const refreshQuestions = async (page = 0) => {
    if (!quiz) return;
    await loadQuestions(quiz.id, page);
  };

  // Toggle active status
  const handleToggleActive = async () => {
    if (!quiz) return;
    setTogglingActive(true);
    setError(null);

    const payload = {
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
      const updated = await updateQuiz(quiz.id, payload);
      setQuiz(updated);
      setAllQuizzes((prev) =>
        prev.map((q) => (q.id === updated.id ? updated : q))
      );
      setFeedback(`Quiz status changed to ${updated.active ? 'Active' : 'Inactive'}.`);
    } catch (err) {
      setError(formatApiError(err, 'Failed to update status.'));
    } finally {
      setTogglingActive(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!quiz) return;
    try {
      await deleteQuestion(questionId);
      setFeedback('Question deleted successfully.');
      // If deleting the last question on a page causes that page to become empty, move to previous page
      const targetPage = (questions.length === 1 && questionPage > 0) ? questionPage - 1 : questionPage;
      await loadQuestions(quiz.id, targetPage);
    } catch (err) {
      setError(formatApiError(err, 'Failed to delete question.'));
    }
  };

  // Manual add question
  const handleAddQuestion = async (questionData) => {
    if (!quiz) return;
    try {
      await addQuestion(quiz.id, questionData);
      setFeedback('Question added successfully.');
      await loadQuestions(quiz.id, questionPage);
    } catch (err) {
      throw new Error(formatApiError(err, 'Failed to add question.'));
    }
  };

  return (
    <div className="admin-page-wrapper">
      <AdminNavbar />

      <main className="admin-main-content">
        {/* Navigation Breadcrumb & Quiz Selector */}
        <div className="breadcrumb-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <Link to="/admin" className="breadcrumb-link">
            &larr; Back to Dashboard
          </Link>

          {allQuizzes.length > 1 && quiz && (
            <div className="quiz-selector-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="select-quiz-manage" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Select Quiz:
              </label>
              <select
                id="select-quiz-manage"
                className="form-control select-control"
                style={{ minWidth: '220px', padding: '6px 10px', fontSize: '0.875rem' }}
                value={quiz.id}
                onChange={(e) => handleSelectQuiz(e.target.value)}
              >
                {allQuizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.active ? 'Active' : 'Inactive'})
                  </option>
                ))}
              </select>
            </div>
          )}
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

        {feedback && (
          <div className="alert alert-success alert-dismissible">
            <span>{feedback}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setFeedback(null)}
            >
              &times;
            </button>
          </div>
        )}

        {loading ? (
          <div className="section-loading">
            <div className="spinner"></div>
            <p>Loading quiz details...</p>
          </div>
        ) : allQuizzes.length === 0 ? (
          <div className="empty-state-card">
            <h4>No Quizzes Created Yet</h4>
            <p>You have not created any quizzes yet. Please create your first quiz from the dashboard.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/admin')}
            >
              + Create Quiz on Dashboard
            </button>
          </div>
        ) : !quiz ? (
          <div className="empty-state-card">
            <h4>Quiz Not Found</h4>
            <p>{error || 'The requested quiz does not exist or was deleted.'}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/admin/quizzes')}
            >
              View Available Quizzes
            </button>
          </div>
        ) : (
          <>
            {/* Quiz Overview Header */}
            <div className="quiz-manage-header">
              <div className="header-details">
                <div className="header-title-row">
                  <h2 className="quiz-heading">{quiz.title}</h2>
                  <span
                    className={`status-pill ${
                      quiz.active ? 'status-active' : 'status-inactive'
                    }`}
                  >
                    {quiz.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="quiz-desc">
                  {quiz.description || 'No description provided.'}
                </p>

                <div className="header-meta-tags">
                  <span className="meta-tag">⏱️ {quiz.durationMinutes} Minutes</span>
                  <span className="meta-tag">❓ {totalQuestionsCount} Questions</span>
                  <span className="meta-tag">
                    📊 Score Display: {quiz.showScore ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="header-actions">
                <button
                  type="button"
                  className={`btn ${
                    quiz.active ? 'btn-warning' : 'btn-success'
                  }`}
                  onClick={handleToggleActive}
                  disabled={togglingActive}
                >
                  {togglingActive
                    ? 'Updating...'
                    : quiz.active
                    ? 'Deactivate Quiz'
                    : 'Activate Quiz'}
                </button>
              </div>
            </div>

            {/* Navigation Tabs for Sections A, B, C */}
            <div className="manage-tabs">
              <button
                type="button"
                className={`tab-btn ${
                  activeTab === 'questions' ? 'tab-btn-active' : ''
                }`}
                onClick={() => setActiveTab('questions')}
              >
                A. Questions ({totalQuestionsCount})
              </button>

              <button
                type="button"
                className={`tab-btn ${
                  activeTab === 'upload' ? 'tab-btn-active' : ''
                }`}
                onClick={() => setActiveTab('upload')}
              >
                B. Excel Upload
              </button>

              <button
                type="button"
                className={`tab-btn ${
                  activeTab === 'settings' ? 'tab-btn-active' : ''
                }`}
                onClick={() => setActiveTab('settings')}
              >
                C. Quiz Settings
              </button>
            </div>

            {/* Tab Panels */}
            <div className="tab-content-card">
              {activeTab === 'questions' && (
                <QuestionList
                  questions={questions}
                  loading={questionsLoading}
                  currentPage={questionPage}
                  totalPages={totalQuestionPages}
                  totalElements={totalQuestionsCount}
                  onPageChange={(newPage) => loadQuestions(quiz.id, newPage)}
                  onDeleteQuestion={handleDeleteQuestion}
                  onAddQuestion={handleAddQuestion}
                />
              )}

              {activeTab === 'upload' && (
                <ExcelUpload
                  quizId={quiz.id}
                  onUploadSuccess={async (res) => {
                    await refreshQuestions(0);
                    setFeedback(
                      `${res.importedQuestions || 'Excel'} questions imported successfully!`
                    );
                    setActiveTab('questions');
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <div className="settings-tab-wrapper">
                  <h4 className="section-title">Quiz Configuration</h4>
                  <p className="section-desc">
                    Manage examination rules, security restrictions, and evaluation parameters.
                  </p>
                  <QuizSettings
                    quiz={quiz}
                    onSaved={(updated) => {
                      setQuiz(updated);
                      setAllQuizzes((prev) =>
                        prev.map((q) => (q.id === updated.id ? updated : q))
                      );
                      setFeedback('Quiz configuration updated successfully!');
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

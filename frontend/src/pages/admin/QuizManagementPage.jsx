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

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'upload' | 'settings'

  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [togglingActive, setTogglingActive] = useState(false);

  // Load quiz details and question list
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allQuizzes = await getAllQuizzes();
      const current = allQuizzes.find((q) => String(q.id) === String(quizId));
      if (!current) {
        setError(`Quiz with ID ${quizId} was not found.`);
        return;
      }
      setQuiz(current);

      setQuestionsLoading(true);
      const qList = await getQuizQuestions(quizId);
      setQuestions(qList || []);
    } catch (err) {
      setError(formatApiError(err, 'Failed to load quiz details.'));
    } finally {
      setLoading(false);
      setQuestionsLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh question list after Excel upload or manual add
  const refreshQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const qList = await getQuizQuestions(quizId);
      setQuestions(qList || []);
    } catch (err) {
      setError(formatApiError(err, 'Failed to refresh questions.'));
    } finally {
      setQuestionsLoading(false);
    }
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
      setFeedback(`Quiz status changed to ${updated.active ? 'Active' : 'Inactive'}.`);
    } catch (err) {
      setError(formatApiError(err, 'Failed to update status.'));
    } finally {
      setTogglingActive(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setFeedback('Question deleted successfully.');
    } catch (err) {
      setError(formatApiError(err, 'Failed to delete question.'));
    }
  };

  // Manual add question
  const handleAddQuestion = async (questionData) => {
    try {
      const created = await addQuestion(quizId, questionData);
      setQuestions((prev) => [...prev, created]);
      setFeedback('Question added successfully.');
    } catch (err) {
      throw new Error(formatApiError(err, 'Failed to add question.'));
    }
  };

  return (
    <div className="admin-page-wrapper">
      <AdminNavbar />

      <main className="admin-main-content">
        {/* Navigation Breadcrumb */}
        <div className="breadcrumb-bar">
          <Link to="/admin" className="breadcrumb-link">
            &larr; Back to Quizzes
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
        ) : !quiz ? (
          <div className="empty-state-card">
            <h4>Quiz Not Found</h4>
            <p>The requested quiz does not exist or was deleted.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/admin')}
            >
              Return to Dashboard
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
                  <span className="meta-tag">❓ {questions.length} Questions</span>
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
                A. Questions ({questions.length})
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
                  onDeleteQuestion={handleDeleteQuestion}
                  onAddQuestion={handleAddQuestion}
                />
              )}

              {activeTab === 'upload' && (
                <ExcelUpload
                  quizId={quiz.id}
                  onUploadSuccess={async (res) => {
                    await refreshQuestions();
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

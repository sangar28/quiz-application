import React, { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

export const QuestionList = ({
  questions = [],
  loading = false,
  onDeleteQuestion,
  onAddQuestion,
}) => {
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteQuestion(questionToDelete.id);
      setQuestionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.questionText.trim()) {
      setAddError('Question text is required.');
      return;
    }
    if (
      !newQuestion.optionA.trim() ||
      !newQuestion.optionB.trim() ||
      !newQuestion.optionC.trim() ||
      !newQuestion.optionD.trim()
    ) {
      setAddError('All 4 options (A, B, C, D) are required.');
      return;
    }

    setIsAdding(true);
    setAddError(null);
    try {
      await onAddQuestion({
        questionText: newQuestion.questionText.trim(),
        optionA: newQuestion.optionA.trim(),
        optionB: newQuestion.optionB.trim(),
        optionC: newQuestion.optionC.trim(),
        optionD: newQuestion.optionD.trim(),
        correctOption: newQuestion.correctOption.toUpperCase(),
      });
      setNewQuestion({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
      });
      setShowAddForm(false);
    } catch (err) {
      setAddError(err.message || 'Failed to add question.');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="section-loading">
        <div className="spinner"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="questions-section">
      <div className="questions-header">
        <div>
          <h4 className="section-title">
            Questions ({questions.length})
          </h4>
          <p className="section-desc">
            All questions currently loaded for this quiz.
          </p>
        </div>

        {onAddQuestion && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Close Add Form' : '+ Add Question Manually'}
          </button>
        )}
      </div>

      {showAddForm && (
        <form className="add-question-card" onSubmit={handleAddSubmit}>
          <h5>Add Question</h5>
          {addError && <div className="alert alert-error">{addError}</div>}

          <div className="form-group">
            <label>Question Text *</label>
            <textarea
              rows="2"
              className="form-control"
              placeholder="Enter question text"
              value={newQuestion.questionText}
              onChange={(e) =>
                setNewQuestion((prev) => ({ ...prev, questionText: e.target.value }))
              }
              required
              disabled={isAdding}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Option A *</label>
              <input
                type="text"
                className="form-control"
                value={newQuestion.optionA}
                onChange={(e) =>
                  setNewQuestion((prev) => ({ ...prev, optionA: e.target.value }))
                }
                required
                disabled={isAdding}
              />
            </div>
            <div className="form-group">
              <label>Option B *</label>
              <input
                type="text"
                className="form-control"
                value={newQuestion.optionB}
                onChange={(e) =>
                  setNewQuestion((prev) => ({ ...prev, optionB: e.target.value }))
                }
                required
                disabled={isAdding}
              />
            </div>
            <div className="form-group">
              <label>Option C *</label>
              <input
                type="text"
                className="form-control"
                value={newQuestion.optionC}
                onChange={(e) =>
                  setNewQuestion((prev) => ({ ...prev, optionC: e.target.value }))
                }
                required
                disabled={isAdding}
              />
            </div>
            <div className="form-group">
              <label>Option D *</label>
              <input
                type="text"
                className="form-control"
                value={newQuestion.optionD}
                onChange={(e) =>
                  setNewQuestion((prev) => ({ ...prev, optionD: e.target.value }))
                }
                required
                disabled={isAdding}
              />
            </div>
          </div>

          <div className="form-row-between">
            <div className="form-group">
              <label>Correct Answer *</label>
              <select
                className="form-control select-control"
                value={newQuestion.correctOption}
                onChange={(e) =>
                  setNewQuestion((prev) => ({ ...prev, correctOption: e.target.value }))
                }
                disabled={isAdding}
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div className="form-actions-inline">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddForm(false)}
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isAdding}
              >
                {isAdding ? 'Saving...' : 'Save Question'}
              </button>
            </div>
          </div>
        </form>
      )}

      {questions.length === 0 ? (
        <div className="empty-state">
          <p className="empty-text">No questions added yet for this quiz.</p>
          <span className="empty-sub">
            Upload an Excel (.xlsx) file above or add questions manually.
          </span>
        </div>
      ) : (
        <div className="question-list">
          {questions.map((q, idx) => {
            const correctOpt = q.correctOption?.toUpperCase();
            return (
              <div key={q.id} className="question-item">
                <div className="question-item-header">
                  <div className="question-number-title">
                    <span className="question-badge">Q{idx + 1}</span>
                    <span className="question-text">{q.questionText}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-xs"
                    onClick={() => setQuestionToDelete(q)}
                  >
                    Delete
                  </button>
                </div>

                <div className="question-options-grid">
                  <div className={`option-box ${correctOpt === 'A' ? 'option-correct' : ''}`}>
                    <span className="opt-letter">A</span>
                    <span className="opt-text">{q.optionA}</span>
                    {correctOpt === 'A' && <span className="correct-tag">Correct</span>}
                  </div>
                  <div className={`option-box ${correctOpt === 'B' ? 'option-correct' : ''}`}>
                    <span className="opt-letter">B</span>
                    <span className="opt-text">{q.optionB}</span>
                    {correctOpt === 'B' && <span className="correct-tag">Correct</span>}
                  </div>
                  <div className={`option-box ${correctOpt === 'C' ? 'option-correct' : ''}`}>
                    <span className="opt-letter">C</span>
                    <span className="opt-text">{q.optionC}</span>
                    {correctOpt === 'C' && <span className="correct-tag">Correct</span>}
                  </div>
                  <div className={`option-box ${correctOpt === 'D' ? 'option-correct' : ''}`}>
                    <span className="opt-letter">D</span>
                    <span className="opt-text">{q.optionD}</span>
                    {correctOpt === 'D' && <span className="correct-tag">Correct</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(questionToDelete)}
        title="Delete Question"
        message={`Are you sure you want to delete this question? This action cannot be undone.`}
        confirmText="Delete Question"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setQuestionToDelete(null)}
      />
    </div>
  );
};

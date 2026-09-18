import React, { useState, useEffect } from 'react';
import { updateQuiz, formatApiError } from '../../api/quizAdminApi';

export const QuizSettings = ({ quiz, onSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
    active: false,
    showScore: true,
    showCorrectAnswers: false,
    allowCopy: false,
    allowPaste: false,
    allowRightClick: false,
    detectTabSwitch: true,
    autoSubmitOnViolation: true,
    violationThreshold: 3,
    allowPreviousQuestion: true,
    randomQuestions: false,
    randomOptions: false,
    immediateResult: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        durationMinutes: quiz.durationMinutes ?? 30,
        active: Boolean(quiz.active),
        showScore: Boolean(quiz.showScore),
        showCorrectAnswers: Boolean(quiz.showCorrectAnswers),
        allowCopy: Boolean(quiz.allowCopy),
        allowPaste: Boolean(quiz.allowPaste),
        allowRightClick: Boolean(quiz.allowRightClick),
        detectTabSwitch: Boolean(quiz.detectTabSwitch),
        autoSubmitOnViolation: quiz.autoSubmitOnViolation ?? true,
        violationThreshold: quiz.violationThreshold ?? 3,
        allowPreviousQuestion: quiz.allowPreviousQuestion ?? true,
        randomQuestions: Boolean(quiz.randomQuestions),
        randomOptions: Boolean(quiz.randomOptions),
        immediateResult: quiz.immediateResult ?? true,
      });
      setError(null);
      setSuccess(null);
    }
  }, [quiz]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'durationMinutes' || name === 'violationThreshold'
          ? value === '' ? '' : parseInt(value, 10)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      setError('Duration must be greater than 0');
      return;
    }
    if (!formData.violationThreshold || formData.violationThreshold <= 0) {
      setError('Violation threshold must be greater than 0');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      durationMinutes: Number(formData.durationMinutes),
      active: formData.active,
      showScore: formData.showScore,
      showCorrectAnswers: formData.showCorrectAnswers,
      allowCopy: formData.allowCopy,
      allowPaste: formData.allowPaste,
      allowRightClick: formData.allowRightClick,
      detectTabSwitch: formData.detectTabSwitch,
      autoSubmitOnViolation: formData.autoSubmitOnViolation,
      violationThreshold: Number(formData.violationThreshold),
      allowPreviousQuestion: formData.allowPreviousQuestion,
      randomQuestions: formData.randomQuestions,
      randomOptions: formData.randomOptions,
      immediateResult: formData.immediateResult,
    };

    try {
      const updated = await updateQuiz(quiz.id, payload);
      setSuccess('Quiz settings saved successfully!');
      if (onSaved) onSaved(updated);
    } catch (err) {
      setError(formatApiError(err, 'Failed to update quiz settings.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="quiz-settings-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="settings-section">
        <h4 className="settings-section-title">General Information</h4>
        <div className="form-group">
          <label htmlFor="edit-title">Quiz Title <span className="required">*</span></label>
          <input
            id="edit-title"
            name="title"
            type="text"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-desc">Description</label>
          <textarea
            id="edit-desc"
            name="description"
            rows="3"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="edit-duration">Duration (minutes) <span className="required">*</span></label>
            <input
              id="edit-duration"
              name="durationMinutes"
              type="number"
              min="1"
              max="360"
              className="form-control"
              value={formData.durationMinutes}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>

          <div className="form-group flex-1">
            <label htmlFor="edit-violations">Violation Threshold</label>
            <input
              id="edit-violations"
              name="violationThreshold"
              type="number"
              min="1"
              max="20"
              className="form-control"
              value={formData.violationThreshold}
              onChange={handleChange}
              disabled={saving || !formData.detectTabSwitch}
            />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h4 className="settings-section-title">Publication & Scoring</h4>
        <div className="toggle-grid">
          <label className="toggle-card">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Active Status</span>
              <span className="toggle-desc">Students can view and start this quiz when active.</span>
            </div>
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              name="showScore"
              checked={formData.showScore}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Show Score</span>
              <span className="toggle-desc">Reveal final score to student upon submission.</span>
            </div>
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              name="showCorrectAnswers"
              checked={formData.showCorrectAnswers}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Show Correct Answers</span>
              <span className="toggle-desc">Display solution key to student after submission.</span>
            </div>
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              name="immediateResult"
              checked={formData.immediateResult}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Immediate Result</span>
              <span className="toggle-desc">Compute and return results immediately upon submit.</span>
            </div>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h4 className="settings-section-title">Security & Anti-Cheating</h4>
        <div className="toggle-grid">
          <label className="toggle-card">
            <input
              type="checkbox"
              name="detectTabSwitch"
              checked={formData.detectTabSwitch}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Detect Tab Switching</span>
              <span className="toggle-desc">Track when student navigates away from the quiz tab.</span>
            </div>
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              name="autoSubmitOnViolation"
              checked={formData.autoSubmitOnViolation}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Auto Submit on Violation</span>
              <span className="toggle-desc">Automatically force-submit quiz if threshold is breached.</span>
            </div>
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              name="allowCopy"
              checked={formData.allowCopy}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Allow Copy</span>
              <span className="toggle-desc">Enable copy operations on question text.</span>
            </div>
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              name="allowPaste"
              checked={formData.allowPaste}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Allow Paste</span>
              <span className="toggle-desc">Enable paste events inside inputs.</span>
            </div>
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              name="allowRightClick"
              checked={formData.allowRightClick}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Allow Right Click</span>
              <span className="toggle-desc">Enable context menu during assessment.</span>
            </div>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h4 className="settings-section-title">Question Flow & Randomization</h4>
        <div className="toggle-grid">
          <label className="toggle-card">
            <input
              type="checkbox"
              name="allowPreviousQuestion"
              checked={formData.allowPreviousQuestion}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Allow Previous Question</span>
              <span className="toggle-desc">Allow students to navigate back to previous questions.</span>
            </div>
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              name="randomQuestions"
              checked={formData.randomQuestions}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Randomize Questions</span>
              <span className="toggle-desc">Shuffle question presentation order for each attempt.</span>
            </div>
          </label>

          <label className="toggle-card">
            <input
              type="checkbox"
              name="randomOptions"
              checked={formData.randomOptions}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="toggle-text">
              <span className="toggle-label">Randomize Options</span>
              <span className="toggle-desc">Shuffle A, B, C, D choices for each question.</span>
            </div>
          </label>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? 'Saving Settings...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

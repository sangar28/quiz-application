import React, { useState } from 'react';
import { createQuiz, formatApiError } from '../../api/quizAdminApi';

export const QuizFormModal = ({ isOpen, onClose, onQuizCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'durationMinutes' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      setError('Duration must be a positive number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await createQuiz({
        title: formData.title.trim(),
        description: formData.description.trim(),
        durationMinutes: Number(formData.durationMinutes),
      });
      onQuizCreated(created);
      onClose();
    } catch (err) {
      setError(formatApiError(err, 'Failed to create quiz.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Quiz</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="quiz-title">
                Quiz Title <span className="required">*</span>
              </label>
              <input
                id="quiz-title"
                name="title"
                type="text"
                className="form-control"
                placeholder="e.g. Java Fundamentals - Day 1"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="quiz-description">Description</label>
              <textarea
                id="quiz-description"
                name="description"
                rows="3"
                className="form-control"
                placeholder="Brief summary or instructions for students"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="quiz-duration">
                Duration (minutes) <span className="required">*</span>
              </label>
              <input
                id="quiz-duration"
                name="durationMinutes"
                type="number"
                min="1"
                max="360"
                className="form-control"
                value={formData.durationMinutes}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <span className="form-hint">Time allowed for students to complete this quiz.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

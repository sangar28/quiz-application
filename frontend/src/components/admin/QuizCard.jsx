import React from 'react';
import { useNavigate } from 'react-router-dom';

export const QuizCard = ({
  quiz,
  onEdit,
  onToggleActive,
  onDelete,
  isToggling = false,
  isDeleting = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className={`quiz-card ${quiz.active ? 'quiz-card-active' : ''}`}>
      <div className="quiz-card-header">
        <div className="quiz-card-title-wrap">
          <h3 className="quiz-card-title">{quiz.title}</h3>
          <span className={`status-pill ${quiz.active ? 'status-active' : 'status-inactive'}`}>
            {quiz.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="quiz-card-desc">
          {quiz.description || 'No description provided.'}
        </p>
      </div>

      <div className="quiz-meta-grid">
        <div className="meta-item">
          <span className="meta-label">Duration</span>
          <span className="meta-val">{quiz.durationMinutes} mins</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Show Score</span>
          <span className="meta-val">{quiz.showScore ? 'Yes' : 'No'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Tab Violation</span>
          <span className="meta-val">{quiz.detectTabSwitch ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Review Answers</span>
          <span className="meta-val">{quiz.showCorrectAnswers ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div className="quiz-card-actions">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
        >
          Manage
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(quiz)}
        >
          Edit
        </button>

        <button
          type="button"
          className={`btn btn-sm ${quiz.active ? 'btn-warning' : 'btn-success'}`}
          onClick={() => onToggleActive(quiz)}
          disabled={isToggling}
        >
          {isToggling ? 'Updating...' : quiz.active ? 'Deactivate' : 'Activate'}
        </button>

        <button
          type="button"
          className="btn btn-danger-outline btn-sm"
          onClick={() => onDelete(quiz)}
          disabled={isDeleting}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

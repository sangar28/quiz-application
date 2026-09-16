import React from 'react';
import { QuizSettings } from './QuizSettings';

export const QuizEditModal = ({ isOpen, quiz, onClose, onQuizUpdated }) => {
  if (!isOpen || !quiz) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card modal-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Edit Quiz: {quiz.title}</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="modal-body modal-scroll">
          <QuizSettings
            quiz={quiz}
            onSaved={(updated) => {
              onQuizUpdated(updated);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

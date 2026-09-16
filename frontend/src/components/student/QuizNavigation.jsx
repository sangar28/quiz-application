import React from 'react';

export const QuizNavigation = ({
  questions = [],
  currentIndex,
  answers = {},
  allowPreviousQuestion = true,
  onSelectIndex,
  onPrevious,
  onNext,
  onSubmitPrompt,
  isSubmitting = false,
}) => {
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="quiz-navigation-panel">
      {/* Bottom Prev / Next Action Controls */}
      <div className="quiz-action-bar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onPrevious}
          disabled={currentIndex === 0 || !allowPreviousQuestion || isSubmitting}
        >
          &larr; Previous
        </button>

        <span className="answered-summary">
          Answered {answeredCount} of {total}
        </span>

        {currentIndex < total - 1 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNext}
            disabled={isSubmitting}
          >
            Next &rarr;
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-success font-bold"
            onClick={onSubmitPrompt}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* Question Palette Grid */}
      <div className="palette-container">
        <div className="palette-header">
          <h4>Question Palette</h4>
          <div className="palette-legend">
            <span className="legend-item">
              <span className="legend-dot legend-current"></span> Current
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-answered"></span> Answered
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-unanswered"></span> Unanswered
            </span>
          </div>
        </div>

        <div className="palette-grid">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = Boolean(answers[q.id]);
            const isDisabled = !allowPreviousQuestion && idx < currentIndex;

            let pillClass = 'palette-unanswered';
            if (isAnswered) pillClass = 'palette-answered';
            if (isCurrent) pillClass = 'palette-current';
            if (isDisabled) pillClass += ' palette-disabled';

            return (
              <button
                key={q.id}
                type="button"
                className={`palette-pill ${pillClass}`}
                onClick={() => !isDisabled && onSelectIndex(idx)}
                disabled={isDisabled || isSubmitting}
                title={
                  isDisabled
                    ? 'Navigating to previous questions is disabled for this quiz'
                    : `Go to Question ${idx + 1}`
                }
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="palette-footer">
          <button
            type="button"
            className="btn btn-success btn-block"
            onClick={onSubmitPrompt}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

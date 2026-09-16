import React from 'react';

export const QuizQuestion = ({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  allowCopy = false,
}) => {
  if (!question) return null;

  const options = [
    { key: 'A', text: question.optionA },
    { key: 'B', text: question.optionB },
    { key: 'C', text: question.optionC },
    { key: 'D', text: question.optionD },
  ];

  return (
    <div className={`quiz-question-card ${!allowCopy ? 'no-select' : ''}`}>
      <div className="quiz-question-meta">
        <span className="question-counter">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        {selectedAnswer && (
          <span className="answered-indicator">✓ Answered</span>
        )}
      </div>

      <h3 className="student-question-text">{question.questionText}</h3>

      <div className="options-container">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.key;
          return (
            <label
              key={opt.key}
              className={`option-choice ${isSelected ? 'option-choice-selected' : ''}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={opt.key}
                checked={isSelected}
                onChange={() => onSelectAnswer(question.id, opt.key)}
                className="option-radio"
              />
              <span className="option-choice-letter">{opt.key}</span>
              <span className="option-choice-text">{opt.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

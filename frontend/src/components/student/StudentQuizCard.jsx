import React from 'react';
import { useNavigate } from 'react-router-dom';

export const StudentQuizCard = ({ quiz }) => {
  const navigate = useNavigate();

  const renderStatus = () => {
    if (quiz.activeAttemptId) {
      return (
        <>
          <span className="status-pill" style={{ background: '#fef3c7', color: '#92400e' }}>
            In Progress
          </span>
          <div className="student-quiz-card-actions">
            <button
              type="button"
              className="btn btn-warning btn-block"
              onClick={() => navigate(`/student/quiz/${quiz.id}?attemptId=${quiz.activeAttemptId}`)}
            >
              Resume Quiz &rarr;
            </button>
          </div>
        </>
      );
    }

    if (quiz.alreadySubmitted && !quiz.retakeApproved) {
      return (
        <>
          <span className="status-pill" style={{ background: '#f1f5f9', color: '#64748b' }}>
            Submitted
          </span>
          <div className="student-quiz-card-actions">
            <button
              type="button"
              className="btn btn-secondary btn-block"
              disabled
              title="Quiz has already been submitted. Retake requires admin approval."
            >
              Already Submitted
            </button>
          </div>
        </>
      );
    }

    if (quiz.alreadySubmitted && quiz.retakeApproved) {
      return (
        <>
          <span className="status-pill" style={{ background: '#ecfdf5', color: '#047857' }}>
            Retake Approved
          </span>
          <div className="student-quiz-card-actions">
            <button
              type="button"
              className="btn btn-success btn-block"
              onClick={() => navigate(`/student/quiz/${quiz.id}/instructions`)}
            >
              Start Retake &rarr;
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <span className="status-pill status-active">Available</span>
        <div className="student-quiz-card-actions">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => navigate(`/student/quiz/${quiz.id}/instructions`)}
          >
            Start Quiz &rarr;
          </button>
        </div>
      </>
    );
  };

  const statusInfo = renderStatus();

  return (
    <div className="student-quiz-card">
      <div className="student-quiz-card-header">
        <div className="quiz-card-title-wrap">
          <h3 className="student-quiz-title">{quiz.title}</h3>
          {statusInfo.props.children[0]}
        </div>
        <p className="student-quiz-desc">
          {quiz.description || 'No specific description provided for this assessment.'}
        </p>
      </div>

      <div className="student-quiz-meta">
        <div className="meta-item">
          <span className="meta-label">Duration</span>
          <span className="meta-val">⏱️ {quiz.durationMinutes} Minutes</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Security</span>
          <span className="meta-val">
            {quiz.detectTabSwitch ? '🔒 Monitored' : 'Standard'}
          </span>
        </div>
      </div>

      {statusInfo.props.children[1]}
    </div>
  );
};

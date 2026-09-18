import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StudentRollNumberModal } from './StudentRollNumberModal';

export const StudentQuizCard = ({ quiz }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);

  const handleStartFlow = () => {
    if (!user?.rollNumber) {
      setIsRollModalOpen(true);
      return;
    }
    navigate(`/student/quiz/${quiz.id}/instructions`);
  };

  const handleRollNumberSuccess = () => {
    setIsRollModalOpen(false);
    navigate(`/student/quiz/${quiz.id}/instructions`);
  };

  const handleResumeQuiz = async () => {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (fsErr) {
      console.warn('Fullscreen request denied or unsupported:', fsErr);
    }
    navigate(`/student/quiz/${quiz.id}?attemptId=${quiz.activeAttemptId}`);
  };

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
              onClick={handleResumeQuiz}
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
              onClick={handleStartFlow}
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
            onClick={handleStartFlow}
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

      <StudentRollNumberModal
        isOpen={isRollModalOpen}
        onClose={() => setIsRollModalOpen(false)}
        onSuccess={handleRollNumberSuccess}
      />
    </div>
  );
};

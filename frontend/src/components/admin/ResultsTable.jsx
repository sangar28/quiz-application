import React from 'react';

export const ResultsTable = ({ results = [], loading = false, onApproveRetake, approvingId = null }) => {
  if (loading) {
    return (
      <div className="section-loading">
        <div className="spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-text">No student submissions found.</p>
        <span className="empty-sub">
          When students complete and submit quizzes, their scores will appear here.
        </span>
      </div>
    );
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Email</th>
            <th>Quiz</th>
            <th className="text-center">Score</th>
            <th className="text-center">Total Questions</th>
            <th className="text-center">Percentage</th>
            <th>Submitted At</th>
            <th className="text-center">Retake Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const total = r.totalQuestions ?? 0;
            const score = r.score ?? 0;
            const pct = total > 0 ? Math.round((score / total) * 100) : 0;
            let badgeClass = 'badge-gray';
            if (pct >= 80) badgeClass = 'badge-success';
            else if (pct >= 50) badgeClass = 'badge-info';
            else badgeClass = 'badge-warning';

            return (
              <tr key={r.resultId}>
                <td className="font-semibold">{r.studentName || 'Student'}</td>
                <td className="text-muted">{r.studentEmail || 'N/A'}</td>
                <td>{r.quizTitle || 'Quiz'}</td>
                <td className="text-center font-bold">{score}</td>
                <td className="text-center">{total}</td>
                <td className="text-center">
                  <span className={`badge ${badgeClass}`}>{pct}%</span>
                </td>
                <td className="text-muted">{formatDateTime(r.submittedAt)}</td>
                <td className="text-center">
                  {r.retakeApproved ? (
                    <span className="badge badge-success" title="Student can retake this quiz">
                      Retake Approved
                    </span>
                  ) : onApproveRetake ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={approvingId === r.resultId}
                      onClick={() => onApproveRetake(r.resultId)}
                    >
                      {approvingId === r.resultId ? 'Approving...' : 'Approve Retake'}
                    </button>
                  ) : (
                    <span className="badge badge-gray">No Retake</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

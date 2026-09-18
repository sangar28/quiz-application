import React from 'react';
import { formatKolkataDateTime } from '../../utils/dateFormat';

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

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Roll Number</th>
            <th>Student Email</th>
            <th>Quiz</th>
            <th className="text-center">Marks</th>
            <th className="text-center">Percentage</th>
            <th>Submitted At</th>
            <th className="text-center">Retake Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const marks = r.marks ?? r.score ?? 0;
            const totalMarks = r.totalMarks ?? r.totalQuestions ?? 0;
            const pct = totalMarks > 0 ? Math.round((marks / totalMarks) * 100) : 0;
            let badgeClass = 'badge-gray';
            if (pct >= 80) badgeClass = 'badge-success';
            else if (pct >= 50) badgeClass = 'badge-info';
            else badgeClass = 'badge-warning';

            return (
              <tr key={r.resultId}>
                <td className="font-semibold">{r.studentName || 'Student'}</td>
                <td className="font-mono text-sm" style={{ fontWeight: 500, color: '#1e293b' }}>
                  {r.rollNumber || 'N/A'}
                </td>
                <td className="text-muted">{r.studentEmail || 'N/A'}</td>
                <td>{r.quizTitle || 'Quiz'}</td>
                <td className="text-center font-bold" style={{ color: '#0f172a', whiteSpace: 'nowrap' }}>
                  {marks} / {totalMarks}
                </td>
                <td className="text-center">
                  <span className={`badge ${badgeClass}`}>{pct}%</span>
                </td>
                <td className="text-muted text-sm" style={{ whiteSpace: 'nowrap' }}>
                  {formatKolkataDateTime(r.submittedAt)}
                </td>
                <td className="text-center">
                  {r.retakeApproved ? (
                    <span className="badge badge-success" title="Student can retake this quiz">
                      Approved
                    </span>
                  ) : (
                    <span className="badge badge-gray">Not Approved</span>
                  )}
                </td>
                <td className="text-center">
                  {r.retakeApproved ? (
                    <span className="text-muted text-xs" style={{ color: '#059669', fontWeight: 500 }}>
                      Retake Granted
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
                    <span className="text-muted text-xs">—</span>
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

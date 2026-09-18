import React, { useState, useEffect } from 'react';

export const AVAILABLE_EXCEL_COLUMNS = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'rollNumber', label: 'Roll Number' },
  { id: 'studentEmail', label: 'Student Email' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'marks', label: 'Marks' },
  { id: 'totalMarks', label: 'Total Marks' },
  { id: 'percentage', label: 'Percentage' },
  { id: 'submittedAt', label: 'Submitted At' },
  { id: 'retakeStatus', label: 'Retake Status' },
  { id: 'attemptId', label: 'Attempt ID' },
];

export const ExcelColumnModal = ({ isOpen, onClose, onConfirm, isExporting, exportError }) => {
  // All columns checked by default
  const [selectedColumns, setSelectedColumns] = useState(() =>
    AVAILABLE_EXCEL_COLUMNS.map((col) => col.id)
  );

  // Reset to all columns checked when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedColumns(AVAILABLE_EXCEL_COLUMNS.map((col) => col.id));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleColumn = (colId) => {
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(AVAILABLE_EXCEL_COLUMNS.map((col) => col.id));
  };

  const handleClearAll = () => {
    setSelectedColumns([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedColumns.length === 0 || isExporting) return;
    // Always preserve defined order
    const orderedSelection = AVAILABLE_EXCEL_COLUMNS.filter((col) =>
      selectedColumns.includes(col.id)
    ).map((col) => col.id);

    onConfirm(orderedSelection);
  };

  const isNoneSelected = selectedColumns.length === 0;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) {
          onClose();
        }
      }}
    >
      <div
        className="modal-content"
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '480px',
          padding: '28px 24px',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
            Select Excel Columns
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Choose the columns to include in the downloaded report.
          </p>
        </div>

        {exportError && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '6px',
              fontSize: '0.875rem',
              marginBottom: '16px',
            }}
          >
            {exportError}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            paddingBottom: '8px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
            {selectedColumns.length} of {AVAILABLE_EXCEL_COLUMNS.length} selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSelectAll}
              disabled={isExporting}
              style={{ padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Select All
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleClearAll}
              disabled={isExporting}
              style={{ padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Clear All
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px 14px',
              marginBottom: '18px',
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '4px 2px',
            }}
          >
            {AVAILABLE_EXCEL_COLUMNS.map((col) => {
              const isChecked = selectedColumns.includes(col.id);
              return (
                <label
                  key={col.id}
                  htmlFor={`col-${col.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: isChecked ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${isChecked ? '#bbf7d0' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: isChecked ? '#166534' : '#334155',
                    fontWeight: isChecked ? 600 : 400,
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    id={`col-${col.id}`}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleColumn(col.id)}
                    disabled={isExporting}
                    style={{
                      accentColor: '#16a34a',
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                    }}
                  />
                  <span>{col.label}</span>
                </label>
              );
            })}
          </div>

          {isNoneSelected && (
            <p
              style={{
                margin: '0 0 16px',
                fontSize: '0.825rem',
                color: '#dc2626',
                fontWeight: 500,
              }}
            >
              Select at least one column to download the report.
            </p>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '20px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '16px',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isExporting}
              style={{
                padding: '9px 18px',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isExporting || isNoneSelected}
              style={{
                padding: '9px 20px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: isNoneSelected ? 'not-allowed' : 'pointer',
              }}
            >
              {isExporting ? 'Downloading...' : 'Download Excel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

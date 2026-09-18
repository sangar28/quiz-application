import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const StudentRollNumberModal = ({ isOpen, onClose, onSuccess }) => {
  const { updateRollNumber } = useAuth();
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = rollNumber.trim().toUpperCase();

    if (!clean) {
      setError('Please enter your roll number.');
      return;
    }

    if (!/^[A-Za-z0-9\-_/]{2,30}$/.test(clean)) {
      setError('Roll number must be between 2 and 30 alphanumeric characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateRollNumber(clean);
      setRollNumber('');
      if (onSuccess) {
        onSuccess(clean);
      }
    } catch (err) {
      console.error('Failed to save roll number:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save roll number. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    setError(null);
    setRollNumber('');
    if (onClose) onClose();
  };

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
        if (e.target === e.currentTarget && !loading) {
          handleCancel();
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
          maxWidth: '440px',
          padding: '28px 24px',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 12px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            🎓
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
            Student Verification
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Please enter your college roll number to proceed with assessments.
          </p>
        </div>

        {error && (
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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="studentRollNumberInput"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Roll Number
            </label>
            <input
              id="studentRollNumberInput"
              type="text"
              className="form-input"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
              placeholder="Enter your roll number (e.g., 23ME123)"
              autoFocus
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            />
            <p style={{ margin: '6px 0 0', fontSize: '0.775rem', color: '#64748b', lineHeight: 1.4 }}>
              This will be saved to your account and will only be requested once.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: '9px 18px',
                borderRadius: '6px',
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !rollNumber.trim()}
              style={{
                padding: '9px 20px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

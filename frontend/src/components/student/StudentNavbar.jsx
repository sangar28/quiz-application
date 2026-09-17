import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const StudentNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="student-header">
      <div className="student-header-inner">
        <div className="student-brand">
          <Link to="/student" className="brand-link">
            <span className="logo-badge">SECE</span>
            <span className="brand-title">College Quiz Portal</span>
          </Link>
          <span className="student-pill">Student</span>
        </div>

        <nav className="student-nav">
          <Link to="/student" className="nav-link nav-link-active">
            Dashboard
          </Link>
        </nav>

        <div className="student-user-info">
          <div className="user-avatar user-avatar-student">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="user-details-nav">
            <span className="user-name">{user?.name || 'Student'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm logout-btn"
            onClick={handleLogout}
            title="Log out of portal"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="logout-icon"
              width="15"
              height="15"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

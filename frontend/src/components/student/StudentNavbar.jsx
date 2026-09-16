import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const StudentNavbar = () => {
  const { user } = useAuth();

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
        </div>
      </div>
    </header>
  );
};

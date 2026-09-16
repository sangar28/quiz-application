import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminNavbar = () => {
  const { user } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <div className="admin-brand">
          <Link to="/admin" className="brand-link">
            <span className="logo-badge">SECE</span>
            <span className="brand-title">College Quiz Portal</span>
          </Link>
          <span className="admin-pill">Admin</span>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <a href="/admin#quizzes-section" className="nav-link">
            Quizzes
          </a>
          <NavLink
            to="/admin/results"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Results
          </NavLink>
        </nav>

        <div className="admin-user-info">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="user-details-nav">
            <span className="user-name">{user?.name || 'Administrator'}</span>
            <span className="user-email">{user?.email || 'admin@sece.ac.in'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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
          <NavLink
            to="/admin/quizzes"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Quizzes
          </NavLink>
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

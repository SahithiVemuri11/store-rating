import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully.', 'info');
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-admin';
      case 'STORE_OWNER':
        return 'badge-owner';
      default:
        return 'badge-user';
    }
  };

  const formatRoleName = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'System Admin';
      case 'STORE_OWNER':
        return 'Store Owner';
      default:
        return 'Customer';
    }
  };

  // Extract initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-link">
          <div className="brand-icon-box">⭐</div>
          <span className="brand-title">StoreRating</span>
        </Link>

        {isAuthenticated && user && (
          <div className="nav-links">
            {user.role === 'ADMIN' && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Users
                </NavLink>
                <NavLink
                  to="/admin/stores"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Stores
                </NavLink>
              </>
            )}

            {user.role === 'NORMAL_USER' && (
              <NavLink
                to="/user/stores"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Browse Stores
              </NavLink>
            )}

            {user.role === 'STORE_OWNER' && (
              <NavLink
                to="/owner/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                My Store
              </NavLink>
            )}
          </div>
        )}

        <div className="user-nav-actions">
          {isAuthenticated && user ? (
            <>
              <div className="user-chip">
                <div className="user-avatar">{getInitials(user.name)}</div>
                <div className="user-chip-meta">
                  <span className="user-chip-name" title={user.name}>
                    {user.name}
                  </span>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    <span className="badge-dot"></span>
                    {formatRoleName(user.role)}
                  </span>
                </div>
              </div>

              <Link
                to="/change-password"
                className="btn btn-secondary btn-sm"
                title="Change Password"
              >
                Password
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

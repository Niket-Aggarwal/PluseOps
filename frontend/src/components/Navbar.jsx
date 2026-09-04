import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.removeToken();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {isAuthenticated && (
          <button className="sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle Menu">
            ☰
          </button>
        )}
        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="brand-logo">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">PulseOps</span>
        </Link>
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="user-nav">
            <span className="live-indicator">
              <span className="pulse-dot" /> Live Monitoring
            </span>
            <button className="btn btn-sm btn-outline-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-sm btn-primary">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-section">
          <span className="sidebar-label">NAVIGATION</span>
          <nav className="sidebar-menu">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="icon">📊</span> Dashboard
            </NavLink>
            <NavLink 
              to="/projects/new" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="icon">➕</span> Create Project
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="dot online"></span> API Status: Active
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

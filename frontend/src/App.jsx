import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import EditProject from './pages/EditProject';
import ProjectHistory from './pages/ProjectHistory';
import HistoryDetails from './pages/HistoryDetails';
import PublicStatus from './pages/PublicStatus';

import { authService } from './services/auth';

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Pages that do not use the authenticated layout header/sidebar
  const isStandalonePage = 
    location.pathname === '/login' || 
    location.pathname.startsWith('/status/');

  const isAuthenticated = authService.isAuthenticated();

  return (
    <div className="app-container">
      {!isStandalonePage && (
        <>
          <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
          {isAuthenticated && (
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          )}
        </>
      )}

      <main className={!isStandalonePage ? 'main-content' : 'standalone-content'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/status/:publicStatusId" element={<PublicStatus />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/edit"
            element={
              <ProtectedRoute>
                <EditProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/history"
            element={
              <ProtectedRoute>
                <ProjectHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/history/:historyId"
            element={
              <ProtectedRoute>
                <HistoryDetails />
              </ProtectedRoute>
            }
          />

          {/* Fallback Redirects */}
          <Route
            path="/"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="*"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
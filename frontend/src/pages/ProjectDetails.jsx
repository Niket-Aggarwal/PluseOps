import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [latestCheck, setLatestCheck] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const projData = await api.getProjectById(id);
      setProject(projData);

      // Fetch latest check & recent history in parallel
      try {
        const latest = await api.getLatestCheck(id);
        setLatestCheck(latest);
      } catch {
        // Safe fallback if no check recorded yet
        setLatestCheck(null);
      }

      try {
        const historyData = await api.getProjectHistory(id, 1, 5);
        const list = Array.isArray(historyData)
          ? historyData
          : historyData?.docs || historyData?.history || [];
        setRecentHistory(list);
      } catch {
        setRecentHistory([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleToggleMonitoring = async () => {
    try {
      const updated = await api.toggleMonitoring(id);
      setProject((prev) => ({
        ...prev,
        isActive: updated?.isActive !== undefined ? updated.isActive : !prev.isActive,
        currentStatus: updated?.currentStatus || prev.currentStatus
      }));
    } catch (err) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.deleteProject(id);
      navigate('/dashboard');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) return <Loading message="Loading project specifications..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProjectDetails} />;
  if (!project) return <ErrorMessage message="Project not found." />;

  const isMonitoringOn = Boolean(project.isActive ?? project.monitoringEnabled);
  const status = project.currentStatus || 'UNKNOWN';

  return (
    <div className="project-details-page">
      {/* Top Header */}
      <div className="details-header-card">
        <div className="details-header-top">
          <div>
            <div className="details-title-row">
              <h1>{project.name}</h1>
              <StatusBadge status={status} size="normal" />
              <span className={`monitoring-pill ${isMonitoringOn ? 'active' : 'disabled'}`}>
                Monitoring: {isMonitoringOn ? 'ON' : 'OFF'}
              </span>
            </div>
            <p className="details-url">
              🔗 <a href={project.baseUrl} target="_blank" rel="noopener noreferrer">{project.baseUrl}</a>
            </p>
            {project.description && <p className="details-desc">{project.description}</p>}
          </div>

          <div className="details-actions">
            <button
              className={`btn ${isMonitoringOn ? 'btn-outline-warning' : 'btn-outline-success'}`}
              onClick={handleToggleMonitoring}
            >
              {isMonitoringOn ? 'Disable Monitoring' : 'Enable Monitoring'}
            </button>
            <Link to={`/projects/${id}/edit`} className="btn btn-secondary">
              ✏️ Edit
            </Link>
            <Link to={`/projects/${id}/history`} className="btn btn-secondary">
              📜 View History
            </Link>
            {project.publicStatusId && (
              <Link to={`/status/${project.publicStatusId}`} className="btn btn-outline-info" target="_blank">
                🌐 Public Page
              </Link>
            )}
            <button className="btn btn-danger" onClick={() => setShowConfirmDelete(true)}>
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <h2 className="section-title mt-4">Current Status & Metrics</h2>
      <div className="stats-grid">
        <StatCard
          title="Response Time"
          value={project.lastResponseTime !== undefined && project.lastResponseTime !== null ? `${project.lastResponseTime}ms` : (latestCheck?.lastResponseTime !== undefined && latestCheck?.lastResponseTime !== null ? `${latestCheck.lastResponseTime}ms` : 'N/A')}
          subtext="Last check latency"
          type="active"
          icon="⚡"
        />
        <StatCard
          title="HTTP Status"
          value={project.lastHttpStatus ?? latestCheck?.lastHttpStatus ?? 'N/A'}
          subtext={project.lastMessage || latestCheck?.lastMessage || 'No check data'}
          icon="🌐"
        />
        <StatCard
          title="Consecutive Failures"
          value={project.consecutiveFailures ?? 0}
          subtext="Consecutive DOWN checks"
          type={project.consecutiveFailures > 0 ? 'down' : 'up'}
          icon="⚠️"
        />
        <StatCard
          title="Total Checks"
          value={project.totalChecks ?? 0}
          subtext="All execution runs"
          icon="📊"
        />
        <StatCard
          title="Total Failures"
          value={project.totalFailures ?? 0}
          subtext="Lifetime error count"
          type="down"
          icon="❌"
        />
      </div>

      {/* Information Cards Grid */}
      <div className="info-cards-grid">
        <div className="info-card">
          <h3>🕒 Schedule & Timestamps</h3>
          <ul className="info-list">
            <li>
              <span className="label">Check Interval:</span>
              <span className="value">Every {project.intervalMinutes || 5} minute(s)</span>
            </li>
            <li>
              <span className="label">Last Checked At:</span>
              <span className="value">{formatDate(project.lastCheckedAt)}</span>
            </li>
            <li>
              <span className="label">Next Check At:</span>
              <span className="value">{formatDate(project.nextCheckAt)}</span>
            </li>
            <li>
              <span className="label">Created At:</span>
              <span className="value">{formatDate(project.createdAt)}</span>
            </li>
          </ul>
        </div>

        <div className="info-card">
          <h3>🔎 Latest Ping Diagnosis</h3>
          {latestCheck || project.lastMessage ? (
            <ul className="info-list">
              <li>
                <span className="label">Status:</span>
                <span className="value">{latestCheck?.currentStatus || project.currentStatus || 'N/A'}</span>
              </li>
              <li>
                <span className="label">HTTP Code:</span>
                <span className="value">{latestCheck?.lastHttpStatus ?? project.lastHttpStatus ?? 'N/A'}</span>
              </li>
              <li>
                <span className="label">Message:</span>
                <span className="value">{latestCheck?.lastMessage || project.lastMessage || 'OK'}</span>
              </li>
              <li>
                <span className="label">Consecutive Failures:</span>
                <span className="value">{latestCheck?.consecutiveFailures ?? project.consecutiveFailures ?? 0}</span>
              </li>
            </ul>
          ) : (
            <p className="text-muted">No ping response recorded yet.</p>
          )}
        </div>
      </div>

      {/* Recent History Table */}
      <div className="recent-history-section">
        <div className="section-header">
          <h3>Recent Checks History</h3>
          <Link to={`/projects/${id}/history`} className="btn-link">
            View All History →
          </Link>
        </div>

        {recentHistory.length === 0 ? (
          <div className="empty-box">No check history recorded yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>HTTP Code</th>
                  <th>Response Time</th>
                  <th>Message</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((item) => {
                  const hId = item._id || item.id;
                  return (
                    <tr key={hId}>
                      <td>{formatDate(item.checkedAt || item.createdAt)}</td>
                      <td>
                        <StatusBadge status={item.status || item.currentStatus} size="small" />
                      </td>
                      <td>
                        <span className="code-pill">{item.httpStatus ?? 'N/A'}</span>
                      </td>
                      <td>{item.responseTimeMs != null ? `${item.responseTimeMs}ms` : 'N/A'}</td>
                      <td className="truncate-text">{item.message || '-'}</td>
                      <td>
                        <Link to={`/projects/${id}/history/${hId}`} className="btn btn-xs btn-outline-secondary">
                          View Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will delete all associated monitor history.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowConfirmDelete(false)}
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default ProjectDetails;

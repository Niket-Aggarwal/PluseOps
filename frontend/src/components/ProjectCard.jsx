import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const ProjectCard = ({ project, onToggleMonitoring }) => {
  const id = project._id || project.id;
  const status = project.currentStatus || 'UNKNOWN';
  const isMonitoringOn = Boolean(project.isActive ?? project.monitoringEnabled);

  const formatTime = (ts) => {
    if (!ts) return 'Never';
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
             ' (' + date.toLocaleDateString() + ')';
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-title-group">
          <Link to={`/projects/${id}`} className="project-name">
            {project.name}
          </Link>
          <div className="project-badges">
            <StatusBadge status={status} />
            <span className={`monitoring-pill ${isMonitoringOn ? 'active' : 'disabled'}`}>
              Monitoring: {isMonitoringOn ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      <div className="project-card-body">
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
        <div className="project-url">
          <span className="url-icon">🌐</span>
          <a href={project.baseUrl} target="_blank" rel="noopener noreferrer" title={project.baseUrl}>
            {project.baseUrl}
          </a>
        </div>

        <div className="project-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Response Time</span>
            <span className="meta-value">
              {project.lastResponseTime !== undefined && project.lastResponseTime !== null
                ? `${project.lastResponseTime}ms`
                : 'N/A'}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Interval</span>
            <span className="meta-value">{project.intervalMinutes || 5} min</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Last Checked</span>
            <span className="meta-value">{formatTime(project.lastCheckedAt)}</span>
          </div>
        </div>
      </div>

      <div className="project-card-actions">
        <button 
          className={`btn btn-sm ${isMonitoringOn ? 'btn-outline-warning' : 'btn-outline-success'}`}
          onClick={() => onToggleMonitoring(id)}
        >
          {isMonitoringOn ? 'Pause' : 'Enable'}
        </button>
        <Link to={`/projects/${id}`} className="btn btn-sm btn-secondary">
          Details
        </Link>
        <Link to={`/projects/${id}/history`} className="btn btn-sm btn-outline-secondary">
          History
        </Link>
        <Link to={`/projects/${id}/edit`} className="btn btn-sm btn-outline-secondary">
          Edit
        </Link>
        {project.publicStatusId && (
          <Link 
            to={`/status/${project.publicStatusId}`} 
            className="btn btn-sm btn-outline-info"
            title="Public Status Page"
            target="_blank"
          >
            Public Page
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';

const PublicStatus = () => {
  const { publicStatusId } = useParams();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getPublicStatus(publicStatusId);
      setStatusData(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch service status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Auto refresh status every 30 seconds for hackathon demo
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [publicStatusId]);

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    try {
      return new Date(ts).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="public-status-container">
        <Loading message="Checking system status..." />
      </div>
    );
  }

  if (error || !statusData) {
    return (
      <div className="public-status-container">
        <div className="status-error-card">
          <div className="status-icon">⚠️</div>
          <h2>System Status Unavailable</h2>
          <p>{error || 'The requested status page could not be found.'}</p>
          <button className="btn btn-primary mt-3" onClick={fetchStatus}>
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  // Extract ONLY safe fields from statusData
  const name = statusData.name || statusData.serviceName || 'Monitored Service';
  const currentStatus = (statusData.currentStatus || statusData.status || 'UNKNOWN').toUpperCase();
  const lastCheckedAt = statusData.lastCheckedAt || statusData.updatedAt || statusData.timestamp;
  const lastResponseTime = statusData.lastResponseTime !== undefined ? statusData.lastResponseTime : statusData.responseTime;
  const uptime = statusData.uptime || statusData.uptimePercentage || null;
  const statusMessage = statusData.message || statusData.lastMessage || (currentStatus === 'UP' ? 'All Systems Operational' : 'Degraded Performance');
  const lastUpdate = statusData.updatedAt || lastCheckedAt;

  return (
    <div className="public-status-page">
      <div className="public-status-container">
        {/* Header */}
        <header className="public-header">
          <div className="brand-badge">
            <img src="/favicon.png" alt="PulseOps" className="brand-logo-img" />
            <span>PulseOps Status</span>
          </div>
          <div className="live-pill">
            <span className="pulse-dot"></span> Live Status
          </div>
        </header>

        {/* Hero Operational Banner */}
        <div className={`status-hero-banner ${currentStatus.toLowerCase()}`}>
          <div className="status-hero-icon">
            {currentStatus === 'UP' ? '🟢' : currentStatus === 'DOWN' ? '🔴' : '⚪'}
          </div>
          <div className="status-hero-content">
            <h1>{name}</h1>
            <p className="hero-message">{statusMessage}</p>
          </div>
          <div className="status-hero-badge">
            <StatusBadge status={currentStatus} size="normal" />
          </div>
        </div>

        {/* Public Metrics Row */}
        <div className="public-metrics-grid">
          <div className="public-metric-card">
            <span className="metric-label">Operational Status</span>
            <span className="metric-value">{currentStatus}</span>
          </div>

          <div className="public-metric-card">
            <span className="metric-label">Response Time</span>
            <span className="metric-value">
              {lastResponseTime !== undefined && lastResponseTime !== null
                ? `${lastResponseTime}ms`
                : 'N/A'}
            </span>
          </div>

          {uptime !== null && (
            <div className="public-metric-card">
              <span className="metric-label">Uptime</span>
              <span className="metric-value">{uptime}%</span>
            </div>
          )}

          <div className="public-metric-card">
            <span className="metric-label">Last Checked</span>
            <span className="metric-value text-sm">{formatDate(lastCheckedAt)}</span>
          </div>
        </div>

        {/* Status Message Box */}
        <div className="status-card-box mt-4">
          <div className="box-header">
            <h3>System Status Incident Report</h3>
            <span className="last-updated">Updated: {formatDate(lastUpdate)}</span>
          </div>
          <div className="box-body">
            <p>{statusMessage}</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="public-footer">
          Powered by <strong>PulseOps</strong> &bull; Automated Infrastructure Monitoring
        </footer>
      </div>
    </div>
  );
};

export default PublicStatus;

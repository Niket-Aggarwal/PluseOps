import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const HistoryDetails = () => {
  const { projectId, historyId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getHistoryDetail(projectId, historyId);
        setDetail(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch check record details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [projectId, historyId]);

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) return <Loading message="Retrieving check execution log entry..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!detail) return <ErrorMessage message="Check log record not found." />;

  const status = detail.status || detail.currentStatus || 'UNKNOWN';

  return (
    <div className="history-details-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Check Execution Log Detail</h1>
          <p className="page-subtitle">ID: {historyId}</p>
        </div>
        <Link to={`/projects/${projectId}/history`} className="btn btn-outline-secondary">
          ← Back to History List
        </Link>
      </div>

      <div className="card detail-card">
        <div className="detail-status-banner">
          <StatusBadge status={status} size="normal" />
          <span className="timestamp-badge">
            🕒 Executed At: {formatDate(detail.createdAt || detail.timestamp || detail.checkedAt)}
          </span>
        </div>

        <div className="info-grid mt-4">
          <div className="info-item">
            <span className="info-label">Response Time</span>
            <span className="info-value highlight">
              {detail.responseTime !== undefined ? `${detail.responseTime} ms` : 'N/A'}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">HTTP Status Code</span>
            <span className="info-value">
              <span className="code-pill">{detail.statusCode || detail.httpStatus || 'N/A'}</span>
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Timeout Flag</span>
            <span className="info-value">
              {detail.isTimeout ? '⚠️ Yes (Request Timed Out)' : 'No'}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Error Type</span>
            <span className="info-value">{detail.errorType || 'None'}</span>
          </div>
        </div>

        <div className="detail-message-box mt-4">
          <h4>Execution Output Message</h4>
          <pre className="log-code-block">{detail.message || 'No additional status message provided.'}</pre>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetails;

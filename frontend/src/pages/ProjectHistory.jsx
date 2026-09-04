import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ProjectHistory = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const limit = 50;

  const fetchHistoryData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch project info for title
      if (!project) {
        const proj = await api.getProjectById(id);
        setProject(proj);
      }

      const res = await api.getProjectHistory(id, page, limit);

      let items = [];
      let pages = 1;

      if (Array.isArray(res)) {
        items = res;
      } else if (res && typeof res === 'object') {
        items = res.docs || res.history || res.items || [];
        pages = res.totalPages || res.pages || (res.total ? Math.ceil(res.total / limit) : 1);
      }

      setHistory(items);
      setTotalPages(pages > 0 ? pages : 1);
    } catch (err) {
      setError(err.message || 'Failed to load check history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, [id, page]);

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    try {
      const date = new Date(ts);
      return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="project-history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Check History {project ? `- ${project.name}` : ''}</h1>
          <p className="page-subtitle">Chronological execution log (page {page} of {totalPages})</p>
        </div>
        <Link to={`/projects/${id}`} className="btn btn-outline-secondary">
          ← Back to Project Details
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchHistoryData} />}

      {loading ? (
        <Loading message="Loading check execution history logs..." />
      ) : history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <h3>No History Recorded</h3>
          <p>This project has not logged any monitoring ping checks yet.</p>
        </div>
      ) : (
        <>
          <div className="card table-card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Checked At</th>
                    <th>Status</th>
                    <th>HTTP Code</th>
                    <th>Response Time</th>
                    <th>Message</th>
                    <th>Error / Timeout</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => {
                    const hId = item._id || item.id;
                    const status = item.status || item.currentStatus;
                    return (
                      <tr key={hId}>
                        <td className="whitespace-nowrap">{formatDate(item.checkedAt || item.createdAt)}</td>
                        <td>
                          <StatusBadge status={status} size="small" />
                        </td>
                        <td>
                          <span className="code-pill">{item.httpStatus ?? 'N/A'}</span>
                        </td>
                        <td>{item.responseTimeMs != null ? `${item.responseTimeMs}ms` : 'N/A'}</td>
                        <td className="truncate-text" title={item.message}>
                          {item.message || '-'}
                        </td>
                        <td>
                          {item.timeout || item.errorType ? (
                            <span className="badge badge-warning">
                              {item.errorType || (item.timeout ? 'Timeout' : 'Error')}
                            </span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td>
                          <Link to={`/projects/${id}/history/${hId}`} className="btn btn-xs btn-outline-secondary">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="pagination-bar">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous Page
            </button>
            <span className="pagination-info">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages || history.length < limit || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next Page →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectHistory;

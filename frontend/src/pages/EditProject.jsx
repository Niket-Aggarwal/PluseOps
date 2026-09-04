import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import Loading from '../components/Loading';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    intervalMinutes: 5,
    description: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getProjectById(id);
        setFormData({
          name: data.name || '',
          baseUrl: data.baseUrl || '',
          intervalMinutes: data.intervalMinutes || 5,
          description: data.description || ''
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch project for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Project name is required.');
      return;
    }

    if (!formData.baseUrl.trim()) {
      setError('Base URL is required.');
      return;
    }

    if (!validateUrl(formData.baseUrl.trim())) {
      setError('Please enter a valid HTTP or HTTPS URL.');
      return;
    }

    const interval = Number(formData.intervalMinutes);
    if (isNaN(interval) || interval < 1) {
      setError('Check interval must be at least 1 minute.');
      return;
    }

    setSubmitting(true);

    try {
      await api.updateProject(id, {
        name: formData.name.trim(),
        baseUrl: formData.baseUrl.trim(),
        intervalMinutes: interval,
        description: formData.description.trim()
      });

      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update project.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading project configuration..." />;

  return (
    <div className="edit-project-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Project</h1>
          <p className="page-subtitle">Update monitoring options and target endpoint</p>
        </div>
        <Link to={`/projects/${id}`} className="btn btn-outline-secondary">
          ← Cancel & Return
        </Link>
      </div>

      <div className="form-card">
        {error && <div className="error-alert mb-4">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Project Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="baseUrl" className="form-label">
              Base URL <span className="required">*</span>
            </label>
            <input
              type="url"
              id="baseUrl"
              name="baseUrl"
              className="form-control"
              value={formData.baseUrl}
              onChange={handleChange}
              disabled={submitting}
              required
            />
            <small className="form-help">Must start with http:// or https://</small>
          </div>

          <div className="form-group">
            <label htmlFor="intervalMinutes" className="form-label">
              Check Interval (minutes) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="intervalMinutes"
              name="intervalMinutes"
              className="form-control"
              min="1"
              max="1440"
              value={formData.intervalMinutes}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-actions">
            <Link to={`/projects/${id}`} className="btn btn-secondary" disabled={submitting}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    intervalMinutes: 5,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError('Please enter a valid HTTP or HTTPS URL (e.g. https://api.example.com).');
      return;
    }

    const interval = Number(formData.intervalMinutes);
    if (isNaN(interval) || interval < 1) {
      setError('Check interval must be at least 1 minute.');
      return;
    }

    setLoading(true);

    try {
      const created = await api.createProject({
        name: formData.name.trim(),
        baseUrl: formData.baseUrl.trim(),
        intervalMinutes: interval,
        description: formData.description.trim()
      });

      const newId = created?._id || created?.id;
      if (newId) {
        navigate(`/projects/${newId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Project</h1>
          <p className="page-subtitle">Set up automated ping checks for your service</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-secondary">
          ← Back to Dashboard
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
              placeholder="e.g. Payment Gateway API"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
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
              placeholder="https://api.myapp.com/health"
              value={formData.baseUrl}
              onChange={handleChange}
              disabled={loading}
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
              disabled={loading}
              required
            />
            <small className="form-help">How frequently the worker ping test should run</small>
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
              placeholder="Short note about what this service monitors..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <Link to="/dashboard" className="btn btn-secondary" disabled={loading}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;

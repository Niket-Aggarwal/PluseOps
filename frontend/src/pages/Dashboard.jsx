import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProjects();
      const projectList = Array.isArray(data) ? data : (data?.projects || []);
      setProjects(projectList);
    } catch (err) {
      setError(err.message || 'Failed to load projects from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleMonitoring = async (id) => {
    try {
      const updated = await api.toggleMonitoring(id);
      setProjects((prev) =>
        prev.map((p) => {
          const pId = p._id || p.id;
          if (pId === id) {
            return {
              ...p,
              isActive: updated?.isActive !== undefined ? updated.isActive : !p.isActive,
              currentStatus: updated?.currentStatus || p.currentStatus
            };
          }
          return p;
        })
      );
    } catch (err) {
      alert(`Failed to toggle monitoring: ${err.message}`);
    }
  };

  // Calculate summary metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => Boolean(p.isActive ?? p.monitoringEnabled)).length;
  const upProjects = projects.filter((p) => (p.currentStatus || '').toUpperCase() === 'UP').length;
  const downProjects = projects.filter((p) => (p.currentStatus || '').toUpperCase() === 'DOWN').length;
  const unknownProjects = projects.filter((p) => {
    const st = (p.currentStatus || '').toUpperCase();
    return st !== 'UP' && st !== 'DOWN';
  }).length;

  const totalChecks = projects.reduce((acc, p) => acc + (Number(p.totalChecks) || 0), 0);
  const totalFailures = projects.reduce((acc, p) => acc + (Number(p.totalFailures) || 0), 0);

  // Filter project list
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.baseUrl?.toLowerCase().includes(searchTerm.toLowerCase());

    const status = (p.currentStatus || 'UNKNOWN').toUpperCase();
    if (filter === 'UP') return matchesSearch && status === 'UP';
    if (filter === 'DOWN') return matchesSearch && status === 'DOWN';
    if (filter === 'ACTIVE') return matchesSearch && Boolean(p.isActive);
    return matchesSearch;
  });

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monitoring Dashboard</h1>
          <p className="page-subtitle">Overview of all operational services & metrics</p>
        </div>
        <Link to="/projects/new" className="btn btn-primary">
          <span className="icon">➕</span> Create Project
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchProjects} />}

      {/* Metrics Row */}
      <div className="stats-grid">
        <StatCard title="Total Projects" value={totalProjects} subtext="Registered monitors" icon="📁" />
        <StatCard title="Active Projects" value={activeProjects} subtext="Currently monitoring" type="active" icon="⚡" />
        <StatCard title="UP" value={upProjects} subtext="Operational" type="up" icon="🟢" />
        <StatCard title="DOWN" value={downProjects} subtext="Service outages" type="down" icon="🔴" />
        <StatCard title="UNKNOWN" value={unknownProjects} subtext="Pending checks" type="unknown" icon="⚪" />
        <StatCard title="Total Checks" value={totalChecks} subtext="Lifetime evaluations" icon="📈" />
        <StatCard title="Total Failures" value={totalFailures} subtext="Recorded downtime" type="down" icon="⚠️" />
      </div>

      {/* Filter and Search Bar */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search projects by name or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>
            All ({totalProjects})
          </button>
          <button className={`filter-btn ${filter === 'UP' ? 'active' : ''}`} onClick={() => setFilter('UP')}>
            UP ({upProjects})
          </button>
          <button className={`filter-btn ${filter === 'DOWN' ? 'active' : ''}`} onClick={() => setFilter('DOWN')}>
            DOWN ({downProjects})
          </button>
          <button className={`filter-btn ${filter === 'ACTIVE' ? 'active' : ''}`} onClick={() => setFilter('ACTIVE')}>
            Active ({activeProjects})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loading message="Fetching monitored services..." />
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📡</div>
          <h3>{projects.length === 0 ? 'No projects yet.' : 'No matching projects found.'}</h3>
          <p>
            {projects.length === 0
              ? 'Create your first project to start monitoring uptime and performance.'
              : 'Try clearing your search or changing status filters.'}
          </p>
          {projects.length === 0 && (
            <Link to="/projects/new" className="btn btn-primary mt-3">
              + Create Project
            </Link>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id || project.id}
              project={project}
              onToggleMonitoring={handleToggleMonitoring}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

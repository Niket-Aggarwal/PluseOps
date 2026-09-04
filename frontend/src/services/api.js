import { authService } from './auth';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return envUrl.replace(/\/$/, '');
};

/**
 * Centralized fetch handler for PulseOps API requests.
 * Attaches JWT Bearer token to protected endpoints and parses backend JSON responses.
 */
async function request(endpoint, options = {}, isPublic = false) {
  const url = `${getBaseUrl()}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (!isPublic) {
    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    // Handle HTTP 401 Unauthorized globally
    if (response.status === 401 && !isPublic) {
      authService.removeToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = json?.message || json?.problem || json?.error || `HTTP Error ${response.status}`;
      throw new Error(errorMsg);
    }

    if (json && typeof json === 'object') {
      if ('success' in json && !json.success) {
        throw new Error(json.message || json.problem || 'Operation failed');
      }
      return json;
    }

    return { success: true, data: json };
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error('Unable to connect to backend server. Ensure backend is running.');
    }
    throw err;
  }
}

export const api = {
  // Google OAuth Login
  googleLogin: async (credential) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ credential })
    }, true);

    if (res.token) {
      authService.setToken(res.token, res.user);
    }
    return res;
  },

  // Active User Session
  getActiveSession: async () => {
    const res = await request('/auth/session');
    return res.user || res.data;
  },

  // Projects API
  getProjects: async () => {
    const res = await request('/projects');
    return res.data ?? res.projects ?? res;
  },

  getDashboardStats: async () => {
    const res = await request('/projects/stats');
    return res.data ?? res;
  },

  getProjectById: async (id) => {
    const res = await request(`/projects/${id}`);
    return res.data ?? res.project ?? res;
  },

  createProject: async (projectData) => {
    const payload = {
      name: projectData.name,
      baseUrl: projectData.baseUrl,
      intervalMinutes: Number(projectData.intervalMinutes) || 5,
      description: projectData.description || '',
      publicStatusEnabled: projectData.publicStatusEnabled !== undefined ? Boolean(projectData.publicStatusEnabled) : true
    };
    const res = await request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.data ?? res.project ?? res;
  },

  updateProject: async (id, projectData) => {
    const payload = {
      name: projectData.name,
      baseUrl: projectData.baseUrl,
      intervalMinutes: Number(projectData.intervalMinutes) || 5,
      description: projectData.description || ''
    };
    const res = await request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return res.data ?? res.project ?? res;
  },

  toggleMonitoring: async (id) => {
    const res = await request(`/projects/${id}/toggle`, {
      method: 'PATCH'
    });
    return res.data ?? res.project ?? res;
  },

  deleteProject: async (id) => {
    const res = await request(`/projects/${id}`, {
      method: 'DELETE'
    });
    return res;
  },

  getLatestCheck: async (id) => {
    const res = await request(`/projects/${id}/latest`);
    return res.data ?? res.check ?? res;
  },

  getProjectHistory: async (id, page = 1, limit = 50) => {
    const res = await request(`/projects/${id}/history?page=${page}&limit=${limit}`);
    return res.data ?? res.history ?? res;
  },

  getHistoryDetail: async (projectId, historyId) => {
    const res = await request(`/projects/${projectId}/history/${historyId}`);
    return res.data ?? res.historyDetail ?? res;
  },

  // Public Status Page (Unauthenticated)
  getPublicStatus: async (publicStatusId) => {
    const res = await request(`/public/status/${publicStatusId}`, {}, true);
    return res.data ?? res.status ?? res;
  }
};

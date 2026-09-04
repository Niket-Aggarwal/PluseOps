const TOKEN_KEY = 'pulseops_token';
const USER_KEY = 'pulseops_user';

export const authService = {
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token, user = null) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return Boolean(token && token.trim().length > 0);
  }
};

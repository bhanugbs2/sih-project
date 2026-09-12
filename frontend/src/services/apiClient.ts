import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// Request Interceptor: Attach JWT Token if present in localStorage (except for public auth endpoints)
apiClient.interceptors.request.use(
  (config) => {
    const isPublicAuthEndpoint = config.url && (config.url.includes('/api/auth/login') || config.url.includes('/api/auth/register') || config.url.includes('/api/verify'));
    if (!isPublicAuthEndpoint) {
      const token = localStorage.getItem('honeychain_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if unauthenticated
      const path = window.location.pathname;
      if (path !== '/login' && !path.startsWith('/verify')) {
        localStorage.removeItem('honeychain_token');
        localStorage.removeItem('honeychain_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

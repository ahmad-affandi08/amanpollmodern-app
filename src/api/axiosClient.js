import axios from 'axios';

// Create axios instance with base configuration
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // Enable cookies for session auth
  headers: {
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - attach token and set Content-Type
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only set Content-Type for non-FormData requests
    // FormData will auto-set multipart/form-data with boundary
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Do not redirect forcefully, let the app state handle it
      // window.location.href = '/login'; 
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    // Handle 503 Service Unavailable (Maintenance Mode)
    if (error.response?.status === 503) {
      // Ignore 503 for notification polling to prevent disruption
      if (error.config?.url?.includes('/notifications')) {
        console.warn('Notification service unavailable:', error.response.status);
        return Promise.reject(error);
      }

      // Redirect to maintenance page (unless we are already there or on bypass page)
      if (window.location.pathname !== '/maintenance' && !window.location.pathname.startsWith('/bypass')) {
        window.location.href = '/maintenance';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

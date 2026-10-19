import axios from 'axios';
import { API_BASE_URL } from '../config';

/** Dikirim saat server menolak token (401) agar AuthContext mengakhiri sesi. */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

// Endpoint yang wajar mengembalikan 401 tanpa berarti sesi berakhir.
const AUTH_ENDPOINTS = ['/login', '/register', '/forgot-password', '/logout'];


const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 30000,
});


axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }



    if (config.data !== undefined && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => url.startsWith(endpoint));

      if (!isAuthEndpoint) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }


    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }


    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }


    if (error.response?.status === 503) {

      if (error.config?.url?.includes('/notifications')) {
        console.warn('Notification service unavailable:', error.response.status);
        return Promise.reject(error);
      }


      if (window.location.pathname !== '/maintenance' && !window.location.pathname.startsWith('/bypass')) {
        window.location.href = '/maintenance';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

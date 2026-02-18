import axios from 'axios';


const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
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



    if (!(config.data instanceof FormData)) {
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');


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

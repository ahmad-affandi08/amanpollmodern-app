import axiosClient from './axiosClient';

const KonfigurasiApi = {
  // Get Fonnte configuration
  getFonnteConfig: () => axiosClient.get('/konfigurasi/fonnte'),

  // Save Fonnte configuration
  saveFonnteConfig: (data) => axiosClient.post('/konfigurasi/fonnte', data),

  // Test Fonnte connection
  testFonnteConnection: (apiToken) => axiosClient.post('/konfigurasi/fonnte/test', { api_token: apiToken }),
};

export default KonfigurasiApi;

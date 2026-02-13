import axiosClient from './axiosClient';

const KonfigurasiApi = {

  getFonnteConfig: () => axiosClient.get('/konfigurasi/fonnte'),


  saveFonnteConfig: (data) => axiosClient.post('/konfigurasi/fonnte', data),


  testFonnteConnection: (apiToken) => axiosClient.post('/konfigurasi/fonnte/test', { api_token: apiToken }),
};

export default KonfigurasiApi;

import axiosClient from './axiosClient';

const KonfigurasiApi = {

  getFonnteConfig: () => axiosClient.get('/konfigurasi/fonnte'),


  saveFonnteConfig: (data) => axiosClient.post('/konfigurasi/fonnte', data),


  testFonnteConnection: (apiToken) => axiosClient.post('/konfigurasi/fonnte/test', { api_token: apiToken }),

  getNotificationTemplates: () => axiosClient.get('/notification-templates'),
  getNotificationTemplate: (kode) => axiosClient.get(`/notification-templates/${kode}`),
  updateNotificationTemplate: (kode, data) => axiosClient.put(`/notification-templates/${kode}`, data),
};

export default KonfigurasiApi;

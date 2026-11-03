import axiosClient from './axiosClient';

const KonfigurasiApi = {

  // WhatsApp multi-provider: GET mengembalikan semua provider + yang aktif (rahasia tersamar).
  getWhatsAppConfig: () => axiosClient.get('/konfigurasi/whatsapp'),

  // { provider, fields } - rahasia tersamar/kosong berarti "pakai yang tersimpan".
  saveWhatsAppConfig: (data) => axiosClient.post('/konfigurasi/whatsapp', data),

  // { provider, fields, test_target? } - test_target wajib untuk provider tanpa uji pasif.
  testWhatsAppConnection: (data) => axiosClient.post('/konfigurasi/whatsapp/test', data),

  getNotificationTemplates: () => axiosClient.get('/notification-templates'),
  getNotificationTemplate: (kode) => axiosClient.get(`/notification-templates/${kode}`),
  updateNotificationTemplate: (kode, data) => axiosClient.put(`/notification-templates/${kode}`, data),
};

export default KonfigurasiApi;

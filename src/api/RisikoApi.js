import axiosClient from './axiosClient';

const RisikoApi = {
  getRegister: async (params = {}) => (await axiosClient.get('/risiko', { params })).data,
  getRingkasan: async () => (await axiosClient.get('/risiko/ringkasan')).data?.data ?? null,
  nilaiMassal: async (data) => (await axiosClient.post('/risiko/nilai-massal', data)).data,
  // inventaris_ids kosong/null = semua alat yang interval-nya kurang dalam cakupan pengguna.
  terapkanInterval: async (inventarisIds = null) =>
    (await axiosClient.post('/risiko/terapkan-interval', { inventaris_ids: inventarisIds })).data,
};

export default RisikoApi;

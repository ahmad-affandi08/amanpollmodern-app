import axiosClient from './axiosClient';

/**
 * Halaman disposisi dibuka pimpinan dari tautan WhatsApp tanpa login. Akses dijaga token `t`
 * pada tautan; token ikut dikirim di setiap permintaan (pengguna yang login tidak butuh token).
 */
const withToken = (token) => (token ? { params: { t: token } } : {});

const DisposisiApi = {
  /** Data aduan untuk halaman disposisi (bentuk sama dengan GET /aduan/{id}). */
  getAduan: async (aduanId, token) => {
    const response = await axiosClient.get(`/disposisi/aduan/${aduanId}`, withToken(token));
    return response.data;
  },

  /** Data pemeliharaan untuk halaman disposisi (bentuk sama dengan GET /pemeliharaan/{id}). */
  getPemeliharaan: async (pemeliharaanId, token) => {
    const response = await axiosClient.get(`/disposisi/pemeliharaan/${pemeliharaanId}`, withToken(token));
    return response.data;
  },

  /**
   * Create disposisi for Aduan
   */
  createDisposisiAduan: (aduanId, data, token) => {
    return axiosClient.post(`/disposisi/aduan/${aduanId}`, data, withToken(token));
  },

  /**
   * Create disposisi for Pemeliharaan
   */
  createDisposisiPemeliharaan: (pemeliharaanId, data, token) => {
    return axiosClient.post(`/disposisi/pemeliharaan/${pemeliharaanId}`, data, withToken(token));
  },
};

export default DisposisiApi;

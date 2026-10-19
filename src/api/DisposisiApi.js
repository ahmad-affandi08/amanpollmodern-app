import axiosClient from './axiosClient';

const DisposisiApi = {
  /**
   * Create disposisi for Aduan
   */
  createDisposisiAduan: (aduanId, data) => {
    return axiosClient.post(`/disposisi/aduan/${aduanId}`, data);
  },

  /**
   * Create disposisi for Pemeliharaan
   */
  createDisposisiPemeliharaan: (pemeliharaanId, data) => {
    return axiosClient.post(`/disposisi/pemeliharaan/${pemeliharaanId}`, data);
  },
};

export default DisposisiApi;

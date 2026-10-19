import axiosClient from './axiosClient';

export const disposisiApi = {
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

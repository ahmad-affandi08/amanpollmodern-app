import axiosClient from './axiosClient';

const AlatBaruApi = {
  // Get all alat baru with pagination
  getAlatBaru: (params = {}) => {
    return axiosClient.get('/alat-baru', { params });
  },

  // Get single alat baru detail
  getAlatBaruDetail: (id) => {
    return axiosClient.get(`/alat-baru/${id}`);
  },

  // Create new alat baru
  createAlatBaru: (formData) => {
    return axiosClient.post('/alat-baru', formData);
  },

  // Delete alat baru
  deleteAlatBaru: (id) => {
    return axiosClient.delete(`/alat-baru/${id}`);
  },

  // Approve alat baru (admin only)
  approveAlatBaru: (id) => {
    return axiosClient.post(`/alat-baru/${id}/approve`);
  },
};

export default AlatBaruApi;

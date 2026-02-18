import axiosClient from './axiosClient';

const AlatBaruApi = {

  getAlatBaru: (params = {}) => {
    return axiosClient.get('/alat-baru', { params });
  },


  getAlatBaruDetail: (id) => {
    return axiosClient.get(`/alat-baru/${id}`);
  },


  createAlatBaru: (formData) => {
    return axiosClient.post('/alat-baru', formData);
  },


  deleteAlatBaru: (id) => {
    return axiosClient.delete(`/alat-baru/${id}`);
  },


  approveAlatBaru: (id) => {
    return axiosClient.post(`/alat-baru/${id}/approve`);
  },
};

export default AlatBaruApi;

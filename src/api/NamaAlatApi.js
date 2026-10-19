import axiosClient from './axiosClient';

const NamaAlatApi = {
  getAll: async (params) => {
    const response = await axiosClient.get('/nama-alat', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/nama-alat/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await axiosClient.post('/nama-alat', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/nama-alat/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/nama-alat/${id}`);
    return response.data;
  }
};

export default NamaAlatApi;

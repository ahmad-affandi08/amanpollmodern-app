import axiosClient from './axiosClient';

const KategoriAlatApi = {
  getAll: async (params) => {
    const response = await axiosClient.get('/kategori-alat', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/kategori-alat/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await axiosClient.post('/kategori-alat', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/kategori-alat/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/kategori-alat/${id}`);
    return response.data;
  }
};

export default KategoriAlatApi;

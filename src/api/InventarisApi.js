import axiosClient from './axiosClient';

const InventarisApi = {
  getAll: async (params = {}) => {
    const response = await axiosClient.get('/inventaris', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/inventaris/${id}`);
    return response.data;
  },

  create: async (data) => {

    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await axiosClient.post('/inventaris', data, { headers });
    return response.data;
  },

  update: async (id, data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};

    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const response = await axiosClient.post(`/inventaris/${id}`, data, { headers });
      return response.data;
    }
    const response = await axiosClient.put(`/inventaris/${id}`, data);
    return response.data;
  },

  updateLocation: async (id, ruanganId) => {
    const response = await axiosClient.put(`/inventaris/${id}/location`, { ruangan_id: ruanganId });
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/inventaris/${id}`);
    return response.data;
  },


  exportExcel: async (filters = {}) => {
    const response = await axiosClient.get('/inventaris/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },


  printLabel: async (filters = {}) => {
    const response = await axiosClient.get('/print/label', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },


  previewNoInventaris: async (data) => {
    const response = await axiosClient.post('/inventaris/preview-no-inventaris', data);
    return response.data;
  }
};

export default InventarisApi;

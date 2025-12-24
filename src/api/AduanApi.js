import axiosClient from './axiosClient';

const AduanApi = {
  getAll: async (params = {}) => {
    const response = await axiosClient.get('/aduan', { params });
    return response.data;
  },

  getAssignments: async (page = 1, limit = 10, statusAduan = undefined) => {
    const params = { page, per_page: limit };
    if (statusAduan) {
      params.status_aduan = statusAduan;
    }
    const response = await axiosClient.get('/aduan/assignments', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/aduan/${id}`);
    return response.data;
  },

  create: async (data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await axiosClient.post('/aduan', data, { headers });
    return response.data;
  },

  update: async (id, data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const response = await axiosClient.post(`/aduan/${id}`, data, { headers });
      return response.data;
    }
    const response = await axiosClient.put(`/aduan/${id}`, data);
    return response.data;
  },

  assignTeknisi: async (id, teknisiId) => {
    const response = await axiosClient.put(`/aduan/${id}/assign`, { teknisi_id: teknisiId });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosClient.patch(`/aduan/${id}/status`, { status });
    return response.data;
  },

  updateInspection: async (id, data) => {
    const response = await axiosClient.put(`/aduan/${id}/inspection`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/aduan/${id}`);
    return response.data;
  }
};

export default AduanApi;

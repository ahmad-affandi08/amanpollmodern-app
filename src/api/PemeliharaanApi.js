import axiosClient from './axiosClient';

const PemeliharaanApi = {
  getAll: async (params = {}) => {
    const response = await axiosClient.get('/pemeliharaan', { params });
    return response.data;
  },

  getAssignments: async (page = 1, limit = 10, search = '', status = 'all', kondisi = 'all', month = null, year = null) => {
    const response = await axiosClient.get('/pemeliharaan/assignments', {
      params: {
        page,
        per_page: limit,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        kondisi_alat: kondisi !== 'all' ? kondisi : undefined,
        month: month || undefined,
        year: year || undefined
      }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/pemeliharaan/${id}`);
    return response.data;
  },
  create: async (data) => {

    const response = await axiosClient.post('/pemeliharaan', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosClient.put(`/pemeliharaan/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosClient.delete(`/pemeliharaan/${id}`);
    return response.data;
  },
  checkActiveSchedule: async (inventarisId) => {

    const response = await axiosClient.get(`/pemeliharaan/check-active/${inventarisId}`);
    return response.data;
  },

  getFormData: async (id) => {
    const response = await axiosClient.get(`/pemeliharaan/${id}/form-data`);
    return response.data;
  },

  submitForm: async (id, data) => {
    const response = await axiosClient.post(`/pemeliharaan/${id}/submit`, data);
    return response.data;
  },

  updateSignature: async (id, data) => {
    const response = await axiosClient.post(`/pemeliharaan/${id}/update-signature`, data);
    return response.data;
  },
};

export default PemeliharaanApi;

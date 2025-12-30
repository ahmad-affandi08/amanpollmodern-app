import axiosClient from './axiosClient';

const PemeliharaanApi = {
  getAll: async (params = {}) => {
    const response = await axiosClient.get('/pemeliharaan', { params });
    return response.data;
  },

  getAssignments: async (page = 1, limit = 10, search = '', status = 'all', month = null, year = null) => {
    const response = await axiosClient.get('/pemeliharaan/assignments', {
      params: {
        page,
        per_page: limit,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
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
    // data can be { schedules: [...] } for bulk or single object
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
    // Check if there are active schedules for this item
    const response = await axiosClient.get(`/pemeliharaan/check-active/${inventarisId}`);
    return response.data; // { active: boolean, message: string }
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

import axiosClient from "./axiosClient";

const AnggaranApi = {
  getAll: () => axiosClient.get('/anggaran'),

  getAnalysis: (params) => {
    return axiosClient.get('/anggaran/analysis', { params });
  },

  getRepairAnalysis: (params) => {
    return axiosClient.get('/anggaran/analysis-repair', { params });
  },

  createInflasi: (data) => axiosClient.post('/anggaran/inflasi', data),

  deleteInflasi: (id) => axiosClient.delete(`/anggaran/inflasi/${id}`),

  updateRab: (data) => axiosClient.put('/anggaran/rab', data),

  getDetail: (id) => axiosClient.get('/anggaran/analysis', { params: { id_inventaris: id } }),
};

export default AnggaranApi;

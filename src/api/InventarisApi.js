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
      data.set('_method', 'PUT');
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


  getKalibrasi: async (id) => {
    const response = await axiosClient.get(`/inventaris/${id}/kalibrasi`);
    return response.data;
  },

  addKalibrasi: async (id, data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await axiosClient.post(`/inventaris/${id}/kalibrasi`, data, { headers });
    return response.data;
  },

  deleteKalibrasi: async (id, historyId) => {
    const response = await axiosClient.delete(`/inventaris/${id}/kalibrasi/${historyId}`);
    return response.data;
  },


  exportExcel: async (filters = {}) => {
    const response = await axiosClient.get('/inventaris/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },


  /**
   * Seperti exportExcel, tetapi mengembalikan juga nama file dari header Content-Disposition
   * (bila terbaca oleh browser): { blob, filename }. filename bernilai null bila header tidak ada.
   */
  exportExcelFile: async (filters = {}) => {
    const response = await axiosClient.get('/inventaris/export', {
      params: filters,
      responseType: 'blob'
    });
    const disposition = response.headers?.['content-disposition'] || '';
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    let filename = match ? match[1].trim() : null;
    try {
      if (filename) filename = decodeURIComponent(filename);
    } catch {
      // Nama file bukan hasil encode URL: pakai apa adanya.
    }
    return { blob: response.data, filename };
  },


  printLabel: async (filters = {}) => {
    const response = await axiosClient.get('/print/label', {
      params: filters,
      responseType: 'blob',
      timeout: 300000, // 5 minutes for bulk label generation
    });
    return response.data;
  },


  previewNoInventaris: async (data) => {
    const response = await axiosClient.post('/inventaris/preview-no-inventaris', data);
    return response.data;
  }
};

export default InventarisApi;

import axiosClient from './axiosClient';

const ChecklistMaintenanceApi = {
  getByNamaAlat: async (namaAlatId) => {
    const response = await axiosClient.get(`/checklist-maintenance?nama_alat_id=${namaAlatId}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await axiosClient.post('/checklist-maintenance', data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/checklist-maintenance/${id}`);
    return response.data;
  }
};

export default ChecklistMaintenanceApi;

import axiosClient from './axiosClient';

const KategoriChecklistApi = {
  getAll: async () => {
    const response = await axiosClient.get('/kategori-checklist-maintenance');
    return response.data.data;
  }
};

export default KategoriChecklistApi;

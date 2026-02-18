import axiosClient from './axiosClient';

const RuanganApi = {
  getAll: async () => {
    const response = await axiosClient.get('/ruangan?all=1');

    return response.data.data || response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/ruangan/${id}`);
    return response.data.data || response.data;
  }
};

export default RuanganApi;

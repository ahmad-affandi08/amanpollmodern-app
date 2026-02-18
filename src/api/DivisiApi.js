import axiosClient from './axiosClient';

const DivisiApi = {
  getAll: async () => {
    const response = await axiosClient.get('/divisi?all=1');
    return response.data.data || response.data;
  },

  getAllRaw: async () => {
    const response = await axiosClient.get('/divisi');
    return response.data.data ? response.data.data : response.data;
  }
};

export default DivisiApi;

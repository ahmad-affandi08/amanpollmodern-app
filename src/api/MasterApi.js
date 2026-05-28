import axiosClient from './axiosClient';

const MasterApi = {

  getAllDivisi: async (params) => {
    const response = await axiosClient.get('/divisi', { params });
    return response.data;
  },
  getDivisiById: async (id) => {
    const response = await axiosClient.get(`/divisi/${id}`);
    return response.data;
  },
  createDivisi: async (data) => {
    const response = await axiosClient.post('/divisi', data);
    return response.data;
  },
  updateDivisi: async (id, data) => {
    const response = await axiosClient.put(`/divisi/${id}`, data);
    return response.data;
  },
  deleteDivisi: async (id) => {
    const response = await axiosClient.delete(`/divisi/${id}`);
    return response.data;
  },
  getAllRuangan: async (params) => {
    const response = await axiosClient.get('/ruangan', { params });
    return response.data;
  },
  getRuanganById: async (id) => {
    const response = await axiosClient.get(`/ruangan/${id}`);
    return response.data;
  },
  createRuangan: async (data) => {
    const response = await axiosClient.post('/ruangan', data);
    return response.data;
  },
  updateRuangan: async (id, data) => {
    const response = await axiosClient.put(`/ruangan/${id}`, data);
    return response.data;
  },
  deleteRuangan: async (id) => {
    const response = await axiosClient.delete(`/ruangan/${id}`);
    return response.data;
  },


  getAllKategoriUser: async (params) => {
    const response = await axiosClient.get('/kategori-user', { params });
    return response.data;
  },
  getAllUsers: async (params) => {
    const response = await axiosClient.get('/users', { params });
    return response.data;
  },
  getUserById: async (id) => {
    const response = await axiosClient.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (data) => {
    const response = await axiosClient.post('/users', data);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await axiosClient.put(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  },
  toggleUserStatus: async (id, isActive) => {
    const response = await axiosClient.patch(`/users/${id}/status`, { active: isActive });
    return response.data;
  },


  getTeknisi: async (params = {}) => {

    const response = await axiosClient.get('/users', {
      params: {
        per_page: 500,
        category: 'teknisi',
        ...params
      }
    });
    return response.data.data || response.data;
  }
};

export default MasterApi;

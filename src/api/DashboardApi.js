import axiosClient from '../api/axiosClient';

const DashboardApi = {
  getStats: (filters) => {
    return axiosClient.get('/dashboard', { params: filters }).then(res => res.data.data);
  }
};

export default DashboardApi;

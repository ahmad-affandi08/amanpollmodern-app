import axiosClient from './axiosClient';

const ProfileApi = {

  getProfile: async () => {
    const response = await axiosClient.get('/user/profile');
    return response.data;
  },


  changePassword: async (data) => {
    const response = await axiosClient.post('/user/change-password', data);
    return response.data;
  }
};

export default ProfileApi;

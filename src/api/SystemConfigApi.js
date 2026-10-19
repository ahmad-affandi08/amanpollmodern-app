import axiosClient from './axiosClient';

const InstitutionConfigApi = {
  getConfig: async () => {
    const response = await axiosClient.get('/institution-config');
    return response.data;
  },

  updateConfig: async (data) => {
    const response = await axiosClient.put('/institution-config', data);
    return response.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await axiosClient.post('/institution-config/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default InstitutionConfigApi;

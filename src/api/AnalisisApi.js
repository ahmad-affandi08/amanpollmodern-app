import axiosClient from './axiosClient';

const AnalisisApi = {
  getKeandalanAlat: () => axiosClient.get('/analisis/keandalan'),
  getKinerjaTeknisi: () => axiosClient.get('/analisis/kinerja'),
  getSebaranRuangan: () => axiosClient.get('/analisis/ruangan'),
  getBiaya: () => axiosClient.get('/analisis/biaya'),
  getKalibrasi: () => axiosClient.get('/analisis/kalibrasi'),
};

export default AnalisisApi;

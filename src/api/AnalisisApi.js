import axiosClient from './axiosClient';

/** Semua endpoint ringkasan menerima `params`: { periode, divisi_id } (lihat AnalisisController). */
const AnalisisApi = {
  getKeandalanAlat: (params) => axiosClient.get('/analisis/keandalan', { params }),
  getKinerjaTeknisi: (params) => axiosClient.get('/analisis/kinerja', { params }),
  getSebaranRuangan: (params) => axiosClient.get('/analisis/ruangan', { params }),
  getBiaya: (params) => axiosClient.get('/analisis/biaya', { params }),
  getKalibrasi: (params) => axiosClient.get('/analisis/kalibrasi', { params }),
  getRisiko: (params) => axiosClient.get('/analisis/risiko', { params }),

  // Realisasi SKI teknisi per bulan. Teknisi selalu mendapat dirinya sendiri (teknisi_id diabaikan server).
  getRealisasiSki: (params) => axiosClient.get('/analisis/ski', { params }),
  /** Unduh Excel: { blob, filename } (filename null bila header tidak terbaca). */
  exportRealisasiSki: async (params) => {
    const response = await axiosClient.get('/analisis/ski/export', { params, responseType: 'blob' });
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(response.headers?.['content-disposition'] || '');
    return { blob: response.data, filename: match ? match[1].trim() : null };
  },
};

export default AnalisisApi;

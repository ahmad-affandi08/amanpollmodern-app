import axiosClient from './axiosClient';

const ENDPOINT = { aduan: 'aduan', pemeliharaan: 'pemeliharaan', inventaris: 'inventaris' };

const ServisPihakKetigaApi = {
  /** Daftar laporan milik aduan / pemeliharaan / alat. */
  list: async (jenis, id) => {
    const response = await axiosClient.get(`/${ENDPOINT[jenis]}/${id}/servis`);
    return response.data?.data ?? [];
  },

  /** Tambah laporan pada aduan atau pemeliharaan (multipart, memuat file_laporan). */
  tambah: async (jenis, id, data) => {
    const response = await axiosClient.post(`/${ENDPOINT[jenis]}/${id}/servis`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  hapus: async (id) => {
    const response = await axiosClient.delete(`/servis-pihak-ketiga/${id}`);
    return response.data;
  },

  /** Berkas laporan (privat): diunduh dengan token, bukan lewat URL publik. */
  unduh: async (id) => {
    const response = await axiosClient.get(`/servis-pihak-ketiga/${id}/file`, { responseType: 'blob' });
    return response.data;
  },
};

export default ServisPihakKetigaApi;

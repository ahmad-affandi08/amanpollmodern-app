import ServisPihakKetigaApi from '../api/ServisPihakKetigaApi';
import { ROLES, getRoleId } from '../features/auth/constants';

export const SERVIS_MAKS_MB = 10;
export const SERVIS_ACCEPT = '.pdf,.jpg,.jpeg,.png';

const PERAN_TULIS = [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.TEKNISI];

/**
 * Apakah pengguna boleh menambah laporan pada aduan/pemeliharaan berstatus tertentu.
 * Cermin aturan server (ServisPihakKetigaService): aduan Pending belum bisa, dan setelah
 * Selesai hanya Admin Divisi / Super Admin. Server tetap menjadi penentu.
 * @returns {{ boleh: boolean, alasan: string }}
 */
export const aturanTambahServis = (user, jenis, status) => {
  const peran = getRoleId(user);

  if (!PERAN_TULIS.includes(peran)) {
    return { boleh: false, alasan: '' };
  }
  if (jenis === 'aduan' && (!status || status === 'Pending')) {
    return { boleh: false, alasan: 'Aduan belum ditugaskan ke teknisi.' };
  }
  if (status === 'Selesai' && peran === ROLES.TEKNISI) {
    return { boleh: false, alasan: 'Setelah selesai, laporan hanya dapat ditambahkan oleh Admin Divisi.' };
  }

  return { boleh: true, alasan: '' };
};

export const bolehHapusServis = (user) => getRoleId(user) === ROLES.SUPER_ADMIN;

/**
 * Buka berkas laporan di tab baru. Tab dibuka sinkron saat klik (agar tidak diblokir popup blocker),
 * lalu diarahkan ke berkas setelah diunduh dengan token. Bila tab diblokir, berkas diunduh biasa.
 */
export const bukaLaporan = async (laporan) => {
  const tab = window.open('', '_blank');
  if (tab) tab.opener = null;

  try {
    const blob = await ServisPihakKetigaApi.unduh(laporan.id);
    const url = URL.createObjectURL(blob);

    if (tab) {
      tab.location.href = url;
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = laporan.nama_file || 'laporan';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    tab?.close();
    throw error;
  }
};

/** Pesan galat dari respons server (validasi 422 digabung). */
export const pesanGalat = (error, fallback) => {
  const errors = error.response?.data?.errors;
  return errors ? Object.values(errors).flat().join(', ') : error.response?.data?.message || fallback;
};

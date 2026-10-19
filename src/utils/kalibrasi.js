import { ROLES } from '../features/auth/constants';
import { parseDate } from './format';

const WARNING_DAYS = 30;

/**
 * Hanya Super Admin, Teknisi, dan Admin Divisi yang boleh mengubah data kalibrasi
 * (sama dengan aturan canManage di backend).
 */
export const canManageKalibrasi = (user) => {
  const role = Number(user?.kategori_user_id);
  return [ROLES.SUPER_ADMIN, ROLES.TEKNISI, ROLES.ADMIN_DIVISI].includes(role);
};

/**
 * Status masa berlaku sertifikat kalibrasi berdasarkan tanggal kadaluwarsa (YYYY-MM-DD).
 * Sumber tunggal: dipakai oleh riwayat kalibrasi, daftar/detail inventaris desktop dan mobile.
 *
 * Opsi `hasCertificate: false` berarti alat belum pernah dikalibrasi (tanpa sertifikat
 * dan tanpa tanggal): statusnya "Belum kalibrasi".
 */
export const getKalibrasiStatus = (kadaluwarsa, { hasCertificate = true } = {}) => {
  const expiry = parseDate(kadaluwarsa);

  if (!expiry) {
    if (!hasCertificate) {
      return { key: 'belum', label: 'Belum kalibrasi', className: 'bg-yellow-100 text-yellow-700' };
    }
    return { key: 'none', label: 'Tanpa masa berlaku', className: 'bg-gray-100 text-gray-600' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { key: 'expired', label: 'Kadaluwarsa', className: 'bg-red-100 text-red-700' };
  }
  if (diffDays <= WARNING_DAYS) {
    return { key: 'warning', label: `Segera habis (${diffDays} hari)`, className: 'bg-yellow-100 text-yellow-700' };
  }
  return { key: 'valid', label: 'Berlaku', className: 'bg-green-100 text-green-700' };
};

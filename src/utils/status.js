/**
 * Sumber tunggal warna status (aduan, pemeliharaan, kondisi alat, status user).
 * Semua badge/label status harus memakai util ini agar status yang sama selalu
 * tampil dengan warna yang sama di desktop, mobile, laporan, dan dashboard.
 */

// Kelas Tailwind ditulis lengkap (bukan dirakit dari string) supaya ikut ter-build.
const TONES = {
  success: { soft: 'bg-green-100 text-green-700', border: 'border-green-200', dot: 'bg-green-500', hex: '#22c55e' },
  warning: { soft: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500', hex: '#eab308' },
  danger: { soft: 'bg-red-100 text-red-700', border: 'border-red-200', dot: 'bg-red-500', hex: '#ef4444' },
  info: { soft: 'bg-blue-100 text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', hex: '#3b82f6' },
  purple: { soft: 'bg-purple-100 text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', hex: '#a855f7' },
  neutral: { soft: 'bg-gray-100 text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400', hex: '#9ca3af' },
};

const STATUS_TONE = {
  // Aduan
  'Baru': 'danger',
  'Pending': 'warning',
  'Sedang Dikerjakan': 'info',
  'Tindakan Lanjutan': 'purple',
  'Selesai': 'success',
  'Ditolak': 'danger',

  // Pemeliharaan
  'Belum Selesai': 'warning',

  // Kondisi alat
  'Baik': 'success',
  'Rusak Ringan': 'warning',
  'Rusak Berat': 'danger',
  'Dalam Perbaikan': 'info',

  // Status pengguna
  'Active': 'success',
  'Aktif': 'success',
  'Inactive': 'neutral',
  'Tidak Aktif': 'neutral',
};

/** Nama tone untuk sebuah status (success | warning | danger | info | purple | neutral). */
export const getStatusTone = (status) => STATUS_TONE[status] || 'neutral';

/** Kelas warna latar+teks, mis. 'bg-green-100 text-green-700'. */
export const getStatusClasses = (status) => TONES[getStatusTone(status)].soft;

/** Kelas warna latar+teks+border. */
export const getStatusClassesWithBorder = (status) => {
  const tone = TONES[getStatusTone(status)];
  return `${tone.soft} border ${tone.border}`;
};

/** Warna hex untuk grafik/legenda. */
export const getStatusHex = (status) => TONES[getStatusTone(status)].hex;

/** Kelas titik penanda status. */
export const getStatusDotClass = (status) => TONES[getStatusTone(status)].dot;

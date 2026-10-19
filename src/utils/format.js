/**
 * Util format tanggal/uang bersama. Semua halaman memakai fungsi di sini
 * (jangan membuat formatDate/formatRupiah lokal lagi).
 */

const pad = (n) => String(n).padStart(2, '0');

/**
 * Ubah nilai tanggal dari API menjadi Date. Tanggal tanpa jam ('2026-10-19') dibaca
 * sebagai tanggal LOKAL (bukan UTC) supaya tidak bergeser sehari, dan format
 * 'YYYY-MM-DD HH:mm:ss' dari Laravel dibaca benar di semua browser (termasuk Safari).
 * Mengembalikan null bila kosong atau tidak valid.
 */
export const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const text = String(value).trim();
  if (!text || text.startsWith('0000-00-00')) return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(text.replace(' ', 'T'));

  return Number.isNaN(date.getTime()) ? null : date;
};

/** Tanggal lokal sebagai 'YYYY-MM-DD' (untuk <input type="date"> dan payload API). */
export const toInputDate = (value = new Date()) => {
  const date = parseDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Tambah bulan tanpa meluap ke bulan berikutnya (31 Agu + 6 bulan = 28/29 Feb, bukan 3 Mar). */
export const addMonths = (value, months) => {
  const date = parseDate(value);
  if (!date) return null;

  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(date.getDate(), lastDay));
  return result;
};

/**
 * Format number to IDR currency
 * @param {number|string} value
 * @returns {string}
 */
export const rupiah = (value) => {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  if (number === null || number === undefined || Number.isNaN(number)) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

/** Angka dengan pemisah ribuan Indonesia. */
export const formatNumber = (value) => {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  if (number === null || number === undefined || Number.isNaN(number)) return '0';
  return new Intl.NumberFormat('id-ID').format(number);
};

/**
 * Tanggal panjang: "19 Oktober 2026".
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsed);
};

/** Tanggal ringkas untuk tabel: "19/10/2026". */
export const formatDateShort = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(parsed);
};

/**
 * Tanggal dan jam: "19 Okt 2026, 14.30" (tanpa detik).
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsed);
};

/** Jam saja: "14.30". */
export const formatTime = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return '-';

  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(parsed);
};

/**
 * Base URL API. Dipakai axios dan semua link unduhan/ekspor.
 *
 * Default `/api` (relatif): aplikasi dan API satu domain (hasil build ada di webservices/public), jadi satu
 * build berlaku untuk domain mana pun tanpa mengganti URL. Isi VITE_API_URL dengan URL absolut hanya
 * bila API ada di domain lain. Saat `npm run dev`, `/api` diteruskan ke server lewat proxy di vite.config.js.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

/** Susun URL absolut ke endpoint API, mis. apiUrl('/report/aduan/export', { status: 'Selesai' }). */
export const apiUrl = (path, params) => {
  const url = `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
  if (!params) return url;

  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();

  return query ? `${url}?${query}` : url;
};

/** Nomor versi aplikasi (dari package.json saat build). 'dev' hanya bila dijalankan di luar build. */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'dev';

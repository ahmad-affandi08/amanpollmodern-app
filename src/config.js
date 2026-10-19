/**
 * Base URL API. Dipakai axios dan semua link unduhan/ekspor agar selalu menunjuk
 * ke server yang sama (tidak ada lagi `/api` relatif atau `undefined/...`).
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

/** Susun URL absolut ke endpoint API, mis. apiUrl('/report/aduan/export', { status: 'Selesai' }). */
export const apiUrl = (path, params) => {
  const url = `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
  if (!params) return url;

  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();

  return query ? `${url}?${query}` : url;
};

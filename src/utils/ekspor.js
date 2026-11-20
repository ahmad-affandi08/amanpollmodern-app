import { unduhBlob } from './realisasiSki';

const escapeHtml = (nilai) => String(nilai).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Sel yang diawali = + - @ dibaca Excel sebagai rumus: beri tanda petik di depan (sama dengan ExcelSafe di server). */
const sel = (nilai) => {
  if (nilai === null || nilai === undefined || nilai === '') return '';
  if (typeof nilai === 'number') return nilai;
  const teks = String(nilai);
  return /^[=+\-@\t\r]/.test(teks) && Number.isNaN(Number(teks)) ? `'${teks}` : teks;
};

/**
 * Unduh beberapa tabel sebagai satu file .xls (tabel HTML yang dibuka Excel, seperti ekspor lain di aplikasi).
 *
 * @param {string} namaFile  tanpa ekstensi
 * @param {string} judul     judul laporan (baris pertama)
 * @param {string} keterangan  mis. periode dan divisi
 * @param {Array<{ judul: string, kolom: string[], baris: Array<Array<string|number|null>> }>} bagian
 */
export const unduhExcel = (namaFile, judul, keterangan, bagian) => {
  const tabel = bagian.map((b) => `
    <tr><td colspan="${b.kolom.length}"><b>${escapeHtml(b.judul)}</b></td></tr>
    <tr>${b.kolom.map((k) => `<th style="background:#EEE">${escapeHtml(k)}</th>`).join('')}</tr>
    ${b.baris.map((r) => `<tr>${r.map((v) => `<td>${escapeHtml(sel(v))}</td>`).join('')}</tr>`).join('')}
    <tr><td></td></tr>`).join('');

  const html = `<html><head><meta charset="UTF-8"></head><body><table border="1">
    <tr><td colspan="4"><b>${escapeHtml(judul)}</b></td></tr>
    <tr><td colspan="4">${escapeHtml(keterangan)}</td></tr><tr><td></td></tr>${tabel}</table></body></html>`;

  unduhBlob(new Blob([html], { type: 'application/vnd.ms-excel' }), `${namaFile}.xls`);
};

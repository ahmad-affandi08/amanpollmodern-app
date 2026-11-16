/**
 * Konfigurasi per jenis disposisi (aduan / pemeliharaan): label, id, dan blok info yang ditampilkan.
 */
export const DISPOSISI_CONFIG = {
  aduan: {
    title: 'Aduan',
    idKey: 'id_aduan',
    doneText: 'Aduan ini telah mendapat disposisi dari pimpinan.',
    fields: [
      { key: 'keluhan', label: 'Keluhan', always: true },
      { key: 'tindakan_teknisi', label: 'Tindakan teknisi' },
      { key: 'rekomendasi', label: 'Rekomendasi' },
    ],
  },
  pemeliharaan: {
    title: 'Pemeliharaan',
    idKey: 'id_pemeliharaan',
    doneText: 'Pemeliharaan ini telah mendapat disposisi dari pimpinan.',
    fields: [
      { key: 'keterangan_pemeliharaan', label: 'Keterangan pemeliharaan', always: true },
      { key: 'rekomendasi', label: 'Rekomendasi' },
    ],
  },
};

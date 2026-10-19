import { FileText, Wrench, Lightbulb } from 'lucide-react';

/**
 * Konfigurasi per jenis disposisi (aduan / pemeliharaan): label, id, dan blok info
 * yang ditampilkan. Kelas Tailwind ditulis utuh agar ikut ter-build.
 */
export const DISPOSISI_CONFIG = {
  aduan: {
    title: 'Aduan',
    idKey: 'id_aduan',
    doneText: 'Aduan ini telah mendapat disposisi dari pimpinan.',
    fields: [
      {
        key: 'keluhan',
        label: 'Keluhan',
        icon: FileText,
        always: true,
        box: 'from-orange-50 to-amber-50 border-orange-100',
        text: 'text-orange-600',
      },
      {
        key: 'tindakan_teknisi',
        label: 'Tindakan Teknisi',
        icon: Wrench,
        box: 'from-green-50 to-emerald-50 border-green-100',
        text: 'text-green-600',
      },
      {
        key: 'rekomendasi',
        label: 'Rekomendasi',
        icon: Lightbulb,
        box: 'from-yellow-50 to-amber-50 border-yellow-100',
        text: 'text-yellow-600',
      },
    ],
  },
  pemeliharaan: {
    title: 'Pemeliharaan',
    idKey: 'id_pemeliharaan',
    doneText: 'Pemeliharaan ini telah mendapat disposisi dari pimpinan.',
    fields: [
      {
        key: 'keterangan_pemeliharaan',
        label: 'Keterangan Pemeliharaan',
        icon: FileText,
        always: true,
        box: 'from-orange-50 to-amber-50 border-orange-100',
        text: 'text-orange-600',
      },
      {
        key: 'rekomendasi',
        label: 'Rekomendasi',
        icon: Lightbulb,
        box: 'from-yellow-50 to-amber-50 border-yellow-100',
        text: 'text-yellow-600',
      },
    ],
  },
};

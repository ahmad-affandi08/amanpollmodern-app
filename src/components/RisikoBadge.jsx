import React from 'react';

const CONFIG = {
  Tinggi: 'bg-red-50 text-red-700 border-red-200',
  Sedang: 'bg-amber-50 text-amber-700 border-amber-200',
  Rendah: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

/**
 * Badge tingkat risiko alat (Tinggi/Sedang/Rendah); kosong = belum dinilai.
 * @param {'Tinggi'|'Sedang'|'Rendah'|null} tingkat
 * @param {number|null} skor total skor Fennig-Koh (opsional, ditampilkan di samping tingkat)
 */
export default function RisikoBadge({ tingkat, skor, size = 'md' }) {
  const color = CONFIG[tingkat] || 'bg-gray-50 text-gray-500 border-gray-200';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border whitespace-nowrap ${color} ${SIZE_CLASSES[size] || SIZE_CLASSES.md}`}>
      {tingkat ? `${tingkat}${skor ? ` (${skor})` : ''}` : 'Belum dinilai'}
    </span>
  );
}

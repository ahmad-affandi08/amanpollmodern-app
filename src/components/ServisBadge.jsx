import React from 'react';
import { Wrench } from 'lucide-react';

/** Penanda aduan/pemeliharaan yang sudah punya laporan servis pihak ketiga (tidak tampil bila nol). */
export default function ServisBadge({ jumlah }) {
  const total = Number(jumlah) || 0;
  if (total < 1) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap"
      title={`${total} laporan servis pihak ketiga`}
    >
      <Wrench size={10} />
      Pihak Ketiga{total > 1 ? ` (${total})` : ''}
    </span>
  );
}

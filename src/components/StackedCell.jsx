import React from 'react';

/** Sel tabel dua baris: teks utama + keterangan kecil di bawahnya (dipotong bila terlalu panjang). */
export default function StackedCell({ main, sub, right = false, subClassName = '', mainClassName = '' }) {
  return (
    <div className={`max-w-[15rem] ${right ? 'ml-auto' : ''}`}>
      <p className={`truncate text-[13px] font-semibold leading-tight text-text-dark ${mainClassName}`} title={main}>{main}</p>
      {/* &nbsp; menjaga tinggi baris sama saat tidak ada keterangan */}
      <p className={`mt-0.5 truncate text-[11px] leading-tight text-text-gray ${subClassName}`} title={sub || undefined}>{sub || ' '}</p>
    </div>
  );
}

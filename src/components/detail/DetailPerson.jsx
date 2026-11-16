import React from 'react';

/** Avatar inisial dan nama (mis. teknisi penanggung jawab). Satu warna merek, tanpa gradien. */
export default function DetailPerson({ nama, keterangan }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 shrink-0 rounded-full bg-brand-primary/10 text-brand-primary font-extrabold flex items-center justify-center">
        {(nama || '?').trim().charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-dark truncate">{nama}</p>
        {keterangan && <p className="text-xs text-[#808191] truncate">{keterangan}</p>}
      </div>
    </div>
  );
}

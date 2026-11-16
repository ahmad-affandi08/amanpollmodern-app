import React from 'react';

/** Kartu putih standar untuk satu bagian halaman detail: judul biasa (bukan kapital), tanpa warna tambahan. */
export default function DetailSection({ judul, aksi, children, className = '' }) {
  return (
    <section className={`bg-white rounded-[20px] p-5 shadow-[0px_10px_40px_rgba(29,22,23,0.04)] ${className}`}>
      {(judul || aksi) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-[15px] font-bold text-text-dark">{judul}</h2>
          {aksi}
        </div>
      )}
      {children}
    </section>
  );
}

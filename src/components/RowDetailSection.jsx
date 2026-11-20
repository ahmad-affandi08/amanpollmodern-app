import React from 'react';

/** Bagian panel detail baris tabel: judul berwarna dan daftar label/nilai sebaris, satu garis tipis antar baris. */
export default function RowDetailSection({ title, rows }) {
  return (
    <section>
      <h4 className="mb-1 text-xs font-bold text-brand-primary">{title}</h4>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className="flex h-9 items-center justify-between gap-3 border-b border-gray-100 text-xs text-text-dark last:border-b-0">
            <dt>{label}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

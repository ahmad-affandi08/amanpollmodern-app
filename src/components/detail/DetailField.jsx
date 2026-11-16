import React from 'react';

/** Pasangan label dan nilai untuk data baca-saja (bukan kotak form). Dipakai di dalam <dl>. */
export default function DetailField({ label, value, mono = false, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-[#808191] mb-0.5">{label}</dt>
      <dd className={`text-sm font-semibold text-text-dark break-words ${mono ? 'font-mono text-[13px]' : ''}`}>
        {children ?? (value || '-')}
      </dd>
    </div>
  );
}

/** Baris label di kiri dan nilai di kanan, untuk daftar pendek di layar sempit. Dipakai di dalam <dl>. */
export function DetailRow({ label, value, children }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-gray-100 first:pt-0 last:border-0 last:pb-0">
      <dt className="text-xs font-semibold text-[#808191] shrink-0 pt-0.5">{label}</dt>
      <dd className="text-sm font-semibold text-text-dark text-right break-words min-w-0">{children ?? (value || '-')}</dd>
    </div>
  );
}

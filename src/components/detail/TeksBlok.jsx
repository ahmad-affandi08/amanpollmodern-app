import React from 'react';

/** Blok teks baca-saja: label di atas, isi di kotak abu muda (untuk tindakan, rekomendasi, keterangan, dan sejenisnya). */
export default function TeksBlok({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-[#808191] mb-1">{label}</p>
      <p className="bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-text-dark whitespace-pre-line break-words">{children || '-'}</p>
    </div>
  );
}

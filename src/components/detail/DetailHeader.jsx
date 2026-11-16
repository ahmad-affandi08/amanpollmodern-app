import React from 'react';
import { ArrowLeft } from 'lucide-react';

/** Kepala halaman detail desktop: tombol kembali, judul, nomor dokumen, status, dan satu aksi utama. */
export default function DetailHeader({ judul, nomor, status, onBack, aksi }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="w-10 h-10 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center text-text-dark hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-text-dark">{judul}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {nomor && (
              <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">{nomor}</span>
            )}
            {status}
          </div>
        </div>
      </div>
      {aksi}
    </div>
  );
}

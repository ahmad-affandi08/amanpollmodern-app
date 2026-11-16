import React from 'react';
import { FileText } from 'lucide-react';

/** Tampilan bila data detail tidak ditemukan atau di luar cakupan pengguna. */
export default function DetailNotFound({ onBack, tombol = 'Kembali ke Daftar' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <FileText size={48} className="text-gray-300 mb-3" />
      <h3 className="text-lg font-bold text-text-dark mb-1">Data tidak ditemukan</h3>
      <p className="text-sm text-[#808191] mb-5">Laporan yang Anda cari tidak tersedia.</p>
      <button
        type="button"
        onClick={onBack}
        className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary/90 transition-colors"
      >
        {tombol}
      </button>
    </div>
  );
}

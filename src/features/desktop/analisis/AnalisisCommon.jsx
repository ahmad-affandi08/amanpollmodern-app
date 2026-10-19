import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

/** Tampilan saat data analisis dimuat pertama kali. */
export function AnalisisLoading({ text = 'Menganalisis data, mohon tunggu...' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[70vh]">
      <RefreshCw className="animate-spin text-brand-primary mb-4" size={32} />
      <p className="text-gray-500 font-medium">{text}</p>
    </div>
  );
}

/** Tampilan saat data analisis gagal dimuat (atau kosong), dengan tombol coba lagi. */
export function AnalisisError({ message = 'Gagal memuat data analisis.', onRetry, retrying = false }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <AlertTriangle className="text-red-400 mb-4" size={40} />
      <p className="text-gray-700 font-semibold mb-1">{message}</p>
      <p className="text-gray-500 text-sm mb-5">Periksa koneksi Anda, lalu coba lagi.</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors text-sm font-semibold disabled:opacity-60"
      >
        <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
        Coba Lagi
      </button>
    </div>
  );
}

/** Tombol "Segarkan Data": hanya ikonnya yang berputar, halaman tetap tampil. */
export function RefreshButton({ onClick, isFetching }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isFetching}
      className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm font-semibold disabled:opacity-60"
    >
      <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
      {isFetching ? 'Menyegarkan...' : 'Segarkan Data'}
    </button>
  );
}

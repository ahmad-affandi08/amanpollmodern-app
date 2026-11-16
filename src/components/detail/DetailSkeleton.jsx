import React from 'react';

/** Kerangka pemuatan sederhana untuk semua halaman detail (satu kolom di mobile, dua kolom di desktop). */
export default function DetailSkeleton({ dua = false }) {
  const blok = (tinggi) => <div className={`bg-white rounded-[20px] ${tinggi}`} />;

  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Memuat">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white" />
        <div className="space-y-2">
          <div className="h-5 w-56 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-200" />
        </div>
      </div>
      {dua ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-5">
          <div className="space-y-5">{blok('h-44')}{blok('h-40')}{blok('h-64')}</div>
          <div className="space-y-5">{blok('h-36')}{blok('h-44')}</div>
        </div>
      ) : (
        <div className="space-y-4">{blok('h-60')}{blok('h-40')}{blok('h-40')}{blok('h-52')}</div>
      )}
    </div>
  );
}

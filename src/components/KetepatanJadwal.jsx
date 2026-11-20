import React from 'react';
import { formatDateShort } from '../utils/format';
import { ketepatanJadwal } from '../utils/progres';

const TONE = {
  ok: 'bg-emerald-50 text-emerald-700',
  telat: 'bg-red-50 text-red-700',
  netral: 'bg-gray-100 text-gray-600',
};

/** Jadwal → tanggal periksa dalam satu sel, dengan penanda Tepat waktu / Terlambat / Lewat jadwal. */
export default function KetepatanJadwal({ jadwal, diperiksa, status }) {
  const nilai = ketepatanJadwal({ jadwal, diperiksa, status });

  return (
    <div>
      <p className="text-[13px] font-semibold leading-tight text-text-dark">
        {jadwal ? formatDateShort(jadwal) : 'Belum Ditentukan'}
        <span className="mx-1 font-normal text-text-gray">→</span>
        <span className={diperiksa ? '' : 'font-normal text-text-gray'}>{diperiksa ? formatDateShort(diperiksa) : 'belum'}</span>
      </p>
      {nilai && (
        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${TONE[nilai.tone]}`}>{nilai.label}</span>
      )}
    </div>
  );
}

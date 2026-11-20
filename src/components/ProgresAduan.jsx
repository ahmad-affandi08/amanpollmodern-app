import React from 'react';
import { progresAduan, LANGKAH_ADUAN } from '../utils/progres';
import { formatDateTime } from '../utils/format';

/**
 * Empat titik penanganan aduan (Masuk, Ditugaskan, Diperiksa, Selesai) dengan nama langkah terakhir di bawahnya.
 * Arahkan kursor ke titik untuk melihat tanggalnya.
 */
export default function ProgresAduan({ aduan }) {
  const { langkah, label, tanggal } = progresAduan(aduan);

  return (
    <div role="img" aria-label={`Progres penanganan: ${label}, langkah ${langkah} dari ${LANGKAH_ADUAN.length}`}>
      <div className="flex items-center">
        {LANGKAH_ADUAN.map((nama, i) => (
          <React.Fragment key={nama}>
            {i > 0 && <span className={`h-0.5 w-4 ${i < langkah ? 'bg-brand-primary' : 'bg-gray-200'}`} />}
            <span
              title={tanggal[i] ? `${nama}: ${formatDateTime(tanggal[i])}` : nama}
              className={`h-[11px] w-[11px] rounded-full ${i < langkah ? 'bg-brand-primary' : 'bg-gray-200'}`}
            />
          </React.Fragment>
        ))}
      </div>
      <p className="mt-1 text-[11px] leading-tight text-text-gray">{label}</p>
    </div>
  );
}

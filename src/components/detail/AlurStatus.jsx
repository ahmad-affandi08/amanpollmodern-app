import React from 'react';
import { Check } from 'lucide-react';

/**
 * Alur status horizontal (mis. Dilaporkan → Ditugaskan → Diperiksa → Selesai) dengan waktu tiap langkah.
 * langkah: [{ label, selesai, waktu, oleh }]
 */
export default function AlurStatus({ langkah }) {
  return (
    <ol className="flex">
      {langkah.map((l, i) => {
        const terakhir = i === langkah.length - 1;
        const berikutnyaSelesai = !terakhir && langkah[i + 1].selesai;

        return (
          <li key={l.label} className="flex-1 min-w-0">
            <div className="flex items-center">
              <span
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-2 ${
                  l.selesai ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-gray-200 text-transparent'
                }`}
              >
                <Check size={16} />
              </span>
              {!terakhir && <span className={`h-0.5 flex-1 mx-2 rounded ${berikutnyaSelesai ? 'bg-brand-primary' : 'bg-gray-200'}`} />}
            </div>
            <div className="mt-2.5 pr-3">
              <p className={`text-sm font-bold ${l.selesai ? 'text-text-dark' : 'text-[#808191]'}`}>{l.label}</p>
              <p className="text-xs text-[#808191]">{l.waktu}</p>
              {l.oleh && <p className="text-xs font-semibold text-text-dark truncate">{l.oleh}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

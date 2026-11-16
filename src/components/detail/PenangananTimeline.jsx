import React from 'react';
import StatusBadge from '../StatusBadge';
import KondisiBadge from '../KondisiBadge';
import noImage from '../../assets/img/no_image.png';

/**
 * Riwayat penanganan (aduan/pemeliharaan) sebagai garis waktu vertikal. Satu bentuk untuk desktop dan mobile:
 * kolom teks otomatis satu atau dua menurut lebar wadah.
 *
 * item: { key, judul, status, tanggal, bagian: [{ label, teks }], kondisi, ttd: [{ label, nama, gambar }] }
 * onPreview(gambar, alt): dipanggil saat tanda tangan diklik.
 */
export default function PenangananTimeline({ items, onPreview }) {
  return (
    <ol className="@container ml-2">
      {items.map((item) => (
        <li key={item.key} className="relative pl-6 pb-7 last:pb-0 border-l-2 border-gray-100 last:border-transparent">
          <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-primary ring-4 ring-white" />

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h3 className="text-sm font-bold text-text-dark">{item.judul}</h3>
            {item.status && <StatusBadge status={item.status} size="md" />}
            {item.tanggal && <span className="text-xs text-[#808191]">{item.tanggal}</span>}
          </div>

          {item.bagian.length > 0 && (
            <div className="grid grid-cols-1 @lg:grid-cols-2 gap-3 mt-3">
              {item.bagian.map((b) => (
                <div key={b.label} className="min-w-0">
                  <p className="text-xs font-semibold text-[#808191] mb-1">{b.label}</p>
                  <p className="bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-text-dark whitespace-pre-line break-words">{b.teks}</p>
                </div>
              ))}
            </div>
          )}

          {item.kondisi && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-semibold text-[#808191]">Kondisi alat</span>
              <KondisiBadge kondisi={item.kondisi} size="md" />
            </div>
          )}

          {item.ttd.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4 max-w-md">
              {item.ttd.map((t) => (
                <div key={t.label}>
                  <p className="text-xs font-semibold text-[#808191] mb-1">{t.label}</p>
                  <button
                    type="button"
                    onClick={() => onPreview?.(t.gambar, t.label)}
                    aria-label={`Perbesar ${t.label}`}
                    className="w-full h-20 rounded-xl border border-dashed border-gray-300 bg-white overflow-hidden cursor-zoom-in hover:border-brand-primary transition-colors"
                  >
                    <img
                      src={t.gambar}
                      alt={t.label}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => { e.currentTarget.src = noImage; }}
                    />
                  </button>
                  {t.nama && <p className="text-xs font-semibold text-text-dark mt-1 truncate">{t.nama}</p>}
                </div>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

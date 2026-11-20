import React from 'react';
import { rupiah, formatDateTime } from '../../../utils/format';
import RowDetailSection from '../../../components/RowDetailSection';
import noImage from '../../../assets/img/no_image.png';

const EMPTY = '-';
const tanggal = (value) => (value ? formatDateTime(value) : EMPTY);

/**
 * Isi baris aduan yang dibuka: keluhan lengkap dan semua kolom yang tidak muat di tabel ringkas.
 * Bentuk dan animasi sama dengan panel di daftar inventaris.
 */
export default function AduanRowDetail({ item, closing = false, onPreviewImage }) {
  return (
    <div className={`@container sticky left-4 grid w-[calc(100cqw-2rem)] whitespace-normal animate-row-expand transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${closing ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
      <div className="min-h-0 overflow-hidden">
        <div className="pb-4 pl-2 pt-1 lg:pl-11">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 @xl:grid-cols-2 @4xl:grid-cols-[9rem_1.3fr_1fr_1fr]">
            <button
              type="button"
              onClick={() => item.img_keluhan && onPreviewImage(item)}
              disabled={!item.img_keluhan}
              aria-label="Perbesar foto keluhan"
              className="h-28 w-36 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 disabled:cursor-default"
            >
              <img src={item.img_keluhan || noImage} alt="Foto keluhan" className={`h-full w-full object-cover ${item.img_keluhan ? '' : 'opacity-50'}`} onError={(e) => { e.target.src = noImage; }} />
            </button>

            <section>
              <h4 className="mb-1 text-xs font-bold text-brand-primary">Keluhan</h4>
              <p className="text-xs leading-relaxed text-text-dark">{item.keluhan || EMPTY}</p>
            </section>

            <RowDetailSection
              title="Pelapor & Lokasi"
              rows={[
                ['Pelapor', item.nama_pengadu || EMPTY],
                ['Divisi', item.divisi_nama || EMPTY],
                ['Ruangan', item.ruangan_nama || EMPTY],
                ['Gedung', item.gedung || EMPTY],
              ]}
            />

            <RowDetailSection
              title="Penanganan"
              rows={[
                ['Ditugaskan', tanggal(item.tanggal_penugasan)],
                ['Direspons', tanggal(item.tanggal_respon)],
                ['Diperiksa', tanggal(item.tanggal_pemeriksaan)],
                ['Tingkat kerusakan', item.tingkat_kerusakan || EMPTY],
                ['Biaya', parseFloat(item.biaya) > 0 ? rupiah(item.biaya) : EMPTY],
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

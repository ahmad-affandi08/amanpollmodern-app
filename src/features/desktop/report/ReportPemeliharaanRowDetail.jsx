import React from 'react';
import { rupiah, formatDateShort } from '../../../utils/format';
import RowDetailSection from '../../../components/RowDetailSection';

const EMPTY = '-';
const tanggal = (value) => (value ? formatDateShort(value) : EMPTY);
const teks = (value) => (value && value !== '-' ? value : EMPTY);

/**
 * Isi baris laporan pemeliharaan yang dibuka: hasil pemeriksaan, rekomendasi, dan kolom yang tidak muat di tabel
 * ringkas (merk, gedung, biaya, tanda tangan). Bentuk dan animasi sama dengan daftar inventaris.
 */
export default function ReportPemeliharaanRowDetail({ item, closing = false }) {
  return (
    <div className={`@container sticky left-4 grid w-[calc(100cqw-2rem)] whitespace-normal animate-row-expand transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${closing ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
      <div className="min-h-0 overflow-hidden">
        <div className="pb-4 pl-2 pt-1 lg:pl-11">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 @xl:grid-cols-2 @4xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div className="space-y-3">
              {[['Hasil pemeriksaan', item.keterangan_pemeliharaan], ['Rekomendasi', item.rekomendasi]].map(([judul, isi]) => (
                <section key={judul}>
                  <h4 className="mb-0.5 text-xs font-bold text-brand-primary">{judul}</h4>
                  <p className="text-xs leading-relaxed text-text-dark">{teks(isi)}</p>
                </section>
              ))}
            </div>

            <RowDetailSection
              title="Alat"
              rows={[
                ['Merk', teks(item.merk)],
                ['Model/Tipe', teks(item.model)],
                ['No. Seri', teks(item.seri)],
                ['Kondisi alat kini', teks(item.inventaris_kondisi_label)],
              ]}
            />

            <RowDetailSection
              title="Lokasi"
              rows={[
                ['Divisi', teks(item.divisi_nama)],
                ['Ruangan', teks(item.ruangan_nama)],
                ['Gedung', teks(item.gedung)],
              ]}
            />

            <RowDetailSection
              title="Pelaksanaan"
              rows={[
                ['Dijadwalkan', tanggal(item.jadwal_pemeliharaan)],
                ['Diperiksa', tanggal(item.tanggal_pemeriksaan)],
                ['Biaya', parseFloat(item.biaya) > 0 ? rupiah(item.biaya) : EMPTY],
                ['TTD teknisi / kepala ruang', `${item.status_ttd_teknisi === 'Sudah TTD' ? 'Sudah' : 'Belum'} / ${item.status_ttd_karu === 'Sudah TTD' ? 'Sudah' : 'Belum'}`],
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { rupiah, formatDateShort } from '../../../../utils/format';

const EMPTY = '-';

function Section({ title, rows }) {
  return (
    <section>
      <h4 className="mb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-brand-primary">{title}</h4>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className="flex h-9 items-center justify-between gap-3 border-b border-gray-100 text-xs text-text-dark last:border-b-0">
            <dt>{label}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const FileLink = ({ url }) =>
  url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
      Lihat <ExternalLink size={11} />
    </a>
  ) : EMPTY;

/**
 * Isi baris inventaris yang dibuka: semua kolom yang tidak muat di tabel ringkas, dikelompokkan per bagian.
 * Teks sengaja satu warna dan tanpa tebal; hanya judul bagian yang berwarna.
 */
export default function InventarisRowDetail({ item, closing = false, onPreviewQr }) {

  const harga = (value) => (parseFloat(value) > 0 ? rupiah(value) : EMPTY);
  const risiko = item.nama_alat?.tingkat_risiko;
  const skor = item.nama_alat?.skor_risiko;

  // Selebar area tabel yang terlihat dan menempel saat tabel digeser, supaya panel tidak terpotong di layar sempit.
  return (
    <div className={`@container sticky left-4 grid w-[calc(100cqw-2rem)] whitespace-normal animate-row-expand transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${closing ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
      {/* Padding ada di anak, bukan di wrapper yang menyusut: padding wrapper tidak ikut 0fr sehingga panel tersisa 20px lalu lompat saat dilepas */}
      <div className="min-h-0 overflow-hidden">
      <div className="pb-4 pl-2 pt-1 lg:pl-11">
      {/* Jumlah kolom mengikuti lebar panel (bukan lebar layar), karena sidebar ikut memakan ruang */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 @xl:grid-cols-2 @4xl:grid-cols-4">
        <Section
          title="Identitas"
          rows={[
            ['Divisi', item.nama_alat?.divisi?.nama_divisi || item.divisi?.nama_divisi || EMPTY],
            ['Merk', item.merk || EMPTY],
            ['Model/Tipe', item.model || EMPTY],
            ['No. Seri', item.seri || EMPTY],
            ['Daya (watt)', item.daya || EMPTY],
            ['Tingkat risiko', risiko ? `${risiko}${skor ? ` (${skor})` : ''}` : 'Belum dinilai'],
          ]}
        />
        <Section
          title="Lokasi"
          rows={[
            ['Bagian/Ruangan', item.ruangan?.nama_ruangan || EMPTY],
            ['Letak saat ini', item.ruangan_sekarang?.nama_ruangan || item.ruangan?.nama_ruangan || EMPTY],
            ['Gedung', item.gedung || EMPTY],
          ]}
        />
        <Section
          title="Pengadaan"
          rows={[
            ['Tahun', item.tahun_pengadaan || EMPTY],
            ['Harga', harga(item.harga)],
            ['Harga ganti (AIC)', harga(item.harga_pengganti)],
            ['Interval maintenance', item.interval_maintenance > 0 ? `${item.interval_maintenance}x / tahun` : EMPTY],
          ]}
        />
        <Section
          title="Kalibrasi & Dokumen"
          rows={[
            ['Berlaku hingga', formatDateShort(item.kadaluwarsa)],
            ['Sertifikat', <FileLink key="s" url={item.file_sertifikat_url} />],
            ['File SOP', <FileLink key="p" url={item.file_sop_url} />],
            [
              'QR Code',
              item.qrcode_url ? (
                <button type="button" onClick={onPreviewQr} className="inline-flex items-center gap-1 hover:underline">
                  Lihat <ExternalLink size={11} />
                </button>
              ) : EMPTY,
            ],
          ]}
        />
      </div>
      </div>
      </div>
    </div>
  );
}

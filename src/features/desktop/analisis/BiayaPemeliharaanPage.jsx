import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, PieChart as PieChartIcon, TrendingUp, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { rupiah, formatNumber } from '../../../utils/format';
import { usePageTitle } from '../../../hooks';
import DataTable from '../../../components/DataTable';
import SegmentTabs from '../../../components/SegmentTabs';
import { useAnalisisBiaya } from '../../../hooks/queries/useAnalisisQueries';
import { AnalisisPage, AnalisisStat, AnalisisPanel, AnalisisChart, DaftarProporsi } from './AnalisisCommon';
import { useAnalisisFilter, selisih, gabung, TOOLTIP_STYLE, AXIS_TICK } from './analisisUtil';

const topBiayaColumns = [
  { id: 'tanggal', header: 'Tanggal', meta: { cellClassName: 'text-gray-500' }, cell: ({ row }) => row.original.tanggal },
  { id: 'jenis', header: 'Jenis', meta: { cellClassName: 'text-gray-500 text-xs' }, cell: ({ row }) => row.original.jenis },
  { id: 'no_aduan', header: 'Nomor', meta: { cellClassName: 'font-mono text-gray-600' }, cell: ({ row }) => row.original.no_aduan },
  { id: 'nama_alat', header: 'Alat', meta: { cellClassName: 'font-semibold text-gray-800 max-w-[200px] truncate' }, cell: ({ row }) => row.original.nama_alat },
  { id: 'biaya', header: 'Biaya', meta: { align: 'right' }, cell: ({ row }) => <span className="text-red-600 font-bold">{rupiah(row.original.biaya)}</span> },
];

const kandidatColumns = [
  { id: 'no_inventaris', header: 'No. Inventaris', meta: { cellClassName: 'font-semibold' }, cell: ({ row: { original: a } }) => (
    <Link to={`/inventaris/detail/${a.id}`} className="text-brand-primary hover:underline">{a.no_inventaris}</Link>
  ) },
  { id: 'nama_alat', header: 'Alat', cell: ({ row }) => row.original.nama_alat },
  { id: 'umur', header: 'Umur', meta: { align: 'center', cellClassName: 'text-gray-500' }, cell: ({ row }) => (row.original.umur_tahun === null ? '-' : `${row.original.umur_tahun} th`) },
  { id: 'biaya_total', header: 'Total Biaya Perbaikan', meta: { align: 'right' }, cell: ({ row }) => rupiah(row.original.biaya_total) },
  { id: 'harga_acuan', header: 'Harga Pengganti', meta: { align: 'right', cellClassName: 'text-gray-500' }, cell: ({ row }) => rupiah(row.original.harga_acuan) },
  { id: 'rasio', header: 'Rasio', meta: { align: 'right' }, cell: ({ row: { original: a } }) => (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${a.rasio >= 100 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{a.rasio}%</span>
  ) },
];

// Angka ringkas di kartu (Rp 18,5 M), angka lengkap di bawahnya: sama dengan kartu di Dashboard dan tidak terpotong di layar sempit.
const rupiahRingkas = (nilai) => `Rp ${(Number(nilai) || 0).toLocaleString('id-ID', { notation: 'compact', maximumFractionDigits: 1 })}`;

const DIMENSI = [
  { value: 'per_divisi', label: 'Divisi' },
  { value: 'per_ruangan', label: 'Ruangan' },
  { value: 'per_merk', label: 'Merk' },
];

/** Biaya menurut divisi, ruangan, atau merk (8 terbesar). Komponen sendiri karena menyimpan tab terpilih. */
function BiayaPerDimensi({ data }) {
  const [dimensi, setDimensi] = useState('per_divisi');
  return (
    <AnalisisPanel title="Biaya Menurut" description="Ke mana biaya perbaikan dan pemeliharaan periode ini terpakai.">
      <SegmentTabs tabs={DIMENSI} value={dimensi} onChange={setDimensi} ariaLabel="Kelompokkan biaya menurut" className="mb-4" />
      <DaftarProporsi
        items={data[dimensi].map((b) => ({ name: b.nama, value: b.biaya }))}
        format={rupiah}
        kosong="Belum ada biaya tercatat pada periode ini."
      />
    </AnalisisPanel>
  );
}

export default function BiayaPemeliharaanPage() {
  usePageTitle('Analisis Biaya Pemeliharaan');
  const filter = useAnalisisFilter();
  const query = useAnalisisBiaya(filter);

  return (
    <AnalisisPage
      title="Analisis Biaya Pemeliharaan"
      description="Total Cost of Ownership (TCO), pengeluaran perbaikan alat, dan alat yang sebaiknya diganti."
      filter={filter}
      query={query}
      loadingText="Menganalisis pengeluaran biaya, mohon tunggu..."
      errorText="Gagal mengambil data biaya."
      ekspor={{
        nama: 'Analisis_Biaya_Pemeliharaan',
        bagian: (d) => [
          { judul: 'Ringkasan', kolom: ['Indikator', 'Nilai'], baris: [
            ['Total nilai aset', d.total_aset], ['Total biaya', d.total_biaya], ['Biaya aduan', d.biaya_aduan],
            ['Biaya pemeliharaan', d.biaya_pemeliharaan], ['Rasio TCO (%)', d.tco_percentage],
          ] },
          { judul: 'Tren biaya', kolom: ['Bulan', 'Aduan', 'Pemeliharaan', 'Total'], baris: d.trend_biaya.map((t) => [t.label, t.aduan, t.pemeliharaan, t.biaya]) },
          { judul: 'Biaya termahal', kolom: ['Tanggal', 'Jenis', 'Nomor', 'Alat', 'Biaya'], baris: d.top_biaya.map((t) => [t.tanggal, t.jenis, t.no_aduan, t.nama_alat, t.biaya]) },
          { judul: 'Biaya per divisi', kolom: ['Divisi', 'Biaya'], baris: d.per_divisi.map((b) => [b.nama, b.biaya]) },
          { judul: 'Biaya per ruangan', kolom: ['Ruangan', 'Biaya'], baris: d.per_ruangan.map((b) => [b.nama, b.biaya]) },
          { judul: 'Biaya per merk', kolom: ['Merk', 'Biaya'], baris: d.per_merk.map((b) => [b.nama, b.biaya]) },
          { judul: 'Kandidat penggantian', kolom: ['No. Inventaris', 'Alat', 'Umur (tahun)', 'Total biaya perbaikan', 'Harga pengganti', 'Rasio (%)'], baris: d.kandidat_ganti.map((a) => [a.no_inventaris, a.nama_alat, a.umur_tahun, a.biaya_total, a.harga_acuan, a.rasio]) },
        ],
      }}
    >
      {(data) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <AnalisisStat tone="blue" icon={PieChartIcon} title="Total Nilai Aset" value={rupiahRingkas(data.total_aset)} subValue={rupiah(data.total_aset)} />
            <AnalisisStat
              tone="red" icon={TrendingUp} title="Total Biaya Periode Ini" value={rupiahRingkas(data.total_biaya)}
              subValue={gabung(selisih(data.total_biaya, data.total_biaya_sebelumnya), rupiah(data.total_biaya))}
            />
            <AnalisisStat tone="orange" icon={DollarSign} title="Rasio TCO" value={`${data.tco_percentage}%`} subValue="Biaya periode ini terhadap nilai aset" />
            <AnalisisStat
              tone="purple" icon={Layers} title="Aduan / Pemeliharaan" value={rupiahRingkas(data.biaya_aduan)}
              subValue={`Pemeliharaan ${rupiahRingkas(data.biaya_pemeliharaan)}`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalisisPanel title="Tren Pengeluaran Biaya" description="Dicatat pada bulan pekerjaan selesai.">
              <AnalisisChart tinggi={350} kosong={!data.trend_biaya.some((t) => t.biaya > 0)}>
                <BarChart data={data.trend_biaya} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(value) => `Rp ${formatNumber(value / 1000000)} jt`} />
                  <Tooltip formatter={(value, nama) => [rupiah(value), nama]} cursor={{ fill: '#f9fafb' }} contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="aduan" stackId="biaya" fill="#6C5DD3" name="Aduan" />
                  <Bar dataKey="pemeliharaan" stackId="biaya" fill="#FFAF4E" name="Pemeliharaan" radius={[4, 4, 0, 0]} />
                </BarChart>
              </AnalisisChart>
            </AnalisisPanel>

            <AnalisisPanel title="Top 10 Biaya Perbaikan Termahal" className="flex flex-col">
              {data.top_biaya.length ? (
                <DataTable columns={topBiayaColumns} data={data.top_biaya.map((item, i) => ({ ...item, urutan: i }))} getRowId={(item) => item.urutan} />
              ) : (
                <p className="text-xs text-gray-400 py-6 text-center">Belum ada biaya tercatat pada periode ini.</p>
              )}
            </AnalisisPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <BiayaPerDimensi data={data} />

            <AnalisisPanel
              className="lg:col-span-2 flex flex-col"
              title="Kandidat Diganti, Bukan Diperbaiki Lagi"
              description="Alat yang total biaya perbaikannya sudah separuh atau lebih dari harga pengganti (harga beli bila harga pengganti belum diisi). Dihitung dari seluruh riwayat, bukan hanya periode ini."
            >
              {data.kandidat_ganti.length ? (
                <DataTable columns={kandidatColumns} data={data.kandidat_ganti} getRowId={(a) => a.id} />
              ) : (
                <p className="text-xs text-gray-400 py-6 text-center">Belum ada alat yang biaya perbaikannya mendekati harga penggantinya.</p>
              )}
            </AnalisisPanel>
          </div>
        </>
      )}
    </AnalisisPage>
  );
}

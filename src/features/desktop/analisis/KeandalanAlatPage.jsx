import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, AlertTriangle, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Cell } from 'recharts';
import { usePageTitle } from '../../../hooks';
import DataTable from '../../../components/DataTable';
import { useAnalisisKeandalan } from '../../../hooks/queries/useAnalisisQueries';
import { formatDate, formatNumber } from '../../../utils/format';
import { AnalisisPage, AnalisisStat, AnalisisPanel, AnalisisChart, DaftarProporsi } from './AnalisisCommon';
import { useAnalisisFilter, selisih, gabung, TOOLTIP_STYLE, AXIS_TICK, warnaKe } from './analisisUtil';

const berulangColumns = [
  { id: 'no_inventaris', header: 'No. Inventaris', meta: { cellClassName: 'font-semibold' }, cell: ({ row: { original: a } }) => (
    <Link to={`/inventaris/detail/${a.id}`} className="text-brand-primary hover:underline">{a.no_inventaris}</Link>
  ) },
  { id: 'nama_alat', header: 'Alat', cell: ({ row }) => row.original.nama_alat },
  { id: 'ruangan', header: 'Ruangan', meta: { cellClassName: 'text-gray-500' }, cell: ({ row }) => row.original.ruangan },
  { id: 'total_aduan', header: 'Aduan', meta: { align: 'center' }, cell: ({ row }) => (
    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-100">{row.original.total_aduan}</span>
  ) },
  { id: 'terakhir', header: 'Terakhir', meta: { align: 'right', cellClassName: 'text-gray-500' }, cell: ({ row }) => formatDate(row.original.terakhir) },
];

export default function KeandalanAlatPage() {
  usePageTitle('Analisis Keandalan Alat');
  const filter = useAnalisisFilter();
  const query = useAnalisisKeandalan(filter);

  return (
    <AnalisisPage
      title="Analisis Keandalan Alat"
      description="Frekuensi kerusakan, kecepatan respons dan penyelesaian, serta alat yang berulang kali bermasalah."
      filter={filter}
      denganKategori
      query={query}
      loadingText="Menganalisis data, mohon tunggu..."
      errorText="Gagal mengambil data analitik."
      ekspor={{
        nama: 'Analisis_Keandalan_Alat',
        bagian: (d) => [
          { judul: 'Ringkasan', kolom: ['Indikator', 'Nilai'], baris: [
            ['Total aduan', d.total_aduan], ['Total alat', d.total_alat], ['MTBF (hari)', d.mtbf_days],
            ['Rata-rata waktu penyelesaian (hari)', d.avg_downtime_days], ['Median waktu penyelesaian (hari)', d.median_downtime_days],
            ['Rata-rata respons (jam)', d.avg_respon_jam], ['Aduan direspons dalam 24 jam (%)', d.persen_respon_24j],
          ] },
          { judul: 'Jenis alat sering rusak', kolom: ['Alat', 'Aduan', 'Jumlah unit', 'Aduan per unit'], baris: d.top_broken.map((t) => [t.nama_alat, t.total_aduan, t.total_unit, t.aduan_per_unit]) },
          { judul: 'Alat diadukan berulang', kolom: ['No. Inventaris', 'Alat', 'Ruangan', 'Aduan', 'Terakhir'], baris: d.alat_berulang.map((a) => [a.no_inventaris, a.nama_alat, a.ruangan, a.total_aduan, a.terakhir]) },
          { judul: 'Tren aduan', kolom: ['Bulan', 'Aduan'], baris: d.trend_aduan.map((t) => [t.label, t.total]) },
        ],
      }}
    >
      {(data) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <AnalisisStat tone="blue" icon={Activity} title="Rata-rata MTBF" value={`${data.mtbf_days} Hari`} subValue="Rata-rata hari antar kerusakan per alat" />
            <AnalisisStat
              tone="orange" icon={Clock} title="Waktu Penyelesaian" value={`${data.avg_downtime_days} Hari`}
              subValue={gabung(`Median ${data.median_downtime_days} hari`, `${formatNumber(data.jumlah_selesai)} aduan selesai`)}
            />
            <AnalisisStat
              tone="green" icon={Zap} title="Direspons dalam 24 Jam"
              value={data.persen_respon_24j === null ? '-' : `${data.persen_respon_24j}%`}
              subValue={data.jumlah_respon ? gabung(`Rata-rata ${data.avg_respon_jam} jam`, `${formatNumber(data.jumlah_respon)} aduan`) : 'Belum ada respons tercatat'}
            />
            <AnalisisStat
              tone="red" icon={AlertTriangle} title="Total Aduan" value={`${formatNumber(data.total_aduan)} Insiden`}
              subValue={gabung(selisih(data.total_aduan, data.total_aduan_sebelumnya), `dari ${formatNumber(data.total_alat)} inventaris`)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalisisPanel title="Jenis Alat Sering Rusak (Top 10)" description="Dihitung per jenis alat; arahkan kursor untuk melihat jumlah unit dan aduan per unit.">
              <AnalisisChart kosong={!data.top_broken.length}>
                <BarChart data={data.top_broken} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f3f4f6" />
                  <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
                  <YAxis dataKey="nama_alat" type="category" width={150} tick={{ fontSize: 12, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value, _nama, item) => [`${value} aduan dari ${item.payload.total_unit} unit (${item.payload.aduan_per_unit ?? '-'} per unit)`, 'Total']}
                  />
                  <Bar dataKey="total_aduan" radius={[0, 4, 4, 0]} barSize={20} name="Total Aduan">
                    {data.top_broken.map((a, i) => <Cell key={i} fill={warnaKe(i)} />)}
                  </Bar>
                </BarChart>
              </AnalisisChart>
            </AnalisisPanel>

            <AnalisisPanel title="Tren Insiden">
              <AnalisisChart kosong={!data.trend_aduan.some((t) => t.total > 0)}>
                <LineChart data={data.trend_aduan} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} dy={10} />
                  <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="total" stroke="#3F8CFF" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Jumlah Aduan Masuk" />
                </LineChart>
              </AnalisisChart>
            </AnalisisPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <AnalisisPanel
              className="lg:col-span-2 flex flex-col"
              title="Alat Diadukan Berulang"
              description="Unit yang diadukan 2 kali atau lebih pada periode ini: kandidat pemeriksaan menyeluruh atau penggantian."
            >
              {data.alat_berulang.length ? (
                <DataTable columns={berulangColumns} data={data.alat_berulang} getRowId={(a) => a.id} />
              ) : (
                <p className="text-xs text-gray-400 py-6 text-center">Tidak ada alat yang diadukan berulang pada periode ini.</p>
              )}
            </AnalisisPanel>

            <div className="flex flex-col gap-4">
              <AnalisisPanel title="Tingkat Kerusakan" description="Penilaian teknisi pada aduan periode ini.">
                <DaftarProporsi items={data.distribusi_kerusakan} warna="#f59e0b" kosong="Belum ada aduan yang dinilai." />
              </AnalisisPanel>
              <AnalisisPanel title="Kondisi Alat Saat Ini">
                <DaftarProporsi items={data.distribusi_kondisi} warna="#22c55e" />
              </AnalisisPanel>
            </div>
          </div>
        </>
      )}
    </AnalisisPage>
  );
}

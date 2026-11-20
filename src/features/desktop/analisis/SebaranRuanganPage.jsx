import React from 'react';
import { AlertCircle, Package, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { usePageTitle } from '../../../hooks';
import DataTable from '../../../components/DataTable';
import { useAnalisisRuangan } from '../../../hooks/queries/useAnalisisQueries';
import { formatNumber } from '../../../utils/format';
import { AnalisisPage, AnalisisStat, AnalisisPanel, AnalisisChart } from './AnalisisCommon';
import { useAnalisisFilter, selisih, gabung, TOOLTIP_STYLE, AXIS_TICK, warnaKe } from './analisisUtil';

// Satu keluarga warna (ungu brand, makin muda untuk peringkat bawah): urutan ruangan tidak punya makna warna.

const rincianColumns = [
  { id: 'nama_ruangan', header: 'Ruangan', meta: { cellClassName: 'font-semibold' }, cell: ({ row }) => row.original.nama_ruangan },
  { id: 'total_aduan', header: 'Aduan', meta: { align: 'center' }, cell: ({ row }) => row.original.total_aduan },
  { id: 'total_alat', header: 'Jumlah Alat', meta: { align: 'center', cellClassName: 'text-gray-500' }, cell: ({ row }) => row.original.total_alat },
  { id: 'aduan_per_alat', header: 'Aduan per Alat', meta: { align: 'right' }, cell: ({ row: { original: r } }) => (
    <span className={`font-semibold ${r.aduan_per_alat >= 1 ? 'text-red-600' : 'text-gray-700'}`}>{r.aduan_per_alat ?? '-'}</span>
  ) },
  { id: 'persentase', header: 'Porsi', meta: { align: 'right', cellClassName: 'text-gray-500' }, cell: ({ row }) => `${row.original.persentase}%` },
];

export default function SebaranRuanganPage() {
  usePageTitle('Analisis Sebaran Ruangan');
  const filter = useAnalisisFilter();
  const query = useAnalisisRuangan(filter);

  return (
    <AnalisisPage
      title="Analisis Sebaran Ruangan"
      description="Asal ruang laporan kerusakan untuk mengidentifikasi area dengan risiko tinggi."
      filter={filter}
      query={query}
      loadingText="Memetakan data ruangan, mohon tunggu..."
      errorText="Gagal mengambil data sebaran."
      ekspor={{
        nama: 'Analisis_Sebaran_Ruangan',
        bagian: (d) => [
          { judul: 'Ruangan dengan aduan terbanyak', kolom: ['Ruangan', 'Aduan', 'Jumlah alat', 'Aduan per alat', 'Porsi (%)'], baris: d.sebaran_aduan.map((r) => [r.nama_ruangan, r.total_aduan, r.total_alat, r.aduan_per_alat, r.persentase]) },
          { judul: 'Ruangan dengan alat terbanyak', kolom: ['Ruangan', 'Jumlah alat'], baris: d.sebaran_alat.map((r) => [r.nama_ruangan, r.total_alat]) },
        ],
      }}
    >
      {(data) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnalisisStat
              tone="red" icon={AlertCircle} title="Total Laporan Kerusakan" value={formatNumber(data.total_aduan)}
              subValue={gabung(selisih(data.total_aduan, data.total_aduan_sebelumnya), 'Keseluruhan insiden aduan')}
            />
            <AnalisisStat tone="green" icon={Package} title="Total Populasi Alat" value={formatNumber(data.total_inventaris)} subValue="Alat terdaftar di sistem" />
            <AnalisisStat tone="blue" icon={BarChart2} title="Aduan per Ruangan Aktif" value={data.avg_aduan_per_ruangan} subValue="Rata-rata aduan per ruangan yang pernah melapor" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <AnalisisPanel className="lg:col-span-2" title="Zona Kritis (Top 15 Ruangan)" description="Ruangan dengan frekuensi laporan kerusakan alat paling tinggi.">
              <AnalisisChart tinggi={400} kosong={!data.sebaran_aduan.length}>
                <BarChart data={data.sebaran_aduan} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f3f4f6" />
                  <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
                  <YAxis dataKey="nama_ruangan" type="category" width={150} tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="total_aduan" radius={[0, 4, 4, 0]} barSize={16} name="Total Aduan">
                    {data.sebaran_aduan.map((r, i) => <Cell key={r.ruangan_id ?? i} fill={warnaKe(i)} />)}
                  </Bar>
                </BarChart>
              </AnalisisChart>
            </AnalisisPanel>

            <div className="flex flex-col gap-4">
              <AnalisisPanel title="Distribusi Kerusakan">
                <AnalisisChart tinggi={220} kosong={!data.sebaran_aduan.length}>
                  <PieChart>
                    <Pie data={data.sebaran_aduan.slice(0, 5)} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="total_aduan" nameKey="nama_ruangan">
                      {data.sebaran_aduan.slice(0, 5).map((entry, index) => (
                        <Cell key={entry.ruangan_id ?? index} fill={warnaKe(index)} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </AnalisisChart>
              </AnalisisPanel>

              <AnalisisPanel title="Top 5 Ruangan Terpadat (Alat)" className="flex-1">
                <div className="space-y-3">
                  {data.sebaran_alat.map((room, idx) => (
                    <div key={`${room.nama_ruangan}-${idx}`} className="flex justify-between items-center gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 shrink-0 rounded-full bg-brand-primary/10 text-brand-primary flex justify-center items-center text-xs font-bold">{idx + 1}</div>
                        <span className="text-xs font-semibold text-text-dark truncate">{room.nama_ruangan}</span>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-text-dark bg-gray-100 px-2.5 py-1 rounded-full">{room.total_alat} Alat</span>
                    </div>
                  ))}
                </div>
              </AnalisisPanel>
            </div>
          </div>

          <AnalisisPanel title="Rincian Ruangan" description="Aduan dibandingkan jumlah alat di ruangan itu: ruangan kecil dengan banyak aduan per alat lebih mendesak daripada ruangan besar dengan aduan yang sama.">
            {data.sebaran_aduan.length ? (
              <DataTable columns={rincianColumns} data={data.sebaran_aduan} getRowId={(r) => r.ruangan_id ?? 'tanpa-ruangan'} />
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">Belum ada aduan pada periode ini.</p>
            )}
          </AnalisisPanel>
        </>
      )}
    </AnalisisPage>
  );
}

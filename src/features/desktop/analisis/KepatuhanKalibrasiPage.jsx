import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarClock, AlertTriangle, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { usePageTitle } from '../../../hooks';
import DataTable from '../../../components/DataTable';
import { useAnalisisKalibrasi } from '../../../hooks/queries/useAnalisisQueries';
import { formatDate, formatNumber } from '../../../utils/format';
import { AnalisisPage, AnalisisStat, AnalisisPanel, AnalisisChart } from './AnalisisCommon';
import { useAnalisisFilter, TOOLTIP_STYLE, AXIS_TICK, warnaKe } from './analisisUtil';

const tindakanColumns = [
  { id: 'no_inventaris', header: 'No. Inventaris', meta: { cellClassName: 'font-semibold' }, cell: ({ row: { original: a } }) => (
    <Link to={`/inventaris/detail/${a.id}`} className="text-brand-primary hover:underline">{a.no_inventaris}</Link>
  ) },
  { id: 'nama_alat', header: 'Alat', cell: ({ row }) => row.original.nama_alat },
  { id: 'ruangan', header: 'Ruangan', meta: { cellClassName: 'text-gray-500' }, cell: ({ row }) => row.original.ruangan },
  { id: 'kadaluwarsa', header: 'Kedaluwarsa', meta: { cellClassName: 'text-gray-500' }, cell: ({ row }) => formatDate(row.original.kadaluwarsa) },
  { id: 'sisa', header: 'Status', meta: { align: 'right' }, cell: ({ row: { original: a } }) => (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${a.status === 'Expired' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
      {a.sisa_hari < 0 ? `Lewat ${Math.abs(a.sisa_hari)} hari` : a.sisa_hari === 0 ? 'Hari ini' : `${a.sisa_hari} hari lagi`}
    </span>
  ) },
];

export default function KepatuhanKalibrasiPage() {
  usePageTitle('Analisis Kepatuhan Kalibrasi');
  const filter = useAnalisisFilter();
  const query = useAnalisisKalibrasi(filter);

  return (
    <AnalisisPage
      title="Analisis Kepatuhan Kalibrasi"
      description="Status kedaluwarsa kalibrasi alat dan prediksi kedaluwarsa ke depan. Keadaan saat ini, tidak mengikuti periode."
      denganPeriode={false}
      filter={filter}
      query={query}
      loadingText="Mengecek status kalibrasi, mohon tunggu..."
      errorText="Gagal mengambil data kalibrasi."
      ekspor={{
        nama: 'Analisis_Kepatuhan_Kalibrasi',
        bagian: (d) => [
          { judul: 'Status kalibrasi', kolom: ['Status', 'Jumlah alat'], baris: d.kepatuhan.map((k) => [k.name, k.value]) },
          { judul: 'Alat yang perlu ditindak', kolom: ['No. Inventaris', 'Alat', 'Ruangan', 'Kedaluwarsa', 'Sisa hari'], baris: d.perlu_tindakan.map((a) => [a.no_inventaris, a.nama_alat, a.ruangan, a.kadaluwarsa, a.sisa_hari]) },
          { judul: 'Prediksi kedaluwarsa 12 bulan', kolom: ['Bulan', 'Jumlah alat'], baris: d.expiring_trend.map((t) => [t.label, t.total]) },
        ],
      }}
    >
      {(data) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <AnalisisStat tone="red" icon={AlertTriangle} title="Status Expired" value={`${formatNumber(data.expired_count)} Alat`} subValue="Tindakan segera diperlukan" />
            <AnalisisStat tone="orange" icon={CalendarClock} title="Mendekati Expired" value={`${formatNumber(data.warning_count)} Alat`} subValue="Dalam 30 hari ke depan" />
            <AnalisisStat
              tone="green" icon={ShieldCheck} title="Kalibrasi Masih Berlaku"
              value={data.persen_berlaku === null ? '-' : `${data.persen_berlaku}%`}
              subValue={`Dari alat yang tanggalnya sudah diisi, total ${formatNumber(data.total_alat)} inventaris`}
            />
            <AnalisisStat tone="blue" icon={HelpCircle} title="Belum Diset" value={`${formatNumber(data.belum_diset)} Alat`} subValue="Tanggal kedaluwarsa belum diisi" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalisisPanel className="flex flex-col" title="Tingkat Kepatuhan (Compliance)" description="Sebaran alat menurut status kalibrasinya.">
              <AnalisisChart kosong={!data.total_alat} teks="Belum ada alat terdaftar.">
                <PieChart>
                  <Pie data={data.kepatuhan} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                    {data.kepatuhan.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" />
                </PieChart>
              </AnalisisChart>
            </AnalisisPanel>

            <AnalisisPanel title="Prediksi Kedaluwarsa (12 Bulan Kedepan)" description="Jumlah alat yang kalibrasinya akan habis tiap bulan, berguna untuk persiapan anggaran.">
              <AnalisisChart kosong={!data.expiring_trend.some((t) => t.total > 0)} teks="Tidak ada kalibrasi yang habis dalam 12 bulan ke depan.">
                <BarChart data={data.expiring_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={20} name="Jumlah Alat">
                    {data.expiring_trend.map((t, i) => <Cell key={i} fill={warnaKe(i)} />)}
                  </Bar>
                </BarChart>
              </AnalisisChart>
            </AnalisisPanel>
          </div>

          <AnalisisPanel
            title="Alat yang Perlu Ditindak"
            description={data.jumlah_perlu_tindakan > 0
              ? `${formatNumber(data.jumlah_perlu_tindakan)} alat sudah kedaluwarsa atau habis dalam 30 hari${data.jumlah_perlu_tindakan > data.perlu_tindakan.length ? `, ${data.perlu_tindakan.length} yang paling lama ditampilkan` : ''}.`
              : 'Tidak ada alat yang kedaluwarsa atau akan habis dalam 30 hari.'}
          >
            {data.perlu_tindakan.length > 0 && <DataTable columns={tindakanColumns} data={data.perlu_tindakan} getRowId={(a) => a.id} />}
          </AnalisisPanel>
        </>
      )}
    </AnalisisPage>
  );
}

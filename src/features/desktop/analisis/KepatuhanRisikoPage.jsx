import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { usePageTitle } from '../../../hooks';
import DataTable from '../../../components/DataTable';
import { useAnalisisRisiko } from '../../../hooks/queries/useAnalisisQueries';
import RisikoBadge from '../../../components/RisikoBadge';
import { AnalisisPage, AnalisisPanel, AnalisisChart } from './AnalisisCommon';
import { useAnalisisFilter, TOOLTIP_STYLE, AXIS_TICK } from './analisisUtil';
import { formatNumber } from '../../../utils/format';

const TIER_COLOR = { Tinggi: '#ef4444', Sedang: '#f59e0b', Rendah: '#22c55e' };
const KALIBRASI_STYLE = {
  Kedaluwarsa: 'text-red-600 font-semibold',
  'Belum diset': 'text-gray-400',
  Valid: 'text-emerald-600',
};

const terlambatColumns = [
  { id: 'no_inventaris', header: 'No. Inventaris', meta: { cellClassName: 'font-semibold' }, cell: ({ row: { original: a } }) => (
    <Link to={`/inventaris/detail/${a.id}`} className="text-brand-primary hover:underline">{a.no_inventaris || '-'}</Link>
  ) },
  { id: 'nama_alat', header: 'Nama Alat', cell: ({ row }) => row.original.nama_alat },
  { id: 'risiko', header: 'Risiko', cell: ({ row }) => <RisikoBadge tingkat={row.original.tingkat} size="sm" /> },
  { id: 'pm', header: 'PM', cell: ({ row: { original: a } }) => `${a.realisasi_pm} / ${a.target_pm}` },
  { id: 'kalibrasi', header: 'Kalibrasi', meta: { cellClassName: 'text-xs' }, cell: ({ row: { original: a } }) => (
    <span className={KALIBRASI_STYLE[a.kalibrasi] || ''}>{a.kalibrasi}</span>
  ) },
];

export default function KepatuhanRisikoPage() {
  usePageTitle('Analisis Kepatuhan PM per Risiko');
  const filter = useAnalisisFilter();
  const query = useAnalisisRisiko(filter);

  return (
    <AnalisisPage
      title="Kepatuhan PM per Tingkat Risiko"
      description={`Tahun ${query.data?.tahun ?? new Date().getFullYear()}: target pemeliharaan preventif sesuai pedoman (Tinggi 2x, Sedang dan Rendah 1x per tahun) dibanding yang sudah selesai.`}
      denganPeriode={false}
      filter={filter}
      query={query}
      loadingText="Menghitung kepatuhan pemeliharaan, mohon tunggu..."
      errorText="Gagal mengambil data kepatuhan risiko."
      ekspor={{
        nama: 'Analisis_Kepatuhan_PM_Risiko',
        bagian: (d) => [
          { judul: `Kepatuhan PM tahun ${d.tahun}`, kolom: ['Tingkat risiko', 'Jumlah alat', 'Target PM', 'PM terlaksana', 'Terlaksana (%)', 'Alat memenuhi target', 'Kalibrasi valid', 'Kalibrasi kedaluwarsa', 'Kalibrasi belum diset'],
            baris: d.tingkat.map((t) => [t.tingkat, t.unit, t.target_pm, t.realisasi_pm, t.persen_pm, t.unit_patuh_pm, t.kalibrasi_valid, t.kalibrasi_kedaluwarsa, t.kalibrasi_belum]) },
          { judul: 'Alat belum memenuhi target PM', kolom: ['No. Inventaris', 'Alat', 'Risiko', 'Target PM', 'PM terlaksana', 'Kalibrasi'],
            baris: d.terlambat.map((a) => [a.no_inventaris, a.nama_alat, a.tingkat, a.target_pm, a.realisasi_pm, a.kalibrasi]) },
        ],
      }}
    >
      {(data) => {
        const chartData = data.tingkat.map((t) => ({ name: t.tingkat, Target: t.target_pm, Terlaksana: t.realisasi_pm }));

        return (
          <>
            {data.belum_dinilai > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800">
                <AlertTriangle size={16} />
                <span>
                  {formatNumber(data.belum_dinilai)} alat belum dinilai risikonya sehingga tidak masuk perhitungan.{' '}
                  <Link to="/risiko" className="font-semibold underline">Nilai sekarang</Link>
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.tingkat.map((t) => (
                <div key={t.tingkat} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <RisikoBadge tingkat={t.tingkat} />
                    <span className="text-xs text-gray-500">{formatNumber(t.unit)} alat</span>
                  </div>
                  <div>
                    <div className="flex items-end justify-between mb-1">
                      <span className="text-xs font-medium text-[#92929D]">PM terlaksana</span>
                      <span className="text-2xl font-bold text-text-dark">{t.persen_pm === null ? '-' : `${t.persen_pm}%`}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${t.persen_pm ?? 0}%`, backgroundColor: TIER_COLOR[t.tingkat] }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t.realisasi_pm} dari {t.target_pm} kali PM · {t.unit_patuh_pm}/{t.unit} alat memenuhi target</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-gray-100">
                    <div><p className="text-lg font-bold text-emerald-600">{t.kalibrasi_valid}</p><p className="text-[10px] text-gray-500">Kalibrasi valid</p></div>
                    <div><p className="text-lg font-bold text-red-600">{t.kalibrasi_kedaluwarsa}</p><p className="text-[10px] text-gray-500">Kedaluwarsa</p></div>
                    <div><p className="text-lg font-bold text-gray-500">{t.kalibrasi_belum}</p><p className="text-[10px] text-gray-500">Belum diset</p></div>
                  </div>
                </div>
              ))}
            </div>

            <AnalisisPanel title="Target vs Terlaksana">
              <AnalisisChart tinggi={256} kosong={!chartData.some((c) => c.Target > 0)} teks="Belum ada alat yang dinilai risikonya.">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Target" fill="#FFAF4E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Terlaksana" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </AnalisisChart>
            </AnalisisPanel>

            <AnalisisPanel
              title="Alat Belum Memenuhi Target PM"
              description={data.jumlah_terlambat > 0
                ? `${formatNumber(data.jumlah_terlambat)} alat${data.jumlah_terlambat > data.terlambat.length ? `, ${data.terlambat.length} teratas ditampilkan (risiko tinggi lebih dulu)` : ''}`
                : 'Semua alat yang sudah dinilai memenuhi target PM tahun ini.'}
            >
              {data.terlambat.length > 0 && <DataTable columns={terlambatColumns} data={data.terlambat} getRowId={(a) => a.id} />}
            </AnalisisPanel>
          </>
        );
      }}
    </AnalisisPage>
  );
}

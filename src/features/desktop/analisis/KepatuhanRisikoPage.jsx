import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import DataTable from '../../../components/DataTable';
import { useAnalisisRisiko } from '../../../hooks/queries/useAnalisisQueries';
import RisikoBadge from '../../../components/RisikoBadge';
import { AnalisisLoading, AnalisisError, RefreshButton } from './AnalisisCommon';
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
  const { showToast } = useToast();
  const { data, isLoading, isError, isFetching, refetch } = useAnalisisRisiko();

  useEffect(() => {
    if (isError) showToast('Gagal mengambil data kepatuhan risiko', 'error');
  }, [isError, showToast]);

  if (isLoading) return <AnalisisLoading text="Menghitung kepatuhan pemeliharaan, mohon tunggu..." />;
  if (!data) return <AnalisisError message="Gagal mengambil data kepatuhan risiko." onRetry={() => refetch()} retrying={isFetching} />;

  const chartData = data.tingkat.map((t) => ({ name: t.tingkat, Target: t.target_pm, Terlaksana: t.realisasi_pm }));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
            <ShieldAlert className="text-brand-primary" />
            Kepatuhan PM per Tingkat Risiko
          </h2>
          <p className="text-text-gray text-xs mt-1">
            Tahun {data.tahun}: target pemeliharaan preventif sesuai pedoman (Tinggi 2x, Sedang dan Rendah 1x per tahun) dibanding yang sudah selesai.
          </p>
        </div>
        <RefreshButton onClick={() => refetch()} isFetching={isFetching} />
      </div>

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
          <div key={t.tingkat} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <RisikoBadge tingkat={t.tingkat} />
              <span className="text-xs text-gray-500">{formatNumber(t.unit)} alat</span>
            </div>
            <div>
              <div className="flex items-end justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500">PM terlaksana</span>
                <span className="text-2xl font-extrabold text-gray-800">{t.persen_pm === null ? '-' : `${t.persen_pm}%`}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${t.persen_pm ?? 0}%`, backgroundColor: TIER_COLOR[t.tingkat] }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{t.realisasi_pm} dari {t.target_pm} kali PM · {t.unit_patuh_pm}/{t.unit} alat memenuhi target</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-50">
              <div><p className="text-lg font-bold text-emerald-600">{t.kalibrasi_valid}</p><p className="text-[10px] text-gray-500">Kalibrasi valid</p></div>
              <div><p className="text-lg font-bold text-red-600">{t.kalibrasi_kedaluwarsa}</p><p className="text-[10px] text-gray-500">Kedaluwarsa</p></div>
              <div><p className="text-lg font-bold text-gray-500">{t.kalibrasi_belum}</p><p className="text-[10px] text-gray-500">Belum diset</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Target vs Terlaksana</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Terlaksana" fill="#6C5DD3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 text-lg">Alat Belum Memenuhi Target PM</h3>
        <p className="text-xs text-gray-500 mb-4">
          {data.jumlah_terlambat > 0
            ? `${formatNumber(data.jumlah_terlambat)} alat${data.jumlah_terlambat > data.terlambat.length ? `, ${data.terlambat.length} teratas ditampilkan (risiko tinggi lebih dulu)` : ''}`
            : 'Semua alat yang sudah dinilai memenuhi target PM tahun ini.'}
        </p>
        {data.terlambat.length > 0 && (
          <DataTable
            columns={terlambatColumns}
            data={data.terlambat}
            getRowId={(a) => a.id}
            tableClassName="text-xs"
          />
        )}
      </div>
    </div>
  );
}

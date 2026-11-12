import React, { useEffect } from 'react';
import { DollarSign, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useToast } from '../../../components/Alert/useToast';
import { rupiah, formatNumber } from '../../../utils/format';
import { usePageTitle } from '../../../hooks';
import DataTable from '../../../components/DataTable';
import { useAnalisisBiaya } from '../../../hooks/queries/useAnalisisQueries';
import { AnalisisLoading, AnalisisError, RefreshButton } from './AnalisisCommon';

const topBiayaColumns = [
  { id: 'tanggal', header: 'Tanggal', meta: { cellClassName: 'text-gray-500' }, cell: ({ row }) => row.original.tanggal },
  { id: 'no_aduan', header: 'No. Aduan', meta: { cellClassName: 'font-mono text-gray-600' }, cell: ({ row }) => row.original.no_aduan },
  { id: 'nama_alat', header: 'Alat', meta: { cellClassName: 'font-semibold text-gray-800 max-w-[200px] truncate' }, cell: ({ row }) => row.original.nama_alat },
  { id: 'biaya', header: 'Biaya', meta: { align: 'right' }, cell: ({ row }) => <span className="text-red-600 font-bold">{rupiah(row.original.biaya)}</span> },
];

export default function BiayaPemeliharaanPage() {
  usePageTitle('Analisis Biaya Pemeliharaan');
  const { showToast } = useToast();
  const { data, isLoading, isError, isFetching, refetch } = useAnalisisBiaya();

  useEffect(() => {
    if (isError) showToast('Gagal mengambil data biaya', 'error');
  }, [isError, showToast]);

  if (isLoading) return <AnalisisLoading text="Menganalisis pengeluaran biaya, mohon tunggu..." />;

  // Gagal dimuat (atau kosong): tampilkan pesan + tombol coba lagi, bukan halaman kosong.
  if (!data) return <AnalisisError message="Gagal mengambil data biaya." onRetry={() => refetch()} retrying={isFetching} />;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
            <DollarSign className="text-brand-primary" />
            Analisis Biaya Pemeliharaan
          </h2>
          <p className="text-text-gray text-xs mt-1">
            Mengevaluasi Total Cost of Ownership (TCO) dan melacak pengeluaran perbaikan alat.
          </p>
        </div>
        <RefreshButton onClick={() => refetch()} isFetching={isFetching} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex justify-center items-center shrink-0">
            <PieChartIcon size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Nilai Aset</div>
            <div className="text-2xl font-black text-gray-800">{rupiah(data.total_aset)}</div>
            <div className="text-xs text-gray-500 mt-1">Estimasi nilai seluruh inventaris</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex justify-center items-center shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Biaya Perbaikan</div>
            <div className="text-2xl font-black text-gray-800">{rupiah(data.total_biaya)}</div>
            <div className="text-xs text-gray-500 mt-1">Terserap untuk perawatan</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex justify-center items-center shrink-0">
            <DollarSign size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Rasio TCO</div>
            <div className="text-3xl font-black text-gray-800">{data.tco_percentage}%</div>
            <div className="text-xs text-gray-500 mt-1">Persentase biaya thd nilai aset</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Tren Pengeluaran Biaya Perbaikan</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.trend_biaya || []}
                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBiaya" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="bulan" 
                  tick={{fontSize: 12, fill: '#6b7280'}} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10} 
                />
                <YAxis 
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `Rp ${formatNumber(value / 1000000)} jt`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  formatter={(value) => [rupiah(value), "Biaya"]}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="biaya" stroke="#ea580c" fillOpacity={1} fill="url(#colorBiaya)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Table / Top Expensive Repairs */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Top 10 Biaya Perbaikan Termahal</h3>
          <div className="flex-1">
            <DataTable
              columns={topBiayaColumns}
              data={data.top_biaya || []}
              getRowId={(item) => item.no_aduan}
              tableClassName="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

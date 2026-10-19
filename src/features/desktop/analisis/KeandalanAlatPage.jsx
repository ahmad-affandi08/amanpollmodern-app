import React, { useEffect } from 'react';
import { Activity, Clock, Wrench, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import { useAnalisisKeandalan } from '../../../hooks/queries/useAnalisisQueries';
import { AnalisisLoading, AnalisisError, RefreshButton } from './AnalisisCommon';

export default function KeandalanAlatPage() {
  usePageTitle('Analisis Keandalan Alat');
  const { showToast } = useToast();
  const { data, isLoading, isError, isFetching, refetch } = useAnalisisKeandalan();

  useEffect(() => {
    if (isError) showToast('Gagal mengambil data analitik', 'error');
  }, [isError, showToast]);

  if (isLoading) return <AnalisisLoading text="Menganalisis data, mohon tunggu..." />;

  // Gagal dimuat (atau kosong): tampilkan pesan + tombol coba lagi, bukan halaman kosong.
  if (!data) return <AnalisisError message="Gagal mengambil data analitik." onRetry={() => refetch()} retrying={isFetching} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-brand-primary" />
            Analisis Keandalan Alat
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Menampilkan statistik MTBF (Mean Time Between Failures) dan waktu perbaikan (downtime).
          </p>
        </div>
        <RefreshButton onClick={() => refetch()} isFetching={isFetching} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex justify-center items-center shrink-0">
            <Activity size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Rata-rata MTBF</div>
            <div className="text-3xl font-black text-gray-800">{data.mtbf_days} <span className="text-base font-semibold text-gray-500">Hari</span></div>
            <div className="text-xs text-gray-500 mt-1">Siklus kerusakan per alat</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex justify-center items-center shrink-0">
            <Clock size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Rata-rata Downtime</div>
            <div className="text-3xl font-black text-gray-800">{data.avg_downtime_days} <span className="text-base font-semibold text-gray-500">Hari</span></div>
            <div className="text-xs text-gray-500 mt-1">Lama perbaikan (Selesai)</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex justify-center items-center shrink-0">
            <AlertTriangle size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Aduan (1 Thn)</div>
            <div className="text-3xl font-black text-gray-800">{data.total_aduan_year} <span className="text-base font-semibold text-gray-500">Insiden</span></div>
            <div className="text-xs text-gray-500 mt-1">Dari total {data.total_alat} inventaris</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareto Chart / Top Broken */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Top 10 Alat Sering Rusak</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.top_broken || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" tick={{fontSize: 12, fill: '#6b7280'}} />
                <YAxis 
                  dataKey="nama_alat" 
                  type="category" 
                  width={150} 
                  tick={{fontSize: 12, fill: '#4b5563'}} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total_aduan" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} name="Total Aduan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Tren Insiden (6 Bulan Terakhir)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.trend_aduan || []}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
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
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#ec4899" 
                  strokeWidth={3} 
                  dot={{r: 5, strokeWidth: 2}} 
                  activeDot={{r: 8}}
                  name="Jumlah Aduan Masuk"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

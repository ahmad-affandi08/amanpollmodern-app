import React, { useEffect } from 'react';
import { User, CheckCircle, Wrench, Briefcase } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import DataTable from '../../../components/DataTable';
import { useAnalisisKinerja } from '../../../hooks/queries/useAnalisisQueries';
import { AnalisisLoading, AnalisisError, RefreshButton } from './AnalisisCommon';

const kinerjaColumns = [
  { id: 'nama_teknisi', header: 'Nama Teknisi', meta: { cellClassName: 'font-semibold text-gray-800' }, cell: ({ row }) => row.original.nama_teknisi },
  { id: 'aktif', header: 'Tugas Aktif', meta: { align: 'center' }, cell: ({ row: { original: teknisi } }) => {
    const totalAktif = Number(teknisi.aduan_aktif || 0) + Number(teknisi.pemeliharaan_aktif || 0);
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${totalAktif > 5 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600'}`}>
        {totalAktif}
      </span>
    );
  } },
  { id: 'selesai', header: 'Tugas Selesai', meta: { align: 'center' }, cell: ({ row }) => (
    <span className="text-gray-700 font-semibold">{row.original.total_tugas_selesai}</span>
  ) },
  { id: 'sla', header: 'Rata-rata SLA', meta: { align: 'right' }, cell: ({ row }) => (
    <span className="text-gray-600">{row.original.avg_resolution_days} Hari</span>
  ) },
];

export default function KinerjaTeknisiPage() {
  usePageTitle('Analisis Kinerja Teknisi');
  const { showToast } = useToast();
  const { data, isLoading, isError, isFetching, refetch } = useAnalisisKinerja();

  useEffect(() => {
    if (isError) showToast('Gagal mengambil data kinerja', 'error');
  }, [isError, showToast]);

  if (isLoading) return <AnalisisLoading text="Menganalisis kinerja teknisi, mohon tunggu..." />;

  // Gagal dimuat (atau kosong): tampilkan pesan + tombol coba lagi, bukan halaman kosong.
  if (!data) return <AnalisisError message="Gagal mengambil data kinerja." onRetry={() => refetch()} retrying={isFetching} />;

  const leaderboard = data.leaderboard || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
            <User className="text-brand-primary" />
            Analisis Kinerja Teknisi
          </h2>
          <p className="text-text-gray text-xs mt-1">
            Mengevaluasi kecepatan respon (SLA), jumlah beban kerja, dan tingkat penyelesaian perbaikan.
          </p>
        </div>
        <RefreshButton onClick={() => refetch()} isFetching={isFetching} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex justify-center items-center shrink-0">
            <CheckCircle size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Rata-rata SLA</div>
            <div className="text-3xl font-black text-gray-800">{data.avg_resolution_all_days} <span className="text-base font-semibold text-gray-500">Hari</span></div>
            <div className="text-xs text-gray-500 mt-1">Kecepatan penyelesaian tiket</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex justify-center items-center shrink-0">
            <Wrench size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Aduan Selesai</div>
            <div className="text-3xl font-black text-gray-800">{data.total_aduan_selesai} <span className="text-base font-semibold text-gray-500">Tugas</span></div>
            <div className="text-xs text-gray-500 mt-1">Total aduan terselesaikan</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex justify-center items-center shrink-0">
            <Briefcase size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Pemeliharaan Selesai</div>
            <div className="text-3xl font-black text-gray-800">{data.total_pemeliharaan_selesai} <span className="text-base font-semibold text-gray-500">Tugas</span></div>
            <div className="text-xs text-gray-500 mt-1">Total jadwal pemeliharaan selesai</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Chart */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Top Performer (Tugas Selesai Terbanyak)</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leaderboard.slice(0, 5)} // 5 teknisi teratas
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" tick={{fontSize: 12, fill: '#6b7280'}} />
                <YAxis 
                  dataKey="nama_teknisi" 
                  type="category" 
                  width={120} 
                  tick={{fontSize: 12, fill: '#4b5563'}} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total_tugas_selesai" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} name="Tugas Selesai" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Workload Table */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Detail Beban Kerja & SLA Teknisi</h3>
          <div className="flex-1">
            <DataTable
              columns={kinerjaColumns}
              data={leaderboard}
              getRowId={(teknisi) => teknisi.id_user}
              tableClassName="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { User, CheckCircle, Wrench, RefreshCw, Briefcase } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AnalisisApi from '../../../api/AnalisisApi';
import { useToast } from '../../../components/Alert/useToast';

export default function KinerjaTeknisiPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await AnalisisApi.getKinerjaTeknisi();
      setData(response.data.data);
    } catch (error) {
      console.error(error);
      showToast('Gagal mengambil data kinerja', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[70vh]">
        <RefreshCw className="animate-spin text-brand-primary mb-4" size={32} />
        <p className="text-gray-500 font-medium">Menganalisis kinerja teknisi, mohon tunggu...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="text-brand-primary" />
            Analisis Kinerja Teknisi
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Mengevaluasi kecepatan respon (SLA), jumlah beban kerja, dan tingkat penyelesaian perbaikan.
          </p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm font-semibold">
          <RefreshCw size={16} /> Segarkan Data
        </button>
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
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Top Performer (Tugas Selesai Terbanyak)</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.leaderboard.slice(0, 5)} // Take top 5
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
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Detail Beban Kerja & SLA Teknisi</h3>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase text-xs">Nama Teknisi</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase text-xs text-center">Tugas Aktif</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase text-xs text-center">Tugas Selesai</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase text-xs text-right">Rata-rata SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.leaderboard.map((teknisi) => {
                  const totalAktif = teknisi.aduan_aktif + teknisi.pemeliharaan_aktif;
                  return (
                    <tr key={teknisi.id_user} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-800">{teknisi.nama_teknisi}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${totalAktif > 5 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600'}`}>
                          {totalAktif}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-gray-700 font-semibold">{teknisi.total_tugas_selesai}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-gray-600">{teknisi.avg_resolution_days} Hari</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

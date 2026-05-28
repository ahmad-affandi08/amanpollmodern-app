import React, { useState, useEffect } from 'react';
import { Map, AlertCircle, Package, RefreshCw, BarChart2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import AnalisisApi from '../../../api/AnalisisApi';
import { useToast } from '../../../components/Alert/useToast';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'];

export default function SebaranRuanganPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await AnalisisApi.getSebaranRuangan();
      setData(response.data.data);
    } catch (error) {
      console.error(error);
      showToast('Gagal mengambil data sebaran', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[70vh]">
        <RefreshCw className="animate-spin text-brand-primary mb-4" size={32} />
        <p className="text-gray-500 font-medium">Memetakan data ruangan, mohon tunggu...</p>
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
            <Map className="text-brand-primary" />
            Analisis Sebaran Ruangan
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Memetakan asal ruang laporan kerusakan untuk mengidentifikasi area dengan risiko tinggi.
          </p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm font-semibold">
          <RefreshCw size={16} /> Segarkan Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex justify-center items-center shrink-0">
            <AlertCircle size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Laporan Kerusakan</div>
            <div className="text-3xl font-black text-gray-800">{data.total_aduan}</div>
            <div className="text-xs text-gray-500 mt-1">Keseluruhan insiden aduan</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex justify-center items-center shrink-0">
            <Package size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Populasi Alat</div>
            <div className="text-3xl font-black text-gray-800">{data.total_inventaris}</div>
            <div className="text-xs text-gray-500 mt-1">Alat terdaftar di sistem</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex justify-center items-center shrink-0">
            <BarChart2 size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Rasio Laporan/Ruang</div>
            <div className="text-3xl font-black text-gray-800">{data.avg_aduan_per_ruangan}</div>
            <div className="text-xs text-gray-500 mt-1">Rata-rata kerusakan per ruang aktif</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap/Top Aduan Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-bold text-gray-800 text-lg mb-2">Zona Kritis (Top 15 Ruangan)</h3>
          <p className="text-sm text-gray-500 mb-6">Ruangan dengan tingkat frekuensi laporan kerusakan alat paling tinggi.</p>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.sebaran_aduan}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" tick={{fontSize: 12, fill: '#6b7280'}} />
                <YAxis 
                  dataKey="nama_ruangan" 
                  type="category" 
                  width={150} 
                  tick={{fontSize: 11, fill: '#4b5563'}} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total_aduan" radius={[0, 4, 4, 0]} barSize={16} name="Total Aduan">
                  {data.sebaran_aduan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Table / Top Inventory Rooms */}
        <div className="flex flex-col gap-6">
          {/* Distribution Pie Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col h-[300px]">
             <h3 className="font-bold text-gray-800 text-base mb-2">Distribusi Kerusakan</h3>
             <div className="flex-1 -mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.sebaran_aduan.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="total_aduan"
                      nameKey="nama_ruangan"
                    >
                      {data.sebaran_aduan.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1">
            <h3 className="font-bold text-gray-800 text-base mb-4">Top 5 Ruangan Terpadat (Alat)</h3>
            <div className="space-y-4">
              {data.sebaran_alat.map((room, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex justify-center items-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{room.nama_ruangan}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{room.total_alat} Alat</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

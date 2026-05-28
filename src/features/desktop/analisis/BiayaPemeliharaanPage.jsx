import React, { useState, useEffect } from 'react';
import { DollarSign, PieChart as PieChartIcon, TrendingUp, RefreshCw } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AnalisisApi from '../../../api/AnalisisApi';
import { useToast } from '../../../components/Alert/useToast';

export default function BiayaPemeliharaanPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await AnalisisApi.getBiaya();
      setData(response.data.data);
    } catch (error) {
      console.error(error);
      showToast('Gagal mengambil data biaya', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[70vh]">
        <RefreshCw className="animate-spin text-brand-primary mb-4" size={32} />
        <p className="text-gray-500 font-medium">Menganalisis pengeluaran biaya, mohon tunggu...</p>
      </div>
    );
  }

  if (!data) return null;

  // Format IDR
  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="text-brand-primary" />
            Analisis Biaya Pemeliharaan
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Mengevaluasi Total Cost of Ownership (TCO) dan melacak pengeluaran perbaikan alat.
          </p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm font-semibold">
          <RefreshCw size={16} /> Segarkan Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex justify-center items-center shrink-0">
            <PieChartIcon size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Nilai Aset</div>
            <div className="text-2xl font-black text-gray-800">{formatIDR(data.total_aset)}</div>
            <div className="text-xs text-gray-500 mt-1">Estimasi nilai seluruh inventaris</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex justify-center items-center shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Biaya Perbaikan</div>
            <div className="text-2xl font-black text-gray-800">{formatIDR(data.total_biaya)}</div>
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
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Tren Pengeluaran Biaya Perbaikan</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.trend_biaya}
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
                  tickFormatter={(value) => `Rp ${value / 1000000}M`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  formatter={(value) => [formatIDR(value), "Biaya"]}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="biaya" stroke="#ea580c" fillOpacity={1} fill="url(#colorBiaya)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Table / Top Expensive Repairs */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-6">Top 10 Biaya Perbaikan Termahal</h3>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase text-xs">Tanggal</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase text-xs">No. Aduan</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase text-xs">Alat</th>
                  <th className="py-3 px-4 font-bold text-gray-500 uppercase text-xs text-right">Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.top_biaya.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-gray-500">{item.tanggal}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">{item.no_aduan}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800 max-w-[200px] truncate">{item.nama_alat}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-red-600 font-bold">{formatIDR(item.biaya)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

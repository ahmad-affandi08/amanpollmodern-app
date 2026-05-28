import React, { useState, useEffect } from 'react';
import { ShieldCheck, CalendarClock, AlertTriangle, RefreshCw } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import AnalisisApi from '../../../api/AnalisisApi';
import { useToast } from '../../../components/Alert/useToast';

export default function KepatuhanKalibrasiPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await AnalisisApi.getKalibrasi();
      setData(response.data.data);
    } catch (error) {
      console.error(error);
      showToast('Gagal mengambil data kalibrasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[70vh]">
        <RefreshCw className="animate-spin text-brand-primary mb-4" size={32} />
        <p className="text-gray-500 font-medium">Mengecek status kalibrasi, mohon tunggu...</p>
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
            <ShieldCheck className="text-brand-primary" />
            Analisis Kepatuhan Kalibrasi
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Memantau tingkat kepatuhan kalibrasi alat ukur medis dan prediksi kedaluwarsa ke depan.
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
            <AlertTriangle size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Status Expired</div>
            <div className="text-3xl font-black text-gray-800">{data.expired_count} <span className="text-base font-semibold text-gray-500">Alat</span></div>
            <div className="text-xs text-red-500 mt-1 font-semibold">Tindakan segera diperlukan!</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex justify-center items-center shrink-0">
            <CalendarClock size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Mendekati Expired</div>
            <div className="text-3xl font-black text-gray-800">{data.warning_count} <span className="text-base font-semibold text-gray-500">Alat</span></div>
            <div className="text-xs text-gray-500 mt-1">Dalam 30 hari ke depan</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex justify-center items-center shrink-0">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Populasi</div>
            <div className="text-3xl font-black text-gray-800">{data.total_alat} <span className="text-base font-semibold text-gray-500">Inventaris</span></div>
            <div className="text-xs text-gray-500 mt-1">Total alat yang terdaftar</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Pie Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-2">Tingkat Kepatuhan (Compliance)</h3>
          <p className="text-sm text-gray-500 mb-6">Persentase alat ukur medis yang kalibrasinya masih berlaku.</p>
          <div className="flex-1 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.kepatuhan}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.kepatuhan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expiring Trend Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-2">Prediksi Kedaluwarsa (12 Bulan Kedepan)</h3>
          <p className="text-sm text-gray-500 mb-6">Tren jumlah alat yang kalibrasinya akan habis, berguna untuk persiapan anggaran.</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.expiring_trend}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} name="Jumlah Alat" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

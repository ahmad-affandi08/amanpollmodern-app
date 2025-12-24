import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
  Package, DollarSign, Activity, CheckCircle2, TrendingUp, AlertCircle,
  Clock, Plus, QrCode, Wrench, Search, Filter, Calendar, FileText
} from 'lucide-react';
import { useDashboardStats, useMasterDivisi, useFilters, useAuth, usePageTitle } from '../../../hooks';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#6C5DD3', '#FF754C', '#FFAF4E', '#3F8CFF', '#A0D7E7', '#F0C782'];

export default function Dashboard() {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { filters, updateFilter } = useFilters({
    tahun_filter: '',
    divisi_id: '',
    ruangan_filter: ''
  });

  // Queries
  const { data, isLoading } = useDashboardStats(filters);
  const { data: divisiData } = useMasterDivisi({ all: 1 });

  const divisions = divisiData?.data || divisiData || [];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse pb-10">
        {/* Welcome & Quick Actions Skeleton */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-3 w-full max-w-md">
            <div className="h-8 bg-gray-200 rounded-xl w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
            <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
            <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
          </div>
        </div>

        {/* Filter Skeleton */}
        <div className="h-16 bg-gray-100 rounded-2xl w-full"></div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-[24px] p-6 h-32 border border-gray-100">
              <div className="flex justify-between mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-2xl"></div>
                <div className="h-6 w-16 bg-gray-100 rounded-lg"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[24px] p-6 h-[400px] border border-gray-100"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[24px] p-6 h-[300px] border border-gray-100"></div>
              <div className="bg-white rounded-[24px] p-6 h-[300px] border border-gray-100"></div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[24px] p-6 h-full min-h-[500px] border border-gray-100"></div>
          </div>
        </div>
      </div>
    );
  }

  // Correct Data Access (Handle nested 'data.data' or direct 'data')
  // API Response: { status: 'success', data: { stats: ..., charts: ..., recent_activities: ... } }
  const dashboardData = data?.data || data || {};

  const stats = dashboardData.stats || {};
  const charts = dashboardData.charts || {};
  // 'recent' key verified in debug logs
  const recent = dashboardData.recent || dashboardData.recent_activities || [];

  // Greetings based on time
  const hour = new Date().getHours();
  let greeting = 'Selamat Pagi';
  if (hour >= 12) greeting = 'Selamat Siang';
  if (hour >= 15) greeting = 'Selamat Sore';
  if (hour >= 18) greeting = 'Selamat Malam';

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Dashboard Overview</h1>
          <p className="text-[#808191] text-sm mt-1">
            Monitoring real-time aset dan kinerja pemeliharaan.
          </p>
        </div>

        {/* Simple Filter Row */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          <select
            value={filters.tahun_filter}
            onChange={(e) => updateFilter('tahun_filter', e.target.value)}
            className="bg-transparent border-none text-sm font-semibold text-text-dark focus:ring-0 cursor-pointer hover:bg-gray-50 rounded-lg py-2 pl-3 pr-8"
          >
            <option value="">Semua Tahun</option>
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>
            })}
          </select>
          <div className="w-px bg-gray-200 my-2 mx-1"></div>
          <select
            value={filters.divisi_id}
            onChange={(e) => updateFilter('divisi_id', e.target.value)}
            className="bg-transparent border-none text-sm font-semibold text-text-dark focus:ring-0 cursor-pointer hover:bg-gray-50 rounded-lg py-2 pl-3 pr-8 max-w-[150px]"
          >
            <option value="">Semua Divisi</option>
            {divisions.map((d) => (
              <option key={d.id_divisi} value={d.id_divisi}>{d.nama_divisi}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Package size={24} />}
          title="Total Aset Inventaris"
          value={stats.total_inventaris || 0}
          trend="+2.5% vs bulan lalu"
          trendUp={true}
          bgColor="bg-gradient-to-br from-[#F2F0FF] via-[#E2DBFF] to-[#C4B5FD]"
          iconColor="text-brand-primary"
          cardBgColor="bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30"
        />
        <StatCard
          icon={<DollarSign size={24} />}
          title="Nilai Aset Keseluruhan"
          value={`Rp ${(stats.total_nilai || 0).toLocaleString('id-ID', { notation: 'compact' })}`}
          subValue={`Rp ${(stats.total_nilai || 0).toLocaleString('id-ID')}`}
          trend="+5% vs tahun lalu"
          trendUp={true}
          bgColor="bg-gradient-to-br from-[#F0FDF9] via-[#D1FBEA] to-[#6EE7B7]"
          iconColor="text-[#059669]"
          cardBgColor="bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30"
        />
        <StatCard
          icon={<CheckCircle2 size={24} />}
          title="Alat Terkalibrasi"
          value={`${stats.total_kalibrasi || 0} Unit`}
          trend="Wajib Kalibrasi"
          trendUp={true}
          bgColor="bg-gradient-to-br from-[#FFF7ED] via-[#FFE5D3] to-[#FDBA74]"
          iconColor="text-[#EA580C]"
          cardBgColor="bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30"
        />
        <StatCard
          icon={<Activity size={24} />}
          title="Konsumsi Daya Total"
          value={`${(stats.total_daya / 1000).toFixed(1)} kVA`}
          trend="Stabil"
          trendUp={true}
          bgColor="bg-gradient-to-br from-[#F0F9FF] via-[#E3F2FF] to-[#93C5FD]"
          iconColor="text-[#2563EB]"
          cardBgColor="bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30"
        />
      </div>

      {/* Middle Section: Charts & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Both Charts Stacked */}
        <div className="lg:col-span-2 space-y-6">
          {/* Aduan Chart */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-text-dark">Statistik Aduan & Perbaikan</h3>
                <p className="text-xs text-gray-500">Performa penanganan kerusakan per bulan</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"></span> Selesai
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFAF4E]"></span> Pending
                </div>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {/* Direct usage of charts.aduan array from backend/hook */}
                <AreaChart data={charts.aduan || []}>
                  <defs>
                    <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C5DD3" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6C5DD3" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFAF4E" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#FFAF4E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF0F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#92929D', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#92929D', fontSize: 12 }} />
                  <RechartsTooltip
                    cursor={{ stroke: '#6C5DD3', strokeWidth: 1, strokeDasharray: '5 5' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Area type="monotone" dataKey="Selesai" stroke="#6C5DD3" strokeWidth={3} fillOpacity={1} fill="url(#colorSelesai)" />
                  <Area type="monotone" dataKey="Pending" stroke="#FFAF4E" strokeWidth={3} fillOpacity={1} fill="url(#colorPending)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pemeliharaan Chart */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-text-dark">Statistik Pemeliharaan</h3>
                <p className="text-xs text-gray-500">Performa pemeliharaan alat per bulan</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Selesai
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Belum Selesai
                </div>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.pemeliharaan || []}>
                  <defs>
                    <linearGradient id="colorPemSelesai" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPemBelum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF0F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#92929D', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#92929D', fontSize: 12 }} />
                  <RechartsTooltip
                    cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '5 5' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Area type="monotone" dataKey="Selesai" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPemSelesai)" />
                  <Area type="monotone" dataKey="Belum Selesai" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorPemBelum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-1 bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-text-dark">Aktivitas Terbaru</h3>
            <button className="text-brand-primary text-sm font-semibold hover:underline">Lihat Semua</button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 max-h-full">
            {recent.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">Belum ada aktivitas</div>
            ) : (
              recent.map((activity, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className={`mt-1 min-w-[32px] h-[32px] rounded-full flex items-center justify-center ${getActivityColor(activity.type)} bg-opacity-10 text-current`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start w-full">
                      <h4 className="text-sm font-bold text-text-dark line-clamp-1">{activity.title}</h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                        {new Date(activity.date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{activity.description}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${activity.status === 'Selesai' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                        {activity.status}
                      </span>
                      {activity.meta && (
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md line-clamp-1">
                          {activity.meta}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Categories, Quick Actions, Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Category Distribution (Radial/Donut) */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-text-dark mb-4">Distribusi Kategori</h3>
          <div className="flex-1 relative min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.kategori || []}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  cornerRadius={4}
                >
                  {(charts.kategori || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-xl font-bold text-text-dark">{stats.total_inventaris}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">Total Unit</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
            {(charts.kategori || []).slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="text-[10px] text-gray-500">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Quick Actions (Dark Card) */}
        <div className="bg-gradient-to-br from-brand-primary to-brand-primary-light shadow-brand-primary/20 rounded-[20px] p-6 text-white flex flex-col justify-between shadow-xl shadow-brand-primary/20">
          <div>
            <h3 className="font-bold text-lg">Quick Actions</h3>
            <p className="text-indigo-100 text-xs mt-1">Akses cepat menu yang sering digunakan.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button onClick={() => navigate('/scanner')} className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl flex flex-col items-center gap-2 text-center group border border-white/5">
              <QrCode className="text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Scan QR</span>
            </button>
            <button onClick={() => navigate('/inventaris/baru')} className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl flex flex-col items-center gap-2 text-center group border border-white/5">
              <Plus className="text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Tambah Alat</span>
            </button>
            <button onClick={() => navigate('/aduan')} className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl flex flex-col items-center gap-2 text-center group border border-white/5">
              <AlertCircle className="text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Buat Aduan</span>
            </button>
            <button onClick={() => navigate('/report/aduan')} className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl flex flex-col items-center gap-2 text-center group border border-white/5">
              <FileText className="text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Laporan</span>
            </button>
          </div>
        </div>

        {/* 3. Asset Conditions (Progress Bars) */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-text-dark mb-6">Kondisi Aset</h3>
          <div className="space-y-5">
            {/* Direct usage of charts.kondisi array */}
            {(charts.kondisi || []).map((item, index) => {
              const value = item.value || 0; // Using value property
              const label = item.name || 'Lainnya'; // Using name property
              const percentage = Math.round((value / (stats.total_inventaris || 1)) * 100);
              const color = index === 0 ? 'bg-green-500' : index === 1 ? 'bg-yellow-400' : index === 2 ? 'bg-orange-400' : 'bg-red-500';

              return (
                <div key={index}>
                  <div className="flex justify-between text-xs font-semibold text-text-dark mb-2">
                    <span>{label}</span>
                    <span>{value} Unit ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Components
function QuickActionButton({ icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-sm hover:-translate-y-1 transition-all whitespace-nowrap ${color}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function StatCard({ icon, title, value, subValue, trend, trendUp, bgColor, iconColor, cardBgColor }) {
  return (
    <div className={`${cardBgColor || 'bg-gradient-to-br from-white via-white to-gray-50/30'} rounded-[20px] p-6 shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 backdrop-blur-sm`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`${bgColor} ${iconColor} p-3 rounded-2xl shadow-inner border border-white/60`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${trendUp ? 'bg-[#EFFFF6] text-[#34D399]' : 'bg-red-50 text-red-500'}`}>
            {trendUp && <TrendingUp size={10} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[#92929D] text-sm font-medium mb-1">{title}</p>
        <h4 className="text-[28px] font-bold text-[#11142D] tracking-tight">{value}</h4>
        {subValue && (
          <p className="text-[10px] text-gray-400 mt-1 font-mono tracking-wide">{subValue}</p>
        )}
      </div>
    </div>
  );
}

function getActivityIcon(type) {
  const icons = {
    aduan: <AlertCircle size={14} />,
    pemeliharaan: <Wrench size={14} />,
    inventaris: <Package size={14} />,
  };
  return icons[type] || <Activity size={14} />;
}

function getActivityColor(type) {
  const colors = {
    aduan: 'bg-red-100 text-red-600',
    pemeliharaan: 'bg-blue-100 text-blue-600',
    inventaris: 'bg-purple-100 text-purple-600',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
}

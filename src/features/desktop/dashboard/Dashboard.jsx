import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Package, DollarSign, Activity, CheckCircle2, AlertCircle, Plus, QrCode, FileText
} from 'lucide-react';
import { useDashboardStats, useMasterDivisi, useFilters, useAuth, usePageTitle } from '../../../hooks';
import { useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../../../components/StatusBadge';
import { getStatusHex } from '../../../utils/status';
import { formatDateShort, formatNumber, rupiah } from '../../../utils/format';
import { ACCESS, ROLES, hasRole, isRole, isReadOnlyRole, canManageInventaris } from '../../auth/constants';
import { getActivityIcon, getActivityColor } from '../activities/activityMeta';

const COLORS = ['#6C5DD3', '#FF754C', '#FFAF4E', '#3F8CFF', '#A0D7E7', '#F0C782'];

// Seri grafik: warna diambil dari utils/status berdasarkan nama status, sama dengan badge di halaman lain.
const ADUAN_SERIES = ['Pending', 'Sedang Dikerjakan', 'Tindakan Lanjutan', 'Selesai'];
const PEMELIHARAAN_SERIES = ['Selesai', 'Belum Selesai'];

// Backend mengirim nama bulan dalam bahasa Inggris.
const MONTH_LABELS = { May: 'Mei', Aug: 'Agu', Oct: 'Okt', Dec: 'Des' };
const localizeMonths = (rows) => (rows || []).map(row => ({ ...row, name: MONTH_LABELS[row.name] || row.name }));

const gradientId = (prefix, status) => `${prefix}-${status.replace(/\s+/g, '')}`;

/** Daya di form inventaris diisi dalam Watt; ditampilkan dalam kW. '-' bila tidak ada data valid. */
const formatPower = (watt) => {
  const value = Number(watt);
  if (!Number.isFinite(value) || value <= 0) return '-';
  return `${(value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} kW`;
};

export default function Dashboard() {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { filters, updateFilter } = useFilters({
    tahun_filter: '',
    divisi_id: '',
    ruangan_filter: ''
  });

  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);

  const { data, isLoading } = useDashboardStats(filters);
  const { data: divisiData } = useMasterDivisi({ all: 1 });

  const divisions = divisiData?.data || divisiData || [];

  // Aksi cepat disaring per peran: Pimpinan hanya-baca, jadi tanpa tambah alat/aduan.
  const canWrite = !isReadOnlyRole(user);
  const quickActions = [
    { key: 'scan', label: 'Scan QR', icon: QrCode, path: '/scanner', visible: hasRole(user, ACCESS.scanner) },
    { key: 'alat', label: 'Tambah Alat', icon: Plus, path: '/inventaris/baru', visible: canManageInventaris(user) },
    { key: 'aduan', label: 'Buat Aduan', icon: AlertCircle, path: '/aduan', visible: canWrite && hasRole(user, ACCESS.aduan) },
    { key: 'laporan', label: 'Laporan', icon: FileText, path: '/report/aduan', visible: hasRole(user, ACCESS.report) },
  ].filter(action => action.visible);

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



  const dashboardData = data?.data || data || {};

  const stats = dashboardData.stats || {};
  const charts = dashboardData.charts || {};
  const recent = dashboardData.recent || dashboardData.recent_activities || [];


  const totalInventaris = Number(stats.total_inventaris) || 0;
  const totalKalibrasi = Number(stats.total_kalibrasi) || 0;
  const totalNilai = Number(stats.total_nilai) || 0;
  const kalibrasiPercent = totalInventaris > 0 ? Math.round((totalKalibrasi / totalInventaris) * 100) : 0;

  const aduanChart = localizeMonths(charts.aduan);
  const pemeliharaanChart = localizeMonths(charts.pemeliharaan);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Ringkasan Dashboard</h1>
          <p className="text-[#808191] text-xs mt-1">
            Pantau aset dan kinerja pemeliharaan secara langsung.
          </p>
        </div>

        {/* Simple Filter Row */}
        <div className="flex bg-white rounded-lg p-0.5 border border-gray-100">
          <select
            value={filters.tahun_filter}
            onChange={(e) => updateFilter('tahun_filter', e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-text-dark focus:ring-0 cursor-pointer hover:bg-gray-50 rounded-md py-1.5 pl-2.5 pr-6"
          >
            <option value="">Semua Tahun</option>
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>
            })}
          </select>

          {/* Hide divisi filter for Admin Divisi */}
          {!isAdminDivisi && (
            <>
              <div className="w-px bg-gray-200 my-1.5 mx-0.5"></div>
              <select
                value={filters.divisi_id}
                onChange={(e) => updateFilter('divisi_id', e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-text-dark focus:ring-0 cursor-pointer hover:bg-gray-50 rounded-md py-1.5 pl-2.5 pr-6 max-w-[150px]"
              >
                <option value="">Semua Divisi</option>
                {divisions.map((d) => (
                  <option key={d.id_divisi} value={d.id_divisi}>{d.nama_divisi}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package size={20} />}
          title="Total Aset Inventaris"
          value={formatNumber(totalInventaris)}
          bgColor="bg-gradient-to-br from-[#F2F0FF] via-[#E2DBFF] to-[#C4B5FD]"
          iconColor="text-brand-primary"
          cardBgColor="bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30"
        />
        <StatCard
          icon={<DollarSign size={20} />}
          title="Nilai Aset Keseluruhan"
          value={`Rp ${totalNilai.toLocaleString('id-ID', { notation: 'compact' })}`}
          subValue={rupiah(totalNilai)}
          bgColor="bg-gradient-to-br from-[#F0FDF9] via-[#D1FBEA] to-[#6EE7B7]"
          iconColor="text-[#059669]"
          cardBgColor="bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          title="Alat Terkalibrasi"
          value={`${formatNumber(totalKalibrasi)} Unit`}
          subValue={totalInventaris > 0 ? `${kalibrasiPercent}% dari total aset` : undefined}
          bgColor="bg-gradient-to-br from-[#FFF7ED] via-[#FFE5D3] to-[#FDBA74]"
          iconColor="text-[#EA580C]"
          cardBgColor="bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30"
        />
        <StatCard
          icon={<Activity size={20} />}
          title="Total Daya Terpasang"
          value={formatPower(stats.total_daya)}
          subValue={Number(stats.total_daya) > 0 ? `${formatNumber(Number(stats.total_daya))} Watt` : undefined}
          bgColor="bg-gradient-to-br from-[#F0F9FF] via-[#E3F2FF] to-[#93C5FD]"
          iconColor="text-[#2563EB]"
          cardBgColor="bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30"
        />
      </div>

      {/* Middle Section: Charts & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Both Charts Stacked */}
        <div className="lg:col-span-2 space-y-4">
          {/* Aduan Chart */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-text-dark">Statistik Aduan & Perbaikan</h3>
                <p className="text-xs text-gray-500">Performa penanganan kerusakan per bulan</p>
              </div>
              <ChartLegend series={ADUAN_SERIES} />
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aduanChart}>
                  <defs>
                    {ADUAN_SERIES.map(status => (
                      <linearGradient key={status} id={gradientId('aduan', status)} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getStatusHex(status)} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={getStatusHex(status)} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF0F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#92929D', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#92929D', fontSize: 12 }} allowDecimals={false} />
                  <RechartsTooltip
                    cursor={{ stroke: '#6C5DD3', strokeWidth: 1, strokeDasharray: '5 5' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  {ADUAN_SERIES.map(status => (
                    <Area
                      key={status}
                      type="monotone"
                      dataKey={status}
                      stroke={getStatusHex(status)}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#${gradientId('aduan', status)})`}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pemeliharaan Chart */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-text-dark">Statistik Pemeliharaan</h3>
                <p className="text-xs text-gray-500">Performa pemeliharaan alat per bulan</p>
              </div>
              <ChartLegend series={PEMELIHARAAN_SERIES} />
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pemeliharaanChart}>
                  <defs>
                    {PEMELIHARAAN_SERIES.map(status => (
                      <linearGradient key={status} id={gradientId('pemeliharaan', status)} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getStatusHex(status)} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={getStatusHex(status)} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF0F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#92929D', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#92929D', fontSize: 12 }} allowDecimals={false} />
                  <RechartsTooltip
                    cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '5 5' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  {PEMELIHARAAN_SERIES.map(status => (
                    <Area
                      key={status}
                      type="monotone"
                      dataKey={status}
                      stroke={getStatusHex(status)}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill={`url(#${gradientId('pemeliharaan', status)})`}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-4  border border-gray-100 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-text-dark">Aktivitas Terbaru</h3>
            <Link to="/activities" className="text-brand-primary text-sm font-semibold hover:underline">Lihat Semua</Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 max-h-full">
            {recent.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">Belum ada aktivitas</div>
            ) : (
              recent.map((activity, index) => (
                <div key={`${activity.type}-${activity.date}-${index}`} className="flex gap-4 group">
                  <div className={`mt-1 min-w-[32px] h-[32px] rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start w-full">
                      <h4 className="text-sm font-bold text-text-dark line-clamp-1">{activity.title}</h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                        {formatDateShort(activity.date)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{activity.description}</p>

                    <div className="mt-2 flex items-center gap-2">
                      {activity.status && <StatusBadge status={activity.status} size="sm" />}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Category Distribution (Radial/Donut) */}
        <div className="bg-white rounded-2xl p-4  border border-gray-100 flex flex-col">
          <h3 className="font-bold text-text-dark mb-4 text-sm">Distribusi Kategori</h3>
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
              <span className="block text-xl font-bold text-text-dark">{formatNumber(totalInventaris)}</span>
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
        <div className="bg-gradient-to-br from-brand-primary to-brand-primary-light shadow-brand-primary/20 rounded-2xl p-4 text-white flex flex-col justify-between shadow-xl shadow-brand-primary/20">
          <div>
            <h3 className="font-bold text-base">Aksi Cepat</h3>
            <p className="text-indigo-100 text-xs mt-1">Akses cepat menu yang sering digunakan.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.key}
                  onClick={() => navigate(action.path)}
                  className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl flex flex-col items-center gap-2 text-center group border border-white/5"
                >
                  <ActionIcon className="text-white group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Asset Conditions (Progress Bars) */}
        <div className="bg-white rounded-2xl p-4  border border-gray-100 flex flex-col">
          <h3 className="font-bold text-text-dark mb-4 text-sm">Kondisi Aset</h3>
          <div className="space-y-5">
            {(charts.kondisi || []).length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">Belum ada data kondisi aset</p>
            )}
            {(charts.kondisi || []).map((item) => {
              const value = Number(item.value) || 0;
              const label = item.name || 'Belum Ditentukan';
              const percentage = totalInventaris > 0 ? Math.round((value / totalInventaris) * 100) : 0;

              return (
                <div key={label}>
                  <div className="flex justify-between text-xs font-semibold text-text-dark mb-2">
                    <span>{label}</span>
                    <span>{formatNumber(value)} Unit ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percentage}%`, backgroundColor: getStatusHex(item.name) }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Legenda seri grafik; warna titik sama dengan warna garis (utils/status). */
function ChartLegend({ series }) {
  return (
    <div className="flex gap-4 flex-wrap">
      {series.map(status => (
        <div key={status} className="flex items-center gap-2 text-xs font-medium text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusHex(status) }}></span> {status}
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, title, value, subValue, bgColor, iconColor, cardBgColor }) {
  return (
    <div className={`${cardBgColor || 'bg-gradient-to-br from-white via-white to-gray-50/30'} rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 backdrop-blur-sm`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`${bgColor} ${iconColor} p-2.5 rounded-xl shadow-inner border border-white/60`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[#92929D] text-xs font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-[#11142D] tracking-tight">{value}</h4>
        {subValue && (
          <p className="text-[10px] text-gray-400 mt-1 font-mono tracking-wide">{subValue}</p>
        )}
      </div>
    </div>
  );
}

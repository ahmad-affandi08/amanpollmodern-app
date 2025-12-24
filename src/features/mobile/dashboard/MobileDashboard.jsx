import React, { useState } from 'react';
import { Package, AlertCircle, FileText, PlusCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileDashboard } from '../../../hooks/queries/useDashboardQueries';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import StatCard from './components/StatCard';
import DonutChart from './components/DonutChart';
import FilterBar from './components/FilterBar';
import MenuGrid from './components/MenuGrid';

export default function MobileDashboard() {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    tahun_filter: '', // Empty = show all years
    bulan_filter: '',
    kategori_filter: ''
  });

  const { data, isLoading, error } = useMobileDashboard(filters);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 space-y-4 animate-pulse pt-3">
        {/* Greeting Skeleton */}
        <div className="bg-white rounded-[20px] p-4 border border-gray-100 h-[88px] flex flex-col justify-center space-y-2.5">
          <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
          <div className="h-3 bg-gray-100 rounded-md w-1/3"></div>
        </div>

        {/* Filter Skeleton */}
        <div className="h-[42px] bg-white rounded-xl w-full border border-gray-100"></div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-[120px] bg-white rounded-[24px] p-4 flex flex-col justify-between border border-gray-100">
              <div>
                <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3"></div>
                <div className="h-3 w-16 bg-gray-100 rounded mb-1"></div>
              </div>
              <div className="h-6 w-12 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="aspect-square bg-white rounded-[24px] p-4 border border-gray-100 flex flex-col items-center justify-center relative">
              <div className="w-24 h-24 rounded-full border-[10px] border-gray-100"></div>
              <div className="absolute h-4 w-12 bg-gray-200 rounded bottom-4"></div>
            </div>
          ))}
        </div>

        {/* Menu Grid Skeleton */}
        <div className="mt-8">
          <div className="h-5 w-24 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-gray-100 rounded-[18px]"></div>
                <div className="h-3 w-12 bg-gray-200 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 flex items-center justify-center min-h-[50vh]">
        <div className="bg-white rounded-[20px] p-6 shadow-lg">
          <div className="text-center">
            <AlertCircle className="mx-auto text-danger-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-text-dark mb-2">Terjadi Kesalahan</h3>
            <p className="text-sm text-text-gray">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const user = data?.user || {};

  return (
    <div className="max-w-md mx-auto px-4 space-y-4">
      {/* Greeting Card */}
      <div className="bg-white rounded-[20px] p-4 mt-3 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-text-dark">Hi, {user.nama_lengkap}! 👋</h2>
        <p className="text-sm text-text-gray">{user.ruangan_nama}</p>
        <p className="text-xs text-text-gray mt-1">Siap melakukan hal besar hari ini?</p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Stats Grid - Conditional based on Role */}
      {user.kategori_user_id === 3 ? (
        // TEKNISI VIEW
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          <StatCard
            title="Tugas Aduan"
            value={stats.total_aduan_pending || 0}
            icon={<AlertCircle size={24} />}
            gradient="from-red-50/50 via-white to-red-50/30"
            iconGradient="from-red-50 via-red-100 to-red-300"
            iconColor="text-danger-600"
            delay="0"
          />
          <StatCard
            title="Pemeliharaan"
            value={stats.total_pemeliharaan_pending || 0}
            icon={<Clock size={24} />}
            gradient="from-blue-50/50 via-white to-blue-50/30"
            iconGradient="from-blue-50 via-blue-100 to-blue-300"
            iconColor="text-info-600"
            delay="100"
          />
        </div>
      ) : (
        // USER RUANGAN VIEW (Existing)
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          <StatCard
            title="Total Inventaris"
            value={stats.total_inventaris || 0}
            icon={<Package size={24} />}
            gradient="from-purple-50/50 via-white to-purple-50/30"
            iconGradient="from-purple-50 via-purple-100 to-purple-300"
            iconColor="text-brand-primary"
            delay="0"
          />
          <StatCard
            title="Total Aduan"
            value={stats.total_aduan || 0}
            icon={<AlertCircle size={24} />}
            gradient="from-orange-50/50 via-white to-orange-50/30"
            iconGradient="from-orange-50 via-orange-100 to-orange-300"
            iconColor="text-pending-600"
            delay="100"
          />
        </div>
      )}

      {/* Charts Grid - Conditional based on Role */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {user.kategori_user_id === 3 ? (
          // TEKNISI VIEW - Aduan & Pemeliharaan Charts
          <>
            <DonutChart
              title="Aduan"
              data={charts.aduan || []}
              colors={['var(--color-accent-green)', 'var(--color-accent-yellow-dark)', 'var(--color-danger-600)', 'var(--color-brand-primary-light)']} // Green, Amber, Red, Purple
            />
            <DonutChart
              title="Pemeliharaan"
              data={charts.pemeliharaan || []}
              colors={['var(--color-accent-cyan-light)', 'var(--color-accent-green)', 'var(--color-brand-primary-light)']} // Cyan, Green, Purple
            />
          </>
        ) : (
          // USER RUANGAN VIEW - Inventaris & Kalibrasi Charts
          <>
            <DonutChart
              title="Inventaris"
              data={charts.inventaris || []}
              colors={['var(--color-brand-primary)', 'var(--color-accent-green)', 'var(--color-accent-yellow-light)', 'var(--color-info-600)', 'var(--color-accent-cyan-light)']}
            />
            <DonutChart
              title="Kalibrasi"
              data={charts.kalibrasi || []}
              colors={['var(--color-accent-cyan-dark)', 'var(--color-accent-yellow-light)', 'var(--color-danger-600)']}
            />
          </>
        )}
      </div>

      {/* Main Menu */}
      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h3 className="text-lg font-bold text-text-dark mb-4 text-center">Main Menu</h3>
        <MenuGrid />
      </div>
    </div >
  );
}

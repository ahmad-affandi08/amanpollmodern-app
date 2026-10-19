import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useMobileDashboard, useAuth, usePageTitle } from '../../../hooks';
import { ROLES, isRole } from '../../auth/constants';
import DonutChart from './components/DonutChart';
import FilterBar from './components/FilterBar';
import MenuGrid from './components/MenuGrid';
import InstallBanner from '../../../pwa/InstallBanner';

export default function MobileDashboard() {
  usePageTitle('Dashboard');
  const { user: authUser } = useAuth();
  const [filters, setFilters] = useState({
    tahun_filter: '',
    bulan_filter: '',
    kategori_filter: ''
  });

  const { data, isLoading, error, refetch } = useMobileDashboard(filters);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };


  if (isLoading && !data) {
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

  const charts = data?.charts || {};
  const user = data?.user || {};
  const isTeknisi = isRole(authUser, ROLES.TEKNISI);

  return (
    <div className="max-w-md mx-auto px-4 space-y-4">
      {/* Greeting Card */}
      <div className="bg-white rounded-[20px] p-4 mt-3 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-brand-primary">Hai, {user.nama_lengkap || authUser?.nama_lengkap}!</h2>
        <p className="text-sm text-text-gray">{user.ruangan_nama}</p>
        <p className="text-xs text-text-gray mt-1">Siap melakukan hal besar hari ini?</p>
      </div>

      <InstallBanner />

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Charts Grid - Conditional based on Role */}
      {error ? (
        <div className="bg-white rounded-[20px] p-6 shadow-lg text-center">
          <AlertCircle className="mx-auto text-danger-500 mb-3" size={40} />
          <h3 className="text-base font-bold text-text-dark mb-1">Gagal memuat data dashboard</h3>
          <p className="text-sm text-text-gray mb-4">
            {error.response?.data?.message || 'Periksa koneksi Anda lalu coba lagi.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {isTeknisi ? (

          <>
            <DonutChart
              title="Aduan"
              data={charts.aduan || []}
              colors={['var(--color-accent-green)', 'var(--color-accent-yellow-dark)', 'var(--color-danger-600)', 'var(--color-brand-primary-light)']}
            />
            <DonutChart
              title="Pemeliharaan"
              data={charts.pemeliharaan || []}
              colors={['var(--color-accent-cyan-light)', 'var(--color-accent-green)', 'var(--color-brand-primary-light)']}
            />
          </>
        ) : (

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
      )}

      {/* Main Menu */}
      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h3 className="text-lg font-bold text-text-dark mb-4 text-center">Menu Utama</h3>
        <MenuGrid />
      </div>
    </div>
  );
}

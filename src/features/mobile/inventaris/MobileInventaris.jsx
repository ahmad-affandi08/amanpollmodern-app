import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import InventarisApi from '../../../api/InventarisApi';
import { queryKeys } from '../../../lib/queryKeys';
import { useDebounce, useToast, usePageTitle } from '../../../hooks';
import { toInputDate } from '../../../utils/format';
import InventarisFilters from './components/InventarisFilters';
import InventarisCard from './components/InventarisCard';
import useInfiniteScroll from '../useInfiniteScroll';

const PER_PAGE = 10;

// Buang filter kosong supaya tidak ikut terkirim ke server.
const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

export default function MobileInventaris() {
  usePageTitle('Inventaris');
  const { showToast } = useToast();
  const [filters, setFilters] = useState({
    kondisi_alat: '',
    nama_alat: '',
    search: ''
  });

  // Pencarian ditunda sebentar agar tidak memanggil server di setiap ketukan.
  const search = useDebounce(filters.search.trim(), 400);
  const queryFilters = cleanParams({ ...filters, search });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isPlaceholderData,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    // Berawalan ['inventaris', 'list'] supaya ikut disegarkan saat data inventaris berubah.
    queryKey: [...queryKeys.inventaris.lists(), 'infinite', queryFilters],
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    queryFn: ({ pageParam }) =>
      InventarisApi.getAll({ ...queryFilters, page: pageParam, per_page: PER_PAGE }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
  });

  useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage: isFetchingNextPage || isPlaceholderData,
    fetchNextPage,
  });

  const inventarisList = data?.pages.flatMap(page => page.data || []) || [];
  const isRefreshing = isFetching && !isFetchingNextPage && !isLoading;
  const hasActiveFilter = !!(filters.kondisi_alat || filters.nama_alat);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExport = async () => {
    try {
      const { blob, filename } = await InventarisApi.exportExcelFile(
        cleanParams({ ...filters, search: filters.search.trim() })
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `Inventaris_${toInputDate()}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('Export berhasil', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Gagal export data. Silakan coba lagi.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 space-y-4 pb-24">
      {/* Header Card */}
      <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 mt-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <Package className="text-brand-primary" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-dark">Inventaris</h1>
            <p className="text-xs text-text-gray">Daftar alat</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <InventarisFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 animate-pulse relative overflow-hidden">
              <div className="flex gap-4">
                {/* Image Skeleton */}
                <div className="w-[88px] h-[88px] bg-gray-200 rounded-2xl flex-shrink-0"></div>

                {/* Content Skeleton */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start">
                    <div className="h-5 bg-gray-200 rounded-lg w-2/3 mb-2"></div>
                    <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-3"></div>
                  <div className="flex gap-2 mt-auto pt-1">
                    <div className="h-4 w-12 bg-gray-50 rounded"></div>
                    <div className="h-4 w-16 bg-gray-50 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 text-center">
          <p className="text-danger-700 text-sm font-medium mb-3">
            {error?.response?.data?.message || 'Gagal memuat data inventaris'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Inventaris List */}
      {!isLoading && !isError && (
        <div className={`space-y-3 transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
          {inventarisList.length > 0 ? (
            <>
              {inventarisList.map((item) => (
                <InventarisCard key={item.id} item={item} />
              ))}

              {/* Loading More Indicator */}
              {isFetchingNextPage && (
                <div className="flex justify-center items-center py-6">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}

              {/* No More Data */}
              {!hasNextPage && inventarisList.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">Semua data sudah ditampilkan</p>
                </div>
              )}
            </>
          ) : (

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[20px] p-8 text-center border border-gray-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Package size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-text-dark mb-2">Tidak Ada Data</h3>
              <p className="text-sm text-gray-500">
                {search
                  ? `Tidak ada hasil untuk "${search}"`
                  : hasActiveFilter
                    ? 'Tidak ada inventaris yang sesuai dengan filter'
                    : 'Belum ada data inventaris'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

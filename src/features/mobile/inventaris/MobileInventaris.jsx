import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import InventarisApi from '../../../api/InventarisApi';
import InventarisFilters from './components/InventarisFilters';
import InventarisCard from './components/InventarisCard';

export default function MobileInventaris() {
  const [filters, setFilters] = useState({
    kondisi_alat: '',
    nama_alat: ''
  });


  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['inventaris-mobile', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        ...filters,
        page: pageParam,
        limit: 5
      };


      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await InventarisApi.getAll(params);
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
  });


  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  const inventarisList = data?.pages.flatMap(page => page.data || []) || [];

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };


  const handleExportCSV = async () => {
    try {

      const params = new URLSearchParams();

      if (filters.kondisi_alat) params.append('kondisi_alat', filters.kondisi_alat);
      if (filters.nama_alat) params.append('nama_alat', filters.nama_alat);


      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const token = localStorage.getItem('auth_token');


      const response = await fetch(`${baseURL}/api/inventaris/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.ms-excel',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }


      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'inventaris_export.xls';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }


      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal export data. Silakan coba lagi.');
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
        onExport={handleExportCSV}
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
          <p className="text-danger-700 text-sm font-medium">
            {error?.response?.data?.message || 'Gagal memuat data inventaris'}
          </p>
        </div>
      )}

      {/* Inventaris List */}
      {!isLoading && !isError && (
        <div className="space-y-3">
          {inventarisList.length > 0 ? (
            <>
              {inventarisList.map((item) => (
                <InventarisCard key={item.id_inventaris} item={item} />
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
              <h3 className="text-lg font-bhover:text-brand-primary mb-2">Tidak Ada Data</h3>
              <p className="text-sm text-gray-500">
                {filters.kondisi_alat || filters.nama_alat
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

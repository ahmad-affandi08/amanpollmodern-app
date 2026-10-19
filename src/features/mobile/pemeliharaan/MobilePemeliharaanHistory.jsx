import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileDown, RotateCcw, AlertCircle } from 'lucide-react';
import { usePageTitle, useToast, usePemeliharaanAssignments } from '../../../hooks';
import { apiUrl } from '../../../config';
import { formatDate } from '../../../utils/format';
import noImage from '../../../assets/img/no_image.png';
import StatusBadge from '../../../components/StatusBadge';
import useInfiniteScroll from '../useInfiniteScroll';

export default function MobilePemeliharaanHistory() {
  usePageTitle('Riwayat Pemeliharaan');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = usePemeliharaanAssignments(20, '', statusFilter, 'all', null, null, startDate || null, endDate || null);

  useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  const pemeliharaanList = data?.pages.flatMap(page => page.data).filter(Boolean) || [];
  const hasActiveFilter = statusFilter !== 'all' || !!startDate || !!endDate;

  const handleReset = () => {
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const handleExport = () => {
    if (startDate && endDate && startDate > endDate) {
      showToast('Tanggal mulai tidak boleh lebih besar dari tanggal akhir', 'warning');
      return;
    }

    window.open(
      apiUrl('/pemeliharaan/export-excel', {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        start_date: startDate,
        end_date: endDate,
      }),
      '_blank'
    );
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-4">
      {/* Header */}
      <div className="py-4">
        <h1 className="text-lg font-bold text-gray-800">Riwayat Pemeliharaan</h1>
        <p className="text-sm text-gray-500">Riwayat pemeliharaan yang pernah dikerjakan</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm space-y-3">
        {/* Export Button */}
        <button
          onClick={handleExport}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <FileDown size={16} />
          Export Excel
        </button>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="Belum Selesai">Belum Selesai</option>
          <option value="Selesai">Selesai</option>
          <option value="Tindakan Lanjutan">Tindakan Lanjutan</option>
        </select>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-2 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <RotateCcw size={16} />
          Reset Filter
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isError ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-2" size={48} />
            <p className="text-danger-600 mb-3">Gagal memuat data</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
            >
              Coba Lagi
            </button>
          </div>
        ) : isLoading ? (

          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                <div className="h-8 bg-gray-200 rounded-full w-16"></div>
              </div>
            </div>
          ))
        ) : pemeliharaanList.length === 0 ? (

          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-300 mb-3" size={64} />
            <p className="text-gray-500 text-sm">
              {hasActiveFilter ? 'Tidak ada hasil yang sesuai dengan filter' : 'Tidak ada riwayat pemeliharaan'}
            </p>
          </div>
        ) : (
          pemeliharaanList.map((item) => (
            <div
              key={item.id_pemeliharaan}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex gap-3 mb-3">
                {/* Image */}
                <div className="flex-shrink-0">
                  <img
                    src={item.img_alat || noImage}
                    alt="Alat"
                    className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                    onError={(e) => { e.target.src = noImage; }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
                    {item.nama_alat_nama}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1">
                    {item.no_inventaris}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    {item.ruangan_nama}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar size={12} />
                    <span>{formatDate(item.jadwal_pemeliharaan)}</span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex justify-between items-center gap-2">
                <StatusBadge status={item.status} size="sm" />

                {/* Detail Button */}
                <button
                  onClick={() => navigate(`/mobile/pemeliharaan/${item.id_pemeliharaan}`)}
                  className="text-xs font-bold text-brand-primary hover:text-brand-primary px-3 py-1.5 rounded-full hover:bg-brand-primary-soft transition-all"
                >
                  Detail
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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

      {/* End of List */}
      {!hasNextPage && pemeliharaanList.length > 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">Semua data telah ditampilkan</p>
        </div>
      )}
    </div>
  );
}

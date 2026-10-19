import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { useAuth, useToast, useDebounce, usePageTitle, useAduanListInfinite } from '../../../hooks';
import { ROLES, isRole } from '../../auth/constants';
import { apiUrl } from '../../../config';
import { formatDateTime } from '../../../utils/format';
import StatusBadge from '../../../components/StatusBadge';
import noImage from '../../../assets/img/no_image.png';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import useInfiniteScroll from '../useInfiniteScroll';

const STATUS_FILTERS = [
  { label: 'Semua', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Sedang Dikerjakan', value: 'Sedang Dikerjakan' },
  { label: 'Selesai', value: 'Selesai' },
  { label: 'Tindakan Lanjutan', value: 'Tindakan Lanjutan' },
];

export default function MobileAduanHistory() {
  usePageTitle('Riwayat Aduan');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');

  const isTeknisi = isRole(user, ROLES.TEKNISI);

  // Pencarian dikirim ke server (bukan menyaring halaman yang sudah dimuat).
  const search = useDebounce(searchQuery.trim(), 400);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isPlaceholderData,
    isLoading,
    isError,
    refetch,
  } = useAduanListInfinite({
    search: search || undefined,
    status_aduan: statusFilter || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  }, 10);

  const aduanList = data?.pages.flatMap(page => page.data) || [];
  const isRefreshing = isFetching && !isFetchingNextPage && !isLoading;
  const hasActiveFilter = !!(search || statusFilter || startDate || endDate);

  useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage: isFetchingNextPage || isPlaceholderData,
    fetchNextPage,
  });

  const handleExport = () => {
    if (startDate && endDate && startDate > endDate) {
      showToast('Tanggal mulai tidak boleh lebih besar dari tanggal akhir', 'warning');
      return;
    }

    window.open(
      apiUrl('/report/aduan/export-excel-teknisi', { start_date: startDate, end_date: endDate }),
      '_blank'
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-20">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Riwayat Aduan</h1>
        <p className="text-xs text-gray-500">Daftar semua riwayat laporan kerusakan</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === filter.value
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Filter & Export Section - Only for Teknisi */}
      {isTeknisi && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4 space-y-3">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors active:scale-95"
          >
            <FileSpreadsheet size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama alat, no. inventaris, keluhan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
          />
          {isRefreshing && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"
              aria-label="Memuat"
            />
          )}
        </div>
      </div>

      {/* List */}
      <div className={`space-y-3 transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
        {isError ? (
          <div className="text-center py-12 text-danger-500">
            <AlertCircle className="mx-auto mb-3" size={48} />
            <p className="mb-3">Gagal memuat riwayat aduan</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
            >
              Coba Lagi
            </button>
          </div>
        ) : aduanList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="mx-auto mb-3 text-gray-300" size={48} />
            <p>
              {search
                ? `Tidak ada hasil untuk "${search}"`
                : hasActiveFilter
                  ? 'Tidak ada aduan yang sesuai dengan filter'
                  : 'Belum ada riwayat aduan'}
            </p>
          </div>
        ) : (
          aduanList.map(item => (
            <div
              key={item.id_aduan}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <StatusBadge status={item.status_aduan} size="sm" />
                <span className="text-[10px] text-gray-400 font-medium">
                  {formatDateTime(item.create_date)}
                </span>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <img
                    src={item.img_keluhan || noImage}
                    alt="Foto Keluhan"
                    className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                    onError={(e) => { e.target.src = noImage; }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.img_keluhan) {
                        setPreviewImage(item.img_keluhan);
                        setPreviewAlt('Foto Keluhan');
                      }
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm truncate mb-1">
                    {item.nama_alat_nama || 'Nama Alat Tidak Diketahui'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 truncate">
                    {item.no_inventaris} • {item.ruangan_nama}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-lg italic mb-3">
                    "{item.keluhan}"
                  </p>

                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate(`/mobile/riwayat-aduan/${item.id_aduan}`)}
                      className="flex items-center gap-1.5 text-xs font-bold text-brand-primary bg-brand-primary/5 px-3 py-1.5 rounded-lg active:scale-95 transition-transform hover:bg-brand-primary/10"
                    >
                      Lihat Detail
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Loading Indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-0"></div>
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      )}
      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage}
        alt={previewAlt}
      />
    </div>
  );
}

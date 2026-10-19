import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, ChevronRight, Search } from 'lucide-react';
import {
  useAduanListInfinite,
  useMobileDashboard,
  useDebounce,
  usePageTitle,
} from '../../../hooks';
import { formatDateTime } from '../../../utils/format';
import StatusBadge from '../../../components/StatusBadge';
import noImage from '../../../assets/img/no_image.png';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import useInfiniteScroll from '../useInfiniteScroll';

// Tugas aktif teknisi = Sedang Dikerjakan + Tindakan Lanjutan (sama dengan /aduan/assignments).
const ACTIVE_STATUSES = ['Sedang Dikerjakan', 'Tindakan Lanjutan'];

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua Tugas', active: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md', idle: 'hover:border-purple-300' },
  { value: 'Sedang Dikerjakan', label: 'Sedang Dikerjakan', active: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md', idle: 'hover:border-blue-300' },
  { value: 'Tindakan Lanjutan', label: 'Tindakan Lanjutan', active: 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-md', idle: 'hover:border-purple-300' },
];

export default function MobileAduanListTeknisi() {
  usePageTitle('Daftar Tugas Aduan');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');

  const { data: dashboardData } = useMobileDashboard({});
  const stats = dashboardData?.stats || {};

  // Pencarian dikirim ke server. /aduan otomatis dibatasi ke aduan milik teknisi yang login.
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
  } = useAduanListInfinite(
    statusFilter === 'all'
      ? { search: search || undefined, status_in: ACTIVE_STATUSES }
      : { search: search || undefined, status_aduan: statusFilter },
    10
  );

  const aduanList = data?.pages.flatMap(page => page.data) || [];
  const totalTugas = data?.pages[0]?.meta?.total ?? aduanList.length;
  const isRefreshing = isFetching && !isFetchingNextPage && !isLoading;

  useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage: isFetchingNextPage || isPlaceholderData,
    fetchNextPage,
  });

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 space-y-4 pt-3 pb-20 animate-pulse">
        {/* Header Stats Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-gray-200 rounded-2xl border border-gray-100"></div>
          <div className="h-20 bg-gray-200 rounded-2xl border border-gray-100"></div>
        </div>

        <div className="flex justify-between items-center mt-6 mb-2">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-5 w-20 bg-gray-100 rounded-full"></div>
        </div>

        {/* Task List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="h-5 w-16 bg-gray-100 rounded-md"></div>
                <div className="h-3 w-20 bg-gray-100 rounded"></div>
              </div>
              <div className="flex gap-3 mb-3">
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-50 rounded-xl mb-3"></div>
              <div className="flex justify-end">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-4 pt-3 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-info-50 p-3 rounded-2xl border border-info-100 flex items-center gap-3">
          <div className="bg-info-100 p-2 rounded-xl text-info-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-info-600 font-medium">Sedang Dikerjakan</p>
            <p className="text-lg font-bold text-info-700">{stats.total_aduan_sedang_dikerjakan || 0}</p>
          </div>
        </div>
        <div className="bg-warning-50 p-3 rounded-2xl border border-warning-100 flex items-center gap-3">
          <div className="bg-warning-100 p-2 rounded-xl text-warning-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-warning-600 font-medium">Tindakan Lanjutan</p>
            <p className="text-lg font-bold text-warning-700">{stats.total_aduan_tindakan_lanjutan || 0}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 mb-2">
        <h2 className="text-lg font-bold text-gray-800">Tugas Saya</h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{totalTugas} Tugas Aktif</span>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3 mb-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama alat atau no inventaris..."
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

        {/* Status Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${statusFilter === filter.value
                ? filter.active
                : `bg-white text-gray-700 border border-gray-200 ${filter.idle}`
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className={`space-y-3 transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
        {isError ? (
          <div className="text-center py-12 text-danger-500">
            <AlertCircle className="mx-auto mb-2" size={48} />
            <p className="mb-3">Gagal memuat tugas. Silakan coba lagi.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
            >
              Coba Lagi
            </button>
          </div>
        ) : aduanList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="mx-auto mb-2" size={48} />
            <p>
              {search
                ? `Tidak ada hasil untuk "${search}"`
                : 'Tidak ada tugas aduan'}
            </p>
          </div>
        ) : (
          aduanList.map((item) => (
            <div
              key={item.id_aduan}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <StatusBadge status={item.status_aduan} size="sm" />
                <span className="text-[10px] text-gray-400">{formatDateTime(item.create_date)}</span>
              </div>

              <div className="flex gap-3 mb-3">
                {/* Image Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={item.img_keluhan || noImage}
                    alt="Alat"
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                    onError={(e) => { e.target.src = noImage; }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.img_keluhan) {
                        setPreviewImage(item.img_keluhan);
                        setPreviewAlt(item.nama_alat_nama || 'Foto Alat');
                      }
                    }}
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
                    {item.nama_alat_nama || 'Nama alat tidak diketahui'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1 line-clamp-1">
                    {item.no_inventaris} • {item.ruangan_nama || 'Ruangan tidak diketahui'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-2 rounded-xl mb-3 flex gap-2 items-start">
                <AlertCircle size={14} className="text-pending-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 line-clamp-2">{item.keluhan}</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate(`/mobile/aduan/${item.id_aduan}`)}
                  className="flex items-center gap-1 text-xs font-bold text-brand-primary "
                >
                  Proses <ChevronRight size={14} />
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

      {/* No More Data */}
      {!hasNextPage && aduanList.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">Semua tugas sudah ditampilkan</p>
        </div>
      )}
      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage}
        alt={previewAlt}
      />
    </div>
  );
}

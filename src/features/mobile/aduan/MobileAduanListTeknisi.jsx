import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ChevronRight, Loader2, Search } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { useAduanAssignments } from '../../../hooks/queries/useAduanQueries';
import { formatDateTime } from '../../../utils/format';
import { useAuthContext } from '../../../context/AuthContext';
import { useMobileDashboard } from '../../../hooks/queries/useDashboardQueries';
import noImage from '../../../assets/img/no_image.png';
import ImagePreviewModal from '../../../components/ImagePreviewModal';

export default function MobileAduanListTeknisi() {
  usePageTitle('Daftar Tugas Aduan');
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, sedang_dikerjakan, selesai
  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');

  // Use dashboard hook for stats
  const { data: dashboardData } = useMobileDashboard({
    enabled: !!user,
  });
  const stats = dashboardData?.stats || {};

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useAduanAssignments(10, statusFilter !== 'all' ? statusFilter : undefined);

  const aduanList = data?.pages.flatMap(page => page.data) || [];

  // Filter logic - only for active tasks
  const filteredList = aduanList.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.nama_alat_nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.no_inventaris?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'sedang_dikerjakan' && item.status_aduan === 'Sedang Dikerjakan') ||
      (statusFilter === 'tindakan_lanjutan' && item.status_aduan === 'Tindakan Lanjutan');

    return matchesSearch && matchesStatus;
  });

  // Infinite scroll handler matching MobileInventaris.jsx pattern
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

  if (isError) {
    return (
      <div className="p-4 text-center text-danger-500">
        Gagal memuat tugas. Silakan coba lagi.
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
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{aduanList.length} Tugas Aktif</span>
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
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white focus:outline-none focus:border-indigo-500 text-sm placehover:text-brand-primary"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${statusFilter === 'all'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
              }`}
          >
            Semua Tugas
          </button>
          <button
            onClick={() => setStatusFilter('sedang_dikerjakan')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${statusFilter === 'sedang_dikerjakan'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
          >
            Sedang Dikerjakan
          </button>
          <button
            onClick={() => setStatusFilter('tindakan_lanjutan')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${statusFilter === 'tindakan_lanjutan'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
              }`}
          >
            Tindakan Lanjutan
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {aduanList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="mx-auto mb-2" size={48} />
            <p>Tidak ada tugas aduan</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="mx-auto mb-2" size={48} />
            <p>Tidak ada hasil yang sesuai dengan filter</p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id_aduan}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${item.status_aduan === 'Sedang Dikerjakan' ? 'bg-info-100 text-info-600' :
                  'bg-warning-100 text-warning-600'
                  }`}>
                  {item.status_aduan ? item.status_aduan.toUpperCase() : 'UNKNOWN'}
                </span>
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
                    {item.nama_alat_nama || 'Nama Alat N/A'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1 line-clamp-1">
                    {item.no_inventaris} • {item.ruangan_nama || 'Ruangan N/A'}
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
      {!hasNextPage && filteredList.length > 0 && (
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

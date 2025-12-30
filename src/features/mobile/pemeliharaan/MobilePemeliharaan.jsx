import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, AlertCircle, Search } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { usePemeliharaanAssignments, useUpdateSignature } from '../../../hooks/queries/usePemeliharaanQueries';
import { formatDateTime } from '../../../utils/format';
import noImage from '../../../assets/img/no_image.png';
import SignatureModal from './components/SignatureModal';
import { ToastDialog } from '../../../components/Alert/Alert';

export default function MobilePemeliharaan() {
  usePageTitle('Daftar Pemeliharaan');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, belum_selesai, selesai

  // Get current month and year as default
  const currentDate = new Date();
  const [periodFilter, setPeriodFilter] = useState('bulan_ini'); // 'bulan_ini' or 'semua'
  const [monthFilter, setMonthFilter] = useState(currentDate.getMonth() + 1); // 1-12
  const [yearFilter, setYearFilter] = useState(currentDate.getFullYear());

  // Signature modal state
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureType, setSignatureType] = useState(''); // 'teknisi' or 'karu'
  const [selectedPemeliharaanId, setSelectedPemeliharaanId] = useState(null);
  const [toast, setToast] = useState(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = usePemeliharaanAssignments(
    20,
    searchQuery,
    statusFilter,
    periodFilter === 'bulan_ini' ? monthFilter : null,
    periodFilter === 'bulan_ini' ? yearFilter : null
  );

  const updateSignature = useUpdateSignature();

  // Infinite scroll logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 100 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Data is already filtered by backend
  const pemeliharaanList = data?.pages.flatMap(page => page.data) || [];

  // Handle signature modal open
  const handleOpenSignatureModal = (id, type) => {
    setSelectedPemeliharaanId(id);
    setSignatureType(type);
    setSignatureModalOpen(true);
  };

  // Handle period filter change
  const handlePeriodFilterChange = (period) => {
    setPeriodFilter(period);
    if (period === 'bulan_ini') {
      setMonthFilter(currentDate.getMonth() + 1);
      setYearFilter(currentDate.getFullYear());
    }
  };

  // Handle signature submission
  const handleSignatureSubmit = async (formData) => {
    try {
      await updateSignature.mutateAsync({
        id: selectedPemeliharaanId,
        data: {
          type: signatureType,
          nama: formData.nama,
          ttd: formData.ttd
        }
      });

      setToast({ type: 'success', message: 'Tanda tangan berhasil disimpan' });
      setSignatureModalOpen(false);
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Gagal menyimpan tanda tangan'
      });
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-2" size={48} />
        <p className="text-red-600">Gagal memuat data pemeliharaan</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-4">
      {/* Header */}
      <div className="py-4">
        <h1 className="text-lg font-bold text-gray-800">Daftar Pemeliharaan</h1>
        <p className="text-sm text-gray-500">Tugas pemeliharaan yang ditugaskan</p>
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
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white focus:outline-none focus:border-indigo-500 text-sm placeholder:text-gray-400 border border-gray-200"
          />
        </div>

        {/* Filter Dropdowns - 2 Column Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-3 pr-8 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="Belum Selesai">Belum Selesai</option>
              <option value="Selesai">Selesai</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Period Filter Dropdown */}
          <div className="relative">
            <select
              value={periodFilter}
              onChange={(e) => handlePeriodFilterChange(e.target.value)}
              className="w-full px-3 py-3 pr-8 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer transition-all"
            >
              <option value="bulan_ini">Bulan Ini</option>
              <option value="semua">Semua Data</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading && pemeliharaanList.length === 0 ? (
          // Skeleton Loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                <div className="h-8 bg-gray-200 rounded-full w-16"></div>
              </div>
            </div>
          ))
        ) : pemeliharaanList.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-300 mb-3" size={64} />
            <p className="text-gray-500 text-sm">Tidak ada pemeliharaan yang ditugaskan</p>
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
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar size={12} />
                    <span>{formatDateTime(item.jadwal_pemeliharaan)}</span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex justify-between items-center gap-2">
                <div className="flex flex-wrap gap-1">
                  {/* Status Badge */}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${item.status === 'Belum Selesai'
                    ? 'bg-warning-100 text-warning-700'
                    : 'bg-success-100 text-success-700'
                    }`}>
                    {item.status}
                  </span>

                  {/* Signature Buttons (only if status is Selesai) */}
                  {item.status === 'Selesai' && item.status_ttd_teknisi !== 'Sudah TTD' && (
                    <button
                      onClick={() => handleOpenSignatureModal(item.id_pemeliharaan, 'teknisi')}
                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-pending-100 text-pending-700 hover:bg-pending-200"
                    >
                      {item.status_ttd_teknisi}
                    </button>
                  )}
                  {item.status === 'Selesai' && item.status_ttd_karu !== 'Sudah TTD' && (
                    <button
                      onClick={() => handleOpenSignatureModal(item.id_pemeliharaan, 'karu')}
                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-pending-100 text-pending-700 hover:bg-pending-200"
                    >
                      {item.status_ttd_karu}
                    </button>
                  )}
                </div>

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

      {/* Signature Modal */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSubmit={handleSignatureSubmit}
        title={signatureType === 'teknisi' ? 'Tanda Tangan Teknisi' : 'Tanda Tangan Kepala Ruang'}
        isLoading={updateSignature.isPending}
      />

      {/* Toast Notification */}
      <ToastDialog
        isOpen={!!toast}
        type={toast?.type || 'info'}
        message={toast?.message}
        onClose={() => setToast(null)}
        duration={3000}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, Search } from 'lucide-react';
import {
  usePageTitle,
  useToast,
  useDebounce,
  usePemeliharaanAssignments,
  useUpdateSignature,
} from '../../../hooks';
import { formatDate } from '../../../utils/format';
import noImage from '../../../assets/img/no_image.png';
import SignatureModal from './components/SignatureModal';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import StatusBadge from '../../../components/StatusBadge';
import KondisiBadge from '../../../components/KondisiBadge';
import useInfiniteScroll from '../useInfiniteScroll';

export default function MobilePemeliharaan() {
  usePageTitle('Daftar Pemeliharaan');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kondisiFilter, setKondisiFilter] = useState('all');
  // Default bulan berjalan; pilih "Semua Data" untuk melihat bulan lain (urut jadwal terdekat hari ini).
  const [periodFilter, setPeriodFilter] = useState('bulan_ini');

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureType, setSignatureType] = useState('');
  const [selectedPemeliharaanId, setSelectedPemeliharaanId] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');

  const search = useDebounce(searchQuery.trim(), 400);
  const now = new Date();
  const isBulanIni = periodFilter === 'bulan_ini';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = usePemeliharaanAssignments(
    20,
    search,
    statusFilter,
    kondisiFilter,
    isBulanIni ? now.getMonth() + 1 : null,
    isBulanIni ? now.getFullYear() : null
  );

  const updateSignature = useUpdateSignature();

  useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  const pemeliharaanList = data?.pages.flatMap(page => page.data) || [];
  const hasActiveFilter = !!(search || statusFilter !== 'all' || kondisiFilter !== 'all' || isBulanIni);

  const handleOpenSignatureModal = (item, type) => {
    setSelectedPemeliharaanId(item.id_pemeliharaan);
    setSignatureType(type);
    setSignatureModalOpen(true);
  };

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

      showToast('Tanda tangan berhasil disimpan', 'success');
      setSignatureModalOpen(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan tanda tangan', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-4">
      <div className="py-4">
        <h1 className="text-lg font-bold text-gray-800">Daftar Pemeliharaan</h1>
        <p className="text-sm text-gray-500">Tugas pemeliharaan yang ditugaskan</p>
      </div>

      <div className="space-y-3 mb-4">
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

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-3 pr-8 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="Belum Selesai">Belum Selesai</option>
              <option value="Selesai">Selesai</option>
              <option value="Tindakan Lanjutan">Tindakan Lanjutan</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={kondisiFilter}
              onChange={(e) => setKondisiFilter(e.target.value)}
              className="w-full px-3 py-3 pr-8 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer transition-all"
            >
              <option value="all">Semua Kondisi</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

        </div>

        <div className="relative">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
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

      <div className="space-y-3">
        {isError ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-2" size={48} />
            <p className="text-red-600 mb-3">Gagal memuat data pemeliharaan</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
            >
              Coba Lagi
            </button>
          </div>
        ) : isLoading && pemeliharaanList.length === 0 ? (
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
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-300 mb-3" size={64} />
            <p className="text-gray-500 text-sm">
              {search
                ? `Tidak ada hasil untuk "${search}"`
                : hasActiveFilter
                  ? 'Tidak ada pemeliharaan yang sesuai dengan filter'
                  : 'Tidak ada pemeliharaan yang ditugaskan'}
            </p>
          </div>
        ) : (
          pemeliharaanList.map((item) => (
            <div
              key={item.id_pemeliharaan}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex gap-3 mb-3">
                <div className="flex-shrink-0">
                  <img
                    src={item.img_alat || noImage}
                    alt="Alat"
                    className="w-20 h-20 rounded-xl object-cover bg-gray-100 cursor-pointer"
                    onError={(e) => { e.target.src = noImage; }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.img_alat) {
                        setPreviewImage(item.img_alat);
                        setPreviewAlt(item.nama_alat_nama);
                      }
                    }}
                  />
                </div>

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
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                    <Calendar size={12} />
                    <span>{formatDate(item.jadwal_pemeliharaan)}</span>
                  </div>
                  {/* Kondisi alat (inventaris) */}
                  <div className="mt-1">
                    <KondisiBadge kondisi={item.inventaris_kondisi_label} size="sm" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-2">
                <div className="flex flex-wrap gap-1">
                  <StatusBadge status={item.status} size="sm" />

                  {(item.status === 'Selesai' || item.status === 'Tindakan Lanjutan') && item.status_ttd_teknisi && item.status_ttd_teknisi !== 'Sudah TTD' && (
                    <button
                      onClick={() => handleOpenSignatureModal(item, 'teknisi')}
                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-pending-100 text-pending-700 hover:bg-pending-200"
                    >
                      Belum TTD Teknisi
                    </button>
                  )}
                  {(item.status === 'Selesai' || item.status === 'Tindakan Lanjutan') && item.status_ttd_karu && item.status_ttd_karu !== 'Sudah TTD' && (
                    <button
                      onClick={() => handleOpenSignatureModal(item, 'karu')}
                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-pending-100 text-pending-700 hover:bg-pending-200"
                    >
                      Belum TTD Kepala Ruangan
                    </button>
                  )}
                </div>

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

      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-6">
          <div className="flex items-center gap-2 text-brand-primary">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {!hasNextPage && pemeliharaanList.length > 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">Semua data telah ditampilkan</p>
        </div>
      )}

      <SignatureModal
        key={`${selectedPemeliharaanId}-${signatureType}`}
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSubmit={handleSignatureSubmit}
        title={signatureType === 'teknisi' ? 'Tanda Tangan Teknisi' : 'Tanda Tangan Kepala Ruangan'}
        isLoading={updateSignature.isPending}
        existingName={
          signatureType === 'karu'
            ? pemeliharaanList.find(item => item.id_pemeliharaan === selectedPemeliharaanId)?.nama_kepala_ruangan || ''
            : ''
        }
      />

      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage}
        alt={previewAlt}
      />
    </div>
  );
}

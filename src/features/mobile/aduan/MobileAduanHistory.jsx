import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, FileSpreadsheet, ChevronRight } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { useAduanListInfinite } from '../../../hooks/queries/useAduanQueries';
import { formatDateTime } from '../../../utils/format';
import { useAuthContext } from '../../../context/AuthContext';
import noImage from '../../../assets/img/no_image.png';
import ImagePreviewModal from '../../../components/ImagePreviewModal';

export default function MobileAduanHistory() {
  usePageTitle('Riwayat Aduan');
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');


  const isTeknisi = parseInt(user?.kategori_user_id) === 3;


  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useAduanListInfinite({
    status_aduan: 'Selesai',
    search: searchQuery,
  }, 10);

  const aduanList = data?.pages.flatMap(page => page.data) || [];


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


  const handleExport = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      return;
    }


    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);


    window.open(`/api/report/aduan/export-excel-teknisi?${params.toString()}`, '_blank');
  };


  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Sedang Dikerjakan': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Selesai': { bg: 'bg-green-100', text: 'text-green-800' },
      'Tindakan Lanjutan': { bg: 'bg-orange-100', text: 'text-orange-800' },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${config.bg} ${config.text}`}>
        {status}
      </span>
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

  if (isError) {
    return (
      <div className="p-8 text-center text-danger-500">
        <AlertCircle className="mx-auto mb-2" size={48} />
        <p>Gagal memuat riwayat aduan</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-20">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Riwayat Aduan</h1>
        <p className="text-xs text-gray-500">Daftar laporan kerusakan yang sudah selesai</p>
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
            placeholder="Cari nama alat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {aduanList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="mx-auto mb-3 text-gray-300" size={48} />
            <p>Belum ada riwayat aduan</p>
          </div>
        ) : (
          aduanList.map(item => (
            <div
              key={item.id_aduan}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                {getStatusBadge(item.status_aduan)}
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

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Calendar, AlertCircle, Wrench, CheckCircle, Clock } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { useAduanDetail } from '../../../hooks/queries/useAduanQueries';
import { formatDateTime } from '../../../utils/format';
import noImage from '../../../assets/img/no_image.png';

export default function MobileAduanDetailUser() {
  usePageTitle('Detail Aduan');
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: aduan, isLoading } = useAduanDetail(id);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
        <div className="h-40 bg-gray-100 rounded-2xl"></div>
        <div className="h-20 bg-gray-100 rounded-2xl"></div>
      </div>
    );
  }

  if (!aduan) {
    return (
      <div className="p-8 text-center text-gray-500">
        <AlertCircle className="mx-auto mb-2 text-gray-400" size={48} />
        <p>Detail aduan tidak ditemukan</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Sedang Dikerjakan': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Selesai': return 'bg-green-100 text-green-800 border-green-200';
      case 'Tindakan Lanjutan': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 sticky top-0 bg-brand-primary-soft/95 backdrop-blur-sm z-10 -mx-4 px-4 border-b border-brand-primary/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/50 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Detail Laporan</h1>
      </div>

      <div className="space-y-4 data-fade-in">
        {/* Status Card */}
        <div className={`p-4 rounded-2xl border ${getStatusColor(aduan.status_aduan)} flex items-center justify-between shadow-sm`}>
          <div>
            <p className="text-xs font-medium opacity-80">Status Saat Ini</p>
            <p className="text-lg font-bold">{aduan.status_aduan}</p>
          </div>
          <div className="bg-white/30 p-2 rounded-xl">
            {aduan.status_aduan === 'Selesai' ? <CheckCircle size={24} /> : <Clock size={24} />}
          </div>
        </div>

        {/* Main Info */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src={aduan.img_keluhan || noImage}
                alt="Keluhan"
                className="w-20 h-20 rounded-xl object-cover border border-gray-100 bg-gray-50"
                onError={(e) => { e.target.src = noImage; }}
                onClick={() => aduan.img_keluhan && window.open(aduan.img_keluhan, '_blank')}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{aduan.nama_alat_nama || 'Nama Alat N/A'}</h3>
              <p className="text-xs text-brand-primary bg-brand-primary/5 px-2 py-1 rounded-md inline-block mt-1 mb-2 font-medium">
                {aduan.no_inventaris}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>{formatDateTime(aduan.create_date)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 mb-1 font-medium">Keluhan Anda:</p>
            <p className="text-sm text-gray-700 italic">"{aduan.keluhan}"</p>
          </div>
        </div>

        {/* Technician Info */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Wrench size={18} className="text-brand-primary" />
            Teknisi Penanggung Jawab
          </h3>
          {aduan.teknisi_nama ? (
            <div className="flex items-center gap-3 bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/10">
              <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                <User size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{aduan.teknisi_nama}</p>
                <p className="text-xs text-gray-500">Teknisi Medis</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">Belum ada teknisi ditugaskan</p>
            </div>
          )}
        </div>

        {/* Result Report (Only if processed) */}
        {(aduan.tindakan_teknisi || aduan.rekomendasi) && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">Laporan Pengerjaan</h3>

            {aduan.tindakan_teknisi && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Tindakan Perbaikan</p>
                <p className="text-sm text-gray-700">{aduan.tindakan_teknisi}</p>
              </div>
            )}

            {aduan.rekomendasi && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Rekomendasi</p>
                <p className="text-sm text-gray-700">{aduan.rekomendasi}</p>
              </div>
            )}

            {aduan.kondisi_alat && (
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-gray-500">Kondisi Akhir:</p>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${aduan.kondisi_alat === 'Baik' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                  }`}>
                  {aduan.kondisi_alat}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

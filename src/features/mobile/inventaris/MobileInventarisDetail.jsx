import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Activity, Tag, Info, AlertCircle, Phone, FileText,
  ChevronLeft, MoreVertical, Share2, ImageIcon, Zap, DollarSign
} from 'lucide-react';
import { useInventarisDetail } from '../../../hooks/queries/useInventarisQueries';
import { rupiah } from '../../../utils/format';
import UpdateLocationModal from './components/UpdateLocationModal';

// InfoRow component - moved outside to prevent re-creation on every render
const InfoRow = ({ label, value, icon: Icon, isLink = false }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2.5 text-gray-500">
      {Icon && <Icon size={16} className="text-brand-primary/70" />}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="text-right flex-1 pl-4">
      {isLink && value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary text-sm font-bold hover:underline break-words"
        >
          Tampilkan
        </a>
      ) : (
        <span className="text-text-dark text-sm font-semibold break-words">{value || '-'}</span>
      )}
    </div>
  </div>
);

export default function MobileInventarisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: inventaris, isLoading, isError } = useInventarisDetail(id);
  const [activeTab, setActiveTab] = useState('info');
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center font-sans">
        <div className="w-full max-w-md min-h-screen pb-6 relative">
          <div className="relative h-72 bg-gray-200 rounded-b-[30px] overflow-hidden shadow-lg mx-[-1px] animate-pulse">
            <div className="absolute top-4 left-4 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full"></div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-300 via-gray-300/80 to-transparent p-6 pt-24">
              <div className="w-20 h-5 bg-gray-400 rounded-lg mb-2.5"></div>
              <div className="w-3/4 h-8 bg-gray-400 rounded-lg mb-1.5"></div>
              <div className="w-1/2 h-4 bg-gray-400/70 rounded-lg"></div>
            </div>
          </div>
          <div className="px-5 mt-4">
            <div className="flex bg-gray-100/80 p-1 rounded-2xl">
              <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
          <div className="px-5 mt-5 space-y-5">
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 animate-pulse h-32"></div>
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 animate-pulse h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !inventaris) {
    return (
      <div className="min-h-screen bg-bg-light flex justify-center">
        <div className="w-full max-w-md bg-bg-light min-h-screen flex items-center justify-center p-4 shadow-xl">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Inventaris tidak ditemukan</p>
            <button
              onClick={() => navigate(-1)}
              className="text-brand-primary font-bold"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const map = {
      'Selesai': 'bg-green-100 text-green-700',
      'Sedang Dikerjakan': 'bg-blue-100 text-blue-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Baru': 'bg-red-100 text-red-700',
      'Baik': 'bg-green-100 text-green-700',
      'Rusak Ringan': 'bg-yellow-100 text-yellow-700',
      'Rusak Berat': 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen flex justify-center font-sans">
      <div className="w-full max-w-md min-h-screen pb-6 relative">

        {/* Header Image Area */}
        <div className="relative h-72 bg-gray-900 rounded-b-[30px] overflow-hidden shadow-lg mx-[-1px]">
          {inventaris.img_alat_url ? (
            <img
              src={inventaris.img_alat_url}
              alt={inventaris.nama_alat?.nama_nama_alat}
              className="w-full h-full object-cover opacity-90"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EGambar Tidak Tersedia%3C/text%3E%3C/svg%3E';
                e.target.onerror = null;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-primary-light">
              <ImageIcon size={64} className="text-white/30" />
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors z-10 border border-white/10 shadow-lg"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-text-dark via-text-dark/80 to-transparent p-6 pt-24">
            <span className="px-3 py-1 bg-brand-primary text-white text-[10px] font-bold rounded-lg uppercase tracking-wider mb-2.5 inline-block shadow-lg shadow-brand-primary/20">
              {inventaris.kondisi_alat || 'Inventaris'}
            </span>
            <h1 className="text-white text-2xl font-bold leading-tight mb-1.5 drop-shadow-md">
              {inventaris.nama_alat?.nama_nama_alat}
            </h1>
            <p className="text-white/80 text-sm font-medium flex items-center gap-2">
              <span className="opacity-60">No. Inv:</span> {inventaris.no_inventaris}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 mt-4">
          <div className="flex bg-gray-100/80 p-1 rounded-2xl backdrop-blur-sm">
            {['info', 'aduan', 'pemeliharaan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 capitalize ${activeTab === tab
                  ? 'bg-white text-brand-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 mt-5 relative z-10 space-y-5">

          {/* TAB: INFO - Existing Detail Content */}
          {activeTab === 'info' && (
            <div className="animate-fade-in space-y-5">
              {/* Location Card & Action */}
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-text-dark text-lg">Lokasi Saat Ini</h3>
                  <button
                    onClick={() => setLocationModalOpen(true)}
                    className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-xl hover:bg-brand-primary/20 transition-colors"
                  >
                    Pindah
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm">
                    <MapPin size={24} className="text-accent-orange" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Ruangan</p>
                    <p className="text-text-dark font-bold text-base">
                      {inventaris.ruangan_sekarang?.nama_ruangan || inventaris.ruangan?.nama_ruangan || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-text-dark text-lg mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <span className="w-1 h-5 bg-brand-primary rounded-full"></span>
                  Spesifikasi Alat
                </h3>

                <div className="space-y-0.5">
                  <InfoRow icon={Tag} label="Merk" value={inventaris.merk} />
                  <InfoRow icon={Info} label="Model/Type" value={inventaris.model} />
                  <InfoRow icon={Info} label="No Seri" value={inventaris.seri} />
                  <InfoRow icon={Zap} label="Daya" value={inventaris.daya ? `${inventaris.daya} Watt` : '-'} />
                  <InfoRow icon={DollarSign} label="Harga" value={rupiah(inventaris.harga)} />
                  <InfoRow icon={Calendar} label="Tahun Pengadaan" value={inventaris.tahun_pengadaan} />
                  <InfoRow icon={Calendar} label="Kadaluwarsa" value={inventaris.kadaluwarsa} />
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-text-dark text-lg mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <span className="w-1 h-5 bg-brand-primary rounded-full"></span>
                  Dokumen
                </h3>

                <div className="space-y-0.5">
                  <InfoRow icon={FileText} label="Sertifikat" value={inventaris.file_sertifikat_url} isLink />
                  <InfoRow icon={FileText} label="SOP" value={inventaris.file_sop_url} isLink />
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADUAN */}
          {activeTab === 'aduan' && (
            <div className="animate-fade-in space-y-4">
              {(!inventaris.aduan || inventaris.aduan.length === 0) ? (
                <div className="text-center py-12 bg-white rounded-[24px] shadow-sm border border-gray-100">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Belum ada riwayat aduan</p>
                </div>
              ) : (
                inventaris.aduan.map((aduan) => (
                  <div key={aduan.id_aduan} className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 font-medium mb-1">No. Aduan</p>
                        <p className="text-sm font-bold text-brand-primary">{aduan.no_aduan}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${getStatusColor(aduan.status_aduan)}`}>
                        {aduan.status_aduan}
                      </span>
                    </div>

                    {/* Keluhan */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 font-medium mb-1.5">Keluhan</p>
                      <p className="text-sm text-text-dark leading-relaxed bg-gray-50 p-3 rounded-xl">
                        "{aduan.keluhan || '-'}"
                      </p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1">Pelapor</p>
                        <p className="text-sm font-semibold text-text-dark">{aduan.nama_pengadu || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1">Tanggal</p>
                        <p className="text-sm font-semibold text-text-dark">{formatDate(aduan.create_date)}</p>
                      </div>
                    </div>

                    {/* Teknisi & Status (if assigned) */}
                    {aduan.teknisi_nama && (
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">Teknisi</p>
                            <p className="text-sm font-semibold text-text-dark">{aduan.teknisi_nama}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">Kondisi Alat</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${getStatusColor(aduan.kondisi_alat)}`}>
                              {aduan.kondisi_alat}
                            </span>
                          </div>
                        </div>

                        {aduan.tindakan_teknisi && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-400 font-medium mb-1">Tindakan</p>
                            <p className="text-sm text-text-dark bg-blue-50 p-2 rounded-lg">{aduan.tindakan_teknisi}</p>
                          </div>
                        )}

                        {aduan.rekomendasi && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-400 font-medium mb-1">Rekomendasi</p>
                            <p className="text-sm text-text-dark bg-yellow-50 p-2 rounded-lg">{aduan.rekomendasi}</p>
                          </div>
                        )}

                        {aduan.biaya && (
                          <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">Biaya</p>
                            <p className="text-sm font-bold text-green-600">{rupiah(aduan.biaya)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: PEMELIHARAAN */}
          {activeTab === 'pemeliharaan' && (
            <div className="animate-fade-in space-y-4">
              {(!inventaris.pemeliharaan || inventaris.pemeliharaan.length === 0) ? (
                <div className="text-center py-12 bg-white rounded-[24px] shadow-sm border border-gray-100">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Belum ada riwayat pemeliharaan</p>
                </div>
              ) : (
                inventaris.pemeliharaan.map((mt) => (
                  <div key={mt.id_pemeliharaan} className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 font-medium mb-1">Jadwal Pemeliharaan</p>
                        <p className="text-sm font-bold text-brand-primary">{formatDate(mt.jadwal_pemeliharaan)}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${getStatusColor(mt.status)}`}>
                        {mt.status}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1">Teknisi</p>
                        <p className="text-sm font-semibold text-text-dark">{mt.teknisi_nama || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1">Tgl Pemeriksaan</p>
                        <p className="text-sm font-semibold text-text-dark">{formatDate(mt.tanggal_pemeriksaan) || '-'}</p>
                      </div>
                    </div>

                    {/* Kondisi Alat */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 font-medium mb-1.5">Kondisi Alat</p>
                      <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg ${getStatusColor(mt.kondisi_alat)}`}>
                        {mt.kondisi_alat}
                      </span>
                    </div>

                    {/* Keterangan */}
                    {mt.keterangan_pemeliharaan && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 font-medium mb-1.5">Keterangan</p>
                        <p className="text-sm text-text-dark leading-relaxed bg-gray-50 p-3 rounded-xl">
                          {mt.keterangan_pemeliharaan}
                        </p>
                      </div>
                    )}

                    {/* Rekomendasi */}
                    {mt.rekomendasi && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 font-medium mb-1.5">Rekomendasi</p>
                        <p className="text-sm text-text-dark bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                          {mt.rekomendasi}
                        </p>
                      </div>
                    )}

                    {/* Biaya */}
                    {mt.biaya > 0 && (
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <p className="text-xs text-gray-400 font-medium mb-1">Biaya Pemeliharaan</p>
                        <p className="text-lg font-bold text-green-600">{rupiah(mt.biaya)}</p>
                      </div>
                    )}

                    {/* TTD Status */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <div className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${mt.status_ttd_teknisi === 'Sudah TTD' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        TTD Teknisi: {mt.status_ttd_teknisi}
                      </div>
                      <div className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${mt.status_ttd_karu === 'Sudah TTD' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        TTD Ka.Ru: {mt.status_ttd_karu}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <UpdateLocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          inventarisId={inventaris.id}
          currentRuanganId={inventaris.ruangan_sekarang?.id_ruangan || inventaris.ruangan?.id_ruangan}
        />

        <style>{`
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

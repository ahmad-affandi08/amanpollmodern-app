import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Activity, Tag, Info, AlertCircle, Phone, FileText,
  ChevronLeft, MoreVertical, Share2, ImageIcon, Zap, DollarSign
} from 'lucide-react';
import { useInventarisDetail } from '../../../hooks/queries/useInventarisQueries';
import { rupiah } from '../../../utils/format';
import UpdateLocationModal from './components/UpdateLocationModal';

export default function MobileInventarisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: inventaris, isLoading, isError } = useInventarisDetail(id);
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center font-sans">
        <div className="w-full max-w-md min-h-screen pb-6 relative">
          {/* Header Image Skeleton */}
          <div className="relative h-72 bg-gray-200 rounded-b-[30px] overflow-hidden shadow-lg mx-[-1px] animate-pulse">
            {/* Back Button Skeleton */}
            <div className="absolute top-4 left-4 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full"></div>

            {/* Title Overlay Skeleton */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-300 via-gray-300/80 to-transparent p-6 pt-24">
              <div className="w-20 h-5 bg-gray-400 rounded-lg mb-2.5"></div>
              <div className="w-3/4 h-8 bg-gray-400 rounded-lg mb-1.5"></div>
              <div className="w-1/2 h-4 bg-gray-400/70 rounded-lg"></div>
            </div>
          </div>

          <div className="px-5 -mt-6 relative z-10 space-y-5">
            {/* Location Card Skeleton */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-32 h-6 bg-gray-200 rounded-lg"></div>
                <div className="w-16 h-8 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                <div className="bg-gray-200 w-12 h-12 rounded-xl"></div>
                <div className="flex-1">
                  <div className="w-16 h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="w-32 h-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Specifications Skeleton */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
                <div className="w-1 h-5 bg-gray-200 rounded-full"></div>
                <div className="w-40 h-6 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Skeleton */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
                <div className="w-1 h-5 bg-gray-200 rounded-full"></div>
                <div className="w-32 h-6 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !inventaris) {
    return (
      <div className="min-h-screen bg-bg-light flex justify-center">
        <div className="w-full max-w-md bg-bg-light min-h-screen flex items-center justify-center p-4 shadow-xl">
          <div className="text-center">
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

  return (
    <div className="min-h-screen flex justify-center font-sans">
      <div className="w-full max-w-md  min-h-screen pb-6  relative">

        {/* Header Image Area */}
        <div className="relative h-72 bg-gray-900 rounded-b-[30px] overflow-hidden shadow-lg mx-[-1px]">
          {inventaris.img_alat_url ? (
            <img
              src={inventaris.img_alat_url}
              alt={inventaris.nama_alat?.nama_nama_alat}
              className="w-full h-full object-cover opacity-90"
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

        <div className="px-5 -mt-6 relative z-10 space-y-5">
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

        <UpdateLocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          inventarisId={inventaris.id}
          currentRuanganId={inventaris.ruangan_sekarang?.id_ruangan || inventaris.ruangan?.id_ruangan}
        />
      </div>
    </div>
  );
}

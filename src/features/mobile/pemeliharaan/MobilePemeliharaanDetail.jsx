import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, ClipboardList, MapPin, Package, User, Wrench, DollarSign, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { usePemeliharaanDetail } from '../../../hooks/queries/usePemeliharaanQueries';
import { formatDate } from '../../../utils/format';
import noImage from '../../../assets/img/no_image.png';
import ImagePreviewModal from '../../../components/ImagePreviewModal';

export default function MobilePemeliharaanDetail() {
  usePageTitle('Detail Pemeliharaan');
  const { id } = useParams();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(false);

  const { data: pemeliharaan, isLoading } = usePemeliharaanDetail(id);

  // Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Selesai': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'Tindakan Lanjutan': { bg: 'bg-purple-100', text: 'text-purple-700', icon: AlertCircle },
      'Belum Selesai': { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock }
    };
    const config = statusConfig[status] || statusConfig['Belum Selesai'];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.text} text-xs font-bold`}>
        <Icon size={14} />
        {status}
      </div>
    );
  };

  // Kondisi badge component
  const KondisiBadge = ({ kondisi }) => {
    const kondisiConfig = {
      'Baik': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      'Rusak Ringan': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
      'Rusak Berat': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
    };
    const config = kondisiConfig[kondisi] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };

    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border ${config.bg} ${config.text} ${config.border} text-xs font-medium`}>
        {kondisi || 'Belum Ditentukan'}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 pb-4">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>

        {/* Hero Skeleton */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse mb-4">
          <div className="w-full h-48 bg-gray-200 rounded-xl mb-3"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!pemeliharaan) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-600 font-medium">Data pemeliharaan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Detail Pemeliharaan</h1>
      </div>

      {/* Hero Card - Image + Status */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="relative mb-3">
          <img
            src={pemeliharaan.img_alat || noImage}
            alt={pemeliharaan.nama_alat_nama}
            className="w-full h-48 rounded-xl object-cover bg-gray-100 cursor-pointer"
            onClick={() => setImagePreview(true)}
            onError={(e) => { e.target.src = noImage; }}
          />
          <div className="absolute top-3 right-3">
            <StatusBadge status={pemeliharaan.status} />
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">{pemeliharaan.nama_alat_nama}</h2>
        <p className="text-sm text-gray-500 mb-2">{pemeliharaan.no_inventaris}</p>
        <KondisiBadge kondisi={pemeliharaan.kondisi_alat} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <User size={16} className="mx-auto text-indigo-500 mb-1" />
          <p className="text-[10px] text-gray-500 mb-0.5">Teknisi</p>
          <p className="text-xs font-bold text-gray-800 line-clamp-1">{pemeliharaan.teknisi_nama}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <Calendar size={16} className="mx-auto text-green-500 mb-1" />
          <p className="text-[10px] text-gray-500 mb-0.5">Jadwal</p>
          <p className="text-xs font-bold text-gray-800">{formatDate(pemeliharaan.jadwal_pemeliharaan)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <DollarSign size={16} className="mx-auto text-yellow-500 mb-1" />
          <p className="text-[10px] text-gray-500 mb-0.5">Biaya</p>
          <p className="text-xs font-bold text-gray-800">{formatRupiah(pemeliharaan.biaya)}</p>
        </div>
      </div>

      {/* Informasi Alat Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Package size={18} className="text-indigo-500" />
          <h3 className="text-sm font-bold text-gray-800">Informasi Alat</h3>
        </div>
        <div className="space-y-2">
          <InfoRow icon={<MapPin size={14} />} label="Divisi" value={pemeliharaan.divisi_nama} />
          <InfoRow icon={<MapPin size={14} />} label="Ruangan" value={pemeliharaan.ruangan_nama} />
          <InfoRow icon={<MapPin size={14} />} label="Gedung" value={pemeliharaan.gedung} />
          <InfoRow icon={<Wrench size={14} />} label="Merk" value={pemeliharaan.merk} />
          <InfoRow icon={<Wrench size={14} />} label="Model/Type" value={pemeliharaan.model} />
          <InfoRow icon={<Wrench size={14} />} label="Seri" value={pemeliharaan.seri} />
        </div>
      </div>

      {/* Informasi Pemeliharaan Section */}
      {(pemeliharaan.status === 'Selesai' || pemeliharaan.status === 'Tindakan Lanjutan') && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={18} className="text-green-500" />
            <h3 className="text-sm font-bold text-gray-800">Hasil Pemeliharaan</h3>
          </div>
          <div className="space-y-2">
            {pemeliharaan.tanggal_pemeriksaan && (
              <InfoRow
                icon={<Calendar size={14} />}
                label="Tanggal Pemeriksaan"
                value={formatDate(pemeliharaan.tanggal_pemeriksaan)}
              />
            )}
            {pemeliharaan.keterangan_pemeliharaan && (
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <div className="flex items-start gap-2 mb-1">
                  <FileText size={14} className="text-gray-400 mt-0.5" />
                  <p className="text-xs font-medium text-gray-600">Keterangan</p>
                </div>
                <p className="text-sm text-gray-800 pl-5">{pemeliharaan.keterangan_pemeliharaan}</p>
              </div>
            )}
            {pemeliharaan.rekomendasi && (
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <div className="flex items-start gap-2 mb-1">
                  <FileText size={14} className="text-gray-400 mt-0.5" />
                  <p className="text-xs font-medium text-gray-600">Rekomendasi</p>
                </div>
                <p className="text-sm text-gray-800 pl-5">{pemeliharaan.rekomendasi}</p>
              </div>
            )}
            {pemeliharaan.status === 'Tindakan Lanjutan' && pemeliharaan.disposisi_nama && (
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                <div className="flex items-start gap-2 mb-1">
                  <User size={14} className="text-purple-500 mt-0.5" />
                  <p className="text-xs font-medium text-purple-700">Disposisi Ke</p>
                </div>
                <p className="text-sm text-gray-800 pl-5">{pemeliharaan.disposisi_nama}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signature Status Section */}
      {(pemeliharaan.status === 'Selesai' || pemeliharaan.status === 'Tindakan Lanjutan') && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800">Status Tanda Tangan</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SignatureCard
              label="Teknisi"
              status={pemeliharaan.status_ttd_teknisi}
              image={pemeliharaan.ttd_teknisi}
            />
            <SignatureCard
              label="Kepala Ruang"
              status={pemeliharaan.status_ttd_karu}
              image={pemeliharaan.ttd_kepala_ruang}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Form Pemeliharaan Button - For incomplete tasks OR Tindakan Lanjutan */}
        {(pemeliharaan.status === 'Belum Selesai' || pemeliharaan.status === 'Tindakan Lanjutan') && (
          <button
            onClick={() => navigate(`/mobile/pemeliharaan/${id}/form`)}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3.5 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <ClipboardList size={20} />
            {pemeliharaan.status === 'Tindakan Lanjutan' ? 'Isi Form Pemeliharaan Lanjutan' : 'Isi Form Pemeliharaan'}
          </button>
        )}

        {/* Hasil Pemeliharaan Button - Only for completed tasks */}
        {(pemeliharaan.status === 'Selesai' || pemeliharaan.status === 'Tindakan Lanjutan') && (
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/pemeliharaan/${id}/export-hasil`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3.5 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <FileText size={20} />
            Download Hasil Pemeliharaan
          </a>
        )}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={imagePreview}
        imageUrl={pemeliharaan.img_alat || noImage}
        onClose={() => setImagePreview(false)}
      />
    </div>
  );
}

// Helper Components
const InfoRow = ({ icon, label, value }) => (
  <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-2">
    <div className="text-gray-400">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate">{value || '-'}</p>
    </div>
  </div>
);

const SignatureCard = ({ label, status, image }) => {
  const isComplete = status === 'Sudah TTD';

  return (
    <div className={`rounded-xl p-3 border-2 ${isComplete ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
      {isComplete ? (
        <>
          <div className="flex items-center gap-1 text-green-600 mb-2">
            <CheckCircle size={16} />
            <span className="text-xs font-bold">Sudah TTD</span>
          </div>
          {image && (
            <img
              src={image}
              alt={`TTD ${label}`}
              className="w-full h-16 object-contain bg-white rounded border border-green-200"
              onError={(e) => { e.target.src = noImage; }}
            />
          )}
        </>
      ) : (
        <div className="flex items-center gap-1 text-gray-500">
          <Clock size={16} />
          <span className="text-xs font-medium">Belum TTD</span>
        </div>
      )}
    </div>
  );
};

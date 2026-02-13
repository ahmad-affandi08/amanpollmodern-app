import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, User, Calendar, Clock, MapPin,
  Building2, Wrench, CheckCircle, AlertCircle, Package, AlertTriangle, HelpCircle
} from 'lucide-react';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import PemeliharaanApi from '../../../api/PemeliharaanApi';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import noImage from '../../../assets/img/no_image.png';

export default function DetailReportPemeliharaan() {
  usePageTitle('Detail Laporan Pemeliharaan');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await PemeliharaanApi.getById(id);
      setData(res.data || res);
    } catch (error) {
      console.error("Failed to fetch detail:", error);
      showToast('Gagal memuat detail laporan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleExport = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    window.open(`${apiUrl}/pemeliharaan/${id}/export-hasil`, '_blank');
  };

  if (loading) {
    return <DetailReportSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <FileText size={64} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h3>
        <p className="text-gray-500 mb-6">Laporan yang Anda cari tidak tersedia.</p>
        <button
          onClick={() => navigate('/report/pemeliharaan')}
          className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors"
        >
          Kembali ke List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/report/pemeliharaan')}
            className="p-2 hover:bg-white rounded-xl transition-colors hover:shadow-sm group"
          >
            <ArrowLeft size={24} className="text-gray-500 group-hover:text-brand-primary transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-dark">Detail Laporan Pemeliharaan</h1>
            <div className="flex items-center gap-3 mt-1">
              {data.no_pemeliharaan && (
                <>
                  <span className="text-sm text-gray-500">No. Pemeliharaan:</span>
                  <span className="px-3 py-1 bg-purple-50 text-brand-primary text-xs font-bold rounded-lg border border-purple-200">
                    {data.no_pemeliharaan}
                  </span>
                </>
              )}
              <StatusBadge status={data.status} />
            </div>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-yellow-950 font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <Download size={20} />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Main Info */}
        <div className="space-y-6">
          {/* Device Info Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Package className="text-brand-primary" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Informasi Alat</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Alat</label>
                <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl text-gray-800 font-bold">
                  {data.nama_alat_nama || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">No Inventaris</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-mono font-medium">
                  {data.no_inventaris || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Merk</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium">
                  {data.merk || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <MapPin className="text-green-500" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Informasi Lokasi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard icon={<Building2 size={16} />} label="Divisi" value={data.divisi_nama} />
              <InfoCard icon={<MapPin size={16} />} label="Ruangan" value={data.ruangan_nama} />
              {data.gedung && <InfoCard icon={<Building2 size={16} />} label="Gedung" value={data.gedung} />}
            </div>
          </div>

          {/* Schedule Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[24px] p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-600" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Jadwal & Pelaksanaan</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-blue-200 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium">Jadwal Pemeliharaan</p>
                  <p className="text-sm font-bold text-gray-900">{formatDate(data.jadwal_pemeliharaan)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-blue-200 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Clock size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium">Tanggal Pemeriksaan</p>
                  <p className="text-sm font-bold text-gray-900">
                    {data.tanggal_pemeriksaan ? formatDateTime(data.tanggal_pemeriksaan) : 'Belum Dilakukan'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technician Assignment */}
          {data.teknisi_nama && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[24px] p-6 border border-purple-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="text-purple-600" size={20} />
                <h2 className="text-lg font-bold text-gray-800">Teknisi Penanggung Jawab</h2>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-purple-200 shadow-sm">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <User size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{data.teknisi_nama}</p>
                  <p className="text-sm text-gray-600">{data.divisi_nama}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Results & Summary */}
        <div className="space-y-6">
          {/* Inspection Results */}
          {data.tanggal_pemeriksaan && (
            <InspectionCard
              title="HASIL PEMERIKSAAN"
              icon={<CheckCircle size={20} className="text-green-600" />}
              bgColor="from-green-50 to-emerald-50"
              borderColor="border-green-200"
              data={{
                kondisi: data.kondisi_alat,
                tanggal: data.tanggal_pemeriksaan,
                ttd_teknisi: data.ttd_teknisi,
                ttd_kepala_ruang: data.ttd_kepala_ruang,
                teknisi_nama: data.teknisi_nama,
                kepala_ruang_nama: data.nama_kepala_ruangan
              }}
              onImagePreview={(img, alt) => {
                setPreviewImage(img);
                setPreviewAlt(alt);
              }}
            />
          )}

          {/* Kondisi Alat */}
          {data.kondisi_alat && (
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Kondisi Alat Terakhir</h3>
              <KondisiBadge kondisi={data.kondisi_alat} large />
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage}
        altText={previewAlt}
      />
    </div>
  );
}


const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
    'Selesai': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    'Dalam Proses': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Wrench }
  };
  const config = statusConfig[status] || statusConfig['Pending'];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bg} ${config.text} ${config.border} text-xs font-bold`}>
      <Icon size={14} />
      {status}
    </div>
  );
};

const KondisiBadge = ({ kondisi, large = false }) => {
  const kondisiConfig = {
    'Baik': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Rusak Ringan': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Rusak Berat': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  };
  const config = kondisiConfig[kondisi] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

  return (
    <div className={`inline-flex items-center justify-center px-4 py-2 rounded-xl border-2 ${config.bg} ${config.text} ${config.border} ${large ? 'text-base font-bold w-full' : 'text-sm font-medium'}`}>
      {kondisi || 'Belum Ditentukan'}
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="flex items-center gap-2 mb-2 text-gray-500">
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="text-sm font-bold text-gray-800 truncate">{value || '-'}</p>
  </div>
);

const InspectionCard = ({ title, icon, bgColor, borderColor, data, onImagePreview }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-[24px] p-6 border ${borderColor} shadow-sm`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        {icon}
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {data.kondisi && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">Kondisi Alat</label>
              <KondisiBadge kondisi={data.kondisi} />
            </div>
          )}

          {data.tanggal && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">Tanggal Pemeriksaan</label>
              <div className="px-3 py-2 bg-white/80 border border-gray-200 rounded-lg text-gray-700 text-xs font-semibold">
                {formatDateTime(data.tanggal)}
              </div>
            </div>
          )}
        </div>

        {/* Signatures */}
        {(data.ttd_teknisi || data.ttd_kepala_ruang) && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {data.ttd_teknisi && (
              <SignatureCard
                label="TTD Teknisi"
                name={data.teknisi_nama}
                image={data.ttd_teknisi}
                onPreview={() => onImagePreview(data.ttd_teknisi, 'TTD Teknisi')}
              />
            )}

            {data.ttd_kepala_ruang && (
              <SignatureCard
                label="TTD Kepala Ruang"
                name={data.kepala_ruang_nama}
                image={data.ttd_kepala_ruang}
                onPreview={() => onImagePreview(data.ttd_kepala_ruang, 'TTD Kepala Ruang')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SignatureCard = ({ label, name, image, onPreview }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 mb-2">{label}</label>
    <div
      className="w-full h-28 bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-primary transition-colors overflow-hidden group"
      onClick={onPreview}
    >
      <img
        src={image}
        alt={label}
        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
        onError={(e) => { e.target.src = noImage; }}
      />
    </div>
    {name && <p className="text-xs text-gray-600 mt-1 text-center font-medium">{name}</p>}
  </div>
);


const DetailReportSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="h-12 w-40 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column Skeleton */}
        <div className="space-y-6">
          {/* Device Info Card Skeleton */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-xl relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                </div>
              </div>

              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Skeleton */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-56 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Skeleton */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-3 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-40 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-6">
          {/* Inspection Card Skeleton */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-56 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="space-y-4">
              {/* Grid Items */}
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="h-3 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-28 bg-gray-100 rounded-xl relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add shimmer keyframe to global styles if not already present */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

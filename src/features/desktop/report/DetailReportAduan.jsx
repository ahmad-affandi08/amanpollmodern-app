import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, User, Calendar, Clock, MapPin,
  Building2, Wrench, CheckCircle, AlertCircle, DollarSign, History, Package
} from 'lucide-react';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import AduanApi from '../../../api/AduanApi';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import noImage from '../../../assets/img/no_image.png';

export default function DetailReportAduan() {
  usePageTitle('Detail Laporan Aduan');
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
      const res = await AduanApi.getById(id);
      setData(res.data || res);
    } catch (error) {
      console.error("Failed to fetch detail:", error);
      showToast('Gagal memuat detail laporan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
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
    window.open(`${apiUrl}/report/aduan/export/${id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memuat detail laporan...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <FileText size={64} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h3>
        <p className="text-gray-500 mb-6">Laporan yang Anda cari tidak tersedia.</p>
        <button
          onClick={() => navigate('/report/aduan')}
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
            onClick={() => navigate('/report/aduan')}
            className="p-2 hover:bg-white rounded-xl transition-colors hover:shadow-sm group"
          >
            <ArrowLeft size={24} className="text-gray-500 group-hover:text-brand-primary transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-dark">Detail Laporan Aduan</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">No Aduan:</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
                {data.no_aduan || '-'}
              </span>
              <StatusBadge status={data.status_aduan} />
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
          {/* Device & Complaint Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Package className="text-brand-primary" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Informasi Alat & Keluhan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Keluhan</label>
                {data.img_keluhan ? (
                  <div
                    className="relative w-full h-64 rounded-2xl overflow-hidden cursor-pointer group border-2 border-gray-100 hover:border-brand-primary transition-all"
                    onClick={() => {
                      setPreviewImage(data.img_keluhan);
                      setPreviewAlt('Foto Keluhan');
                    }}
                  >
                    <img
                      src={data.img_keluhan}
                      alt="Foto Keluhan"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = noImage; }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
                        Klik untuk memperbesar
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Tidak ada foto keluhan</p>
                  </div>
                )}
              </div>

              <div>
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

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Keluhan Kerusakan</label>
                <div className="px-4 py-4 bg-orange-50/50 border border-orange-100 rounded-xl text-gray-700 min-h-[100px] whitespace-pre-wrap italic">
                  "{data.keluhan || '-'}"
                </div>
              </div>
            </div>
          </div>

          {/* Reporter & Location Info */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <MapPin className="text-green-500" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Informasi Pelapor & Lokasi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard icon={<User size={16} />} label="Nama Pengadu" value={data.nama_pengadu} />
              <InfoCard icon={<Calendar size={16} />} label="Tanggal Laporan" value={formatDate(data.create_date)} />
              <InfoCard icon={<Building2 size={16} />} label="Divisi" value={data.divisi_nama} />
              <InfoCard icon={<MapPin size={16} />} label="Ruangan" value={data.ruangan_nama} />
              {data.gedung && <InfoCard icon={<Building2 size={16} />} label="Gedung" value={data.gedung} />}
            </div>
          </div>

          {/* Technician Assignment */}
          {data.teknisi_nama && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[24px] p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="text-blue-600" size={20} />
                <h2 className="text-lg font-bold text-gray-800">Teknisi Penanggung Jawab</h2>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-blue-200 shadow-sm">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg">
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

        {/* Right Column - Inspection Timeline & Summary */}
        <div className="space-y-6">
          {/* Biaya */}
          {data.biaya && parseFloat(data.biaya) > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-[24px] p-6 border border-yellow-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-orange-600" size={20} />
                <h3 className="text-sm font-bold text-gray-700">Biaya Perbaikan</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600">{formatRupiah(data.biaya)}</p>
            </div>
          )}

          {/* Inspection Timeline */}
          {((data.history && data.history.length > 0) || data.tindakan_teknisi) && (
            <div className="space-y-6">
              {/* TINDAKAN AWAL */}
              {data.history && data.history.length > 0 && data.history[0] && (
                <InspectionCard
                  title={`TINDAKAN AWAL (${data.history[0].status_aduan})`}
                  icon={<History size={20} className="text-blue-600" />}
                  bgColor="from-blue-50 to-cyan-50"
                  borderColor="border-blue-200"
                  data={{
                    tindakan: data.history[0].tindakan_teknisi,
                    rekomendasi: data.history[0].rekomendasi,
                    kondisi: data.history[0].kondisi_alat,
                    tanggal: data.history[0].tanggal_pemeriksaan,
                    ttd_teknisi: data.history[0].ttd_teknisi,
                    ttd_pengadu: data.history[0].ttd_kepala_ruang,
                    teknisi_nama: data.teknisi_nama,
                    pengadu_nama: data.nama_pengadu
                  }}
                  onImagePreview={(img, alt) => {
                    setPreviewImage(img);
                    setPreviewAlt(alt);
                  }}
                />
              )}

              {/* TINDAKAN LANJUTAN/AKHIR */}
              {data.tindakan_teknisi && (
                <InspectionCard
                  title={data.history && data.history.length > 0 ? 'TINDAKAN LANJUTAN' : 'LAPORAN PENGERJAAN'}
                  icon={<CheckCircle size={20} className="text-green-600" />}
                  bgColor="from-green-50 to-emerald-50"
                  borderColor="border-green-200"
                  data={{
                    tindakan: data.tindakan_teknisi,
                    rekomendasi: data.rekomendasi,
                    kondisi: data.kondisi_alat,
                    tanggal: data.tanggal_pemeriksaan,
                    biaya: data.biaya,
                    ttd_teknisi: data.ttd_teknisi,
                    ttd_pengadu: data.ttd_kepala_ruang,
                    teknisi_nama: data.teknisi_nama,
                    pengadu_nama: data.nama_pengadu
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

// Helper Components
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
    'Sedang Dikerjakan': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Wrench },
    'Selesai': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    'Tindakan Lanjutan': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: AlertCircle }
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

const StatItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
    <div className="text-white/80">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-white/70">{label}</p>
      <p className="text-sm font-bold text-white truncate">{value}</p>
    </div>
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

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-[24px] p-6 border ${borderColor} shadow-sm`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        {icon}
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>

      <div className="space-y-4">
        {data.tindakan && (
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Tindakan Petugas</label>
            <div className="px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-700 text-sm">
              {data.tindakan}
            </div>
          </div>
        )}

        {data.rekomendasi && (
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Rekomendasi</label>
            <div className="px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-700 text-sm">
              {data.rekomendasi}
            </div>
          </div>
        )}

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

        {data.biaya && parseFloat(data.biaya) > 0 && (
          <div className="flex items-center gap-3 bg-white/80 p-4 rounded-xl border border-yellow-200">
            <DollarSign size={20} className="text-orange-600" />
            <div>
              <p className="text-xs text-gray-600 font-medium">Biaya Perbaikan</p>
              <p className="text-lg font-bold text-orange-600">{formatRupiah(data.biaya)}</p>
            </div>
          </div>
        )}

        {/* Signatures */}
        {(data.ttd_teknisi || data.ttd_pengadu) && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {data.ttd_teknisi && (
              <SignatureCard
                label="TTD Teknisi"
                name={data.teknisi_nama}
                image={data.ttd_teknisi}
                onPreview={() => onImagePreview(data.ttd_teknisi, 'TTD Teknisi')}
              />
            )}

            {data.ttd_pengadu && (
              <SignatureCard
                label="TTD Pengadu"
                name={data.pengadu_nama}
                image={data.ttd_pengadu}
                onPreview={() => onImagePreview(data.ttd_pengadu, 'TTD Pengadu')}
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

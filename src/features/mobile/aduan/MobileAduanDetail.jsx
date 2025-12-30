import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, Calendar, AlertCircle, Wrench, CheckCircle, Clock,
  FileText, MapPin, Building2, DollarSign, History, Package
} from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { useAduanDetail } from '../../../hooks/queries/useAduanQueries';
import { formatDateTime, formatDate } from '../../../utils/format';
import noImage from '../../../assets/img/no_image.png';
import ImagePreviewModal from '../../../components/ImagePreviewModal';

export default function MobileAduanDetail() {
  usePageTitle('Detail Aduan');
  const { id } = useParams();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');

  const { data: aduan, isLoading } = useAduanDetail(id);

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
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      'Sedang Dikerjakan': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Wrench },
      'Selesai': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'Tindakan Lanjutan': { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle }
    };
    const config = statusConfig[status] || statusConfig['Pending'];
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
        <div className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse mb-4">
          <div className="w-full h-48 bg-gray-200 rounded-xl mb-3"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!aduan) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <AlertCircle className="mx-auto mb-2 text-red-500" size={48} />
          <p className="text-red-600 font-medium">Detail aduan tidak ditemukan</p>
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
        <h1 className="text-lg font-bold text-gray-800">Detail Laporan</h1>
      </div>

      {/* Hero Card - Image + Status */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="relative mb-3">
          <img
            src={aduan.img_keluhan || noImage}
            alt="Keluhan"
            className="w-full h-48 rounded-xl object-cover bg-gray-100 cursor-pointer"
            onClick={() => {
              if (aduan.img_keluhan) {
                setPreviewImage(aduan.img_keluhan);
                setPreviewAlt('Foto Keluhan');
              }
            }}
            onError={(e) => { e.target.src = noImage; }}
          />
          <div className="absolute top-3 right-3">
            <StatusBadge status={aduan.status_aduan} />
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">{aduan.nama_alat_nama}</h2>
        <p className="text-sm text-gray-500 mb-2">{aduan.no_inventaris}</p>
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 mb-1 font-medium">Keluhan:</p>
          <p className="text-sm text-gray-700 italic">"{aduan.keluhan}"</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <User size={16} className="mx-auto text-indigo-500 mb-1" />
          <p className="text-[10px] text-gray-500 mb-0.5">Pengadu</p>
          <p className="text-xs font-bold text-gray-800 line-clamp-1">{aduan.nama_pengadu || '-'}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <Calendar size={16} className="mx-auto text-green-500 mb-1" />
          <p className="text-[10px] text-gray-500 mb-0.5">Tanggal</p>
          <p className="text-xs font-bold text-gray-800">{formatDate(aduan.create_date)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <Package size={16} className="mx-auto text-purple-500 mb-1" />
          <p className="text-[10px] text-gray-500 mb-0.5">No Aduan</p>
          <p className="text-[10px] font-bold text-gray-800 leading-tight break-all">{aduan.no_aduan || '-'}</p>
        </div>
      </div>

      {/* Informasi Lokasi */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={18} className="text-indigo-500" />
          <h3 className="text-sm font-bold text-gray-800">Informasi Lokasi</h3>
        </div>
        <div className="space-y-2">
          {aduan.divisi_nama && <InfoRow icon={<Building2 size={14} />} label="Divisi" value={aduan.divisi_nama} />}
          {aduan.ruangan_nama && <InfoRow icon={<MapPin size={14} />} label="Ruangan" value={aduan.ruangan_nama} />}
          {aduan.gedung && <InfoRow icon={<Building2 size={14} />} label="Gedung" value={aduan.gedung} />}
        </div>
      </div>

      {/* Teknisi Info */}
      {aduan.teknisi_nama && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench size={18} className="text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800">Teknisi Penanggung Jawab</h3>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">{aduan.teknisi_nama}</p>
              <p className="text-xs text-gray-500">{aduan.divisi_nama}</p>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Timeline */}
      {((aduan.history && aduan.history.length > 0) || aduan.tindakan_teknisi) && (
        <div className="space-y-4">
          {/* TINDAKAN AWAL (First Inspection from History) */}
          {aduan.history && aduan.history.length > 0 && aduan.history[0] && (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                <History size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-800">TINDAKAN AWAL ({aduan.history[0].status_aduan})</h3>
              </div>

              {aduan.history[0].tindakan_teknisi && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">Tindakan Petugas</p>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">{aduan.history[0].tindakan_teknisi}</p>
                </div>
              )}

              {aduan.history[0].rekomendasi && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">Rekomendasi</p>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">{aduan.history[0].rekomendasi}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {aduan.history[0].kondisi_alat && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Kondisi Alat</p>
                    <KondisiBadge kondisi={aduan.history[0].kondisi_alat} />
                  </div>
                )}

                {aduan.history[0].tanggal_pemeriksaan && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Tanggal</p>
                    <p className="text-xs text-gray-700 font-semibold">{formatDateTime(aduan.history[0].tanggal_pemeriksaan)}</p>
                  </div>
                )}
              </div>

              {/* Signatures for First Inspection */}
              {(aduan.history[0].ttd_teknisi || aduan.history[0].ttd_kepala_ruang) && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  {aduan.history[0].ttd_teknisi && (
                    <SignatureCard
                      label="TTD Teknisi"
                      image={aduan.history[0].ttd_teknisi}
                      onPreview={() => {
                        setPreviewImage(aduan.history[0].ttd_teknisi);
                        setPreviewAlt(`TTD Teknisi - ${aduan.history[0].status_aduan}`);
                      }}
                    />
                  )}

                  {aduan.history[0].ttd_kepala_ruang && (
                    <SignatureCard
                      label="TTD Pengadu"
                      image={aduan.history[0].ttd_kepala_ruang}
                      onPreview={() => {
                        setPreviewImage(aduan.history[0].ttd_kepala_ruang);
                        setPreviewAlt(`TTD Pengadu - ${aduan.history[0].status_aduan}`);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* TINDAKAN LANJUTAN (Current/Final Inspection) */}
          {aduan.tindakan_teknisi && (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                <CheckCircle size={18} className="text-green-600" />
                <h3 className="font-bold text-gray-800">
                  {aduan.history && aduan.history.length > 0 ? 'TINDAKAN LANJUTAN' : 'LAPORAN PENGERJAAN'}
                </h3>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Tindakan Perbaikan</p>
                <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">{aduan.tindakan_teknisi}</p>
              </div>

              {aduan.rekomendasi && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">Rekomendasi</p>
                  <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">{aduan.rekomendasi}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {aduan.kondisi_alat && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Kondisi Akhir</p>
                    <KondisiBadge kondisi={aduan.kondisi_alat} />
                  </div>
                )}

                {aduan.tanggal_pemeriksaan && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Tanggal</p>
                    <p className="text-xs text-gray-700 font-semibold">{formatDateTime(aduan.tanggal_pemeriksaan)}</p>
                  </div>
                )}
              </div>

              {aduan.biaya && parseFloat(aduan.biaya) > 0 && (
                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <DollarSign size={16} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Biaya Perbaikan</p>
                    <p className="text-sm font-bold text-blue-700">{formatRupiah(aduan.biaya)}</p>
                  </div>
                </div>
              )}

              {/* Signatures for Final Inspection */}
              {(aduan.ttd_teknisi || aduan.ttd_kepala_ruang) && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  {aduan.ttd_teknisi && (
                    <SignatureCard
                      label="TTD Teknisi"
                      name={aduan.teknisi_nama}
                      image={aduan.ttd_teknisi}
                      onPreview={() => {
                        setPreviewImage(aduan.ttd_teknisi);
                        setPreviewAlt('TTD Teknisi - Penyelesaian');
                      }}
                    />
                  )}

                  {aduan.ttd_kepala_ruang && (
                    <SignatureCard
                      label="TTD Pengadu"
                      name={aduan.nama_pengadu}
                      image={aduan.ttd_kepala_ruang}
                      onPreview={() => {
                        setPreviewImage(aduan.ttd_kepala_ruang);
                        setPreviewAlt('TTD Pengadu - Penyelesaian');
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Export PDF Button (Only if Selesai) */}
      {aduan.status_aduan === 'Selesai' && (
        <div className="mt-4">
          <a
            href={`/api/report/aduan/export/${aduan.id_aduan}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3.5 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <FileText size={20} />
            Download Hasil Aduan
          </a>
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

const SignatureCard = ({ label, name, image, onPreview }) => (
  <div>
    <p className="text-xs text-gray-500 mb-2 font-medium">{label}</p>
    <img
      src={image}
      alt={label}
      className="w-full h-20 object-contain bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
      onClick={onPreview}
      onError={(e) => { e.target.src = noImage; }}
    />
    {name && <p className="text-xs text-gray-600 mt-1 text-center">{name}</p>}
  </div>
);

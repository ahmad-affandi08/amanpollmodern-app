import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, Calendar, AlertCircle, Wrench, CheckCircle, Clock,
  FileText, MapPin, Building2, DollarSign, PenTool, History
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

  const getKondisiColor = (kondisi) => {
    switch (kondisi) {
      case 'Baik': return 'bg-success-100 text-success-700';
      case 'Rusak Ringan': return 'bg-warning-100 text-warning-700';
      case 'Rusak Berat': return 'bg-danger-100 text-danger-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 sticky top-0 bg-brand-primary-soft/95 backdrop-blur-sm z-10 -mx-4 px-4 border-b border-brand-primary/5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/50 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1">Detail Laporan</h1>
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
                className="w-20 h-20 rounded-xl object-cover border border-gray-100 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                onError={(e) => { e.target.src = noImage; }}
                onClick={() => {
                  if (aduan.img_keluhan) {
                    setPreviewImage(aduan.img_keluhan);
                    setPreviewAlt('Foto Keluhan');
                  }
                }}
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
            <p className="text-xs text-gray-500 mb-1 font-medium">Keluhan:</p>
            <p className="text-sm text-gray-700 italic">"{aduan.keluhan}"</p>
          </div>
        </div>

        {/* Location & Division Info */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">Informasi Lokasi</h3>

          {aduan.divisi_nama && (
            <div className="flex items-start gap-3">
              <Building2 size={16} className="text-brand-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Divisi</p>
                <p className="text-sm font-semibold text-gray-800">{aduan.divisi_nama}</p>
              </div>
            </div>
          )}

          {aduan.ruangan_nama && (
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-brand-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Ruangan</p>
                <p className="text-sm font-semibold text-gray-800">{aduan.ruangan_nama}</p>
              </div>
            </div>
          )}

          {aduan.pengadu_nama && (
            <div className="flex items-start gap-3">
              <User size={16} className="text-brand-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Pengadu</p>
                <p className="text-sm font-semibold text-gray-800">{aduan.pengadu_nama}</p>
              </div>
            </div>
          )}
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
                <p className="text-xs text-gray-500">{aduan.divisi_nama}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">Belum ada teknisi ditugaskan</p>
            </div>
          )}
        </div>

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
                    <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded-lg border border-blue-100">{aduan.history[0].tindakan_teknisi}</p>
                  </div>
                )}

                {aduan.history[0].rekomendasi && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Rekomendasi</p>
                    <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded-lg border border-blue-100">{aduan.history[0].rekomendasi}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {aduan.history[0].kondisi_alat && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Kondisi Alat</p>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-block ${getKondisiColor(aduan.history[0].kondisi_alat)}`}>
                        {aduan.history[0].kondisi_alat}
                      </span>
                    </div>
                  )}

                  {aduan.history[0].tanggal_pemeriksaan && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Tanggal Pemeriksaan</p>
                      <p className="text-xs text-gray-700 font-semibold">{formatDateTime(aduan.history[0].tanggal_pemeriksaan)}</p>
                    </div>
                  )}
                </div>

                {/* Signatures for First Inspection */}
                {(aduan.history[0].ttd_teknisi || aduan.history[0].ttd_kepala_ruang) && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    {aduan.history[0].ttd_teknisi && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium">TTD Teknisi</p>
                        <img
                          src={aduan.history[0].ttd_teknisi}
                          alt="TTD Teknisi"
                          className="w-full h-20 object-contain bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setPreviewImage(aduan.history[0].ttd_teknisi);
                            setPreviewAlt(`TTD Teknisi - ${aduan.history[0].status_aduan}`);
                          }}
                          onError={(e) => { e.target.src = noImage; }}
                        />
                      </div>
                    )}

                    {aduan.history[0].ttd_kepala_ruang && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium">TTD Pengadu</p>
                        <img
                          src={aduan.history[0].ttd_kepala_ruang}
                          alt="TTD Pengadu"
                          className="w-full h-20 object-contain bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setPreviewImage(aduan.history[0].ttd_kepala_ruang);
                            setPreviewAlt(`TTD Pengadu - ${aduan.history[0].status_aduan}`);
                          }}
                          onError={(e) => { e.target.src = noImage; }}
                        />
                      </div>
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
                  <p className="text-sm text-gray-700 bg-green-50 p-2 rounded-lg border border-green-100">{aduan.tindakan_teknisi}</p>
                </div>

                {aduan.rekomendasi && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Rekomendasi</p>
                    <p className="text-sm text-gray-700 bg-green-50 p-2 rounded-lg border border-green-100">{aduan.rekomendasi}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {aduan.kondisi_alat && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Kondisi Akhir Alat</p>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-block ${getKondisiColor(aduan.kondisi_alat)}`}>
                        {aduan.kondisi_alat}
                      </span>
                    </div>
                  )}

                  {aduan.tanggal_pemeriksaan && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium">Tanggal Pelaksanaan</p>
                      <p className="text-xs text-gray-700 font-semibold">{formatDateTime(aduan.tanggal_pemeriksaan)}</p>
                    </div>
                  )}
                </div>

                {aduan.biaya && parseFloat(aduan.biaya) > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <DollarSign size={16} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Biaya Perbaikan</p>
                      <p className="text-sm font-bold text-blue-700">
                        Rp {parseFloat(aduan.biaya).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Signatures for Final Inspection */}
                {(aduan.ttd_teknisi || aduan.ttd_kepala_ruang) && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    {aduan.ttd_teknisi && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium">TTD Teknisi</p>
                        <img
                          src={aduan.ttd_teknisi}
                          alt="TTD Teknisi"
                          className="w-full h-20 object-contain bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setPreviewImage(aduan.ttd_teknisi);
                            setPreviewAlt('TTD Teknisi - Penyelesaian');
                          }}
                          onError={(e) => { e.target.src = noImage; }}
                        />
                        <p className="text-xs text-gray-600 mt-1 text-center">{aduan.teknisi_nama || 'Teknisi'}</p>
                      </div>
                    )}

                    {aduan.ttd_kepala_ruang && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium">TTD Pengadu</p>
                        <img
                          src={aduan.ttd_kepala_ruang}
                          alt="TTD Pengadu"
                          className="w-full h-20 object-contain bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setPreviewImage(aduan.ttd_kepala_ruang);
                            setPreviewAlt('TTD Pengadu - Penyelesaian');
                          }}
                          onError={(e) => { e.target.src = noImage; }}
                        />
                        <p className="text-xs text-gray-600 mt-1 text-center">{aduan.pengadu_nama || 'Pengadu'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Export PDF Button (Only if Selesai) */}
        {aduan.status_aduan === 'Selesai' && (
          <div className="pt-2">
            <a
              href={`/api/report/aduan/export/${aduan.id_aduan}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 active:scale-95 transition-all"
            >
              <FileText size={20} />
              <span>Hasil Aduan</span>
            </a>
          </div>
        )}
      </div>
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

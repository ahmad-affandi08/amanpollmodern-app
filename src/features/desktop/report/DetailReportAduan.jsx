import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, User, Calendar, Clock } from 'lucide-react';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import AduanApi from '../../../api/AduanApi';

export default function DetailReportAduan() {
  usePageTitle('Laporan Detail Aduan');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await AduanApi.getById(id);
      setData(res.data || res); // Handle potentially different response structures
    } catch (error) {
      console.error("Failed to fetch detail:", error);
      showToast('Gagal memuat detail laporan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selesai':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Sedang Dikerjakan':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Pending':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Tindakan Lanjutan':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Helper to get image URL - backend already provides full URLs via asset() helper
  const getImageUrl = (url) => {
    if (!url) return null;
    // Backend already returns full URL, just return it
    return url;
  };

  const handleExport = () => {
    // Export to PDF
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    window.open(`${apiUrl}/report/aduan/export/${id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
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
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/report/aduan')}
          className="p-2 hover:bg-white rounded-xl transition-colors hover:shadow-sm group"
        >
          <ArrowLeft size={24} className="text-gray-500 group-hover:text-brand-primary transition-colors" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Detail Report Aduan</h1>
          <p className="text-gray-500 text-sm">No Pendaftaran: <span className="font-mono font-medium text-brand-primary">{data.id_aduan}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Main Info */}
        <div className="space-y-6">

          {/* Device Info Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Informasi Alat</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Alat</label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                {data.nama_alat_nama || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">No Inventaris</label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-mono">
                {data.no_inventaris || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keluhan Kerusakan</label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 min-h-[100px] whitespace-pre-wrap">
                {data.keluhan || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Keluhan</label>
              {data.img_keluhan ? (
                <div className="flex gap-4 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="relative group cursor-pointer overflow-hidden rounded-lg w-32 h-24 flex-shrink-0 bg-gray-200">
                    <img
                      src={getImageUrl(data.img_keluhan)}
                      alt="Foto Keluhan"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-700 truncate">{data.img_keluhan}</p>
                    <p className="text-xs text-gray-400 mt-1">Klik gambar untuk memperbesar</p>
                  </div>
                </div>
              ) : (
                <div className="w-full px-4 py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-sm">
                  Tidak ada foto keluhan dilampirkan
                </div>
              )}
            </div>
          </div>

          {/* Action & Results Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Hasil Pemeriksaan</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tindakan Petugas</label>
              <div className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-gray-800">
                {data.tindakan_teknisi || 'Belum ada tindakan'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rekomendasi</label>
              <div className="w-full px-4 py-3 bg-purple-50/50 border border-purple-100 rounded-xl text-gray-800">
                {data.rekomendasi || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kondisi Alat</label>
              <div className={`w-full px-4 py-3 border rounded-xl font-medium ${data.kondisi_alat === 'Baik' ? 'bg-green-50 border-green-100 text-green-700' :
                data.kondisi_alat === 'Rusak Ringan' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                  data.kondisi_alat === 'Rusak Berat' ? 'bg-red-50 border-red-100 text-red-700' :
                    'bg-gray-50 border-gray-100 text-gray-700'
                }`}>
                {data.kondisi_alat || 'Belum ditentukan'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Signatures & Status */}
        <div className="space-y-6">

          {/* Signatures Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Tanda Tangan</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Tanda Tangan Teknisi Pelaksana</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center min-h-[160px] bg-gray-50">
                {data.ttd_teknisi ? (
                  <img
                    src={getImageUrl(data.ttd_teknisi)}
                    alt="TTD Teknisi"
                    className="max-h-[140px] max-w-full object-contain mix-blend-multiply"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                  />
                ) : null}
                <p className="text-gray-400 text-sm hidden">Belum ada tanda tangan</p>
                {!data.ttd_teknisi && <p className="text-gray-400 text-sm">Belum ada tanda tangan</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Tanda Tangan Kepala Ruang</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center min-h-[160px] bg-gray-50">
                {data.ttd_kepala_ruang ? (
                  <img
                    src={getImageUrl(data.ttd_kepala_ruang)}
                    alt="TTD Kepala Ruang"
                    className="max-h-[140px] max-w-full object-contain mix-blend-multiply"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                  />
                ) : null}
                <p className="text-gray-400 text-sm hidden">Belum ada tanda tangan</p>
                {!data.ttd_kepala_ruang && <p className="text-gray-400 text-sm">Belum ada tanda tangan</p>}
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-gradient-to-br from-brand-primary to-purple-700 rounded-[24px] p-6 text-white shadow-xl shadow-brand-primary/20">
            <h2 className="text-lg font-bold border-b border-white/20 pb-2 mb-4">Status Laporan</h2>

            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className={`px-6 py-3 rounded-full font-bold text-lg shadow-sm backdrop-blur-sm bg-white/20 border border-white/30`}>
                {data.status_aduan || 'Pending'}
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-center">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full justify-center"
            >
              <Download size={20} />
              Hasil Pemeriksaan (PDF)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

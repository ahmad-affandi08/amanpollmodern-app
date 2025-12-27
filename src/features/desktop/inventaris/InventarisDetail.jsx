import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Award, Image as ImageIcon, Download, AlertCircle, Activity, Wrench } from 'lucide-react';
import InventarisApi from '../../../api/InventarisApi';
import Button from '../../../components/Button';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import noImage from '../../../assets/img/no_image.png';

export default function InventarisDetail() {
  usePageTitle('Detail Inventaris');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await InventarisApi.getById(id);
      setData(response.data || response);
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat detail inventaris', 'error');
      navigate('/inventaris');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500">Data tidak ditemukan</p>
        <Button onClick={() => navigate('/inventaris')} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/inventaris')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-dark">Detail Inventaris</h1>
            <p className="text-[#808191] text-sm mt-1">Informasi lengkap alat inventaris</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/inventaris/edit/${id}`)}
          className="flex items-center gap-2"
        >
          Edit Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-[24px] p-2 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        <div className="flex gap-2">
          {[
            { id: 'info', label: 'Informasi Alat', icon: FileText },
            { id: 'aduan', label: 'Riwayat Aduan', icon: AlertCircle },
            { id: 'pemeliharaan', label: 'Riwayat Pemeliharaan', icon: Wrench }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === tab.id
                ? 'bg-brand-primary text-white shadow-lg'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Left Column - Main Info */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] space-y-4">
            <h2 className="text-lg font-bold text-text-dark mb-4">Informasi Utama</h2>

            <DetailField label="Divisi" value={data.divisi?.nama_divisi || data.nama_alat?.divisi?.nama_divisi} />
            <DetailField label="Nama Alat" value={data.nama_alat?.nama_nama_alat} />
            <DetailField label="Nama Bagian/Ruangan" value={data.ruangan?.nama_ruangan} />
            <DetailField label="No Inventaris" value={data.no_inventaris} />
            <DetailField label="Merk" value={data.merk} />
            <DetailField label="Model/Tipe" value={data.model} />
            <DetailField label="No Seri" value={data.seri} />
            <DetailField label="Daya" value={data.daya} />
            <DetailField label="Harga" value={formatCurrency(data.harga)} />
            <DetailField label="Tahun Pengadaan" value={data.tahun_pengadaan} />
            <DetailField label="Letak Saat Ini" value={data.ruangan_sekarang?.nama_ruangan || data.ruangan?.nama_ruangan} />
          </div>

          {/* Right Column - Additional Info & Files */}
          <div className="space-y-6">
            {/* Additional Info */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] space-y-4">
              <h2 className="text-lg font-bold text-text-dark mb-4">Informasi Tambahan</h2>

              <DetailField label="Gedung" value={data.gedung} />
              <DetailField label="Interval Maintenance" value={data.interval_maintenance} />
              <DetailField label="Berlaku Hingga" value={formatDate(data.kadaluwarsa)} />
              <DetailField label="Kondisi Alat" value={data.kondisi_alat} />
              <DetailField
                label="Alat Kesehatan"
                value={data.alat_kesehatan ? 'Ya' : 'Tidak'}
              />
              {data.alat_kesehatan && (
                <DetailField label="Kategori Alkes" value={data.kategori_alkes} />
              )}
            </div>

            {/* Image */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
              <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Foto Alat
              </h2>
              <LazyLoadImage
                src={data.img_alat_url || noImage}
                alt={data.nama_alat?.nama_nama_alat}
                effect="blur"
                className="w-full h-auto rounded-xl border border-gray-200 max-h-96 object-contain"
                placeholderSrc={noImage}
                onError={(e) => { e.target.src = noImage; }}
              />
            </div>

            {/* File SOP */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
              <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                <FileText size={20} />
                File SOP
              </h2>
              {data.file_sop_url ? (
                <a
                  href={data.file_sop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-[#F8F9FB] rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText size={24} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-dark">Lihat File SOP</p>
                    <p className="text-xs text-gray-500">File SOP</p>
                  </div>
                  <Download size={20} className="text-gray-400" />
                </a>
              ) : (
                <p className="text-gray-400 text-sm">Tidak ada file SOP</p>
              )}
            </div>

            {/* File Sertifikat */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
              <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                <Award size={20} />
                File Sertifikat
              </h2>
              {data.file_sertifikat_url ? (
                <a
                  href={data.file_sertifikat_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-[#F8F9FB] rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-dark">Lihat Sertifikat</p>
                    <p className="text-xs text-gray-500">File Sertifikat</p>
                  </div>
                  <Download size={20} className="text-gray-400" />
                </a>
              ) : (
                <p className="text-gray-400 text-sm">Tidak ada file sertifikat</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Aduan */}
      {activeTab === 'aduan' && (
        <div className="animate-fade-in">
          {(!data.aduan || data.aduan.length === 0) ? (
            <div className="bg-white rounded-[24px] p-12 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Belum ada riwayat aduan untuk alat ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.aduan.map((aduan) => (
                <div key={aduan.id_aduan} className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">No. Aduan</p>
                      <p className="text-lg font-bold text-brand-primary">{aduan.no_aduan}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase ${getStatusColor(aduan.status_aduan)}`}>
                      {aduan.status_aduan}
                    </span>
                  </div>

                  {/* Keluhan */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 font-medium mb-2">Keluhan</p>
                    <p className="text-sm text-text-dark leading-relaxed bg-gray-50 p-3 rounded-lg">
                      "{aduan.keluhan || '-'}"
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Pelapor</p>
                      <p className="text-sm font-semibold text-text-dark">{aduan.nama_pengadu || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Tanggal</p>
                      <p className="text-sm font-semibold text-text-dark">{formatDate(aduan.create_date)}</p>
                    </div>
                  </div>

                  {/* Teknisi Section */}
                  {aduan.teknisi_nama && (
                    <div className="border-t pt-4 mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-1">Teknisi</p>
                          <p className="text-sm font-semibold text-text-dark">{aduan.teknisi_nama}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-1">Kondisi Alat</p>
                          <span className={`inline-block text-xs font-bold px-2 py-1 rounded-md ${getStatusColor(aduan.kondisi_alat)}`}>
                            {aduan.kondisi_alat}
                          </span>
                        </div>
                      </div>

                      {aduan.tindakan_teknisi && (
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-1">Tindakan</p>
                          <p className="text-sm text-text-dark bg-blue-50 p-3 rounded-lg">{aduan.tindakan_teknisi}</p>
                        </div>
                      )}

                      {aduan.rekomendasi && (
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-1">Rekomendasi</p>
                          <p className="text-sm text-text-dark bg-yellow-50 p-3 rounded-lg border border-yellow-200">{aduan.rekomendasi}</p>
                        </div>
                      )}

                      {aduan.biaya && (
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-1">Biaya</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(aduan.biaya)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Pemeliharaan */}
      {activeTab === 'pemeliharaan' && (
        <div className="animate-fade-in">
          {(!data.pemeliharaan || data.pemeliharaan.length === 0) ? (
            <div className="bg-white rounded-[24px] p-12 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Belum ada riwayat pemeliharaan untuk alat ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.pemeliharaan.map((mt) => (
                <div key={mt.id_pemeliharaan} className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Jadwal Pemeliharaan</p>
                      <p className="text-lg font-bold text-brand-primary">{formatDate(mt.jadwal_pemeliharaan)}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase ${getStatusColor(mt.status)}`}>
                      {mt.status}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
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
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 font-medium mb-2">Kondisi Alat</p>
                    <span className={`inline-block text-sm font-bold px-4 py-2 rounded-lg ${getStatusColor(mt.kondisi_alat)}`}>
                      {mt.kondisi_alat}
                    </span>
                  </div>

                  {/* Keterangan */}
                  {mt.keterangan_pemeliharaan && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 font-medium mb-2">Keterangan</p>
                      <p className="text-sm text-text-dark leading-relaxed bg-gray-50 p-3 rounded-lg">
                        {mt.keterangan_pemeliharaan}
                      </p>
                    </div>
                  )}

                  {/* Rekomendasi */}
                  {mt.rekomendasi && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 font-medium mb-2">Rekomendasi</p>
                      <p className="text-sm text-text-dark bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        {mt.rekomendasi}
                      </p>
                    </div>
                  )}

                  {/* Biaya */}
                  {mt.biaya > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-xs text-gray-400 font-medium mb-1">Biaya Pemeliharaan</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(mt.biaya)}</p>
                    </div>
                  )}

                  {/* TTD Status */}
                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <div className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${mt.status_ttd_teknisi === 'Sudah TTD' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      TTD Teknisi: {mt.status_ttd_teknisi}
                    </div>
                    <div className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${mt.status_ttd_karu === 'Sudah TTD' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      TTD Ka.Ru: {mt.status_ttd_karu}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper Component
function DetailField({ label, value }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-[#808191]">{label}</label>
      <div className="bg-[#F8F9FB] px-4 py-3 rounded-xl border border-gray-100">
        <p className="text-text-dark font-medium">{value || '-'}</p>
      </div>
    </div>
  );
}

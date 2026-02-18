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
    return <InventarisDetailSkeleton />;
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inventaris')}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-dark">Detail Inventaris</h1>
            <p className="text-[#808191] text-xs mt-0.5">Informasi lengkap alat inventaris</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => navigate(`/inventaris/edit/${id}`)}
          className="flex items-center gap-2"
        >
          Edit Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-[24px] p-2 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'info', label: 'Informasi Alat', icon: FileText },
            { id: 'aduan', label: 'Riwayat Aduan', icon: AlertCircle },
            { id: 'pemeliharaan', label: 'Riwayat Pemeliharaan', icon: Wrench }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-fit flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm ${activeTab === tab.id
                ? 'bg-brand-primary text-white shadow-lg'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label.replace('Riwayat ', '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
          {/* Left Column - Main Info */}
          <div className="bg-white rounded-[20px] p-5 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] space-y-3">
            <h2 className="text-base font-bold text-text-dark mb-3">Informasi Utama</h2>

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
          <div className="space-y-4">
            {/* Additional Info */}
            <div className="bg-white rounded-[20px] p-5 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] space-y-3">
              <h2 className="text-base font-bold text-text-dark mb-3">Informasi Tambahan</h2>

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
            <div className="bg-white rounded-[20px] p-5 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
              <h2 className="text-base font-bold text-text-dark mb-3 flex items-center gap-2">
                <ImageIcon size={18} />
                Foto Alat
              </h2>
              <LazyLoadImage
                src={data.img_alat_url || noImage}
                alt={data.nama_alat?.nama_nama_alat}
                effect="blur"
                className="w-full h-auto rounded-xl border border-gray-200 max-h-72 object-contain"
                placeholderSrc={noImage}
                onError={(e) => { e.target.src = noImage; }}
              />
            </div>

            {/* File SOP */}
            <div className="bg-white rounded-[20px] p-5 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
              <h2 className="text-base font-bold text-text-dark mb-3 flex items-center gap-2">
                <FileText size={18} />
                File SOP
              </h2>
              {data.file_sop_url ? (
                <a
                  href={data.file_sop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#F8F9FB] rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-dark text-sm">Lihat File SOP</p>
                    <p className="text-[10px] text-gray-500">File SOP</p>
                  </div>
                  <Download size={20} className="text-gray-400" />
                </a>
              ) : (
                <p className="text-gray-400 text-xs">Tidak ada file SOP</p>
              )}
            </div>

            {/* File Sertifikat */}
            <div className="bg-white rounded-[20px] p-5 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
              <h2 className="text-base font-bold text-text-dark mb-3 flex items-center gap-2">
                <Award size={18} />
                File Sertifikat
              </h2>
              {data.file_sertifikat_url ? (
                <a
                  href={data.file_sertifikat_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#F8F9FB] rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-dark text-sm">Lihat Sertifikat</p>
                    <p className="text-[10px] text-gray-500">File Sertifikat</p>
                  </div>
                  <Download size={18} className="text-gray-400" />
                </a>
              ) : (
                <p className="text-gray-400 text-xs">Tidak ada file sertifikat</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Aduan */}
      {activeTab === 'aduan' && (
        <div className="animate-fade-in">
          {(!data.aduan || data.aduan.length === 0) ? (
            <div className="bg-white rounded-[20px] p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">Belum ada riwayat aduan untuk alat ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.aduan.map((aduan) => (
                <div key={aduan.id_aduan} className="bg-white rounded-[20px] p-5 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3 pb-3 border-b">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">No. Aduan</p>
                      <p className="text-base font-bold text-brand-primary">{aduan.no_aduan}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${getStatusColor(aduan.status_aduan)}`}>
                      {aduan.status_aduan}
                    </span>
                  </div>

                  {/* Keluhan */}
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-400 font-medium mb-1">Keluhan</p>
                    <p className="text-xs text-text-dark leading-relaxed bg-gray-50 p-2.5 rounded-lg">
                      "{aduan.keluhan || '-'}"
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">Pelapor</p>
                      <p className="text-xs font-semibold text-text-dark">{aduan.nama_pengadu || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">Tanggal</p>
                      <p className="text-xs font-semibold text-text-dark">{formatDate(aduan.create_date)}</p>
                    </div>
                  </div>

                  {/* Teknisi Section */}
                  {aduan.teknisi_nama && (
                    <div className="border-t pt-3 mt-3 space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium mb-0.5">Teknisi</p>
                          <p className="text-xs font-semibold text-text-dark">{aduan.teknisi_nama}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium mb-0.5">Kondisi Alat</p>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${getStatusColor(aduan.kondisi_alat)}`}>
                            {aduan.kondisi_alat}
                          </span>
                        </div>
                      </div>

                      {aduan.tindakan_teknisi && (
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium mb-0.5">Tindakan</p>
                          <p className="text-xs text-text-dark bg-blue-50 p-2.5 rounded-lg">{aduan.tindakan_teknisi}</p>
                        </div>
                      )}

                      {aduan.rekomendasi && (
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium mb-0.5">Rekomendasi</p>
                          <p className="text-xs text-text-dark bg-yellow-50 p-2.5 rounded-lg border border-yellow-200">{aduan.rekomendasi}</p>
                        </div>
                      )}

                      {aduan.biaya && (
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium mb-0.5">Biaya</p>
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
            <div className="bg-white rounded-[20px] p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)] text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">Belum ada riwayat pemeliharaan untuk alat ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.pemeliharaan.map((mt) => (
                <div key={mt.id_pemeliharaan} className="bg-white rounded-[20px] p-5 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3 pb-3 border-b">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">Jadwal Pemeliharaan</p>
                      <p className="text-base font-bold text-brand-primary">{formatDate(mt.jadwal_pemeliharaan)}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${getStatusColor(mt.status)}`}>
                      {mt.status}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">Teknisi</p>
                      <p className="text-xs font-semibold text-text-dark">{mt.teknisi_nama || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">Tgl Pemeriksaan</p>
                      <p className="text-xs font-semibold text-text-dark">{formatDate(mt.tanggal_pemeriksaan) || '-'}</p>
                    </div>
                  </div>

                  {/* Kondisi Alat */}
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-400 font-medium mb-1">Kondisi Alat</p>
                    <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg ${getStatusColor(mt.kondisi_alat)}`}>
                      {mt.kondisi_alat}
                    </span>
                  </div>

                  {/* Keterangan */}
                  {mt.keterangan_pemeliharaan && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-400 font-medium mb-1">Keterangan</p>
                      <p className="text-xs text-text-dark leading-relaxed bg-gray-50 p-2.5 rounded-lg">
                        {mt.keterangan_pemeliharaan}
                      </p>
                    </div>
                  )}

                  {/* Rekomendasi */}
                  {mt.rekomendasi && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-400 font-medium mb-1">Rekomendasi</p>
                      <p className="text-xs text-text-dark bg-yellow-50 p-2.5 rounded-lg border border-yellow-200">
                        {mt.rekomendasi}
                      </p>
                    </div>
                  )}

                  {/* Biaya */}
                  {mt.biaya > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">Biaya Pemeliharaan</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(mt.biaya)}</p>
                    </div>
                  )}

                  {/* TTD Status */}
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <div className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-medium ${mt.status_ttd_teknisi === 'Sudah TTD' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      TTD Teknisi: {mt.status_ttd_teknisi}
                    </div>
                    <div className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-medium ${mt.status_ttd_karu === 'Sudah TTD' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
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


function DetailField({ label, value }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-[#808191]">{label}</label>
      <div className="bg-[#F8F9FB] px-3 py-2 rounded-lg border border-gray-100">
        <p className="text-text-dark font-medium text-sm">{value || '-'}</p>
      </div>
    </div>
  );
}


function InventarisDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="bg-white rounded-[24px] p-2 shadow-sm">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Additional Info Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Image Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="w-full h-64 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {/* File Cards */}
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


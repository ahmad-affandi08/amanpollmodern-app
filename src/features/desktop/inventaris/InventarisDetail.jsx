import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Award, Image as ImageIcon, Download } from 'lucide-react';
import InventarisApi from '../../../api/InventarisApi';
import Button from '../../../components/Button';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';

export default function InventarisDetail() {
  usePageTitle('Detail Inventaris');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      showToast('error', 'Gagal memuat detail inventaris');
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

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          {data.img_alat_url && (
            <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
              <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Foto Alat
              </h2>
              <img
                src={data.img_alat_url}
                alt={data.nama_alat?.nama_nama_alat}
                className="w-full h-auto rounded-xl border border-gray-200"
                onError={(e) => {
                  e.target.src = '/path/to/placeholder.png';
                }}
              />
            </div>
          )}

          {/* File SOP */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
            <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
              <FileText size={20} />
              File SOP
            </h2>
            {data.file_sop ? (
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
                  <p className="text-xs text-gray-500">{data.file_sop}</p>
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
            {data.file_sertifikat ? (
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
                  <p className="text-xs text-gray-500">{data.file_sertifikat}</p>
                </div>
                <Download size={20} className="text-gray-400" />
              </a>
            ) : (
              <p className="text-gray-400 text-sm">Tidak ada file sertifikat</p>
            )}
          </div>
        </div>
      </div>
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

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, ClipboardList } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { usePemeliharaanDetail } from '../../../hooks/queries/usePemeliharaanQueries';
import { formatDate } from '../../../utils/format';
import noImage from '../../../assets/img/no_image.png';

export default function MobilePemeliharaanDetail() {
  usePageTitle('Detail Pemeliharaan');
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: pemeliharaan, isLoading } = usePemeliharaanDetail(id);

  const DetailCard = ({ label, value }) => (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      <p className="text-sm font-bold text-gray-800">{value || '-'}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 pb-4">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>

        {/* Detail Cards Skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
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
      <div className="p-4 text-center text-red-500">
        Data pemeliharaan tidak ditemukan
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

      {/* Details */}
      <div className="space-y-3">
        <DetailCard label="Nama Divisi" value={pemeliharaan.divisi_nama} />
        <DetailCard label="Nama Alat" value={pemeliharaan.nama_alat_nama} />
        <DetailCard label="Merk" value={pemeliharaan.merk} />
        <DetailCard label="Model/Type" value={pemeliharaan.model} />
        <DetailCard label="Seri" value={pemeliharaan.seri} />
        <DetailCard label="No Inventaris" value={pemeliharaan.no_inventaris} />
        <DetailCard label="Gedung" value={pemeliharaan.gedung} />
        <DetailCard label="Ruangan" value={pemeliharaan.ruangan_nama} />

        {/* Image */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="text-xs font-medium text-gray-600 block mb-2">Gambar Alat</label>
          <div className="flex items-center gap-3">
            <img
              src={pemeliharaan.img_alat || noImage}
              alt="Gambar Alat"
              className="w-24 h-24 rounded-xl object-cover bg-gray-100"
              onError={(e) => { e.target.src = noImage; }}
            />
            <p className="text-xs text-gray-500 flex-1">
              {pemeliharaan.img_alat || 'Gambar tidak ditemukan'}
            </p>
          </div>
        </div>

        <DetailCard
          label="Jadwal Pemeriksaan"
          value={formatDate(pemeliharaan.jadwal_pemeliharaan)}
        />

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          {/* Form Pemeliharaan Button - Only for incomplete tasks */}
          {pemeliharaan.status !== 'Selesai' && (
            <button
              onClick={() => navigate(`/mobile/pemeliharaan/${id}/form`)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
            >
              <ClipboardList size={20} />
              Form Pemeliharaan
            </button>
          )}

          {/* Hasil Pemeliharaan Button - Only for completed tasks */}
          {pemeliharaan.status === 'Selesai' && (
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/pemeliharaan/${id}/export-hasil`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <ClipboardList size={20} />
              Hasil Pemeliharaan
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

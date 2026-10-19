import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, User, Calendar, Clock, MapPin,
  Building2, Wrench, CheckCircle, Package
} from 'lucide-react';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle, usePemeliharaanDetail } from '../../../hooks';
import { apiUrl } from '../../../config';
import { formatDate } from '../../../utils/format';
import StatusBadge from '../../../components/StatusBadge';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import noImage from '../../../assets/img/no_image.png';
import KondisiBadge from '../../../components/KondisiBadge';

export default function DetailReportPemeliharaan() {
  usePageTitle('Detail Laporan Pemeliharaan');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Kunci query memuat id, jadi data sebelumnya tidak pernah tampil di id yang baru
  // atau tertinggal saat gagal memuat.
  const { data: detail, isLoading: loading, isError } = usePemeliharaanDetail(id);
  const data = detail || null;

  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');

  useEffect(() => {
    if (isError) showToast('Gagal memuat detail laporan', 'error');
  }, [isError, showToast]);

  // Tautan unduhan (rute export di server tidak memakai middleware api.auth,
  // sesi dibawa cookie), jadi autentikasi tidak diubah.
  const handleExport = () => {
    window.open(apiUrl(`/pemeliharaan/${id}/export-hasil`), '_blank');
  };

  if (loading) {
    return <DetailReportSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <FileText size={48} className="text-gray-300 mb-2" />
        <h3 className="text-lg font-bold text-gray-800 mb-1">Data Tidak Ditemukan</h3>
        <p className="text-sm text-gray-500 mb-4">Laporan yang Anda cari tidak tersedia.</p>
        <button
          type="button"
          onClick={() => navigate('/report/pemeliharaan')}
          className="px-4 py-2 bg-brand-primary text-white text-sm rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/report/pemeliharaan')}
            aria-label="Kembali ke daftar laporan pemeliharaan"
            className="p-1.5 hover:bg-white rounded-lg transition-colors hover:shadow-sm group"
          >
            <ArrowLeft size={20} className="text-gray-500 group-hover:text-brand-primary transition-colors" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-dark">Detail Laporan Pemeliharaan</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {data.no_pemeliharaan && (
                <>
                  <span className="text-xs text-gray-500">No. Pemeliharaan:</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-brand-primary text-[10px] font-bold rounded border border-purple-200">
                    {data.no_pemeliharaan}
                  </span>
                </>
              )}
              <StatusBadge status={data.status} size="sm" />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-yellow-950 font-bold rounded-lg shadow-sm hover:shadow text-xs transition-all duration-300"
        >
          <Download size={14} />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
              <Package className="text-brand-primary" size={16} />
              <h2 className="text-sm font-bold text-gray-800">Informasi Alat</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Nama Alat</label>
                <div className="px-3 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg text-gray-800 font-bold text-xs">
                  {data.nama_alat_nama || '-'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">No Inventaris</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-mono font-medium text-[10px]">
                  {data.no_inventaris || '-'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Merk</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium text-xs">
                  {data.merk || '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
              <MapPin className="text-green-500" size={16} />
              <h2 className="text-sm font-bold text-gray-800">Informasi Lokasi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoCard icon={<Building2 size={12} />} label="Divisi" value={data.divisi_nama} />
              <InfoCard icon={<MapPin size={12} />} label="Ruangan" value={data.ruangan_nama} />
              {data.gedung && <InfoCard icon={<Building2 size={12} />} label="Gedung" value={data.gedung} />}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar className="text-blue-600" size={16} />
              <h2 className="text-sm font-bold text-gray-800">Jadwal & Pelaksanaan</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-md">
                  <Calendar size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-600 font-medium">Jadwal Pemeliharaan</p>
                  <p className="text-xs font-bold text-gray-900">{formatDate(data.jadwal_pemeliharaan)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
                  <Clock size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-600 font-medium">Tanggal Pemeriksaan</p>
                  <p className="text-xs font-bold text-gray-900">
                    {data.tanggal_pemeriksaan ? formatDate(data.tanggal_pemeriksaan) : 'Belum Dilakukan'}
                  </p>
                </div>
              </div>
            </div>
          </div>


        </div>

        <div className="space-y-4">
          {data.tanggal_pemeriksaan && (
            <InspectionCard
              title="HASIL PEMERIKSAAN"
              icon={<CheckCircle size={16} className="text-green-600" />}
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

          {data.kondisi_alat && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-700 mb-2">Kondisi Alat Terakhir</h3>
              <KondisiBadge kondisi={data.kondisi_alat} size="lg" />
            </div>
          )}

          {data.teknisi_nama && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Wrench className="text-purple-600" size={16} />
                <h2 className="text-sm font-bold text-gray-800">Teknisi Penanggung Jawab</h2>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-purple-200 shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-md">
                  <User size={14} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xs">{data.teknisi_nama}</p>
                  <p className="text-[10px] text-gray-600">{data.divisi_nama}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage}
        altText={previewAlt}
      />
    </div>
  );
}

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="flex items-center gap-1 mb-0.5 text-gray-500">
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </div>
    <p className="text-xs font-bold text-gray-800 truncate">{value || '-'}</p>
  </div>
);

const InspectionCard = ({ title, icon, bgColor, borderColor, data, onImagePreview }) => {
  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-xl p-4 border ${borderColor} shadow-sm`}>
      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-200">
        {icon}
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {data.kondisi && (
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Kondisi Alat</label>
              <KondisiBadge kondisi={data.kondisi} />
            </div>
          )}

          {data.tanggal && (
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Tanggal Pemeriksaan</label>
              <div className="px-2.5 py-1.5 bg-white/80 border border-gray-200 rounded-lg text-gray-700 text-[10px] font-semibold">
                {formatDate(data.tanggal)}
              </div>
            </div>
          )}
        </div>

        {(data.ttd_teknisi || data.ttd_kepala_ruang) && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
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
                label="TTD Kepala Ruangan"
                name={data.kepala_ruang_nama}
                image={data.ttd_kepala_ruang}
                onPreview={() => onImagePreview(data.ttd_kepala_ruang, 'TTD Kepala Ruangan')}
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
    <label className="block text-[10px] font-bold text-gray-600 mb-1">{label}</label>
    <div
      className="w-full h-20 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-primary transition-colors overflow-hidden group"
      onClick={onPreview}
    >
      <img
        src={image}
        alt={label}
        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
        onError={(e) => { e.target.src = noImage; }}
      />
    </div>
    {name && <p className="text-[10px] text-gray-600 mt-0.5 text-center font-medium">{name}</p>}
  </div>
);

const DetailReportSkeleton = () => {
  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div>
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-2 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-3 w-24 bg-gray-300 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-2 w-20 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="h-2 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="h-2 w-12 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

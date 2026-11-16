import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { usePageTitle, useAduanDetail } from '../../../hooks';
import { apiUrl } from '../../../config';
import { formatDateTime, rupiah } from '../../../utils/format';
import { susunRiwayatAduan } from '../../../utils/detailRiwayat';
import RisikoBadge from '../../../components/RisikoBadge';
import StatusBadge from '../../../components/StatusBadge';
import KondisiBadge from '../../../components/KondisiBadge';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import ServisPihakKetigaPanel from '../../../components/ServisPihakKetigaPanel';
import DetailSection from '../../../components/detail/DetailSection';
import { DetailRow } from '../../../components/detail/DetailField';
import DetailPerson from '../../../components/detail/DetailPerson';
import ExportButton from '../../../components/detail/ExportButton';
import PenangananTimeline from '../../../components/detail/PenangananTimeline';
import DetailSkeleton from '../../../components/detail/DetailSkeleton';

const BELUM = 'Belum Ditentukan';

export default function MobileAduanDetail() {
  usePageTitle('Detail Aduan');
  const { id } = useParams();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');

  const { data: aduan, isLoading } = useAduanDetail(id);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4 pb-4">
        <DetailSkeleton />
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

  const pratinjau = (gambar, alt) => {
    setPreviewImage(gambar);
    setPreviewAlt(alt);
  };
  const riwayat = susunRiwayatAduan(aduan);
  const kondisi = aduan.kondisi_alat && aduan.kondisi_alat !== BELUM ? aduan.kondisi_alat : null;

  return (
    <div className="max-w-md mx-auto px-4 pb-24 space-y-4">
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-text-dark"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold text-text-dark">Detail Laporan</h1>
      </div>

      <DetailSection>
        {aduan.img_keluhan && (
          <button
            type="button"
            onClick={() => pratinjau(aduan.img_keluhan, 'Foto keluhan')}
            aria-label="Perbesar foto keluhan"
            className="w-full h-44 mb-4 rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in"
          >
            <img
              src={aduan.img_keluhan}
              alt="Foto keluhan"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </button>
        )}
        <h2 className="text-xl font-extrabold text-text-dark">{aduan.nama_alat_nama}</h2>
        <p className="font-mono text-xs text-[#808191] mt-0.5 break-all">{aduan.no_inventaris}</p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <StatusBadge status={aduan.status_aduan} />
          {kondisi && <KondisiBadge kondisi={kondisi} size="md" />}
          <span className="px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">{aduan.no_aduan || '-'}</span>
        </div>
        {aduan.tingkat_risiko === 'Tinggi' && (
          <div className="mt-3 flex items-center gap-2">
            <RisikoBadge tingkat="Tinggi" size="sm" />
            <span className="text-xs text-red-600 font-semibold">Alat risiko tinggi: prioritaskan penanganan</span>
          </div>
        )}
      </DetailSection>

      <DetailSection judul="Keluhan">
        <p className="text-[15px] font-semibold text-text-dark whitespace-pre-wrap break-words">{aduan.keluhan}</p>
        <dl className="mt-4 pt-4 border-t border-gray-100">
          <DetailRow label="Pelapor" value={aduan.nama_pengadu} />
          <DetailRow label="Tanggal laporan" value={formatDateTime(aduan.create_date)} />
          <DetailRow label="Divisi" value={aduan.divisi_nama} />
          <DetailRow label="Ruangan" value={aduan.ruangan_nama} />
          {aduan.gedung && aduan.gedung !== '-' && <DetailRow label="Gedung" value={aduan.gedung} />}
        </dl>
      </DetailSection>

      {aduan.teknisi_nama && (
        <DetailSection judul="Penugasan">
          <DetailPerson nama={aduan.teknisi_nama} keterangan={aduan.divisi_nama} />
          <dl className="mt-4 pt-4 border-t border-gray-100">
            <DetailRow label="Waktu penugasan" value={aduan.tanggal_penugasan ? formatDateTime(aduan.tanggal_penugasan) : 'Tidak tercatat'} />
            {parseFloat(aduan.biaya) > 0 && (
              <DetailRow label="Biaya perbaikan">
                <span className="text-base font-extrabold">{rupiah(aduan.biaya)}</span>
              </DetailRow>
            )}
          </dl>
        </DetailSection>
      )}

      {riwayat.length > 0 && (
        <DetailSection judul="Riwayat penanganan">
          <PenangananTimeline items={riwayat} onPreview={pratinjau} />
        </DetailSection>
      )}

      <DetailSection>
        <ServisPihakKetigaPanel jenis="aduan" indukId={aduan.id_aduan} status={aduan.status_aduan} />
      </DetailSection>

      {/* Export PDF hanya bila aduan sudah selesai */}
      {aduan.status_aduan === 'Selesai' && (
        <ExportButton href={apiUrl(`/report/aduan/export/${aduan.id_aduan}`)} variant="solid" full />
      )}

      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage}
        alt={previewAlt}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Image as ImageIcon } from 'lucide-react';
import { usePageTitle, usePemeliharaanDetail } from '../../../hooks';
import { apiUrl } from '../../../config';
import { formatDate, rupiah } from '../../../utils/format';
import { susunRiwayatPemeliharaan } from '../../../utils/detailRiwayat';
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
const ada = (v) => (v && v !== '-' ? v : null);

export default function MobilePemeliharaanDetail() {
  usePageTitle('Detail Pemeliharaan');
  const { id } = useParams();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(false);
  const [fotoGagal, setFotoGagal] = useState(false);
  const [ttdPreview, setTtdPreview] = useState(null);

  const { data: pemeliharaan, isLoading } = usePemeliharaanDetail(id);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4 pb-4">
        <DetailSkeleton />
      </div>
    );
  }

  if (!pemeliharaan) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-600 font-medium">Data pemeliharaan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const riwayat = susunRiwayatPemeliharaan(pemeliharaan);
  const kondisi = pemeliharaan.kondisi_alat && pemeliharaan.kondisi_alat !== BELUM ? pemeliharaan.kondisi_alat : null;
  const teknisi = ada(pemeliharaan.teknisi_nama);
  const perluForm = pemeliharaan.status === 'Belum Selesai' || pemeliharaan.status === 'Tindakan Lanjutan';
  const bisaExport = pemeliharaan.status === 'Selesai' || pemeliharaan.status === 'Tindakan Lanjutan';

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
        <h1 className="text-lg font-extrabold text-text-dark">Detail Pemeliharaan</h1>
      </div>

      <DetailSection>
        {pemeliharaan.img_alat && !fotoGagal ? (
          <button
            type="button"
            onClick={() => setImagePreview(true)}
            aria-label="Perbesar foto alat"
            className="w-full h-44 mb-4 rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in"
          >
            <img
              src={pemeliharaan.img_alat}
              alt={pemeliharaan.nama_alat_nama}
              className="w-full h-full object-cover"
              onError={() => setFotoGagal(true)}
            />
          </button>
        ) : (
          <div className="w-full h-28 mb-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center gap-2 text-xs font-semibold text-[#B0B3C7]">
            <ImageIcon size={18} />
            Belum ada foto alat
          </div>
        )}
        <h2 className="text-xl font-extrabold text-text-dark">{pemeliharaan.nama_alat_nama}</h2>
        <p className="font-mono text-xs text-[#808191] mt-0.5 break-all">{pemeliharaan.no_inventaris}</p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <StatusBadge status={pemeliharaan.status} />
          {kondisi && <KondisiBadge kondisi={kondisi} size="md" />}
          {pemeliharaan.no_pemeliharaan && (
            <span className="px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">{pemeliharaan.no_pemeliharaan}</span>
          )}
        </div>
      </DetailSection>

      <DetailSection judul="Jadwal dan teknisi">
        {teknisi ? (
          <DetailPerson nama={teknisi} keterangan={pemeliharaan.divisi_nama} />
        ) : (
          <p className="text-sm text-[#808191]">Belum ada teknisi yang ditugaskan.</p>
        )}
        <dl className="mt-4 pt-4 border-t border-gray-100">
          <DetailRow label="Jadwal" value={formatDate(pemeliharaan.jadwal_pemeliharaan)} />
          <DetailRow label="Diperiksa" value={pemeliharaan.tanggal_pemeriksaan ? formatDate(pemeliharaan.tanggal_pemeriksaan) : 'Belum dilakukan'} />
          {parseFloat(pemeliharaan.biaya) > 0 && (
            <DetailRow label="Biaya">
              <span className="text-base font-extrabold">{rupiah(pemeliharaan.biaya)}</span>
            </DetailRow>
          )}
          {pemeliharaan.status === 'Tindakan Lanjutan' && pemeliharaan.disposisi_nama && (
            <DetailRow label="Disposisi ke" value={pemeliharaan.disposisi_nama} />
          )}
        </dl>
      </DetailSection>

      <DetailSection judul="Informasi alat">
        <dl>
          <DetailRow label="Divisi" value={pemeliharaan.divisi_nama} />
          <DetailRow label="Ruangan" value={pemeliharaan.ruangan_nama} />
          <DetailRow label="Gedung" value={ada(pemeliharaan.gedung)} />
          <DetailRow label="Merk" value={ada(pemeliharaan.merk)} />
          <DetailRow label="Model/Tipe" value={ada(pemeliharaan.model)} />
          <DetailRow label="Seri" value={ada(pemeliharaan.seri)} />
        </dl>
      </DetailSection>

      {riwayat.length > 0 && (
        <DetailSection judul="Riwayat pemeriksaan">
          <PenangananTimeline items={riwayat} onPreview={(gambar) => setTtdPreview(gambar)} />
        </DetailSection>
      )}

      <DetailSection>
        <ServisPihakKetigaPanel jenis="pemeliharaan" indukId={id} status={pemeliharaan.status} />
      </DetailSection>

      <div className="space-y-3">
        {/* Form: untuk jadwal yang belum selesai atau perlu tindakan lanjutan */}
        {perluForm && (
          <button
            type="button"
            onClick={() => navigate(`/mobile/pemeliharaan/${id}/form`)}
            className="w-full h-12 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <ClipboardList size={18} />
            {pemeliharaan.status === 'Tindakan Lanjutan' ? 'Isi form pemeliharaan lanjutan' : 'Isi form pemeliharaan'}
          </button>
        )}

        {bisaExport && (
          <ExportButton
            href={apiUrl(`/pemeliharaan/${id}/export-hasil`)}
            variant={perluForm ? 'outline' : 'solid'}
            full
          />
        )}
      </div>

      <ImagePreviewModal
        isOpen={imagePreview}
        imageUrl={pemeliharaan.img_alat}
        onClose={() => setImagePreview(false)}
      />
      <ImagePreviewModal
        isOpen={!!ttdPreview}
        imageUrl={ttdPreview}
        onClose={() => setTtdPreview(null)}
      />
    </div>
  );
}

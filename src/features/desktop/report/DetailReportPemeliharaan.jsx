import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle, usePemeliharaanDetail } from '../../../hooks';
import { apiUrl } from '../../../config';
import { rupiah, formatDate } from '../../../utils/format';
import { susunRiwayatPemeliharaan, langkahAlurPemeliharaan } from '../../../utils/detailRiwayat';
import StatusBadge from '../../../components/StatusBadge';
import KondisiBadge from '../../../components/KondisiBadge';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import ServisPihakKetigaPanel from '../../../components/ServisPihakKetigaPanel';
import DetailHeader from '../../../components/detail/DetailHeader';
import DetailSection from '../../../components/detail/DetailSection';
import DetailField from '../../../components/detail/DetailField';
import DetailPerson from '../../../components/detail/DetailPerson';
import ExportButton from '../../../components/detail/ExportButton';
import AlurStatus from '../../../components/detail/AlurStatus';
import PenangananTimeline from '../../../components/detail/PenangananTimeline';
import DetailSkeleton from '../../../components/detail/DetailSkeleton';
import DetailNotFound from '../../../components/detail/DetailNotFound';

const BELUM = 'Belum Ditentukan';
const ada = (v) => (v && v !== '-' ? v : null);

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

  const kembali = () => navigate('/report/pemeliharaan');

  // Tautan unduhan (rute export di server tidak memakai middleware api.auth,
  // sesi dibawa cookie), jadi autentikasi tidak diubah.
  const handleExport = () => {
    window.open(apiUrl(`/pemeliharaan/${id}/export-hasil`), '_blank');
  };

  if (loading) return <DetailSkeleton dua />;
  if (!data) return <DetailNotFound onBack={kembali} />;

  const pratinjau = (gambar, alt) => {
    setPreviewImage(gambar);
    setPreviewAlt(alt);
  };
  const riwayat = susunRiwayatPemeliharaan(data);
  const teknisi = ada(data.teknisi_nama);
  const kondisiTerakhir = data.kondisi_alat && data.kondisi_alat !== BELUM ? data.kondisi_alat : null;

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <DetailHeader
        judul="Detail Laporan Pemeliharaan"
        nomor={data.no_pemeliharaan}
        status={<StatusBadge status={data.status} />}
        onBack={kembali}
        aksi={<ExportButton onClick={handleExport} />}
      />

      <DetailSection judul="Alur pemeliharaan">
        <AlurStatus langkah={langkahAlurPemeliharaan(data)} />
      </DetailSection>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-5 items-start">
        <div className="space-y-5">
          <DetailSection judul="Alat dan lokasi">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <DetailField label="Nama alat" value={data.nama_alat_nama} />
              <DetailField label="No. inventaris" value={data.no_inventaris} mono />
              <DetailField label="Merk" value={ada(data.merk)} />
              <DetailField label="Model" value={ada(data.model)} />
              <DetailField label="No. seri" value={ada(data.seri)} mono />
              <DetailField label="Divisi" value={data.divisi_nama} />
              <DetailField label="Ruangan" value={data.ruangan_nama} />
              {ada(data.gedung) && <DetailField label="Gedung" value={data.gedung} />}
            </dl>
          </DetailSection>

          {riwayat.length > 0 ? (
            <DetailSection judul="Riwayat pemeriksaan">
              <PenangananTimeline items={riwayat} onPreview={pratinjau} />
            </DetailSection>
          ) : (
            <DetailSection judul="Riwayat pemeriksaan">
              <p className="text-sm text-[#808191]">Belum ada pemeriksaan untuk jadwal ini.</p>
            </DetailSection>
          )}
        </div>

        <div className="space-y-5">
          <DetailSection judul="Jadwal dan teknisi">
            {teknisi ? (
              <DetailPerson nama={teknisi} keterangan={data.divisi_nama} />
            ) : (
              <p className="text-sm text-[#808191]">Belum ada teknisi yang ditugaskan.</p>
            )}
            <dl className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <DetailField label="Jadwal" value={formatDate(data.jadwal_pemeliharaan)} />
              <DetailField label="Diperiksa" value={data.tanggal_pemeriksaan ? formatDate(data.tanggal_pemeriksaan) : 'Belum dilakukan'} />
            </dl>
          </DetailSection>

          <DetailSection judul="Ringkasan">
            <dl className="space-y-4">
              <DetailField label="Kondisi alat terakhir">
                {kondisiTerakhir ? <KondisiBadge kondisi={kondisiTerakhir} size="md" /> : '-'}
              </DetailField>
              <div className="pt-4 border-t border-gray-100">
                <dt className="text-xs font-semibold text-[#808191] mb-0.5">Biaya pemeliharaan</dt>
                <dd className="text-2xl font-extrabold text-text-dark">{Number(data.biaya) > 0 ? rupiah(data.biaya) : '-'}</dd>
              </div>
            </dl>
          </DetailSection>

          <DetailSection>
            <ServisPihakKetigaPanel jenis="pemeliharaan" indukId={data.id_pemeliharaan ?? id} status={data.status} />
          </DetailSection>
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

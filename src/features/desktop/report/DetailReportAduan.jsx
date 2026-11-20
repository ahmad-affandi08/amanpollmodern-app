import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle, useAduanDetail } from '../../../hooks';
import { apiUrl } from '../../../config';
import { rupiah, formatDate, formatDateTime } from '../../../utils/format';
import { susunRiwayatAduan, langkahAlurAduan } from '../../../utils/detailRiwayat';
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

export default function DetailReportAduan() {
  usePageTitle('Detail Laporan Aduan');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Kunci query memuat id, jadi data aduan sebelumnya tidak pernah tampil di id yang baru
  // atau tertinggal saat gagal memuat.
  const { data: detail, isLoading: loading, isError } = useAduanDetail(id);
  const data = detail?.data || detail || null;

  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');

  useEffect(() => {
    if (isError) showToast('Gagal memuat detail laporan', 'error');
  }, [isError, showToast]);

  const kembali = () => navigate('/report/aduan');

  // Tautan unduhan (rute export di server tidak memakai middleware api.auth,
  // sesi dibawa cookie), jadi autentikasi tidak diubah.
  const handleExport = () => {
    window.open(apiUrl(`/report/aduan/export/${id}`), '_blank');
  };

  if (loading) return <DetailSkeleton dua />;
  if (!data) return <DetailNotFound onBack={kembali} />;

  const pratinjau = (gambar, alt) => {
    setPreviewImage(gambar);
    setPreviewAlt(alt);
  };
  const riwayat = susunRiwayatAduan(data);
  const kondisiTerakhir = data.kondisi_alat && data.kondisi_alat !== BELUM ? data.kondisi_alat : null;

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <DetailHeader
        judul="Detail Laporan Aduan"
        nomor={data.no_aduan}
        status={<StatusBadge status={data.status_aduan} />}
        onBack={kembali}
        aksi={<ExportButton onClick={handleExport} />}
      />

      <DetailSection judul="Alur penanganan">
        <AlurStatus langkah={langkahAlurAduan(data)} />
      </DetailSection>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-5 items-start">
        <div className="space-y-5">
          <DetailSection judul="Keluhan">
            <div className="flex flex-col sm:flex-row gap-5">
              {data.img_keluhan ? (
                <button
                  type="button"
                  onClick={() => pratinjau(data.img_keluhan, 'Foto keluhan')}
                  aria-label="Perbesar foto keluhan"
                  className="w-full sm:w-56 h-40 shrink-0 rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in"
                >
                  <img
                    src={data.img_keluhan}
                    alt="Foto keluhan"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </button>
              ) : (
                <div className="w-full sm:w-56 h-40 shrink-0 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-xs font-semibold text-[#B0B3C7]">
                  Tidak ada foto
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-text-dark whitespace-pre-wrap break-words">{data.keluhan || '-'}</p>
                <p className="text-xs text-[#808191] mt-2">
                  Dilaporkan oleh {data.nama_pengadu || '-'} · {formatDate(data.create_date)}
                </p>
              </div>
            </div>
          </DetailSection>

          <DetailSection judul="Alat dan lokasi">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <DetailField label="Nama alat" value={data.nama_alat_nama} />
              <DetailField label="No. inventaris" value={data.no_inventaris} mono />
              <DetailField label="Divisi" value={data.divisi_nama} />
              <DetailField label="Ruangan" value={data.ruangan_nama} />
              {data.gedung && data.gedung !== '-' && <DetailField label="Gedung" value={data.gedung} />}
            </dl>
          </DetailSection>

          {riwayat.length > 0 && (
            <DetailSection judul="Riwayat penanganan">
              <PenangananTimeline items={riwayat} onPreview={pratinjau} />
            </DetailSection>
          )}
        </div>

        <div className="space-y-5">
          <DetailSection judul="Penugasan">
            {data.teknisi_nama ? (
              <>
                <DetailPerson nama={data.teknisi_nama} keterangan={data.divisi_nama} />
                <dl className="mt-4 pt-4 border-t border-gray-100">
                  <DetailField label="Waktu penugasan" value={data.tanggal_penugasan ? formatDateTime(data.tanggal_penugasan) : 'Tidak tercatat'} />
                  <div className="mt-4">
                    <DetailField label="Respons pertama teknisi" value={data.tanggal_respon ? formatDateTime(data.tanggal_respon) : 'Tidak tercatat'} />
                  </div>
                </dl>
              </>
            ) : (
              <p className="text-sm text-[#808191]">Belum ada teknisi yang ditugaskan.</p>
            )}
          </DetailSection>

          <DetailSection judul="Ringkasan">
            <dl className="space-y-4">
              <DetailField label="Kondisi alat terakhir">
                {kondisiTerakhir ? <KondisiBadge kondisi={kondisiTerakhir} size="md" /> : '-'}
              </DetailField>
              <DetailField label="Tingkat kerusakan" value={data.tingkat_kerusakan} />
              <div className="pt-4 border-t border-gray-100">
                <dt className="text-xs font-semibold text-[#808191] mb-0.5">Biaya perbaikan</dt>
                <dd className="text-2xl font-extrabold text-text-dark">{Number(data.biaya) > 0 ? rupiah(data.biaya) : '-'}</dd>
              </div>
            </dl>
          </DetailSection>

          <DetailSection>
            <ServisPihakKetigaPanel jenis="aduan" indukId={data.id_aduan ?? id} status={data.status_aduan} />
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

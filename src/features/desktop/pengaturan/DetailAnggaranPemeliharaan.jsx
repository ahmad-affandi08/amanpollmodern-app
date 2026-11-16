import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AnggaranApi from '../../../api/AnggaranApi';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import { apiUrl } from '../../../config';
import { rupiah, formatPercent } from '../../../utils/format';
import DataTable from '../../../components/DataTable';
import DetailHeader from '../../../components/detail/DetailHeader';
import DetailSection from '../../../components/detail/DetailSection';
import DetailField from '../../../components/detail/DetailField';
import ExportButton from '../../../components/detail/ExportButton';
import DetailSkeleton from '../../../components/detail/DetailSkeleton';
import { toNumber } from './useAnggaranAnalysis';

// Persentase dari pecahan (0.035 -> "3,50%"). Belum ada padanannya di utils/format.
export default function DetailAnggaranPemeliharaan() {
  usePageTitle('Detail Anggaran');
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Kunci query memuat id, jadi data milik id sebelumnya tidak pernah tampil di id yang baru.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pengaturan', 'detail', id],
    queryFn: async () => {
      const res = await AnggaranApi.getDetail(id);
      const items = res.data?.data?.items?.data;
      const rows = Array.isArray(items) ? items : [];
      // Pastikan benar-benar item yang diminta (bukan sekadar baris pertama).
      return rows.find((row) => String(row.id_inventaris) === String(id)) || null;
    },
  });

  useEffect(() => {
    if (isError) showToast('Gagal memuat detail anggaran', 'error');
  }, [isError, showToast]);

  if (isLoading) return <DetailSkeleton dua />;

  if (!data) return (
    <div className="p-6 text-center text-[#808191] text-sm space-y-3">
      <p>{isError ? 'Gagal memuat detail anggaran.' : 'Data tidak ditemukan.'}</p>
      <Link to="/anggaran/pemeliharaan" className="text-brand-primary font-semibold hover:underline">Kembali ke Daftar</Link>
    </div>
  );

  const firstProjection = data.projections && data.projections.length > 0 ? data.projections[0] : null;

  const proyeksiColumns = [
    { id: 'tahun', header: 'Tahun', meta: { cellClassName: 'font-bold text-gray-900' }, cell: ({ row }) => row.original.tahun },
    { id: 'inflasi', header: 'Inflasi', meta: { align: 'center', cellClassName: 'text-gray-600' }, cell: ({ row }) => formatPercent(row.original.inflasi) },
    { id: 'aic', header: 'Nilai AIC', meta: { align: 'right', cellClassName: 'font-mono text-gray-700' }, cell: ({ row }) => rupiah(row.original.aic) },
    { id: 'rab', header: 'Anggaran Pemeliharaan (RAB)', meta: { align: 'right', cellClassName: 'font-mono font-bold text-brand-primary' }, cell: ({ row }) => rupiah(row.original.rab) },
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <DetailHeader
        judul="Laporan Proyeksi Biaya"
        nomor={data.nama_alat}
        onBack={() => navigate('/anggaran/pemeliharaan')}
        aksi={<ExportButton href={apiUrl(`/anggaran/analysis/export-pdf/${data.id_inventaris}`)}>Cetak laporan</ExportButton>}
      />

      <DetailSection judul="Informasi aset">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
          <DetailField label="Nama alat" value={data.merk ? `${data.nama_alat} (${data.merk})` : data.nama_alat} />
          <DetailField label="Harga pengadaan awal (IIC)" value={rupiah(data.harga_awal)} />
          <DetailField label="Tahun pengadaan" value={data.tahun_pengadaan} />
          <DetailField label="Standar usia teknis (L)" value={`${data.usia_pakai} tahun`} />
          <DetailField label="Dasar persentase RAB" value={`${toNumber(data.persentase_rab).toFixed(2)}% dari nilai AIC tahunan`} />
        </dl>
      </DetailSection>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-5 items-start">
        <DetailSection judul="Proyeksi biaya tahunan">
          <p className="text-sm text-[#808191] mb-4">
            Perkiraan biaya investasi (AIC) dan rencana anggaran biaya pemeliharaan (RAB) per tahun.
          </p>

          <DataTable
            columns={proyeksiColumns}
            data={data.projections || []}
            getRowId={(proj) => proj.tahun}
            empty={{ title: 'Data proyeksi tidak tersedia' }}
            tableClassName="text-sm"
            footer={(
              <>
                <tr className="bg-gray-50 font-bold border-t border-gray-100">
                  <td colSpan="3" className="px-3 py-2 text-right text-gray-600">Jumlah total proyeksi AIC</td>
                  <td className="px-3 py-2 text-right text-gray-900">{rupiah(data.total_projected_aic || 0)}</td>
                </tr>
                <tr className="bg-brand-primary/10 font-bold">
                  <td colSpan="3" className="px-3 py-2 text-right text-brand-primary">Jumlah total proyeksi RAB</td>
                  <td className="px-3 py-2 text-right text-brand-primary">{rupiah(data.total_projected_rab || 0)}</td>
                </tr>
              </>
            )}
          />
        </DetailSection>

        <div className="space-y-5">
          {firstProjection && (
            <DetailSection judul="Contoh perhitungan">
              <div className="space-y-5 text-sm">
                <div>
                  <p className="font-bold text-text-dark mb-2">AIC = (IIC × (1 + i)<sup>t</sup>) / L</p>
                  <dl className="space-y-1 text-[#808191]">
                    <div className="flex justify-between"><dt>IIC</dt><dd>{rupiah(data.harga_awal)}</dd></div>
                    <div className="flex justify-between"><dt>Inflasi (i)</dt><dd>{formatPercent(firstProjection.inflasi)}</dd></div>
                    <div className="flex justify-between"><dt>Tahun ke- (t)</dt><dd>1</dd></div>
                    <div className="flex justify-between"><dt>Masa pakai (L)</dt><dd>{data.usia_pakai}</dd></div>
                  </dl>
                  <p className="mt-3 rounded-xl bg-gray-50 px-3.5 py-2.5 text-center font-semibold text-text-dark">
                    AIC (tahun {firstProjection.tahun}) = {rupiah(firstProjection.aic)}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-text-dark mb-2">RAB = AIC tahunan × persentase RAB</p>
                  <dl className="space-y-1 text-[#808191]">
                    <div className="flex justify-between"><dt>AIC (tahun {firstProjection.tahun})</dt><dd>{rupiah(firstProjection.aic)}</dd></div>
                    <div className="flex justify-between"><dt>Persentase RAB</dt><dd>{toNumber(data.persentase_rab).toFixed(2)}%</dd></div>
                  </dl>
                  <p className="mt-3 rounded-xl bg-brand-primary/10 px-3.5 py-2.5 text-center font-semibold text-brand-primary">
                    RAB (tahun {firstProjection.tahun}) = {rupiah(firstProjection.rab)}
                  </p>
                </div>
              </div>
            </DetailSection>
          )}

          <DetailSection judul="Proyeksi nilai pengganti">
            <p className="text-sm text-[#808191] mb-3">
              Di akhir masa pakainya (tahun {parseInt(data.tahun_pengadaan) + parseInt(data.usia_pakai)}), nilai aset ini jika dibeli baru diperkirakan menjadi:
            </p>
            <p className="text-2xl font-extrabold text-text-dark">{rupiah(data.nilai_pengganti || 0)}</p>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

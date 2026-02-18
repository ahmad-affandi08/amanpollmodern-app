import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, Box, ChartLine, Calculator, Coins, ArrowLeft } from 'lucide-react';
import AnggaranApi from '../../../api/AnggaranApi';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle } from '../../../hooks';
import TableSkeleton from '../../../components/TableSkeleton';

export default function DetailAnggaranPemeliharaan() {
  usePageTitle('Detail Anggaran');
  const { id } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await AnggaranApi.getDetail(id);

      const items = res.data.data?.items?.data;
      if (items && items.length > 0) {
        setData(items[0]);
      } else {
        showToast('Data tidak ditemukan', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat detail anggaran', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatPercent = (val) => {
    return (val * 100).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  };

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );

  if (!data) return <div className="p-6 text-center text-gray-500 text-sm">Data tidak ditemukan</div>;

  const firstProjection = data.projections && data.projections.length > 0 ? data.projections[0] : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link to="/anggaran/pemeliharaan" className="text-gray-500 hover:text-brand-primary flex items-center gap-1.5 mb-1.5 text-xs">
            <ArrowLeft size={14} /> Kembali ke Daftar
          </Link>
          <h1 className="text-base md:text-lg font-bold text-text-dark">
            Laporan Proyeksi Biaya - {data.nama_alat}
          </h1>
        </div>

        <a
          href={`${import.meta.env.VITE_API_URL}/anggaran/analysis/export-pdf/${data.id_inventaris}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm text-xs"
        >
          <Printer size={14} />
          Cetak Laporan
        </a>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-2">
          <Box size={16} className="text-gray-600" />
          Detail Informasi Aset
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-50 py-2">
            <div className="font-semibold text-gray-600 text-xs">Nama Alat</div>
            <div className="md:col-span-2 font-medium text-gray-900 text-xs">{data.nama_alat} <span className="text-gray-400 text-[10px] ml-1">({data.merk})</span></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-50 py-2">
            <div className="font-semibold text-gray-600 text-xs">Harga Pengadaan Awal (IIC)</div>
            <div className="md:col-span-2 font-mono font-medium text-gray-900 text-xs">{formatCurrency(data.harga_awal)}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-50 py-2">
            <div className="font-semibold text-gray-600 text-xs">Tahun Pengadaan</div>
            <div className="md:col-span-2 font-medium text-gray-900 text-xs">{data.tahun_pengadaan}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-50 py-2">
            <div className="font-semibold text-gray-600 text-xs">Standar Usia Teknis (L)</div>
            <div className="md:col-span-2 font-medium text-gray-900 text-xs">{data.usia_pakai} Tahun</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 py-2">
            <div className="font-semibold text-gray-600 text-xs">Dasar Persentase RAB Pemeliharaan</div>
            <div className="md:col-span-2 font-medium text-gray-900 text-xs">{parseFloat(data.persentase_rab).toFixed(2)}% dari Nilai AIC Tahunan</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm h-fit">
          <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <ChartLine size={16} className="text-gray-600" />
            Proyeksi Biaya Tahunan
          </h3>
          <p className="text-xs text-gray-500 mb-3">Tabel berikut menunjukkan perkiraan biaya investasi (AIC) dan rencana anggaran biaya pemeliharaan (RAB) tahunan.</p>

          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-bg-light">
                <tr>
                  <th className="px-3 py-2 font-semibold text-gray-600">Tahun</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 text-center">Inflasi</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 text-right">Nilai AIC</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 text-right">Anggaran Pemeliharaan (RAB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.projections && data.projections.length > 0 ? (
                  data.projections.map((proj, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-bold text-gray-900">{proj.tahun}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{formatPercent(proj.inflasi)}</td>
                      <td className="px-3 py-2 text-right font-mono text-gray-700">{formatCurrency(proj.aic)}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-brand-primary">{formatCurrency(proj.rab)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="px-3 py-6 text-center text-gray-400">Data proyeksi tidak tersedia</td></tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 font-bold border-t border-gray-100">
                <tr>
                  <td colSpan="3" className="px-3 py-2 text-right text-gray-600">Jumlah Total Proyeksi AIC</td>
                  <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(data.total_projected_aic || 0)}</td>
                </tr>
                <tr className="bg-purple-50">
                  <td colSpan="3" className="px-3 py-2 text-right text-brand-primary">Jumlah Total Proyeksi RAB</td>
                  <td className="px-3 py-2 text-right text-brand-primary">{formatCurrency(data.total_projected_rab || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {firstProjection && (
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-cyan-500">
              <h3 className="font-bold text-sm text-cyan-700 mb-3 flex items-center gap-1.5">
                <Calculator size={16} />
                Contoh Perhitungan
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-bold text-gray-800 mb-1">AIC = (IIC * (1 + i)<sup>t</sup>) / L</div>
                  <hr className="my-1.5 border-gray-100" />
                  <div className="space-y-0.5 text-gray-600">
                    <div className="flex justify-between"><span>IIC:</span> <span>{formatCurrency(data.harga_awal)}</span></div>
                    <div className="flex justify-between"><span>Inflasi (i):</span> <span>{formatPercent(firstProjection.inflasi)}</span></div>
                    <div className="flex justify-between"><span>Tahun Ke- (t):</span> <span>1</span></div>
                    <div className="flex justify-between"><span>Masa Pakai (L):</span> <span>{data.usia_pakai}</span></div>
                  </div>
                  <div className="mt-2 text-center p-1.5 bg-gray-50 rounded font-semibold text-gray-800 border border-gray-200">
                    AIC (Tahun {firstProjection.tahun}) = {formatCurrency(firstProjection.aic)}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-gray-800 mb-1">RAB = AIC Tahunan * Persentase RAB</div>
                  <hr className="my-1.5 border-gray-100" />
                  <div className="space-y-0.5 text-gray-600">
                    <div className="flex justify-between"><span>AIC (Tahun {firstProjection.tahun}):</span> <span>{formatCurrency(firstProjection.aic)}</span></div>
                    <div className="flex justify-between"><span>Persentase RAB:</span> <span>{parseFloat(data.persentase_rab).toFixed(2)}%</span></div>
                  </div>
                  <div className="mt-2 text-center p-1.5 bg-gray-50 rounded font-semibold text-brand-primary border border-purple-100">
                    RAB (Tahun {firstProjection.tahun}) = {formatCurrency(firstProjection.rab)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
            <h3 className="font-bold text-sm text-yellow-700 mb-3 flex items-center gap-1.5">
              <Coins size={16} />
              Proyeksi Nilai Pengganti
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              Di akhir masa pakainya (Tahun {parseInt(data.tahun_pengadaan) + parseInt(data.usia_pakai)}), nilai aset ini jika dibeli baru diperkirakan menjadi:
            </p>
            <div className="text-2xl font-extrabold text-gray-800 text-right">
              {formatCurrency(data.nilai_pengganti || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

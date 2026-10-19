import React, { useEffect } from 'react';
import { Hammer, AlertTriangle, CheckCircle, TrendingUp, Info } from 'lucide-react';
import AnggaranApi from '../../../api/AnggaranApi';
import TableSkeleton from '../../../components/TableSkeleton';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle, useAuth } from '../../../hooks';
import Pagination from '../../../components/Pagination';
import { rupiah } from '../../../utils/format';
import { ROLES } from '../../auth/constants';
import AnggaranFilters from './AnggaranFilters';
import useAnggaranAnalysis, { toNumber } from './useAnggaranAnalysis';

const CURRENT_YEAR = String(new Date().getFullYear());
const INITIAL_FILTERS = {
  divisi_id: '',
  kategori_alat_id: '',
  ruangan_id: '',
  tahun_filter: CURRENT_YEAR,
  search: ''
};
const EMPTY_TOTALS = { total_biaya_aktual: 0, total_mmel: 0, jumlah_ganti_aset: 0 };
const COLUMN_COUNT = 8;

export default function BiayaPerbaikan() {
  usePageTitle('Biaya Perbaikan');
  const { showToast } = useToast();
  const { user } = useAuth();

  const isAdminDivisi = Number(user?.kategori_user_id) === ROLES.ADMIN_DIVISI;

  const {
    filters, setFilter, resetFilters,
    items: data, totals, meta, perPage,
    goToPage, expandedRow, toggleExpand,
    isLoading, isFetching, isError, refetch,
  } = useAnggaranAnalysis({
    queryName: 'biaya',
    fetcher: AnggaranApi.getRepairAnalysis,
    initialFilters: INITIAL_FILTERS,
    emptyTotals: EMPTY_TOTALS,
  });

  useEffect(() => {
    if (isError) showToast('Gagal memuat data analisis perbaikan', 'error');
  }, [isError, showToast]);

  // Bila tahun dikosongkan, server memakai tahun berjalan.
  const analysisYear = filters.tahun_filter || CURRENT_YEAR;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-bold text-text-dark flex items-center gap-2">
          Biaya Perbaikan vs MMEL
        </h1>
        <p className="text-text-gray text-xs mt-0.5">
          Analisis kelayakan alat dengan membandingkan Biaya Perbaikan Tahunan dengan Batas MMEL (Maximum Maintenance Expenditure Limit).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center border-l-4 border-brand-primary">
          <p className="text-gray-500 text-xs mb-1">Total Biaya Perbaikan (Tahun {analysisYear})</p>
          <h2 className="text-xl font-extrabold text-text-dark">{rupiah(totals.total_biaya_aktual)}</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center border-l-4 border-gray-400">
          <p className="text-gray-500 text-xs mb-1">Total Batas MMEL (Tahun {analysisYear})</p>
          <h2 className="text-xl font-extrabold text-gray-400">{rupiah(totals.total_mmel)}</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center border-l-4 border-red-500">
          <p className="text-gray-500 text-xs mb-1">Aset Direkomendasikan Ganti</p>
          <h2 className="text-xl font-extrabold text-red-500">{toNumber(totals.jumlah_ganti_aset)} Unit</h2>
        </div>
      </div>

      <AnggaranFilters
        filters={filters}
        onChange={setFilter}
        onReset={resetFilters}
        showDivisi={!isAdminDivisi}
        showYear
      />

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className={`overflow-x-auto rounded-lg border border-gray-100 custom-scrollbar mb-3 transition-opacity ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-light border-b border-gray-100">
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider sticky left-0 bg-bg-light z-10 w-[40px]"></th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">No</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Nama Alat</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Ruangan</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">Biaya Aktual</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">Batas MMEL</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-center">% Biaya/MMEL</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-center">Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {isLoading ? (
                <TableSkeleton rows={5} columns={COLUMN_COUNT} />
              ) : isError ? (
                <tr>
                  <td colSpan={COLUMN_COUNT} className="py-6 text-center text-xs">
                    <p className="text-red-500 mb-2">Gagal memuat data analisis perbaikan.</p>
                    <button type="button" onClick={() => refetch()} className="text-brand-primary font-semibold hover:underline">Coba lagi</button>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={COLUMN_COUNT} className="py-6 text-center text-gray-400 text-xs">Tidak ada data analisis</td></tr>
              ) : (
                data.map((item, idx) => (
                  <React.Fragment key={item.id_inventaris}>
                    <tr
                      className={`hover:bg-gray-50/50 cursor-pointer ${expandedRow === item.id_inventaris ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleExpand(item.id_inventaris)}
                    >
                      <td className="py-2.5 px-4 text-center border-r border-gray-50">
                        <div className={`transition-transform duration-200 ${expandedRow === item.id_inventaris ? 'rotate-90' : ''}`}>
                          <div className={`p-0.5 rounded-full ${expandedRow === item.id_inventaris ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400'}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-gray-800">
                        {(meta.currentPage - 1) * perPage + idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-text-dark">
                        {item.nama_alat}
                        <div className="text-[10px] text-brand-primary font-normal">{item.no_inventaris}</div>
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">{item.ruangan}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-800">{rupiah(item.biaya_aktual)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-500">{rupiah(item.mmel)}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.percentage > 100 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                          {toNumber(item.percentage).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {item.status === 'Ganti Aset' ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wide">
                            <AlertTriangle size={12} />
                            Ganti Aset
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-wide">
                            <CheckCircle size={12} />
                            Aman
                          </div>
                        )}
                      </td>
                    </tr>

                    {expandedRow === item.id_inventaris && (
                      <tr className="bg-bg-light">
                        <td colSpan={COLUMN_COUNT} className="p-4 cursor-default">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-scale-in">
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                              <h6 className="font-bold text-gray-800 mb-2 flex items-center gap-1.5 text-sm">
                                <Info size={14} /> Informasi Aset
                              </h6>
                              <ul className="space-y-1.5 text-xs text-gray-600">
                                <li className="flex justify-between"><span>Harga Awal (IIC):</span> <span className="font-medium text-gray-800">{rupiah(item.harga_awal)}</span></li>
                                <li className="flex justify-between"><span>Tahun Pengadaan:</span> <span className="font-medium text-gray-800">{item.tahun}</span></li>
                                <li className="flex justify-between"><span>Usia Alat:</span> <span className="font-medium text-gray-800">{item.usia_alat} Tahun</span></li>
                                <li className="flex justify-between"><span>Standar Usia Pakai:</span> <span className="font-medium text-gray-800">{item.usia_pakai} Tahun</span></li>
                              </ul>
                            </div>

                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                              <h6 className="font-bold text-gray-800 mb-2 flex items-center gap-1.5 text-sm">
                                <TrendingUp size={14} /> Faktor Perhitungan
                              </h6>
                              <ul className="space-y-1.5 text-xs text-gray-600">
                                <li className="flex justify-between">
                                  <span title="Harga Pengganti saat ini (Compounded Inflation)">Harga Pengganti (FV):</span>
                                  <span className="font-medium text-gray-800">{rupiah(item.harga_pengganti)}</span>
                                </li>
                                <li className="flex justify-between">
                                  <span title="Faktor Kategori Alat (Khusus=0.9, Standar=0.8)">MEL Factor:</span>
                                  <span className="font-medium text-gray-800">{item.mel_faktor}</span>
                                </li>
                                <li className="flex justify-between">
                                  <span title="Fraksi sisa masa pakai (Remaining / Useful Life)">Fraksi Usia Manfaat:</span>
                                  <span className="font-medium text-gray-800">{(toNumber(item.life_fraction) * 100).toFixed(1)}%</span>
                                </li>
                              </ul>
                            </div>

                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 bg-gradient-to-br from-white to-gray-50">
                              <h6 className="font-bold text-gray-800 mb-2 flex items-center gap-1.5 text-sm">
                                <Hammer size={14} /> Analisis MMEL
                              </h6>
                              <div className="text-xs text-gray-600 space-y-0.5 mb-2">
                                <p><strong>Rumus:</strong> MMEL = MEL Factor × Fraksi Usia × FV</p>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-t border-gray-200">
                                <span className="text-xs font-semibold">Jumlah Perbaikan:</span>
                                <span className="text-base font-bold text-blue-600">{item.jumlah_perbaikan}x</span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-t border-gray-200">
                                <span className="text-xs font-semibold">Rata-rata Biaya/Perbaikan:</span>
                                <span className="text-base font-bold text-purple-600">
                                  {item.jumlah_perbaikan > 0 ? rupiah(item.biaya_aktual / item.jumlah_perbaikan) : 'Rp 0'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-t border-gray-200">
                                <span className="text-xs font-semibold">MMEL Limit:</span>
                                <span className="text-base font-bold text-gray-800">{rupiah(item.mmel)}</span>
                              </div>
                              <div className="flex justify-between items-center py-1.5 border-t border-gray-200">
                                <span className="text-xs font-semibold">Biaya Perbaikan:</span>
                                <span className={`text-base font-bold ${item.biaya_aktual > item.mmel ? 'text-red-500' : 'text-emerald-500'}`}>{rupiah(item.biaya_aktual)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          onPageChange={goToPage}
          totalData={meta.totalItems}
        />
      </div>
    </div>
  );
}

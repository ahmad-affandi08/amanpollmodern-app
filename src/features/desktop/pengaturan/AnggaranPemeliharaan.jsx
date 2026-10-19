import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnggaranApi from '../../../api/AnggaranApi';
import TableSkeleton from '../../../components/TableSkeleton';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle, useAuth } from '../../../hooks';
import Pagination from '../../../components/Pagination';
import { rupiah } from '../../../utils/format';
import { ROLES } from '../../auth/constants';
import AnggaranFilters from './AnggaranFilters';
import useAnggaranAnalysis, { toNumber } from './useAnggaranAnalysis';

const INITIAL_FILTERS = {
  divisi_id: '',
  kategori_alat_id: '',
  ruangan_id: '',
  search: ''
};
const EMPTY_TOTALS = { total_aic: 0, total_rab: 0 };
const COLUMN_COUNT = 10;

export default function AnggaranPemeliharaan() {
  usePageTitle('Anggaran Pemeliharaan');
  const { showToast } = useToast();
  const { user } = useAuth();

  const isAdminDivisi = Number(user?.kategori_user_id) === ROLES.ADMIN_DIVISI;

  const {
    filters, setFilter, resetFilters,
    items: data, totals, meta, perPage,
    goToPage, expandedRow, toggleExpand,
    isLoading, isFetching, isError, refetch,
  } = useAnggaranAnalysis({
    queryName: 'anggaran',
    fetcher: AnggaranApi.getAnalysis,
    initialFilters: INITIAL_FILTERS,
    emptyTotals: EMPTY_TOTALS,
  });

  useEffect(() => {
    if (isError) showToast('Gagal memuat data analisis', 'error');
  }, [isError, showToast]);

  const persen = (value) => toNumber(value).toFixed(1);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-bold text-text-dark flex items-center gap-2">
          Anggaran Pemeliharaan (AIC)
        </h1>
        <p className="text-text-gray text-xs mt-0.5">Analisis biaya pemeliharaan tahunan berdasarkan inflasi dan usia pakai aset.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 text-xs mb-1">Total Anggaran Pemeliharaan (RAB) Tahun Ini</p>
          <h2 className="text-2xl font-extrabold text-brand-primary">{rupiah(totals.total_rab)}</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 text-xs mb-1">Total Annual Investment Cost (AIC) Tahun Ini</p>
          <h2 className="text-2xl font-extrabold text-text-dark">{rupiah(totals.total_aic)}</h2>
        </div>
      </div>

      <AnggaranFilters
        filters={filters}
        onChange={setFilter}
        onReset={resetFilters}
        showDivisi={!isAdminDivisi}
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
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Usia / Masa Pakai</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Tahun</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">Harga Awal</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">Est. Harga Kini</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">AIC Tahunan</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right bg-purple-50 text-brand-primary">RAB (Budget)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {isLoading ? (
                <TableSkeleton rows={5} columns={COLUMN_COUNT} />
              ) : isError ? (
                <tr>
                  <td colSpan={COLUMN_COUNT} className="py-6 text-center text-xs">
                    <p className="text-red-500 mb-2">Gagal memuat data analisis.</p>
                    <button type="button" onClick={() => refetch()} className="text-brand-primary font-semibold hover:underline">Coba lagi</button>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={COLUMN_COUNT} className="py-6 text-center text-gray-400 text-xs">Tidak ada data analisis</td></tr>
              ) : (
                data.map((item, idx) => (
                  <React.Fragment key={item.id_inventaris}>
                    <tr className={`hover:bg-gray-50/50 cursor-pointer ${expandedRow === item.id_inventaris ? 'bg-gray-50' : ''}`} onClick={() => toggleExpand(item.id_inventaris)}>
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
                        <div className="text-[10px] text-gray-400 font-normal">{item.merk}</div>
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">{item.ruangan}</td>
                      <td className="py-2.5 px-4 text-gray-600">{item.usia_sekarang} Thn / {item.usia_pakai} Thn</td>
                      <td className="py-2.5 px-4">{item.tahun_pengadaan}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-600">{rupiah(item.harga_awal)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-600">{rupiah(item.estimasi_harga_sekarang)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-800">{rupiah(item.aic_tahunan)}</td>
                      <td className="py-2.5 px-4 text-right font-bold font-mono text-brand-primary bg-purple-50/30">
                        {rupiah(item.rab_tahunan)}
                      </td>
                    </tr>
                    {expandedRow === item.id_inventaris && (
                      <tr className="bg-bg-light">
                        <td colSpan={COLUMN_COUNT} className="p-4 cursor-default">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-scale-in">
                            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-cyan-500">
                              <h6 className="font-bold text-cyan-600 mb-3 text-sm">Detail Aset & Usia</h6>
                              <div className="space-y-2 text-xs text-gray-600">
                                <p><strong>Harga Beli Awal:</strong> {rupiah(item.harga_awal)} (Thn {item.tahun_pengadaan})</p>
                                <p><strong>Standar Masa Pakai:</strong> {item.usia_pakai} Tahun</p>
                                <p>
                                  <strong>Usia Saat Ini:</strong> {item.usia_sekarang} Tahun
                                  <span className="text-gray-400 ml-1">
                                    ({item.usia_pakai > 0 ? persen((item.usia_sekarang / item.usia_pakai) * 100) : 0}% terpakai)
                                  </span>
                                </p>
                                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                  <div
                                    className="bg-cyan-500 h-2 rounded-full"
                                    style={{ width: `${Math.min(100, item.usia_pakai > 0 ? ((item.usia_sekarang / item.usia_pakai) * 100) : 0)}%` }}
                                  ></div>
                                </div>
                                <hr className="border-gray-100 my-3" />
                                <p><strong>Perhitungan RAB</strong> menggunakan <strong className="text-cyan-600">{toNumber(item.persentase_rab).toFixed(2)}%</strong> dari nilai AIC.</p>

                                <Link
                                  to={`/anggaran/pemeliharaan/${item.id_inventaris}`}
                                  className="flex items-center justify-center w-full mt-3 py-1.5 px-3 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors font-medium text-xs gap-1.5"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                  Lihat Laporan Lengkap & Cetak
                                </Link>
                              </div>
                            </div>

                            <div className="md:col-span-2 bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                              <h6 className="font-bold text-green-600 mb-3 text-sm">Proyeksi Biaya Tahunan (AIC & RAB)</h6>
                              <div className="overflow-x-auto rounded-lg border border-gray-100">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-bg-light">
                                    <tr>
                                      <th className="px-3 py-2 font-semibold text-gray-600">Tahun</th>
                                      <th className="px-3 py-2 font-semibold text-gray-600">Usia Alat</th>
                                      <th className="px-3 py-2 font-semibold text-gray-600 text-right">Nilai AIC</th>
                                      <th className="px-3 py-2 font-semibold text-gray-600 text-right">RAB Pemeliharaan</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {item.projections && item.projections.length > 0 ? item.projections.map((proj) => (
                                      <tr key={proj.tahun} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium text-gray-900">{proj.tahun}</td>
                                        <td className="px-3 py-2 text-gray-500">{proj.tahun - item.tahun_pengadaan} Tahun</td>
                                        <td className="px-3 py-2 text-right font-mono text-gray-600">{rupiah(proj.aic)}</td>
                                        <td className="px-3 py-2 text-right font-mono font-bold text-green-600 bg-green-50/30">{rupiah(proj.rab)}</td>
                                      </tr>
                                    )) : (
                                      <tr><td colSpan="4" className="px-3 py-6 text-center text-gray-400">Data proyeksi tidak tersedia</td></tr>
                                    )}
                                  </tbody>
                                  <tfoot className="bg-gray-50 font-bold border-t border-gray-100">
                                    <tr>
                                      <td colSpan="3" className="px-3 py-2 text-right text-gray-600">Jumlah Total Proyeksi AIC</td>
                                      <td className="px-3 py-2 text-right text-gray-800">{rupiah(item.total_projected_aic || 0)}</td>
                                    </tr>
                                    <tr className="bg-green-50/50">
                                      <td colSpan="3" className="px-3 py-2 text-right text-green-700">Jumlah Total Proyeksi RAB</td>
                                      <td className="px-3 py-2 text-right text-green-700">{rupiah(item.total_projected_rab || 0)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
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

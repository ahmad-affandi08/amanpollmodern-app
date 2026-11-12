import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnggaranApi from '../../../api/AnggaranApi';
import DataTable from '../../../components/DataTable';
import { useDataTable } from '../../../hooks/utils/useServerTable';
import { indexColumn } from '../../../utils/tableColumns';
import { useToast } from '../../../components/Alert/useToast';
import { usePageTitle, useAuth } from '../../../hooks';
import { rupiah } from '../../../utils/format';
import { ROLES } from '../../auth/constants';
import AnggaranFilters from './AnggaranFilters';
import useAnggaranAnalysis, { toNumber } from './useAnggaranAnalysis';

const EMPTY_TOTALS = { total_aic: 0, total_rab: 0 };

export default function AnggaranPemeliharaan() {
  usePageTitle('Anggaran Pemeliharaan');
  const { showToast } = useToast();
  const { user } = useAuth();

  const isAdminDivisi = Number(user?.kategori_user_id) === ROLES.ADMIN_DIVISI;

  const {
    tableState, items: data, totals, meta,
    expandedRow, toggleExpand,
    isLoading, isFetching, isError, refetch,
  } = useAnggaranAnalysis({
    queryName: 'anggaran',
    fetcher: AnggaranApi.getAnalysis,
    emptyTotals: EMPTY_TOTALS,
  });

  useEffect(() => {
    if (isError) showToast('Gagal memuat data analisis', 'error');
  }, [isError, showToast]);

  const persen = (value) => toNumber(value).toFixed(1);

  const columns = [
    { id: 'expand', header: '', meta: { headerClassName: 'sticky left-0 z-10 w-[40px]', cellClassName: 'text-center border-r border-gray-50' }, cell: ({ row: { original: item } }) => (
      <div className={`transition-transform duration-200 ${expandedRow === item.id_inventaris ? 'rotate-90' : ''}`}>
        <div className={`p-0.5 rounded-full ${expandedRow === item.id_inventaris ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        </div>
      </div>
    ) },
    indexColumn(),
    { id: 'nama_alat', header: 'Nama Alat', meta: { cellClassName: 'font-medium text-text-dark' }, cell: ({ row: { original: item } }) => (
      <>
        {item.nama_alat}
        <div className="text-[10px] text-gray-400 font-normal">{item.merk}</div>
      </>
    ) },
    { id: 'ruangan', header: 'Ruangan', meta: { cellClassName: 'text-gray-600' }, cell: ({ row }) => row.original.ruangan },
    { id: 'usia', header: 'Usia / Masa Pakai', meta: { cellClassName: 'text-gray-600' }, cell: ({ row: { original: item } }) => `${item.usia_sekarang} Thn / ${item.usia_pakai} Thn` },
    { id: 'tahun', header: 'Tahun', cell: ({ row }) => row.original.tahun_pengadaan },
    { id: 'harga_awal', header: 'Harga Awal', meta: { align: 'right', cellClassName: 'font-mono text-gray-600' }, cell: ({ row }) => rupiah(row.original.harga_awal) },
    { id: 'harga_kini', header: 'Est. Harga Kini', meta: { align: 'right', cellClassName: 'font-mono text-gray-600' }, cell: ({ row }) => rupiah(row.original.estimasi_harga_sekarang) },
    { id: 'aic', header: 'AIC Tahunan', meta: { align: 'right', cellClassName: 'font-mono text-gray-800' }, cell: ({ row }) => rupiah(row.original.aic_tahunan) },
    { id: 'rab', header: 'RAB (Budget)', meta: { align: 'right', headerClassName: '!bg-purple-50 !text-brand-primary', cellClassName: 'font-bold font-mono text-brand-primary bg-purple-50/30' }, cell: ({ row }) => rupiah(row.original.rab_tahunan) },
  ];

  const table = useDataTable({
    columns,
    data,
    tableState,
    pageCount: isError ? undefined : meta.totalPages, // error: jangan memundurkan halaman (Coba lagi memuat ulang halaman yang sama)
    rowCount: meta.totalItems,
    getRowId: (item) => item.id_inventaris,
  });

  const renderSubRow = (item, colCount) => (
    expandedRow === item.id_inventaris ? (
      <tr className="bg-bg-light">
        <td colSpan={colCount} className="p-4 cursor-default">
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
    ) : null
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-dark">Anggaran Pemeliharaan (AIC)</h1>
        <p className="text-text-gray text-xs mt-1">Analisis biaya pemeliharaan tahunan berdasarkan inflasi dan usia pakai aset.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 text-xs mb-1">Total Anggaran Pemeliharaan (RAB) Tahun Ini</p>
          <h2 className="text-2xl font-extrabold text-brand-primary">{rupiah(totals.total_rab)}</h2>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 text-xs mb-1">Total Annual Investment Cost (AIC) Tahun Ini</p>
          <h2 className="text-2xl font-extrabold text-text-dark">{rupiah(totals.total_aic)}</h2>
        </div>
      </div>

      <AnggaranFilters table={table} showDivisi={!isAdminDivisi} />

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <DataTable
          table={table}
          isLoading={isLoading}
          error={isError ? { title: 'Gagal memuat data analisis.', onRetry: () => refetch() } : undefined}
          empty={{ title: 'Tidak ada data analisis' }}
          rowClassName={(item) => (expandedRow === item.id_inventaris ? 'bg-gray-50' : '')}
          onRowClick={(item) => toggleExpand(item.id_inventaris)}
          renderSubRow={renderSubRow}
          containerClassName={`custom-scrollbar transition-opacity ${isFetching && !isLoading ? 'opacity-60' : ''}`}
        />
      </div>
    </div>
  );
}

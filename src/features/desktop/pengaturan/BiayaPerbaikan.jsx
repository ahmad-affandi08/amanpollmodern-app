import React, { useEffect } from 'react';
import { Hammer, AlertTriangle, CheckCircle, TrendingUp, Info } from 'lucide-react';
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

const CURRENT_YEAR = String(new Date().getFullYear());
// "Reset Filter" kembali ke tahun berjalan.
const INITIAL_FILTERS = [{ id: 'tahun_filter', value: CURRENT_YEAR }];
const EMPTY_TOTALS = { total_biaya_aktual: 0, total_mmel: 0, jumlah_ganti_aset: 0 };

export default function BiayaPerbaikan() {
  usePageTitle('Biaya Perbaikan');
  const { showToast } = useToast();
  const { user } = useAuth();

  const isAdminDivisi = Number(user?.kategori_user_id) === ROLES.ADMIN_DIVISI;

  const {
    tableState, items: data, totals, meta,
    expandedRow, toggleExpand,
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
  const analysisYear = tableState.filters.tahun_filter || CURRENT_YEAR;

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
        <div className="text-[10px] text-brand-primary font-normal">{item.no_inventaris}</div>
      </>
    ) },
    { id: 'ruangan', header: 'Ruangan', meta: { cellClassName: 'text-gray-600' }, cell: ({ row }) => row.original.ruangan },
    { id: 'biaya_aktual', header: 'Biaya Aktual', meta: { align: 'right', cellClassName: 'font-mono text-gray-800' }, cell: ({ row }) => rupiah(row.original.biaya_aktual) },
    { id: 'mmel', header: 'Batas MMEL', meta: { align: 'right', cellClassName: 'font-mono text-gray-500' }, cell: ({ row }) => rupiah(row.original.mmel) },
    { id: 'persen', header: '% Biaya/MMEL', meta: { align: 'center' }, cell: ({ row: { original: item } }) => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.percentage > 100 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
        {toNumber(item.percentage).toFixed(1)}%
      </span>
    ) },
    { id: 'rekomendasi', header: 'Rekomendasi', meta: { align: 'center' }, cell: ({ row: { original: item } }) => (
      item.status === 'Ganti Aset' ? (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wide">
          <AlertTriangle size={12} />
          Ganti Aset
        </div>
      ) : (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-wide">
          <CheckCircle size={12} />
          Aman
        </div>
      )
    ) },
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
    ) : null
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-dark">Biaya Perbaikan vs MMEL</h1>
        <p className="text-text-gray text-xs mt-1">
          Analisis kelayakan alat dengan membandingkan Biaya Perbaikan Tahunan dengan Batas MMEL (Maximum Maintenance Expenditure Limit).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center border-l-4 border-brand-primary">
          <p className="text-gray-500 text-xs mb-1">Total Biaya Perbaikan (Tahun {analysisYear})</p>
          <h2 className="text-xl font-extrabold text-text-dark">{rupiah(totals.total_biaya_aktual)}</h2>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center border-l-4 border-gray-400">
          <p className="text-gray-500 text-xs mb-1">Total Batas MMEL (Tahun {analysisYear})</p>
          <h2 className="text-xl font-extrabold text-gray-400">{rupiah(totals.total_mmel)}</h2>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center border-l-4 border-red-500">
          <p className="text-gray-500 text-xs mb-1">Aset Direkomendasikan Ganti</p>
          <h2 className="text-xl font-extrabold text-red-500">{toNumber(totals.jumlah_ganti_aset)} Unit</h2>
        </div>
      </div>

      <AnggaranFilters table={table} showDivisi={!isAdminDivisi} showYear />

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <DataTable
          table={table}
          isLoading={isLoading}
          error={isError ? { title: 'Gagal memuat data analisis perbaikan.', onRetry: () => refetch() } : undefined}
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

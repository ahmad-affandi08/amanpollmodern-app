import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Download, Eye, RotateCcw, Search } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import DateRangePicker from '../../../components/DateRangePicker';
import DataTable from '../../../components/DataTable';
import FilterBar from '../../../components/FilterBar';
import SegmentTabs from '../../../components/SegmentTabs';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import { indexColumn } from '../../../utils/tableColumns';
import StatusAsetBadge from '../../../components/StatusAsetBadge';
import StatusAsetModal from '../../../components/StatusAsetModal';
import InventarisApi from '../../../api/InventarisApi';
import {
  useInventarisArsip,
  useAuth,
  useToast,
  usePageTitle,
} from '../../../hooks';
import { canManageInventaris } from '../../auth/constants';
import { formatDateShort } from '../../../utils/format';
import { STATUS_ASET, statusAsetOf, statusTujuanFor } from '../../../utils/statusAset';

const TABS = [
  { value: '', label: 'Semua' },
  { value: STATUS_ASET.DIGUDANGKAN, label: 'Digudangkan' },
  { value: STATUS_ASET.DIHAPUS, label: 'Dihapus dari Daftar Aset' },
];

// Filter diatur lewat state TanStack. Peta: id filter -> parameter query server.
const FILTER_MAP = {
  status_aset: 'status_aset',
  periode: ['tanggal_awal', 'tanggal_akhir'],
};

/** Riwayat alat rusak berat yang digudangkan atau dihapus dari daftar aset. */
export default function InventarisArsip() {
  usePageTitle('Riwayat Alat Rusak Berat');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const canManage = canManageInventaris(user);

  const tableState = useTableState({ pageSize: 10, filterMap: FILTER_MAP });
  const { filters, params } = tableState;
  const [statusItem, setStatusItem] = useState(null);

  const { data, isLoading } = useInventarisArsip(params);
  const rows = data?.data || [];

  const handleExport = async () => {
    try {
      const blob = await InventarisApi.exportArsip({ ...filters, search: params.search });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `riwayat_alat_rusak_berat_${Date.now()}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Export berhasil', 'success');
    } catch {
      showToast('Gagal export data', 'error');
    }
  };

  const columns = [
    indexColumn(),
    { id: 'no_inventaris', header: 'No. Inventaris', cell: ({ row }) => (
      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#6C5DD3] text-[10px] font-bold">{row.original.no_inventaris}</span>
    ) },
    { id: 'nama_alat', header: 'Nama Alat', meta: { cellClassName: 'font-bold text-text-dark' }, cell: ({ row: { original: item } }) => (
      <>
        {item.nama_alat?.nama_nama_alat || '-'}
        <p className="font-normal text-gray-400">{[item.merk, item.model].filter(Boolean).join(' ')}</p>
      </>
    ) },
    { id: 'ruangan', header: 'Ruangan Asal', cell: ({ row }) => row.original.ruangan?.nama_ruangan || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'status', header: 'Status', cell: ({ row }) => <StatusAsetBadge status={row.original.status_aset} size="sm" /> },
    { id: 'tanggal', header: 'Tanggal', cell: ({ row }) => formatDateShort(row.original.tanggal_status), meta: { cellClassName: 'text-gray-600' } },
    { id: 'lokasi', header: 'Lokasi / Tindak Lanjut', meta: { cellClassName: 'text-gray-600' }, cell: ({ row }) => {
      const log = row.original.status_terakhir;
      return log?.lokasi_penyimpanan || log?.tindak_lanjut || '-';
    } },
    { id: 'dokumen', header: 'SK / Berita Acara', meta: { cellClassName: 'text-gray-600' }, cell: ({ row }) => {
      const log = row.original.status_terakhir;
      return (
        <>
          {log?.nomor_sk && <p>SK: {log.nomor_sk} ({formatDateShort(log.tanggal_sk)})</p>}
          {log?.nomor_ba && <p>BA: {log.nomor_ba} ({formatDateShort(log.tanggal_ba)})</p>}
          {!log?.nomor_sk && !log?.nomor_ba && '-'}
          {log?.file_dokumen_url && (
            <a href={log.file_dokumen_url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
              Lihat dokumen
            </a>
          )}
        </>
      );
    } },
    { id: 'alasan', header: 'Alasan', cell: ({ row }) => row.original.status_terakhir?.alasan || '-', meta: { cellClassName: 'text-gray-600 max-w-[220px] whitespace-normal' } },
    { id: 'actions', header: 'Aksi', meta: { align: 'right' }, cell: ({ row: { original: item } }) => {
      const bisaDiubah = canManage && statusTujuanFor(user, statusAsetOf(item)).length > 0;
      return (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/inventaris/detail/${item.id}`)}
            className="p-1.5 bg-blue-500 text-white rounded-lg shadow-sm hover:-translate-y-0.5 transition-all"
            title="Detail & riwayat"
          >
            <Eye size={14} />
          </button>
          {bisaDiubah && (
            <button
              onClick={() => setStatusItem(item)}
              className="p-1.5 bg-brand-primary text-white rounded-lg shadow-sm hover:-translate-y-0.5 transition-all"
              title="Ubah status"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      );
    } },
  ];

  const table = useDataTable({
    columns,
    data: rows,
    tableState,
    pageCount: data?.meta?.last_page,
    rowCount: data?.meta?.total,
    getRowId: (item) => item.id,
  });

  const f = getTableFilters(table);
  const [tanggalAwal, tanggalAkhir] = f.getRange('periode');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Riwayat Alat Rusak Berat</h1>
          <p className="text-text-gray text-xs mt-1">
            Alat rusak berat yang digudangkan atau dihapus dari daftar aset, lengkap dengan dasar SK dan berita acara
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2 w-full md:w-auto">
          <Download className="w-3.5 h-3.5" />
          Export Excel
        </Button>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <SegmentTabs
          ariaLabel="Status aset"
          tabs={TABS}
          value={f.get('status_aset')}
          onChange={(value) => f.set('status_aset', value)}
          className="mb-4"
        />

        <FilterBar
          search={
            <Input
              name="search"
              size="sm"
              placeholder="Cari nama alat, No. Inventaris, Seri..."
              value={f.search}
              onChange={(e) => f.setSearch(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
              className="!bg-white"
            />
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={f.reset}
              className="!rounded-lg whitespace-nowrap border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary"
            >
              Reset Filter
            </Button>
          }
          gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
        >
          <DateRangePicker
            size="sm"
            placeholder="Tanggal status (rentang)"
            startDate={tanggalAwal}
            endDate={tanggalAkhir}
            onChange={({ startDate, endDate }) => f.set('periode', startDate || endDate ? [startDate, endDate] : '')}
            className="!bg-white"
          />
        </FilterBar>

        <DataTable
          table={table}
          isLoading={isLoading}
          skeletonRows={8}
          rowClassName={() => 'align-top'}
          tableClassName="min-w-[1100px]"
          empty={{ icon: Archive, title: 'Belum ada alat yang digudangkan atau dihapus', description: 'Riwayat tercatat sejak fitur ini digunakan' }}
        />
      </div>

      {statusItem && (
        <StatusAsetModal
          key={`${statusItem.id}-${statusItem.status_aset}`}
          isOpen
          inventaris={statusItem}
          onClose={() => setStatusItem(null)}
        />
      )}
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Trash2, AlertCircle, FileText, Edit, Wrench } from 'lucide-react';
import {
  useReportPemeliharaan,
  useDeletePemeliharaan,
  useMasterRuangan,
  useMasterDivisi,
  useAuth,
  usePageTitle,
} from '../../../hooks';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import SearchableSelect from '../../../components/SearchableSelect';
import DateRangePicker from '../../../components/DateRangePicker';
import DataTable from '../../../components/DataTable';
import FilterBar from '../../../components/FilterBar';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import { indexColumn } from '../../../utils/tableColumns';
import ConfirmDialog from '../../../components/Alert/Alert';
import { useToast } from '../../../components/Alert/useToast';
import KondisiBadge from '../../../components/KondisiBadge';
import StatusBadge from '../../../components/StatusBadge';
import ServisBadge from '../../../components/ServisBadge';
import { apiUrl } from '../../../config';
import { formatDateShort } from '../../../utils/format';
import { ROLES, isRole, isReadOnlyRole } from '../../auth/constants';
import useConfirmAction from '../master-data/useConfirmAction';
import useTeknisiOptions from './useTeknisiOptions';

// Filter diatur lewat state TanStack. Peta: id filter -> parameter query server.
const FILTER_MAP = {
  ruangan: 'ruangan_id',
  divisi: 'divisi_id',
  teknisi: 'teknisi_id',
  status: 'status',
  kondisi_alat: 'kondisi_alat',
  pihakKetiga: 'pihak_ketiga',
  periode: ['start_date', 'end_date'],
};

export default function ReportPemeliharaan() {
  usePageTitle('Laporan Pemeliharaan');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);
  const isPimpinan = isReadOnlyRole(user);

  const { askConfirm, dialogProps } = useConfirmAction();

  const tableState = useTableState({ pageSize: 10, filterMap: FILTER_MAP });
  const { filters, params } = tableState;

  const { data: pemeliharaanData, isLoading } = useReportPemeliharaan(params);

  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const teknisiOptions = useTeknisiOptions();
  const deleteMutation = useDeletePemeliharaan();


  const data = pemeliharaanData?.data || [];
  const meta = pemeliharaanData?.meta;

  const ruanganOptions = (ruanganData?.data || []).map(r => ({ label: r.nama_ruangan, value: r.id_ruangan }));
  const divisiOptions = (divisiData?.data || []).map(d => ({ label: d.nama_divisi, value: d.id_divisi }));


  const statusOptions = [
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Belum Selesai', label: 'Belum Selesai' },
    { value: 'Tindakan Lanjutan', label: 'Tindakan Lanjutan' }
  ];

  // Super Admin boleh menghapus semua; Admin Divisi hanya yang belum 'Selesai'
  // (aturan yang sama dengan daftar Pemeliharaan).
  const canDelete = (item) => {
    if (isRole(user, ROLES.SUPER_ADMIN)) return true;
    if (isAdminDivisi) return item.status !== 'Selesai';
    return false;
  };

  const handleDelete = (item) => {
    if (!canDelete(item)) {
      showToast('Anda tidak memiliki izin untuk menghapus data ini', 'error');
      return;
    }

    askConfirm({
      title: 'Hapus Pemeliharaan',
      message: 'Apakah Anda yakin ingin menghapus data laporan ini?',
      confirmText: 'Ya, Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(item.id_pemeliharaan);
          showToast('Laporan berhasil dihapus', 'success');
        } catch {
          showToast('Gagal menghapus laporan', 'error');
        }
      },
    });
  };

  // Unduhan lewat tautan (rute export di server tidak memakai middleware api.auth,
  // sesi dibawa cookie), jadi autentikasi tidak diubah.
  const handleExport = () => {
    window.open(apiUrl('/pemeliharaan/export-excel', filters), '_blank');
  };

  const columns = [
    indexColumn(),
    { id: 'no_pemeliharaan', header: 'No. Pemeliharaan', cell: ({ row }) => (
      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-brand-primary">
        {row.original.no_pemeliharaan || '-'}
      </span>
    ) },
    { id: 'divisi', header: 'Divisi', cell: ({ row }) => row.original.divisi_nama || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'ruangan', header: 'Ruangan', cell: ({ row }) => row.original.ruangan_nama || '-', meta: { cellClassName: 'text-gray-600 font-medium' } },
    { id: 'alat', header: 'Nama Alat', cell: ({ row }) => row.original.nama_alat_nama || '-', meta: { cellClassName: 'text-text-dark font-medium' } },
    { id: 'no_inventaris', header: 'No. Inv', cell: ({ row }) => row.original.no_inventaris || '-', meta: { cellClassName: 'text-gray-600 font-mono text-[10px]' } },
    { id: 'merk', header: 'Merk', cell: ({ row }) => row.original.merk || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'jadwal', header: 'Jadwal', cell: ({ row: { original: item } }) => (
      item.jadwal_pemeliharaan ? formatDateShort(item.jadwal_pemeliharaan) : 'Belum Ditentukan'
    ), meta: { cellClassName: 'text-gray-600' } },
    { id: 'teknisi', header: 'Teknisi', cell: ({ row }) => row.original.teknisi_nama || '-', meta: { cellClassName: 'text-brand-primary font-medium' } },
    { id: 'tanggal', header: 'Tanggal', cell: ({ row: { original: item } }) => (
      item.tanggal_pemeriksaan ? formatDateShort(item.tanggal_pemeriksaan) : 'Belum Ditentukan'
    ), meta: { cellClassName: 'text-gray-600' } },
    { id: 'kondisi_alat', header: 'Kondisi', cell: ({ row: { original: item } }) => (
      item.kondisi_alat ? <KondisiBadge kondisi={item.kondisi_alat} size="sm" /> : <span className="text-gray-400 text-xs">Belum Ditentukan</span>
    ) },
    { id: 'status', header: 'Status', cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge status={row.original.status} size="sm" />
        <ServisBadge jumlah={row.original.jumlah_servis} />
      </div>
    ) },
    { id: 'actions', header: 'Aksi', meta: { align: 'right' }, cell: ({ row: { original: item } }) => (
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          onClick={() => navigate(`/report/pemeliharaan/${item.id_pemeliharaan}`)}
          className="p-2 bg-blue-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
          title="Detail"
        >
          <Eye size={16} />
        </button>

        {/* Disposisi Button - Show for Pimpinan only */}
        {isPimpinan && (
          item.status === 'Tindakan Lanjutan' ||
          (item.status === 'Selesai' && item.kondisi_alat === 'Rusak Berat')
        ) && (
            <button
              onClick={() => window.open(`/mobile/pemeliharaan/${item.id_pemeliharaan}/disposisi`, '_blank')}
              className="p-2 bg-success-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
              title="Isi Disposisi"
            >
              <Edit size={16} />
            </button>
          )}

        {canDelete(item) && (
          <button
            onClick={() => handleDelete(item)}
            disabled={deleteMutation.isPending}
            className="p-2 bg-danger-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    ) },
  ];

  const table = useDataTable({
    columns,
    data,
    tableState,
    pageCount: meta?.last_page,
    rowCount: meta?.total,
    getRowId: (item) => item.id_pemeliharaan,
  });

  const f = getTableFilters(table);
  const [startDate, endDate] = f.getRange('periode');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Laporan Pemeliharaan</h1>
          <p className="text-text-gray text-xs mt-1">Rekapitulasi jadwal dan hasil pemeliharaan alat</p>
        </div>
        <Button
          onClick={handleExport}
          className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
          size="sm"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          search={
            <Input
              name="search"
              size="sm"
              placeholder="Cari laporan..."
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
          gridClassName="grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
        >
          <SearchableSelect
            size="sm"
            name="ruangan_id"
            value={f.get('ruangan')}
            onChange={(e) => f.set('ruangan', e.target.value)}
            options={[{ label: 'Semua Ruangan', value: '' }, ...ruanganOptions]}
            placeholder="Semua Ruangan"
            searchPlaceholder="Cari ruangan..."
          />

          {/* Hide divisi filter for Admin Divisi */}
          {!isAdminDivisi && (
            <SearchableSelect
              size="sm"
              name="divisi_id"
              value={f.get('divisi')}
              onChange={(e) => f.set('divisi', e.target.value)}
              options={[{ label: 'Semua Divisi', value: '' }, ...divisiOptions]}
              placeholder="Semua Divisi"
              searchPlaceholder="Cari divisi..."
            />
          )}

          <SearchableSelect
            size="sm"
            name="teknisi_id"
            value={f.get('teknisi')}
            onChange={(e) => f.set('teknisi', e.target.value)}
            options={[{ label: 'Semua Teknisi', value: '' }, ...teknisiOptions]}
            placeholder="Semua Teknisi"
            searchPlaceholder="Cari teknisi..."
          />

          <Select
            size="sm"
            value={f.get('status')}
            onChange={(e) => f.set('status', e.target.value)}
            options={[{ label: 'Semua Status', value: '' }, ...statusOptions]}
            icon={<AlertCircle className="w-4 h-4" />}
            className="!bg-white"
          />

          <Select
            size="sm"
            value={f.get('pihakKetiga')}
            onChange={(e) => f.set('pihakKetiga', e.target.value)}
            options={[{ label: 'Semua Servis', value: '' }, { label: 'Ada Laporan Pihak Ketiga', value: '1' }]}
            icon={<Wrench className="w-4 h-4" />}
            className="!bg-white"
          />

          <div className="col-span-2 md:col-span-1">
            <DateRangePicker
              size="sm"
              startDate={startDate}
              endDate={endDate}
              onChange={({ startDate: start, endDate: end }) => f.set('periode', start || end ? [start, end] : '')}
              className="!bg-white"
            />
          </div>
        </FilterBar>

        <DataTable
          table={table}
          isLoading={isLoading}
          skeletonRows={10}
          empty={{ icon: FileText, title: 'Tidak ada data pemeliharaan', description: 'Silakan sesuaikan filter pencarian' }}
        />
      </div>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, Calendar } from 'lucide-react';
import KondisiBadge from '../../../components/KondisiBadge';
import StatusBadge from '../../../components/StatusBadge';
import ServisBadge from '../../../components/ServisBadge';
import {
  usePemeliharaan,
  useDeletePemeliharaan,
  useMasterRuangan,
  useAuth,
  useToast,
  useModal,
  usePageTitle,
} from '../../../hooks';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import FilterBar from '../../../components/FilterBar';
import DateRangePicker from '../../../components/DateRangePicker';
import DataTable from '../../../components/DataTable';
import { indexColumn } from '../../../utils/tableColumns';
import SearchableSelect from '../../../components/SearchableSelect';
import ColumnToggle from '../../../components/ColumnToggle';
import useColumnToggle from '../../../hooks/utils/useColumnToggle';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import ConfirmDialog from '../../../components/Alert/Alert';
import AddPemeliharaanModal from './AddPemeliharaanModal';
import EditPemeliharaanModal from './EditPemeliharaanModal';
import { ROLES, isRole, isReadOnlyRole } from '../../auth/constants';
import { formatDateShort } from '../../../utils/format';
import useTeknisiList from './useTeknisiList';


const COLUMN_DEFS = [
  { key: 'index', label: 'No.', defaultVisible: true },
  { key: 'no_pemeliharaan', label: 'No. Pemeliharaan', defaultVisible: true },
  { key: 'tanggal_jadwal', label: 'Tanggal Jadwal', defaultVisible: true },
  { key: 'ruangan', label: 'Ruangan', defaultVisible: true },
  { key: 'divisi', label: 'Divisi', defaultVisible: false },
  { key: 'gedung', label: 'Gedung', defaultVisible: false },
  { key: 'alat', label: 'Alat', defaultVisible: true },
  { key: 'no_inventaris', label: 'No. Inventaris', defaultVisible: false },
  { key: 'teknisi', label: 'Teknisi', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'kondisi_alat', label: 'Kondisi Alat', defaultVisible: true },
  { key: 'actions', label: 'Aksi', defaultVisible: true, alwaysVisible: true }
];

// Filter diatur lewat state TanStack. Peta: id filter -> parameter query server (array = rentang [awal, akhir]).
const FILTER_MAP = {
  ruangan: 'ruangan_id',
  teknisi: 'teknisi_id',
  tanggal: ['start_date', 'end_date'],
  pihakKetiga: 'pihak_ketiga',
};

export default function PemeliharaanList() {
  usePageTitle('Daftar Pemeliharaan');
  const { user } = useAuth();
  const { showToast } = useToast();

  const isSuperAdmin = isRole(user, ROLES.SUPER_ADMIN);
  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);
  // Pimpinan hanya boleh melihat: tanpa tambah, ubah, dan hapus.
  const canWrite = !isReadOnlyRole(user);

  // Sama dengan laporan pemeliharaan: Super Admin boleh menghapus semua,
  // Admin Divisi tidak boleh menghapus pemeliharaan yang sudah selesai.
  const canDelete = (item) => {
    if (isSuperAdmin) return true;
    if (isAdminDivisi) return item.status !== 'Selesai';
    return false;
  };

  // Jadwal/teknisi pemeliharaan yang sudah selesai tidak dapat diubah lagi.
  const canEdit = (item) => canWrite && item.status !== 'Selesai';

  const { visibleColumns, toggleColumn, showAll, hideAll } = useColumnToggle(
    COLUMN_DEFS,
    'pemeliharaan_columns'
  );

  const tableState = useTableState({ pageSize: 10, filterMap: FILTER_MAP });
  const { params } = tableState;

  const addModal = useModal();
  const editModal = useModal();

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: pemeliharaanData, isLoading, refetch } = usePemeliharaan(params);

  const { data: ruanganData } = useMasterRuangan({ all: 1 });

  const teknisiList = useTeknisiList();

  const deleteMutation = useDeletePemeliharaan();

  const data = pemeliharaanData?.data || [];
  const meta = pemeliharaanData?.meta;

  const ruanganOptions = (ruanganData?.data || []);

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id_pemeliharaan);
      showToast('Pemeliharaan berhasil dihapus', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus pemeliharaan', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // id kolom = key di COLUMN_DEFS, supaya ColumnToggle tetap mengendalikan visibilitas.
  const columns = [
    indexColumn(),
    { id: 'no_pemeliharaan', header: 'No. Pemeliharaan', cell: ({ row: { original: item } }) => (
      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-brand-primary text-[10px] font-bold">{item.no_pemeliharaan || '-'}</span>
    ) },
    { id: 'divisi', header: 'Divisi', cell: ({ row }) => row.original.divisi_nama || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'ruangan', header: 'Ruangan', cell: ({ row }) => row.original.ruangan_nama || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'gedung', header: 'Gedung', cell: ({ row }) => row.original.gedung || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'alat', header: 'Nama Alat', cell: ({ row }) => row.original.nama_alat_nama || '-', meta: { cellClassName: 'font-medium text-text-dark' } },
    { id: 'no_inventaris', header: 'No. Inv', cell: ({ row }) => (
      <span className="px-2 py-0.5 rounded-md bg-brand-primary-50 text-brand-primary text-[10px] font-bold">{row.original.no_inventaris || '-'}</span>
    ) },
    { id: 'tanggal_jadwal', header: 'Jadwal', cell: ({ row }) => formatDateShort(row.original.jadwal_pemeliharaan), meta: { cellClassName: 'font-medium text-text-dark' } },
    { id: 'teknisi', header: 'Teknisi', cell: ({ row: { original: item } }) => (
      item.teknisi_nama && item.teknisi_nama !== '-'
        ? <span className="font-medium text-brand-primary">{item.teknisi_nama}</span>
        : <span className="text-gray-400 text-[10px] italic">Belum ada</span>
    ) },
    { id: 'status', header: 'Status', cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge status={row.original.status} />
        <ServisBadge jumlah={row.original.jumlah_servis} />
      </div>
    ) },
    { id: 'kondisi_alat', header: 'Kondisi', cell: ({ row: { original: item } }) => (
      item.kondisi_alat ? <KondisiBadge kondisi={item.kondisi_alat} size="sm" /> : '-'
    ), meta: { cellClassName: 'text-gray-600' } },
    { id: 'actions', header: 'Aksi', meta: { align: 'right' }, cell: ({ row: { original: item } }) => (
      <div className="flex items-center justify-end gap-2">
        {canEdit(item) && (
          <button onClick={() => editModal.open(item)} className="p-2 bg-brand-primary text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all" title="Edit">
            <Edit2 size={16} />
          </button>
        )}
        {canDelete(item) && (
          <button onClick={() => setDeleteTarget(item)} disabled={deleteMutation.isPending} className="p-2 bg-danger-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50" title="Hapus">
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
    columnVisibility: visibleColumns,
    getRowId: (item) => item.id_pemeliharaan,
  });

  // Filter lewat state TanStack. Nilai kosong menghapus filter; mengubah filter kembali ke halaman 1.
  const f = getTableFilters(table);
  const [startDate, endDate] = f.getRange('tanggal');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Daftar Pemeliharaan</h1>
          <p className="text-text-gray text-xs mt-1">Kelola jadwal pemeliharaan berkala</p>
        </div>
        {canWrite && (
          <Button
            onClick={() => addModal.open()}
            size="sm"
            className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
          >
            <Plus className="w-4 h-4" />
            Tambah Pemeliharaan
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          search={
            <Input
              name="search"
              size="sm"
              placeholder="Cari pemeliharaan..."
              icon={<Search className="w-3.5 h-3.5" />}
              value={f.search}
              onChange={(e) => f.setSearch(e.target.value)}
              className="!bg-white"
            />
          }
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={f.reset}
                className="!rounded-lg whitespace-nowrap border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary"
              >
                Reset Filter
              </Button>
              <ColumnToggle
                columns={COLUMN_DEFS}
                visibleColumns={visibleColumns}
                onToggle={toggleColumn}
                onShowAll={showAll}
                onHideAll={hideAll}
                size="sm"
                className="!rounded-lg"
              />
            </>
          }
          gridClassName="grid-cols-2 md:grid-cols-3"
        >
          <SearchableSelect
            size="sm"
            name="ruangan_id"
            value={f.get('ruangan')}
            onChange={(e) => f.set('ruangan', e.target.value)}
            options={[
              { label: 'Semua Ruangan', value: '' },
              ...ruanganOptions.map(r => ({ label: r.nama_ruangan, value: r.id_ruangan }))
            ]}
            placeholder="Semua Ruangan"
            searchPlaceholder="Cari ruangan..."
          />

          <SearchableSelect
            size="sm"
            name="teknisi_id"
            value={f.get('teknisi')}
            onChange={(e) => f.set('teknisi', e.target.value)}
            options={[
              { label: 'Semua Teknisi', value: '' },
              ...teknisiList.map(t => ({ label: t.nama_lengkap, value: t.id_user }))
            ]}
            placeholder="Semua Teknisi"
            searchPlaceholder="Cari teknisi..."
          />

          <SearchableSelect
            size="sm"
            name="pihak_ketiga"
            value={f.get('pihakKetiga')}
            onChange={(e) => f.set('pihakKetiga', e.target.value)}
            options={[{ label: 'Semua Servis', value: '' }, { label: 'Ada Laporan Pihak Ketiga', value: '1' }]}
            placeholder="Semua Servis"
            searchPlaceholder="Cari..."
          />

          {/* Rentang tanggal: satu filter (start_date, end_date) */}
          <div className="col-span-2 md:col-span-1">
            <DateRangePicker
              size="sm"
              startDate={startDate}
              endDate={endDate}
              onChange={({ startDate: start, endDate: end }) => f.set('tanggal', start || end ? [start, end] : '')}
              className="!bg-white"
            />
          </div>
        </FilterBar>

        <DataTable
          table={table}
          isLoading={isLoading}
          skeletonRows={10}
          empty={{ icon: Calendar, title: 'Tidak ada data pemeliharaan', description: 'Belum ada jadwal pemeliharaan' }}
        />
      </div>

      <AddPemeliharaanModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onSuccess={() => { table.setPageIndex(0); refetch(); }}
      />

      <EditPemeliharaanModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        pemeliharaan={editModal.data}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Pemeliharaan"
        message={`Apakah Anda yakin ingin menghapus pemeliharaan ${deleteTarget?.no_pemeliharaan || 'ini'}?`}
        type="danger"
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Plus, AlertCircle, Trash2 } from 'lucide-react';
import {
  useAduan,
  useDeleteAduan,
  useMasterRuangan,
  useAuth,
  useToast,
  useModal,
  usePageTitle,
} from '../../../hooks';
import DataTable from '../../../components/DataTable';
import FilterBar from '../../../components/FilterBar';
import { indexColumn } from '../../../utils/tableColumns';
import SearchableSelect from '../../../components/SearchableSelect';
import ColumnToggle from '../../../components/ColumnToggle';
import useColumnToggle from '../../../hooks/utils/useColumnToggle';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import Input from '../../../components/Input';
import DateRangePicker from '../../../components/DateRangePicker';
import Button from '../../../components/Button';
import AddAduanModal from './AddAduanModal';
import AssignTeknisiModal from './AssignTeknisiModal';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import ConfirmDialog from '../../../components/Alert/Alert';
import StatusBadge from '../../../components/StatusBadge';
import ServisBadge from '../../../components/ServisBadge';
import RisikoBadge from '../../../components/RisikoBadge';
import { isReadOnlyRole } from '../../auth/constants';
import { formatDateTime } from '../../../utils/format';
import useTeknisiList from '../pemeliharaan/useTeknisiList';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import noImage from '../../../assets/img/no_image.png';
import technicianIcon from '../../../assets/img/technician.png';


const COLUMN_DEFS = [
  { key: 'no_pendaftaran', label: 'No.', defaultVisible: true },
  { key: 'no_aduan', label: 'No. Aduan', defaultVisible: true },
  { key: 'tanggal', label: 'Tanggal Aduan', defaultVisible: true },
  { key: 'divisi_ruang', label: 'Divisi/Ruang', defaultVisible: true },
  { key: 'gedung', label: 'Gedung', defaultVisible: false },
  { key: 'alat', label: 'Alat', defaultVisible: true },
  { key: 'no_inventaris', label: 'No. Inventaris', defaultVisible: false },
  { key: 'keluhan', label: 'Keluhan', defaultVisible: true },
  { key: 'foto', label: 'Foto', defaultVisible: true },
  { key: 'pelapor', label: 'Pelapor', defaultVisible: true },
  { key: 'teknisi', label: 'Teknisi', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'actions', label: 'Aksi', defaultVisible: true, alwaysVisible: true }
];

// Filter diatur lewat state TanStack. Peta: id filter -> parameter query server (array = rentang [awal, akhir]).
const FILTER_MAP = {
  ruangan: 'ruangan_id',
  teknisi: 'teknisi_id',
  tanggal: ['start_date', 'end_date'],
  pihakKetiga: 'pihak_ketiga',
};

export default function AduanList() {
  usePageTitle('Daftar Aduan');
  const { showToast } = useToast();
  const { user } = useAuth();


  // Pimpinan hanya boleh melihat: tanpa tambah, tugaskan, dan hapus.
  const canWrite = !isReadOnlyRole(user);


  const { visibleColumns, toggleColumn, showAll, hideAll } = useColumnToggle(
    COLUMN_DEFS,
    'aduan_columns'
  );


  const tableState = useTableState({ pageSize: 10, filterMap: FILTER_MAP });
  const { params } = tableState;


  const addModal = useModal();
  const assignModal = useModal();
  const imagePreviewModal = useModal();
  const [deleteTarget, setDeleteTarget] = useState(null);


  const { data: aduanData, isLoading, refetch } = useAduan(params);

  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const teknisiList = useTeknisiList();

  const deleteMutation = useDeleteAduan();


  const aduan = aduanData?.data || [];
  const meta = aduanData?.meta;


  const ruanganOptions = (ruanganData?.data || []).map(r => ({
    label: r.nama_ruangan,
    value: r.id_ruangan
  }));


  const teknisiOptions = teknisiList.map(u => ({
    label: u.nama_lengkap,
    value: u.id_user
  }));

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id_aduan);
      showToast('Aduan berhasil dihapus', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus aduan', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // id kolom = key di COLUMN_DEFS, supaya ColumnToggle tetap mengendalikan visibilitas.
  const columns = [
    indexColumn({ id: 'no_pendaftaran' }),
    { id: 'no_aduan', header: 'No. Aduan', cell: ({ row: { original: item } }) => (
      <span className="px-2 py-1 text-xs font-bold rounded-md bg-brand-primary-50 text-brand-primary">
        {item.no_aduan || '-'}
      </span>
    ) },
    { id: 'tanggal', header: 'Tanggal', cell: ({ row }) => formatDateTime(row.original.create_date), meta: { cellClassName: 'text-text-dark' } },
    { id: 'divisi_ruang', header: 'Divisi/Ruang', cell: ({ row: { original: item } }) => (
      <div className="flex flex-col">
        <span className="font-medium text-text-dark">{item.ruangan_nama || '-'}</span>
        <span className="text-[10px] text-gray-400">{item.divisi_nama}</span>
      </div>
    ), meta: { cellClassName: 'text-gray-600' } },
    { id: 'gedung', header: 'Gedung', cell: ({ row }) => row.original.gedung || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'alat', header: 'Alat', cell: ({ row: { original: item } }) => (
      <div className="flex flex-col">
        <span className="font-medium text-text-dark">{item.nama_alat_nama || '-'}</span>
        {item.tingkat_risiko === 'Tinggi' && (
          <span className="mt-1 w-fit" title="Alat risiko tinggi: prioritaskan penanganan">
            <RisikoBadge tingkat="Tinggi" size="sm" />
          </span>
        )}
      </div>
    ), meta: { cellClassName: 'text-gray-600' } },
    { id: 'no_inventaris', header: 'No. Inventaris', cell: ({ row }) => (
      <span className="text-[10px] text-brand-primary bg-purple-50 px-1.5 py-0.5 rounded w-fit">{row.original.no_inventaris}</span>
    ) },
    { id: 'keluhan', header: 'Keluhan', cell: ({ row: { original: item } }) => (
      <span title={item.keluhan}>{item.keluhan}</span>
    ), meta: { cellClassName: 'text-gray-600 max-w-[150px] truncate text-xs' } },
    { id: 'foto', header: 'Foto', cell: ({ row: { original: item } }) => (
      <div className="flex items-center justify-center">
        {item.img_keluhan ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-primary" style={{ minWidth: '48px', minHeight: '48px', width: '48px', height: '48px' }}>
            <LazyLoadImage
              src={item.img_keluhan}
              alt="Foto Keluhan"
              effect="blur"
              className="object-cover"
              style={{ width: '48px', height: '48px', display: 'block' }}
              placeholderSrc={noImage}
              onError={(e) => { e.target.src = noImage; }}
              onClick={() => imagePreviewModal.open({ url: item.img_keluhan, alt: `Foto Keluhan - ${item.no_aduan || ''}` })}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200" style={{ minWidth: '48px', minHeight: '48px' }}>
            <img
              src={noImage}
              alt="Tidak ada foto"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}
      </div>
    ) },
    { id: 'pelapor', header: 'Pelapor', cell: ({ row }) => row.original.nama_pengadu || '-', meta: { cellClassName: 'text-gray-600' } },
    { id: 'teknisi', header: 'Teknisi', cell: ({ row: { original: item } }) => (
      item.teknisi_nama
        ? <span className="font-medium text-brand-primary">{item.teknisi_nama}</span>
        : <span className="text-gray-400 text-[10px] italic">Belum ada</span>
    ) },
    { id: 'status', header: 'Status', cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge status={row.original.status_aduan} />
        <ServisBadge jumlah={row.original.jumlah_servis} />
      </div>
    ) },
    { id: 'actions', header: 'Aksi', meta: { align: 'right' }, cell: ({ row: { original: item } }) => (
      <div className="flex items-center justify-end gap-2">
        {canWrite && !item.teknisi_id && (
          <button
            onClick={() => assignModal.open(item)}
            className="group w-12 h-12 p-1 bg-white rounded-xl shadow-lg hover:-translate-y-1 transition-all overflow-hidden flex items-center justify-center border border-gray-100"
            title="Tugaskan Teknisi"
          >
            <img
              src={technicianIcon}
              alt="Tugaskan Teknisi"
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </button>
        )}
        {/* Sama dengan laporan aduan: hanya aduan yang belum ditugaskan yang boleh dihapus. */}
        {canWrite && !item.teknisi_id && (
          <button
            onClick={() => setDeleteTarget(item)}
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
    data: aduan,
    tableState,
    pageCount: meta?.last_page,
    rowCount: meta?.total,
    columnVisibility: visibleColumns,
    getRowId: (item) => item.id_aduan,
  });

  // Filter lewat state TanStack. Nilai kosong menghapus filter; mengubah filter kembali ke halaman 1.
  const f = getTableFilters(table);
  const [startDate, endDate] = f.getRange('tanggal');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Daftar Aduan</h1>
          <p className="text-text-gray text-xs mt-1">Kelola aduan kerusakan alat</p>
        </div>
        {canWrite && (
          <Button
            size="sm"
            onClick={() => addModal.open()}
            className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
          >
            <Plus className="w-4 h-4" />
            Tambah Aduan
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          search={
            <Input
              name="search"
              size="sm"
              placeholder="Cari aduan..."
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
            options={[{ label: 'Semua Ruangan', value: '' }, ...ruanganOptions]}
            placeholder="Semua Ruangan"
            searchPlaceholder="Cari ruangan..."
          />

          <SearchableSelect
            size="sm"
            name="teknisi_id"
            value={f.get('teknisi')}
            onChange={(e) => f.set('teknisi', e.target.value)}
            options={[{ label: 'Semua Teknisi', value: '' }, ...teknisiOptions]}
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
          empty={{ icon: AlertCircle, title: 'Tidak ada data aduan', description: 'Belum ada aduan yang masuk' }}
        />
      </div>

      {/* Modals */}
      <AddAduanModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onSuccess={() => { table.setPageIndex(0); refetch(); }}
      />

      <AssignTeknisiModal
        isOpen={assignModal.isOpen}
        onClose={assignModal.close}
        aduan={assignModal.data}
        teknisi={teknisiList}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Aduan"
        message={`Apakah Anda yakin ingin menghapus aduan ${deleteTarget?.no_aduan || 'ini'}?`}
        type="danger"
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ImagePreviewModal
        isOpen={imagePreviewModal.isOpen}
        onClose={imagePreviewModal.close}
        imageUrl={imagePreviewModal.data?.url}
        altText={imagePreviewModal.data?.alt}
      />
    </div>
  );
}

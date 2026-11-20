import React, { useState } from 'react';
import { Search, Plus, Trash2, UserPlus, ChevronDown } from 'lucide-react';
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
import SearchableSelect from '../../../components/SearchableSelect';
import ColumnToggle from '../../../components/ColumnToggle';
import useColumnToggle from '../../../hooks/utils/useColumnToggle';
import useExpandedRow from '../../../hooks/utils/useExpandedRow';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import Input from '../../../components/Input';
import DateRangePicker from '../../../components/DateRangePicker';
import Button from '../../../components/Button';
import AddAduanModal from './AddAduanModal';
import AssignTeknisiModal from './AssignTeknisiModal';
import AduanRowDetail from './AduanRowDetail';
import StackedCell from '../../../components/StackedCell';
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


// Tabel ringkas: kolom yang berkaitan digabung dalam satu sel; selengkapnya ada di panel yang terbuka lewat
// tombol panah di tiap baris. Kolom panah tidak masuk daftar: selalu tampil.
const COLUMN_DEFS = [
  { key: 'aduan', label: 'No. Aduan / Tanggal', defaultVisible: true },
  { key: 'foto', label: 'Foto', defaultVisible: true },
  { key: 'alat', label: 'Alat / No. Inventaris', defaultVisible: true, alwaysVisible: true },
  { key: 'lokasi', label: 'Lokasi', defaultVisible: true },
  { key: 'keluhan', label: 'Keluhan', defaultVisible: true },
  { key: 'teknisi', label: 'Teknisi / Pelapor', defaultVisible: true },
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
    'aduan_columns_v2'
  );


  const tableState = useTableState({ pageSize: 10, filterMap: FILTER_MAP });
  const { params } = tableState;


  const addModal = useModal();
  const assignModal = useModal();
  const imagePreviewModal = useModal();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { expandedId, closing, toggleRow } = useExpandedRow();

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

  const previewFoto = (item) => imagePreviewModal.open({ url: item.img_keluhan, alt: `Foto Keluhan - ${item.no_aduan || ''}` });

  // id kolom = key di COLUMN_DEFS, supaya ColumnToggle tetap mengendalikan visibilitas.
  const columns = [
    { id: 'expand', header: '', meta: { cellClassName: '!pr-0 w-10' }, cell: ({ row: { original: item } }) => {
      const open = expandedId === item.id_aduan && !closing;
      return (
        <button
          type="button"
          onClick={() => toggleRow(item.id_aduan)}
          aria-expanded={open}
          aria-label={open ? 'Tutup detail' : 'Buka detail'}
          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${open ? 'border-brand-primary/30 bg-brand-primary-soft text-brand-primary' : 'border-gray-200 text-text-gray hover:bg-gray-50'}`}
        >
          <ChevronDown size={14} className={`transition-transform duration-300 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
        </button>
      );
    } },
    { id: 'aduan', header: 'Aduan', cell: ({ row: { original: item } }) => (
      <div>
        <span className="inline-block rounded-md bg-brand-primary-50 px-2 py-0.5 text-xs font-bold text-brand-primary">{item.no_aduan || '-'}</span>
        <p className="mt-1 text-[11px] leading-tight text-text-gray">{formatDateTime(item.create_date)}</p>
      </div>
    ) },
    // Di area tabel yang sempit kolom foto disembunyikan supaya tabel tidak perlu digeser; fotonya ada di panel detail.
    { id: 'foto', header: 'Foto', meta: { headerClassName: 'hidden @[1180px]:table-cell', cellClassName: 'hidden @[1180px]:table-cell' }, cell: ({ row: { original: item } }) => (
      item.img_keluhan ? (
        <div className="h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-gray-100 transition-all duration-300 hover:scale-105 hover:border-brand-primary hover:shadow-lg">
          <LazyLoadImage
            src={item.img_keluhan}
            alt="Foto Keluhan"
            effect="blur"
            className="object-cover"
            style={{ width: '44px', height: '44px', display: 'block' }}
            placeholderSrc={noImage}
            onError={(e) => { e.target.src = noImage; }}
            onClick={() => previewFoto(item)}
          />
        </div>
      ) : (
        <div className="h-11 w-11 overflow-hidden rounded-lg border border-gray-200">
          <img src={noImage} alt="Tidak ada foto" className="h-full w-full object-cover opacity-50" />
        </div>
      )
    ) },
    { id: 'alat', header: 'Alat', cell: ({ row: { original: item } }) => (
      <div>
        <StackedCell main={item.nama_alat_nama || '-'} sub={item.no_inventaris} subClassName="font-mono" />
        {item.tingkat_risiko === 'Tinggi' && (
          <span className="mt-1 block w-fit" title="Alat risiko tinggi: prioritaskan penanganan">
            <RisikoBadge tingkat="Tinggi" size="sm" />
          </span>
        )}
      </div>
    ) },
    { id: 'lokasi', header: 'Lokasi', cell: ({ row: { original: item } }) => (
      <StackedCell
        main={item.ruangan_nama || '-'}
        sub={[item.divisi_nama, item.gedung].filter((v) => v && v !== '-').join(' · ')}
      />
    ) },
    { id: 'keluhan', header: 'Keluhan', cell: ({ row: { original: item } }) => (
      <p className="line-clamp-2 min-w-32 max-w-64 whitespace-normal text-xs text-gray-600" title={item.keluhan}>{item.keluhan}</p>
    ) },
    { id: 'teknisi', header: 'Teknisi', cell: ({ row: { original: item } }) => (
      <StackedCell
        main={item.teknisi_nama || 'Belum ada'}
        mainClassName={item.teknisi_nama ? '!text-brand-primary' : '!font-normal !italic !text-gray-400'}
        sub={`Pelapor: ${item.nama_pengadu || '-'}`}
      />
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
            className="p-2 bg-brand-primary text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
            title="Tugaskan Teknisi"
            aria-label="Tugaskan Teknisi"
          >
            <UserPlus size={16} />
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
          gridClassName="grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
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
          tableClassName="[&_th]:!px-3 [&_td]:!px-3"
          containerClassName="@container"
          empty={{ title: 'Tidak ada data aduan', description: 'Belum ada aduan yang masuk' }}
          rowClassName={(item) => (expandedId === item.id_aduan ? '!border-b-0' : '')}
          renderSubRow={(item, colCount) => (expandedId === item.id_aduan ? (
            <tr key={`detail-${item.id_aduan}`}>
              <td colSpan={colCount} className="px-4 !py-0">
                <AduanRowDetail item={item} closing={closing} onPreviewImage={previewFoto} />
              </td>
            </tr>
          ) : null)}
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Trash2, AlertCircle, Edit, Wrench, ChevronDown } from 'lucide-react';
import {
  useReportAduan,
  useDeleteAduan,
  useMasterRuangan,
  useMasterDivisi,
  useAuth,
  useToast,
  usePageTitle,
  useModal,
} from '../../../hooks';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import SearchableSelect from '../../../components/SearchableSelect';
import DateRangePicker from '../../../components/DateRangePicker';
import DataTable from '../../../components/DataTable';
import FilterBar from '../../../components/FilterBar';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import useExpandedRow from '../../../hooks/utils/useExpandedRow';
import ConfirmDialog from '../../../components/Alert/Alert';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import KondisiBadge from '../../../components/KondisiBadge';
import StatusBadge from '../../../components/StatusBadge';
import ServisBadge from '../../../components/ServisBadge';
import ProgresAduan from '../../../components/ProgresAduan';
import StackedCell from '../../../components/StackedCell';
import ReportAduanRowDetail from './ReportAduanRowDetail';
import { apiUrl } from '../../../config';
import { formatDateTime } from '../../../utils/format';
import { ROLES, isRole, isReadOnlyRole } from '../../auth/constants';
import useConfirmAction from '../master-data/useConfirmAction';
import useTeknisiOptions from './useTeknisiOptions';

// Filter diatur lewat state TanStack. Peta: id filter -> parameter query server.
const FILTER_MAP = {
  ruangan: 'ruangan_id',
  divisi: 'divisi_id',
  teknisi: 'teknisi_id',
  status: 'status_aduan',
  kondisi_alat: 'kondisi_alat',
  pihakKetiga: 'pihak_ketiga',
  periode: ['start_date', 'end_date'],
};

const adaKondisi = (item) => !!item.kondisi_alat && item.kondisi_alat !== 'Belum Ditentukan';

/** Kondisi akhir alat; strip bila belum ditentukan. */
function Kondisi({ item }) {
  return adaKondisi(item) ? <KondisiBadge kondisi={item.kondisi_alat} size="sm" /> : <span className="text-gray-400 text-xs">-</span>;
}

export default function ReportAduan() {
  usePageTitle('Laporan Aduan');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);
  const isPimpinan = isReadOnlyRole(user);

  const { askConfirm, dialogProps } = useConfirmAction();
  const [selectedImage, setSelectedImage] = useState(null);
  const imagePreviewModal = useModal();
  const { expandedId, closing, toggleRow } = useExpandedRow();
  const previewFoto = (item) => { setSelectedImage(item.img_keluhan); imagePreviewModal.open(); };

  const tableState = useTableState({ pageSize: 10, filterMap: FILTER_MAP });
  const { filters, params } = tableState;

  const { data: aduanData, isLoading } = useReportAduan(params);

  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const teknisiOptions = useTeknisiOptions();
  const deleteMutation = useDeleteAduan();


  const data = aduanData?.data || [];
  const meta = aduanData?.meta;

  const ruanganOptions = (ruanganData?.data || []).map(r => ({ label: r.nama_ruangan, value: r.id_ruangan }));
  const divisiOptions = (divisiData?.data || []).map(d => ({ label: d.nama_divisi, value: d.id_divisi }));


  const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Sedang Dikerjakan', value: 'Sedang Dikerjakan' },
    { label: 'Tindakan Lanjutan', value: 'Tindakan Lanjutan' },
    { label: 'Selesai', value: 'Selesai' }
  ];

  const handleDelete = (id) => {
    askConfirm({
      title: 'Hapus Aduan',
      message: 'Apakah Anda yakin ingin menghapus data laporan ini?',
      confirmText: 'Ya, Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
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
    window.open(apiUrl('/aduan/export-excel', filters), '_blank');
  };

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
        <span className="inline-block rounded-md bg-brand-primary-50 px-2 py-0.5 text-[11px] font-bold text-brand-primary">{item.no_aduan || '-'}</span>
        <p className="mt-1 text-[11px] leading-tight text-text-gray">{formatDateTime(item.create_date)}</p>
      </div>
    ) },
    { id: 'alat', header: 'Alat & Lokasi', cell: ({ row: { original: item } }) => (
      <div className="max-w-[13rem]">
        <p className="truncate text-[13px] font-semibold leading-tight text-text-dark" title={item.nama_alat_nama}>
          {item.nama_alat_nama || '-'}
          <span className="ml-1.5 font-mono text-[10px] font-normal text-text-gray">{item.no_inventaris}</span>
        </p>
        <p className="mt-0.5 truncate text-[11px] leading-tight text-text-gray">
          {[item.ruangan_nama, item.divisi_nama].filter((v) => v && v !== '-').join(' · ') || '\u00A0'}
        </p>
      </div>
    ) },
    { id: 'keluhan', header: 'Keluhan', cell: ({ row: { original: item } }) => (
      <p className="line-clamp-2 min-w-32 max-w-60 whitespace-normal text-xs text-gray-600" title={item.keluhan}>{item.keluhan}</p>
    ) },
    { id: 'progres', header: 'Progres', cell: ({ row }) => <ProgresAduan aduan={row.original} /> },
    { id: 'teknisi', header: 'Teknisi', cell: ({ row: { original: item } }) => (
      <StackedCell
        main={item.teknisi_nama || 'Belum ada'}
        mainClassName={item.teknisi_nama ? '!text-brand-primary' : '!font-normal !italic !text-gray-400'}
        sub={item.nama_pengadu}
      />
    ) },
    // Di area tabel yang sempit kolom ini disembunyikan dan kondisinya pindah ke bawah status, supaya tabel tidak perlu digeser.
    { id: 'kondisi_alat', header: 'Kondisi', meta: { headerClassName: 'hidden @[1200px]:table-cell', cellClassName: 'hidden @[1200px]:table-cell' }, cell: ({ row: { original: item } }) => <Kondisi item={item} /> },
    { id: 'status', header: 'Status', cell: ({ row: { original: item } }) => (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge status={item.status_aduan} size="sm" />
        <ServisBadge jumlah={item.jumlah_servis} />
        {adaKondisi(item) && <span className="@[1200px]:hidden"><Kondisi item={item} /></span>}
      </div>
    ) },
    { id: 'actions', header: 'Aksi', meta: { align: 'right' }, cell: ({ row: { original: item } }) => (
      <div className="flex items-center justify-end gap-2 text-xs">
        {/* Detail Button - Show for Sedang Dikerjakan, Selesai, Tindakan Lanjutan, or Rusak Berat */}
        {(item.status_aduan === 'Sedang Dikerjakan' || item.status_aduan === 'Selesai' || item.status_aduan === 'Tindakan Lanjutan' || item.kondisi_alat === 'Rusak Berat') && (
          <button
            onClick={() => navigate(`/report/aduan/${item.id_aduan}`)}
            className="p-2 bg-[#4FD1C5] text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
            title="Detail"
          >
            <Eye size={16} />
          </button>
        )}

        {/* Disposisi Button - Show for Pimpinan only */}
        {isPimpinan && (
          item.status_aduan === 'Tindakan Lanjutan' ||
          item.kondisi_alat === 'Rusak Berat' ||
          (item.status_aduan === 'Selesai' && item.kondisi_alat !== 'Baik')
        ) && (
            <button
              onClick={() => window.open(`/mobile/aduan/${item.id_aduan}/disposisi`, '_blank')}
              className="p-2 bg-success-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
              title="Isi Disposisi"
            >
              <Edit size={16} />
            </button>
          )}

        {/* Delete Button - Show only for unassigned aduan (no teknisi) and NOT Pimpinan */}
        {!isPimpinan && !item.teknisi_id && (
          <button
            onClick={() => handleDelete(item.id_aduan)}
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
    getRowId: (item) => item.id_aduan,
  });

  const f = getTableFilters(table);
  const [startDate, endDate] = f.getRange('periode');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Laporan Aduan</h1>
          <p className="text-text-gray text-xs mt-1">Rekapitulasi seluruh data aduan dan perbaikan</p>
        </div>
        <Button
          onClick={handleExport}
          size="sm"
          className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
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
          tableClassName="[&_th]:!px-3 [&_td]:!px-3"
          containerClassName="@container"
          empty={{ variant: 'cari', title: 'Tidak ada data laporan', description: 'Silakan sesuaikan filter pencarian' }}
          rowClassName={(item) => (expandedId === item.id_aduan ? '!border-b-0' : '')}
          renderSubRow={(item, colCount) => (expandedId === item.id_aduan ? (
            <tr key={`detail-${item.id_aduan}`}>
              <td colSpan={colCount} className="px-4 !py-0">
                <ReportAduanRowDetail item={item} closing={closing} onPreviewImage={previewFoto} />
              </td>
            </tr>
          ) : null)}
        />
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={imagePreviewModal.isOpen}
        imageUrl={selectedImage}
        onClose={imagePreviewModal.close}
      />

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

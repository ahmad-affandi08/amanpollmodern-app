import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Layers, Edit2, Trash2, Eye, Archive, ChevronDown } from 'lucide-react';
import PrintLabelDropdown from '../../../components/PrintLabelDropdown';
import KondisiBadge from '../../../components/KondisiBadge';
import StatusAsetModal from '../../../components/StatusAsetModal';
import {
  useInventaris,
  useDeleteInventaris,
  useMasterKategori,
  useMasterDivisi,
  useMasterRuangan,
  useAuth,
  useToast,
  useMasterNamaAlat,
  usePageTitle,
} from '../../../hooks';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import SearchableSelect from '../../../components/SearchableSelect';
import DataTable from '../../../components/DataTable';
import FilterBar from '../../../components/FilterBar';
import ConfirmDialog from '../../../components/Alert/Alert';
import ColumnToggle from '../../../components/ColumnToggle';
import useColumnToggle from '../../../hooks/utils/useColumnToggle';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import noImage from '../../../assets/img/no_image.png';
import InventarisRowDetail from './components/InventarisRowDetail';
import InventarisApi from '../../../api/InventarisApi';
import { ROLES, isRole, canManageInventaris } from '../../auth/constants';
import { rupiah } from '../../../utils/format';

// Tabel ringkas: kolom yang berkaitan digabung dalam satu sel. Kolom lain (divisi, seri, daya, dokumen, dst.)
// ada di panel yang terbuka lewat tombol panah di tiap baris. Kolom panah tidak masuk daftar: selalu tampil.
const COLUMN_DEFS = [
  { key: 'img_alat', label: 'Foto', defaultVisible: true },
  { key: 'alat', label: 'Alat / No. Inventaris', defaultVisible: true, alwaysVisible: true },
  { key: 'merk_model', label: 'Merk / Model', defaultVisible: true },
  { key: 'lokasi', label: 'Lokasi', defaultVisible: true },
  { key: 'kategori_alat', label: 'Kategori', defaultVisible: true },
  { key: 'harga', label: 'Harga / Tahun', defaultVisible: true },
  { key: 'kondisi_alat', label: 'Kondisi', defaultVisible: true },
  { key: 'actions', label: 'Aksi', defaultVisible: true, alwaysVisible: true }
];

// Isian angka tanpa panah naik/turun agar rapi di sel yang sempit.
const YEAR_INPUT = '!bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

// Filter diatur lewat state TanStack (columnFilters). Peta: id kolom -> parameter query server.
// Array = rentang [min, max] pada satu kolom.
const FILTER_MAP = {
  nama_alat: 'nama_alat',
  kategori_alat: 'kategori_alat_id',
  divisi: 'divisi_id',
  ruangan: 'ruangan_id',
  kondisi_alat: 'kondisi_alat',
  tahun_pengadaan: ['tahun_awal', 'tahun_akhir'],
};

/** Sel dua baris: teks utama + keterangan kecil di bawahnya (dipotong bila terlalu panjang). */
function Stacked({ main, sub, right = false, subClassName = '' }) {
  return (
    <div className={`max-w-[15rem] ${right ? 'ml-auto' : ''}`}>
      <p className="truncate text-[13px] font-semibold leading-tight text-text-dark" title={main}>{main}</p>
      {/* &nbsp; menjaga tinggi baris sama saat tidak ada keterangan */}
      <p className={`mt-0.5 truncate text-[11px] leading-tight text-text-gray ${subClassName}`} title={sub || undefined}>{sub || '\u00A0'}</p>
    </div>
  );
}

export default function InventarisList() {
  usePageTitle('Daftar Inventaris');
  const navigate = useNavigate();
  const { user } = useAuth();


  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);
  // Hanya peran yang boleh mengelola inventaris (Super Admin, Teknisi, Admin Divisi) yang melihat tombol tambah/ubah/hapus.
  const canManage = canManageInventaris(user);


  const { visibleColumns, toggleColumn, showAll, hideAll } = useColumnToggle(
    COLUMN_DEFS,
    'inventaris_columns_v2'
  );


  // Pagination, filter kolom, dan pencarian disimpan di state TanStack; `params` dikirim ke server.
  const tableState = useTableState({ pageSize: 10, filterMap: FILTER_MAP });
  const { filters, params } = tableState;


  const { showToast } = useToast();
  const [deleteId, setDeleteId] = useState(null);
  // Alat rusak berat yang akan digudangkan/dihapus dari daftar aset.
  const [statusItem, setStatusItem] = useState(null);


  const [imagePreview, setImagePreview] = useState({ isOpen: false, imageUrl: '', altText: '' });
  // Hanya satu baris yang terbuka pada satu waktu agar tabel tidak memanjang.
  const [expandedId, setExpandedId] = useState(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);
  // Menutup: jalankan animasi dulu, baru lepas panelnya (durasi sama dengan transisi di InventarisRowDetail).
  const toggleRow = (id) => {
    clearTimeout(closeTimer.current);
    if (expandedId === id && !closing) {
      setClosing(true);
      closeTimer.current = setTimeout(() => { setExpandedId(null); setClosing(false); }, 300);
    } else {
      setClosing(false);
      setExpandedId(id);
    }
  };


  const { data: inventarisData, isLoading } = useInventaris(params);


  const { data: kategoriData } = useMasterKategori({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: namaAlatData } = useMasterNamaAlat({ all: 1 });

  const deleteMutation = useDeleteInventaris();


  const dataList = inventarisData?.data || [];
  const meta = inventarisData?.meta;


  const categories = kategoriData?.data || [];
  const divisions = divisiData?.data || [];
  const rooms = ruanganData?.data || [];



  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteId);
      showToast('Inventaris berhasil dihapus', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus inventaris', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await InventarisApi.exportExcel(filters);

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventaris_${Date.now()}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Export berhasil', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Gagal export data', 'error');
    }
  };


  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintLabelWithType = async (labelType, itemId = null) => {
    setIsPrinting(true);
    showToast('Sedang menyiapkan label, mohon tunggu...', 'info');
    try {
      const params = itemId
        ? { id_inventaris: itemId, type: labelType }
        : { ...filters, type: labelType };

      const response = await InventarisApi.printLabel(params);
      const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
      window.open(url, '_blank');
      showToast('Print label berhasil dibuka', 'success');

    } catch (error) {
      console.error('Print label error:', error);
      showToast('Gagal membuka print label', 'error');
    } finally {
      setIsPrinting(false);
    }
  };



  // id kolom = key di COLUMN_DEFS, supaya ColumnToggle tetap mengendalikan visibilitas.
  const columns = [
    { id: 'expand', header: '', meta: { cellClassName: '!pr-0 w-10' }, cell: ({ row: { original: item } }) => {
      const open = expandedId === item.id && !closing;
      return (
        <button
          type="button"
          onClick={() => toggleRow(item.id)}
          aria-expanded={open}
          aria-label={open ? 'Tutup detail' : 'Buka detail'}
          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${open ? 'border-brand-primary/30 bg-brand-primary-soft text-brand-primary' : 'border-gray-200 text-text-gray hover:bg-gray-50'}`}
        >
          <ChevronDown size={14} className={`transition-transform duration-300 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
        </button>
      );
    } },
    { id: 'img_alat', header: 'Foto', cell: ({ row: { original: item } }) => (
      <div className="flex items-center">
        {item.img_alat_url ? (
          <div className="w-11 h-11 rounded-lg overflow-hidden cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-brand-primary">
            <LazyLoadImage
              src={item.img_alat_url}
              alt="Foto Alat"
              effect="blur"
              className="object-cover"
              style={{ width: '44px', height: '44px', display: 'block' }}
              placeholderSrc={noImage}
              onError={(e) => { e.target.src = noImage; }}
              onClick={() => setImagePreview({ isOpen: true, imageUrl: item.img_alat_url, altText: `Foto Alat - ${item.nama_alat?.nama_nama_alat || item.no_inventaris || ''}` })}
            />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={noImage}
              alt="Tidak ada foto"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}
      </div>
    ) },
    { id: 'alat', header: 'Alat', cell: ({ row: { original: item } }) => (
      <Stacked
        main={item.nama_alat?.nama_nama_alat || '-'}
        sub={item.no_inventaris}
        subClassName="font-mono"
      />
    ) },
    // Di bawah 1400px kolom ini disembunyikan supaya tabel tidak perlu digeser; merk & model tetap ada di panel detail.
    { id: 'merk_model', header: 'Merk / Model', meta: { headerClassName: 'hidden min-[1400px]:table-cell', cellClassName: 'hidden min-[1400px]:table-cell' }, cell: ({ row: { original: item } }) => (
      <Stacked main={item.merk || '-'} sub={item.model} />
    ) },
    { id: 'lokasi', header: 'Lokasi', cell: ({ row: { original: item } }) => {
      const ruangan = item.ruangan?.nama_ruangan;
      const letak = item.ruangan_sekarang?.nama_ruangan;
      // Letak saat ini hanya ditulis bila berbeda dari ruangan asal; selengkapnya ada di panel detail.
      const sub = [item.gedung && `Gedung ${item.gedung}`, letak && letak !== ruangan && letak].filter(Boolean).join(' · ');
      return <Stacked main={ruangan || '-'} sub={sub} />;
    } },
    { id: 'kategori_alat', header: 'Kategori', cell: ({ row: { original: item } }) => {
      const alkes = item.alat_kesehatan === 1 || item.alat_kesehatan === true;
      return (
        <Stacked
          main={item.nama_alat?.kategori_alat?.nama_kategori || '-'}
          sub={alkes ? (item.kategori_alkes ? `Alkes · ${item.kategori_alkes}` : 'Alkes') : ''}
        />
      );
    } },
    { id: 'harga', header: 'Harga', meta: { align: 'right' }, cell: ({ row: { original: item } }) => (
      <Stacked
        right
        main={parseFloat(item.harga) > 0 ? rupiah(item.harga) : '-'}
        sub={item.tahun_pengadaan ? `Pengadaan ${item.tahun_pengadaan}` : ''}
      />
    ) },
    { id: 'kondisi_alat', header: 'Kondisi', cell: ({ row }) => <KondisiBadge kondisi={row.original.kondisi_alat} size="sm" /> },
    { id: 'actions', header: 'Aksi', meta: { align: 'right' }, cell: ({ row: { original: item } }) => (
      <div className="flex items-center justify-end gap-1.5">
        {/* Cetak label */}
        <PrintLabelDropdown
          variant="icon"
          onSelect={(type) => handlePrintLabelWithType(type, item.id)}
          isPrinting={isPrinting}
        />

        {/* Detail */}
        <button
          onClick={() => navigate(`/inventaris/detail/${item.id}`)}
          className="p-1.5 bg-blue-500 text-white rounded-lg shadow-sm hover:-translate-y-0.5 transition-all"
          title="Detail"
        >
          <Eye size={14} />
        </button>

        {/* Ubah dan hapus hanya untuk peran pengelola inventaris */}
        {canManage && (
          <>
            <button
              onClick={() => navigate(`/inventaris/edit/${item.id}`)}
              className="p-1.5 bg-brand-primary text-white rounded-lg shadow-sm hover:-translate-y-0.5 transition-all"
              title="Edit"
            >
              <Edit2 size={14} />
            </button>

            {/* Alat rusak berat tidak dihapus permanen: digudangkan / dihapus dari daftar aset, riwayat tetap tersimpan */}
            {item.kondisi_alat === 'Rusak Berat' && (
              <button
                onClick={() => setStatusItem(item)}
                className="p-1.5 bg-amber-500 text-white rounded-lg shadow-sm hover:-translate-y-0.5 transition-all"
                title="Gudangkan / Hapus dari Daftar Aset"
              >
                <Archive size={14} />
              </button>
            )}

            <button
              onClick={() => setDeleteId(item.id)}
              disabled={deleteMutation.isPending}
              className="p-1.5 bg-danger-500 text-white rounded-lg shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
              title="Hapus permanen (hanya untuk salah input)"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    ) },
  ];

  const table = useDataTable({
    columns,
    data: dataList,
    tableState,
    pageCount: meta?.last_page,
    rowCount: meta?.total,
    columnVisibility: visibleColumns,
    getRowId: (item) => item.id,
  });

  // Filter lewat state TanStack. Nilai kosong menghapus filter; mengubah filter kembali ke halaman 1.
  const f = getTableFilters(table);
  const [tahunAwal, tahunAkhir] = f.getRange('tahun_pengadaan');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Daftar Inventaris</h1>
          <p className="text-[#808191] text-xs mt-1">Kelola inventaris alat medis</p>
        </div>
        <div className="grid grid-cols-1 md:flex gap-2 md:gap-2 w-full md:w-auto">
          {/* Print All Labels Button */}
          <PrintLabelDropdown
            onSelect={(type) => handlePrintLabelWithType(type)}
            isPrinting={isPrinting}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="gap-2 w-full md:w-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </Button>

          {canManage && (
            <Button
              onClick={() => navigate('/inventaris/baru')}
              size="sm"
              className="gap-2 shadow-lg shadow-brand-primary/20 w-full md:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Inventaris
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          search={
            <Input
              name="search"
              size="sm"
              placeholder="Cari No. Inventaris, Seri..."
              value={f.search}
              onChange={(e) => f.setSearch(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
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
          gridClassName="grid-cols-2 md:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.5fr)]"
        >
          <SearchableSelect
            name="nama_alat"
            size="sm"
            value={f.get('nama_alat')}
            onChange={(e) => f.set('nama_alat', e.target.value)}
            options={[
              { label: 'Semua Alat', value: '' },
              ...(namaAlatData?.data || []).map(item => ({
                label: item.nama_nama_alat,
                value: item.nama_nama_alat
              }))
            ]}
            placeholder="Semua Alat"
            searchPlaceholder="Cari nama alat..."
          />

          <SearchableSelect
            name="kategori_alat_id"
            size="sm"
            value={f.get('kategori_alat')}
            onChange={(e) => f.set('kategori_alat', e.target.value)}
            options={[
              { label: 'Semua Kategori', value: '' },
              ...categories.map(c => ({ label: c.nama_kategori, value: c.id }))
            ]}
            placeholder="Semua Kategori"
            searchPlaceholder="Cari kategori..."
          />

          {/* Divisi Filter - Hide for Admin Divisi */}
          {!isAdminDivisi && (
            <SearchableSelect
              name="divisi_id"
              size="sm"
              value={f.get('divisi')}
              onChange={(e) => f.set('divisi', e.target.value)}
              options={[
                { label: 'Semua Divisi', value: '' },
                ...divisions.map(d => ({ label: d.nama_divisi, value: d.id_divisi }))
              ]}
              placeholder="Semua Divisi"
              searchPlaceholder="Cari divisi..."
            />
          )}

          <SearchableSelect
            name="ruangan_id"
            size="sm"
            value={f.get('ruangan')}
            onChange={(e) => f.set('ruangan', e.target.value)}
            options={[
              { label: 'Semua Ruangan', value: '' },
              ...rooms.map(r => ({ label: r.nama_ruangan, value: r.id_ruangan }))
            ]}
            placeholder="Semua Ruangan"
            searchPlaceholder="Cari ruangan..."
          />

          <SearchableSelect
            name="kondisi_alat"
            size="sm"
            value={f.get('kondisi_alat')}
            onChange={(e) => f.set('kondisi_alat', e.target.value)}
            options={[
              { label: 'Semua Kondisi', value: '' },
              { label: 'Baik', value: 'Baik' },
              { label: 'Rusak Ringan', value: 'Rusak Ringan' },
              { label: 'Rusak Berat', value: 'Rusak Berat' },
              { label: 'Dalam Perbaikan', value: 'Dalam Perbaikan' }
            ]}
            placeholder="Semua Kondisi"
            searchPlaceholder="Cari kondisi..."
          />

          {/* Rentang Tahun Pengadaan: satu filter kolom, dua isian */}
          <div className="grid grid-cols-2 gap-2 col-span-2 md:col-span-1">
            <Input
              type="number"
              size="sm"
              placeholder="Tahun Awal"
              aria-label="Tahun pengadaan awal"
              value={tahunAwal}
              onChange={(e) => f.setRangePart('tahun_pengadaan', 0, e.target.value)}
              className={YEAR_INPUT}
            />
            <Input
              type="number"
              size="sm"
              placeholder="Tahun Akhir"
              aria-label="Tahun pengadaan akhir"
              value={tahunAkhir}
              onChange={(e) => f.setRangePart('tahun_pengadaan', 1, e.target.value)}
              className={YEAR_INPUT}
            />
          </div>
        </FilterBar>

        <DataTable
          table={table}
          isLoading={isLoading}
          skeletonRows={10}
          tableClassName="[&_th]:!px-3 [&_td]:!px-3"
          containerClassName="@container"
          empty={{ icon: Layers, title: 'Tidak ada data inventaris', description: 'Coba ubah filter pencarian Anda' }}
          rowClassName={(item) => (expandedId === item.id ? '!border-b-0' : '')}
          renderSubRow={(item, colCount) => (expandedId === item.id ? (
            <tr key={`detail-${item.id}`}>
              <td colSpan={colCount} className="px-4 !py-0">
                <InventarisRowDetail
                  item={item}
                  closing={closing}
                  onPreviewQr={() => setImagePreview({ isOpen: true, imageUrl: item.qrcode_url, altText: `QR Code - ${item.no_inventaris || ''}` })}
                />
              </td>
            </tr>
          ) : null)}
        />
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Konfirmasi Hapus"
        message="Hapus permanen hanya untuk data salah input dan tidak bisa dibatalkan. Alat yang sudah punya riwayat aduan/pemeliharaan harus digudangkan atau dihapus dari daftar aset. Lanjutkan?"
        confirmText="Ya, Hapus"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {statusItem && (
        <StatusAsetModal
          key={`${statusItem.id}-${statusItem.status_aset}`}
          isOpen
          inventaris={statusItem}
          onClose={() => setStatusItem(null)}
        />
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={imagePreview.isOpen}
        imageUrl={imagePreview.imageUrl}
        altText={imagePreview.altText}
        onClose={() => setImagePreview({ isOpen: false, imageUrl: '', altText: '' })}
      />
    </div>
  );
}

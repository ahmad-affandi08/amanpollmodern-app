import React, { useState } from 'react';
import { useAlatBaru, useApproveAlatBaru, useDeleteAlatBaru } from '../../../hooks/queries/useAlatBaruQueries';
import { useToast } from '../../../hooks';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import DataTable from '../../../components/DataTable';
import FilterBar from '../../../components/FilterBar';
import Input from '../../../components/Input';
import { useTableState, useDataTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import ConfirmDialog from '../../../components/Alert/Alert';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import RisikoBadge from '../../../components/RisikoBadge';
import { CheckCircle, Trash2, Eye, Construction, Search } from 'lucide-react';
import AlatBaruDetailModal from './components/AlatBaruDetailModal';
import noImage from '../../../assets/img/no_image.png';
import { formatDateShort } from '../../../utils/format';

// Hanya pencarian (globalFilter); tidak ada filter kolom.
const FILTER_MAP = {};

export default function AlatBaruList() {
  usePageTitle('Pengajuan Alat Baru');
  const { showToast } = useToast();


  const tableState = useTableState({ pageSize: 10, filterMap: FILTER_MAP });
  const { params } = tableState;


  // `useAlatBaru` mengembalikan satu halaman: { data: baris[], meta }.
  const { data, isLoading, isError, isPlaceholderData } = useAlatBaru(params);

  const items = data?.data ?? [];
  const meta = data?.meta;

  const approveMutation = useApproveAlatBaru();
  const deleteMutation = useDeleteAlatBaru();


  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  const [confirmApprove, setConfirmApprove] = useState({ isOpen: false, id: null });
  const [imagePreview, setImagePreview] = useState({ isOpen: false, imageUrl: '', altText: '' });


  const handleDetail = (item) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleApproveClick = (item) => {
    setDetailModalOpen(false);
    setConfirmApprove({ isOpen: true, id: item.id });
  };

  const handleApproveConfirm = async () => {
    try {
      await approveMutation.mutateAsync(confirmApprove.id);
      showToast('Alat berhasil disetujui dan masuk ke inventaris', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyetujui alat', 'error');
    } finally {
      setConfirmApprove({ isOpen: false, id: null });
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      showToast('Pengajuan alat berhasil dihapus', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus pengajuan', 'error');
    } finally {
      setConfirmDelete({ isOpen: false, id: null });
    }
  };

  const columns = [
    { id: 'foto', header: 'Foto', cell: ({ row: { original: item } }) => (
      <div className="flex items-center justify-center">
        {item.img_alat_baru_url ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-primary" style={{ minWidth: '48px', minHeight: '48px', width: '48px', height: '48px' }}>
            <img
              src={item.img_alat_baru_url}
              alt={item.nama_alat?.nama_nama_alat || 'Foto alat'}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = noImage; }}
              onClick={() => setImagePreview({
                isOpen: true,
                imageUrl: item.img_alat_baru_url,
                altText: `Foto Alat - ${item.nama_alat?.nama_nama_alat || ''}`
              })}
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
    { id: 'nama_alat', header: 'Nama Alat', cell: ({ row: { original: item } }) => (
      <>
        <div className="text-xs font-bold text-text-dark">{item.nama_alat?.nama_nama_alat || '-'}</div>
        <div className="text-[10px] text-text-gray">{item.merk} - {item.model}</div>
        <div className="mt-1">
          <RisikoBadge tingkat={item.nama_alat?.tingkat_risiko} skor={item.nama_alat?.skor_risiko} size="sm" />
        </div>
      </>
    ) },
    { id: 'ruangan', header: 'Ruangan', cell: ({ row }) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
        {row.original.ruangan?.nama_ruangan || '-'}
      </span>
    ) },
    { id: 'tgl_pengajuan', header: 'Tgl Pengajuan', cell: ({ row }) => formatDateShort(row.original.create_date), meta: { cellClassName: 'text-xs text-text-gray' } },
    { id: 'actions', header: 'Aksi', meta: { align: 'right' }, cell: ({ row: { original: item } }) => (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => handleDetail(item)}
          className="p-2 bg-blue-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
          title="Lihat Detail"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => handleApproveClick(item)}
          disabled={approveMutation.isPending || deleteMutation.isPending || !item.nama_alat?.tingkat_risiko}
          className="p-2 bg-green-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
          title={item.nama_alat?.tingkat_risiko ? 'Setujui' : 'Nilai risiko jenis alat ini dulu di menu Register Risiko'}
        >
          <CheckCircle size={16} />
        </button>
        <button
          onClick={() => handleDeleteClick(item.id)}
          disabled={approveMutation.isPending || deleteMutation.isPending}
          className="p-2 bg-danger-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
          title="Hapus"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ) },
  ];

  const table = useDataTable({
    columns,
    data: items,
    tableState,
    pageCount: meta?.last_page,
    rowCount: meta?.total,
    getRowId: (item) => item.id,
  });

  const f = getTableFilters(table);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Pengajuan Alat Baru</h1>
          <p className="text-text-gray text-xs mt-1">Daftar alat yang diajukan oleh user ruangan</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          search={
            <Input
              name="search"
              size="sm"
              placeholder="Cari nama alat..."
              icon={<Search className="w-3.5 h-3.5" />}
              value={f.search}
              onChange={(e) => f.setSearch(e.target.value)}
              className="!bg-white"
            />
          }
        />

        <DataTable
          table={table}
          isLoading={isLoading}
          error={isError ? { title: 'Gagal memuat data pengajuan', description: 'Periksa koneksi Anda lalu muat ulang halaman' } : undefined}
          skeletonRows={5}
          containerClassName={`transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}
          empty={{ icon: Construction, title: 'Tidak ada pengajuan alat baru', description: 'Belum ada data yang masuk / ditemukan' }}
        />
      </div>

      {/* Modals */}
      <AlatBaruDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        data={selectedItem}
        onApprove={handleApproveClick}
      />

      <ConfirmDialog
        isOpen={confirmApprove.isOpen}
        title="Setujui Alat Baru?"
        message="Alat ini akan dipindahkan ke inventaris utama dan muncul di daftar inventaris ruangan terkait."
        confirmText="Ya, Setujui"
        type="success"
        onConfirm={handleApproveConfirm}
        onCancel={() => setConfirmApprove({ isOpen: false, id: null })}
      />

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Pengajuan?"
        message="Data pengajuan ini akan dihapus permanen."
        confirmText="Ya, Hapus"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />

      <ImagePreviewModal
        isOpen={imagePreview.isOpen}
        imageUrl={imagePreview.imageUrl}
        altText={imagePreview.altText}
        onClose={() => setImagePreview({ isOpen: false, imageUrl: '', altText: '' })}
      />
    </div>
  );
}

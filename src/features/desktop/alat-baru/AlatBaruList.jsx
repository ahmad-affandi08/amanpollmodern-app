import React, { useState, useEffect } from 'react';
import { useAlatBaru, useApproveAlatBaru, useDeleteAlatBaru } from '../../../hooks/queries/useAlatBaruQueries';
import { useToast, useFilters, useDebounce, usePagination } from '../../../hooks';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Pagination from '../../../components/Pagination';
import TableSkeleton from '../../../components/TableSkeleton';
import ConfirmDialog from '../../../components/Alert/Alert';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import { CheckCircle, Trash2, Eye, Construction, Search, Plus } from 'lucide-react';
import AlatBaruDetailModal from './components/AlatBaruDetailModal';
import noImage from '../../../assets/img/no_image.png';

export default function AlatBaruList() {
  usePageTitle('Pengajuan Alat Baru');
  const { showToast } = useToast();

  // Filters & Pagination
  const pagination = usePagination(10);
  const { filters, updateFilter, resetFilters } = useFilters({
    search: '',
  });
  const debouncedSearch = useDebounce(filters.search, 500);

  // Queries
  const { data, isLoading, isError } = useAlatBaru({
    search: debouncedSearch,
    page: pagination.currentPage,
    per_page: pagination.perPage
  });

  const approveMutation = useApproveAlatBaru();
  const deleteMutation = useDeleteAlatBaru();

  // State
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  const [confirmApprove, setConfirmApprove] = useState({ isOpen: false, id: null });
  const [imagePreview, setImagePreview] = useState({ isOpen: false, imageUrl: '', altText: '' });

  // Extract Data
  const items = data?.pages || [];

  // Handlers
  const handleDetail = (item) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleApproveClick = (item) => {
    setDetailModalOpen(false);
    setConfirmApprove({ isOpen: true, id: item.id || item.id_alat_baru });
  };

  const handleApproveConfirm = async () => {
    try {
      await approveMutation.mutateAsync(confirmApprove.id);
      showToast('Alat berhasil disetujui dan masuk ke inventaris', 'success');
      setConfirmApprove({ isOpen: false, id: null });
    } catch (error) {
      showToast('Gagal menyetujui alat', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      showToast('Pengajuan alat berhasil dihapus', 'success');
      setConfirmDelete({ isOpen: false, id: null });
    } catch (error) {
      showToast('Gagal menghapus pengajuan', 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Pengajuan Alat Baru</h1>
          <p className="text-[#808191] text-sm mt-1">Daftar alat yang diajukan oleh user ruangan</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        {/* Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#808191] w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama alat..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-bg-light border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Foto</th>
                <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Nama Alat</th>
                <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Ruangan</th>
                <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Tgl Pengajuan</th>
                <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <TableSkeleton columns={5} rows={5} />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <Construction size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="font-bold text-gray-600">Tidak ada pengajuan alat baru</p>
                    <p className="text-sm text-gray-400 mt-1">Belum ada data yang masuk / ditemukan</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id || item.id_alat_baru} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        {item.img_alat_baru_url ? (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-brand-primary" style={{ minWidth: '80px', minHeight: '80px', width: '80px', height: '80px' }}>
                            <img
                              src={item.img_alat_baru_url}
                              alt="alat"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = noImage; }}
                              onClick={() => setImagePreview({
                                isOpen: true,
                                imageUrl: item.img_alat_baru_url,
                                altText: `Foto Alat - ${item.nama_alat?.nama_nama_alat}`
                              })}
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200" style={{ minWidth: '80px', minHeight: '80px' }}>
                            <img
                              src={noImage}
                              alt="No Image"
                              className="w-full h-full object-cover opacity-50"
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-text-dark">{item.nama_alat?.nama_nama_alat || '-'}</div>
                      <div className="text-xs text-text-gray">{item.merk} - {item.model}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {item.ruangan?.nama_ruangan || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-gray">
                      {item.create_date
                        ? new Date(item.create_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleDetail(item)}
                          className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                          title="Lihat Detail"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => handleApproveClick(item)}
                          className="p-3 bg-green-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                          title="Setujui"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id || item.id_alat_baru)}
                          className="p-3 bg-danger-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
        type="error"
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

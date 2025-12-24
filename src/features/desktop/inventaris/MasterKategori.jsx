import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Layers } from 'lucide-react';
import {
  useMasterKategori,
  useCreateKategori,
  useUpdateKategori,
  useDeleteKategori,
  useDebounce,
  useModal,
  usePageTitle,
} from '../../../hooks';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Modal from '../../../components/Modal';
import { ConfirmDialog, Toast } from '../../../components/Alert/Alert';
import Pagination from '../../../components/Pagination';
import TableSkeleton from '../../../components/TableSkeleton';

export default function MasterKategori() {
  usePageTitle('Master Kategori');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const debouncedSearch = useDebounce(searchTerm, 300);
  const modal = useModal();

  const [formData, setFormData] = useState({
    kode_kategori_alat: '',
    nama_kategori: ''
  });

  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  // Queries
  const { data: kategoriData, isLoading } = useMasterKategori({ all: 1 });

  // Mutations
  const createMutation = useCreateKategori();
  const updateMutation = useUpdateKategori();
  const deleteMutation = useDeleteKategori();

  // Extract data
  const categories = kategoriData?.data || kategoriData || [];

  // Filter data
  const filteredCategories = categories.filter(cat =>
    cat.nama_kategori?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    cat.kode_kategori_alat?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleOpenCreate = () => {
    setFormData({ kode_kategori_alat: '', nama_kategori: '' });
    modal.open();
  };

  const handleOpenEdit = (category) => {
    setFormData({
      kode_kategori_alat: category.kode_kategori_alat,
      nama_kategori: category.nama_kategori
    });
    modal.open(category);
  };

  const handleDeleteClick = (category) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Kategori',
      message: `Apakah Anda yakin ingin menghapus kategori "${category.nama_kategori}"?`,
      type: 'error',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(category.id);
          setToast({ type: 'success', message: 'Kategori berhasil dihapus' });
          setConfirmDialog({ isOpen: false });
        } catch (error) {
          setToast({ type: 'error', message: 'Gagal menghapus kategori. Mungkin data sedang digunakan.' });
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.data?.id) {
        await updateMutation.mutateAsync({ id: modal.data.id, data: formData });
        setToast({ type: 'success', message: 'Kategori berhasil diperbarui' });
      } else {
        await createMutation.mutateAsync(formData);
        setToast({ type: 'success', message: 'Kategori berhasil ditambahkan' });
      }
      modal.close();
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
      setToast({ type: 'error', message: msg });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Ya, Hapus"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false })}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Master Kategori Alat</h1>
          <p className="text-text-gray text-sm mt-1">Kelola kategori inventaris rumah sakit</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 shadow-lg shadow-brand-primary/20">
          <Plus size={18} />
          <span>Tambah Kategori</span>
        </Button>
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari kategori..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-light border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">No</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Kode</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Nama Kategori</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <Layers size={32} className="mx-auto text-gray-400 mb-4" />
                    <p className="font-bold text-gray-600">Belum ada data kategori</p>
                    <p className="text-sm text-gray-400 mt-1">Silakan tambahkan kategori baru</p>
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className="px-3 py-1 rounded-md bg-purple-50 text-brand-primary font-bold">{category.kode_kategori_alat}</span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-text-dark">{category.nama_kategori}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleOpenEdit(category)} className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all">
                          <Edit2 size={20} />
                        </button>
                        <button onClick={() => handleDeleteClick(category)} className="p-3 bg-danger-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all" disabled={deleteMutation.isPending}>
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

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        footer={
          <>
            <Button variant="ghost" onClick={modal.close} disabled={createMutation.isPending || updateMutation.isPending}>Batal</Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
              {modal.data ? 'Perbarui Data' : 'Simpan Data'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Kode Kategori"
            value={formData.kode_kategori_alat}
            onChange={(e) => setFormData({ ...formData, kode_kategori_alat: e.target.value })}
            placeholder="Contoh: ELK"
            required
            autoFocus
          />
          <Input
            label="Nama Kategori"
            value={formData.nama_kategori}
            onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })}
            placeholder="Contoh: Elektronik"
            required
          />
        </form>
      </Modal>
    </div>
  );
}

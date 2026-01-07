import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Search, Building2 } from 'lucide-react';
import {
  useMasterDivisi,
  useCreateDivisi,
  useUpdateDivisi,
  useDeleteDivisi,
  useToast,
  usePagination,
  useDebounce,
  useModal,
  usePageTitle,
} from '../../../../hooks';
import Button from '../../../../components/Button';
import Modal from '../../../../components/Modal';
import Input from '../../../../components/Input';
import Pagination from '../../../../components/Pagination';
import TableSkeleton from '../../../../components/TableSkeleton';
import ConfirmDialog from '../../../../components/Alert/Alert';

export default function MasterDivisi() {
  usePageTitle('Master Divisi');
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const pagination = usePagination(10);
  const modal = useModal();
  const [formData, setFormData] = useState({ nama_divisi: '' });

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Queries
  const { data: divisiData, isLoading } = useMasterDivisi({
    page: pagination.currentPage,
    per_page: pagination.perPage,
    search: debouncedSearch
  });

  // Mutations
  const createMutation = useCreateDivisi();
  const updateMutation = useUpdateDivisi();
  const deleteMutation = useDeleteDivisi();

  // Extract data
  const data = divisiData?.data || [];
  const meta = divisiData?.meta;

  // Update pagination
  useEffect(() => {
    if (meta) pagination.setMetadata(meta);
  }, [meta]);

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.data?.id_divisi) {
        await updateMutation.mutateAsync({ id: modal.data.id_divisi, data: formData });
        showToast('Divisi berhasil diperbarui', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Divisi berhasil ditambahkan', 'success');
      }
      modal.close();
    } catch (error) {
      showToast('Gagal menyimpan data', 'error');
    }
  };

  const openAddModal = () => {
    setFormData({ nama_divisi: '' });
    modal.open();
  };

  const openEditModal = (item) => {
    setFormData({ nama_divisi: item.nama_divisi });
    modal.open(item);
  };

  const handleDelete = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Divisi',
      message: `Apakah Anda yakin ingin menghapus divisi "${item.nama_divisi}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        try {
          await deleteMutation.mutateAsync(item.id_divisi);
          showToast('Divisi berhasil dihapus', 'success');
        } catch (error) {
          showToast('Gagal menghapus divisi', 'error');
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
    });
  };

  return (
    <div className="space-y-6 animate-fade-in font-[Plus_Jakarta_Sans]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Master Divisi</h1>
          <p className="text-text-gray text-sm mt-1">Kelola data divisi/unit kerja di RSUD.</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 shadow-lg shadow-brand-primary/20">
          <Plus size={18} />
          <span>Tambah Divisi</span>
        </Button>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        <div className="mb-6 flex items-center gap-3 bg-bg-light p-4 rounded-2xl border border-gray-100">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari divisi..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); pagination.reset(); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 mb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-light border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">No</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase w-full">Nama Divisi</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <TableSkeleton rows={5} columns={3} />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center">
                    <Building2 size={32} className="mx-auto text-gray-400 mb-4" />
                    <p className="font-bold text-gray-600">Belum ada data divisi</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_divisi} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium">{(pagination.currentPage - 1) * pagination.perPage + index + 1}</td>
                    <td className="py-4 px-6 font-bold text-text-dark">{item.nama_divisi}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openEditModal(item)} className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all">
                          <Edit2 size={20} />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-3 bg-danger-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all" disabled={deleteMutation.isPending}>
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

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          totalData={pagination.totalItems}
        />
      </div>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title={modal.data ? "Edit Divisi" : "Tambah Divisi Baru"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Nama Divisi" placeholder="Contoh: IT, Keuangan, IGD" value={formData.nama_divisi} onChange={(e) => setFormData({ ...formData, nama_divisi: e.target.value })} required />
          <div className="flex justify-end pt-4">
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="w-full">
              {modal.data ? 'Simpan Perubahan' : 'Simpan Divisi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
        type="danger"
      />
    </div>
  );
}

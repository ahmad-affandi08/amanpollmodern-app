import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Search, DoorOpen } from 'lucide-react';
import {
  useMasterRuangan,
  useCreateRuangan,
  useUpdateRuangan,
  useDeleteRuangan,
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

export default function MasterRuangan() {
  usePageTitle('Master Ruangan');
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const pagination = usePagination(10);
  const modal = useModal();

  const [formData, setFormData] = useState({
    nama_ruangan: '',
    kode_ruangan: ''
  });

  // Queries
  const { data: ruanganData, isLoading } = useMasterRuangan({
    page: pagination.currentPage,
    per_page: pagination.perPage,
    search: debouncedSearch
  });

  // Mutations
  const createMutation = useCreateRuangan();
  const updateMutation = useUpdateRuangan();
  const deleteMutation = useDeleteRuangan();

  // Extract data
  const data = ruanganData?.data || [];
  const meta = ruanganData?.meta;

  // Update pagination
  useEffect(() => {
    if (meta) pagination.setMetadata(meta);
  }, [meta]);

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.data?.id_ruangan) {
        await updateMutation.mutateAsync({
          id: modal.data.id_ruangan,
          data: formData
        });
        showToast('Ruangan berhasil diperbarui', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Ruangan berhasil ditambahkan', 'success');
      }
      modal.close();
    } catch (error) {
      showToast('Gagal menyimpan data', 'error');
    }
  };

  const openAddModal = () => {
    setFormData({ nama_ruangan: '', kode_ruangan: '' });
    modal.open();
  };

  const openEditModal = (item) => {
    setFormData({
      nama_ruangan: item.nama_ruangan,
      kode_ruangan: item.kode_ruangan || ''
    });
    modal.open(item);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus ruangan ini?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast('Ruangan dihapus', 'success');
    } catch (error) {
      showToast('Gagal menghapus', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-[Plus_Jakarta_Sans]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Master Ruangan</h1>
          <p className="text-text-gray text-sm mt-1">Kelola data ruangan/bagian di RSUD.</p>
        </div>
        <Button
          onClick={openAddModal}
          className="flex items-center gap-2 shadow-lg shadow-brand-primary/20 bg-gray-900 hover:bg-black/90 text-white"
        >
          <Plus size={18} />
          <span>Tambah Ruangan</span>
        </Button>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-3 bg-bg-light p-4 rounded-2xl border border-gray-100">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari ruangan atau kode..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                pagination.reset();
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 mb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-light border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">No</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Kode</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase w-full">Nama Ruangan</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <DoorOpen size={32} className="mx-auto text-gray-400 mb-4" />
                    <p className="font-bold text-gray-600">Belum ada data ruangan</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_ruangan} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium">
                      {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-text-gray">
                      {item.kode_ruangan || '-'}
                    </td>
                    <td className="py-4 px-6 font-bold text-text-dark">{item.nama_ruangan}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_ruangan)}
                          className="p-3 bg-danger-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                          disabled={deleteMutation.isPending}
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

        {/* Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          totalData={pagination.totalItems}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data ? "Edit Ruangan" : "Tambah Ruangan Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nama Ruangan"
            placeholder="Contoh: Poli Mata, Dahlia 1"
            value={formData.nama_ruangan}
            onChange={(e) => setFormData({ ...formData, nama_ruangan: e.target.value })}
            required
          />
          <Input
            label="Kode Ruangan (Opsional)"
            placeholder="Contoh: R001"
            value={formData.kode_ruangan}
            onChange={(e) => setFormData({ ...formData, kode_ruangan: e.target.value })}
          />
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              className="w-full"
            >
              {modal.data ? 'Simpan Perubahan' : 'Simpan Ruangan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Layers } from 'lucide-react';
import {
  useMasterKategori,
  useCreateKategori,
  useUpdateKategori,
  useDeleteKategori,
  useModal,
  usePageTitle,
  useToast,
} from '../../../hooks';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Modal from '../../../components/Modal';
import ConfirmDialog from '../../../components/Alert/Alert';
import DataTable from '../../../components/DataTable';
import FilterBar from '../../../components/FilterBar';
import { useLocalTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import { indexColumn } from '../../../utils/tableColumns';

export default function MasterKategori() {
  usePageTitle('Master Kategori');
  const modal = useModal();

  const [formData, setFormData] = useState({
    kode_kategori_alat: '',
    nama_kategori: ''
  });

  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);


  const { data: kategoriData, isLoading } = useMasterKategori({ all: 1 });


  const createMutation = useCreateKategori();
  const updateMutation = useUpdateKategori();
  const deleteMutation = useDeleteKategori();


  const categories = kategoriData?.data || kategoriData || [];


  const isSaving = createMutation.isPending || updateMutation.isPending;


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

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast('Kategori berhasil dihapus', 'success');
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Gagal menghapus kategori. Mungkin data sedang digunakan.',
        'error'
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    try {
      if (modal.data?.id) {
        await updateMutation.mutateAsync({ id: modal.data.id, data: formData });
        showToast('Kategori berhasil diperbarui', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Kategori berhasil ditambahkan', 'success');
      }
      modal.close();
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
      showToast(msg, 'error');
    }
  };

  const columns = [
    indexColumn(),
    { id: 'kode_kategori_alat', header: 'Kode', cell: ({ row }) => (
      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-brand-primary font-bold text-xs">{row.original.kode_kategori_alat}</span>
    ) },
    { id: 'nama_kategori', header: 'Nama Kategori', cell: ({ row }) => row.original.nama_kategori, meta: { cellClassName: 'font-bold text-text-dark' } },
    { id: 'actions', header: 'Aksi', meta: { align: 'right' }, cell: ({ row: { original: category } }) => (
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => handleOpenEdit(category)} className="p-2 bg-brand-primary text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all" title="Edit">
          <Edit2 size={16} />
        </button>
        <button onClick={() => setDeleteTarget(category)} className="p-2 bg-danger-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all" title="Hapus" disabled={deleteMutation.isPending}>
          <Trash2 size={16} />
        </button>
      </div>
    ) },
  ];

  const table = useLocalTable({
    columns,
    data: categories,
    pageSize: 8,
    getRowId: (category) => category.id,
    matchSearch: (cat, q) =>
      cat.nama_kategori?.toLowerCase().includes(q) ||
      cat.kode_kategori_alat?.toLowerCase().includes(q),
  });
  const f = getTableFilters(table);

  return (
    <div className="space-y-6 animate-fade-in">
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.nama_kategori ?? ''}"?`}
        type="danger"
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Master Kategori Alat</h1>
          <p className="text-text-gray text-xs mt-1">Kelola kategori inventaris rumah sakit</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 shadow-lg shadow-brand-primary/20">
          <Plus size={16} />
          <span>Tambah Kategori</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          search={
            <Input
              name="search"
              size="sm"
              placeholder="Cari kategori..."
              value={f.search}
              onChange={(e) => f.setSearch(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
              className="!bg-white"
            />
          }
        />

        <DataTable
          table={table}
          isLoading={isLoading}
          empty={{ icon: Layers, title: 'Belum ada data kategori', description: 'Silakan tambahkan kategori baru' }}
        />
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        footer={
          <>
            <Button variant="ghost" onClick={modal.close} disabled={isSaving}>Batal</Button>
            <Button type="submit" form="form-kategori" loading={isSaving}>
              {modal.data ? 'Perbarui Data' : 'Simpan Data'}
            </Button>
          </>
        }
      >
        <form id="form-kategori" onSubmit={handleSubmit} className="space-y-6">
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

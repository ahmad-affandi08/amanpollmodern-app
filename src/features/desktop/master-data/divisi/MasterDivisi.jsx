import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Search, Building2 } from 'lucide-react';
import {
  useMasterDivisi,
  useCreateDivisi,
  useUpdateDivisi,
  useDeleteDivisi,
  useToast,
  useModal,
  usePageTitle,
} from '../../../../hooks';
import Button from '../../../../components/Button';
import Modal from '../../../../components/Modal';
import Input from '../../../../components/Input';
import DataTable from '../../../../components/DataTable';
import FilterBar from '../../../../components/FilterBar';
import { indexColumn } from '../../../../utils/tableColumns';
import { useTableState, useDataTable, getTableFilters } from '../../../../hooks/utils/useServerTable';
import ConfirmDialog from '../../../../components/Alert/Alert';
import useConfirmAction from '../useConfirmAction';

// Hanya pencarian (parameter `search`); tidak ada filter kolom.
const FILTER_MAP = {};

export default function MasterDivisi() {
  usePageTitle('Master Divisi');
  const { showToast } = useToast();
  // Pencarian & pagination ada di state TanStack; `params` (search, page, per_page) dikirim ke server.
  const tableState = useTableState({ pageSize: 10, filterMap: FILTER_MAP, searchDelay: 500 });
  const modal = useModal();
  const [formData, setFormData] = useState({ nama_divisi: '' });

  const { askConfirm, dialogProps } = useConfirmAction();

  const { data: divisiData, isLoading } = useMasterDivisi(tableState.params);

  const createMutation = useCreateDivisi();
  const updateMutation = useUpdateDivisi();
  const deleteMutation = useDeleteDivisi();

  const data = divisiData?.data || [];
  const meta = divisiData?.meta;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.data?.id_divisi) {
        await updateMutation.mutateAsync({ id: modal.data.id_divisi, data: formData });
        showToast('Divisi berhasil diperbarui', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        tableState.handlers.onPaginationChange((p) => ({ ...p, pageIndex: 0 }));
        showToast('Divisi berhasil ditambahkan', 'success');
      }
      modal.close();
    } catch {
      showToast('Gagal menyimpan data. Periksa kembali isian Anda.', 'error');
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
    askConfirm({
      title: 'Hapus Divisi',
      message: `Apakah Anda yakin ingin menghapus divisi "${item.nama_divisi}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(item.id_divisi);
          showToast('Divisi berhasil dihapus', 'success');
        } catch {
          showToast('Gagal menghapus divisi. Kemungkinan masih dipakai oleh data lain.', 'error');
        }
      },
    });
  };

  const columns = [
    indexColumn(),
    { id: 'nama_divisi', header: 'Nama Divisi', cell: ({ row }) => row.original.nama_divisi, meta: { headerClassName: 'w-full', cellClassName: 'font-bold text-text-dark' } },
    { id: 'actions', header: 'Aksi', meta: { align: 'right' }, cell: ({ row: { original: item } }) => (
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => openEditModal(item)} className="p-2 bg-brand-primary text-white rounded-xl shadow-md hover:-translate-y-0.5 transition-all">
          <Edit2 size={14} />
        </button>
        <button onClick={() => handleDelete(item)} className="p-2 bg-danger-500 text-white rounded-xl shadow-md hover:-translate-y-0.5 transition-all" disabled={deleteMutation.isPending}>
          <Trash2 size={14} />
        </button>
      </div>
    ) },
  ];

  const table = useDataTable({
    columns,
    data,
    tableState,
    pageCount: meta?.last_page,
    rowCount: meta?.total,
    getRowId: (item) => item.id_divisi,
  });
  const f = getTableFilters(table);

  return (
    <div className="space-y-6 animate-fade-in font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Master Divisi</h1>
          <p className="text-text-gray text-xs mt-1">Kelola data divisi/unit kerja di RSUD.</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-1.5 shadow-lg shadow-brand-primary/20">
          <Plus size={16} />
          <span>Tambah Divisi</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          search={
            <Input
              name="search"
              size="sm"
              placeholder="Cari divisi..."
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
          empty={{ icon: Building2, title: 'Belum ada data divisi' }}
        />
      </div>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title={modal.data ? "Edit Divisi" : "Tambah Divisi Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Divisi" placeholder="Contoh: IT, Keuangan, IGD" value={formData.nama_divisi} onChange={(e) => setFormData({ ...formData, nama_divisi: e.target.value })} required />
          <div className="flex justify-end pt-3">
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="w-full">
              {modal.data ? 'Simpan Perubahan' : 'Simpan Divisi'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

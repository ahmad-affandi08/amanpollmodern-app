import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Tag, Users } from 'lucide-react';
import {
  useMasterNamaAlat,
  useCreateNamaAlat,
  useUpdateNamaAlat,
  useDeleteNamaAlat,
  useMasterKategori,
  useMasterDivisi,
  useDebounce,
  useModal,
  usePageTitle,
  useToast,
} from '../../../hooks';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Modal from '../../../components/Modal';
import ConfirmDialog from '../../../components/Alert/Alert';
import SearchableSelect from '../../../components/SearchableSelect';
import Pagination from '../../../components/Pagination';
import ChecklistMaintenanceModal from './components/ChecklistMaintenanceModal';
import TableSkeleton from '../../../components/TableSkeleton';

export default function MasterNamaAlat() {
  usePageTitle('Master Nama Alat');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const debouncedSearch = useDebounce(searchTerm, 300);
  const modal = useModal();
  const checklistModal = useModal();

  const [formData, setFormData] = useState({
    nama_nama_alat: '',
    standar_usia_pakai: '',
    kategori_alat_id: '',
    divisi_id: ''
  });

  const { showToast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  // Queries
  const { data: namaAlatData, isLoading } = useMasterNamaAlat({ all: 1 });
  const { data: kategoriData } = useMasterKategori({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });

  // Mutations
  const createMutation = useCreateNamaAlat();
  const updateMutation = useUpdateNamaAlat();
  const deleteMutation = useDeleteNamaAlat();

  // Extract data
  const dataList = namaAlatData?.data || namaAlatData || [];
  const categories = kategoriData?.data || kategoriData || [];
  const divisions = divisiData?.data || divisiData || [];

  // Filter data
  const filteredData = dataList.filter(item =>
    item.nama_nama_alat?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    item.kategori_alat?.nama_kategori?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleOpenCreate = () => {
    setFormData({
      nama_nama_alat: '',
      standar_usia_pakai: '',
      kategori_alat_id: '',
      divisi_id: ''
    });
    modal.open();
  };

  const handleOpenEdit = (item) => {
    setFormData({
      nama_nama_alat: item.nama_nama_alat,
      standar_usia_pakai: item.standar_usia_pakai,
      kategori_alat_id: item.kategori_alat_id || item.kategori_alat?.id_kategori_alat || '',
      divisi_id: item.divisi_id || item.divisi?.id_divisi || ''
    });
    modal.open(item);
  };

  const handleDeleteClick = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Nama Alat',
      message: `Apakah Anda yakin ingin menghapus "${item.nama_nama_alat}"?`,
      type: 'error',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(item.id);
          showToast('Data berhasil dihapus', 'success');
          setConfirmDialog({ isOpen: false });
        } catch (error) {
          showToast('Gagal menghapus data. Mungkin sedang digunakan.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean data: convert empty strings to null for nullable fields
      const cleanedData = {
        nama_nama_alat: formData.nama_nama_alat,
        standar_usia_pakai: parseInt(formData.standar_usia_pakai) || 0,
        kategori_alat_id: formData.kategori_alat_id ? parseInt(formData.kategori_alat_id) : null,
        divisi_id: formData.divisi_id ? parseInt(formData.divisi_id) : null,
      };

      if (modal.data?.id) {
        await updateMutation.mutateAsync({ id: modal.data.id, data: cleanedData });
        showToast('Data berhasil diperbarui', 'success');
      } else {
        await createMutation.mutateAsync(cleanedData);
        showToast('Data berhasil ditambahkan', 'success');
      }
      modal.close();
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
      showToast(msg, 'error');
      console.error('Validation errors:', error.response?.data);
    }
  };

  // Prepare options
  const categoryOptions = categories.map(cat => ({
    value: cat.id_kategori_alat || cat.id,
    label: cat.nama_kategori
  }));

  const divisionOptions = divisions.map(div => ({
    value: div.id_divisi || div.id,
    label: div.nama_divisi
  }));

  return (
    <div className="space-y-6 animate-fade-in">

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
          <h1 className="text-2xl font-bold text-text-dark">Master Nama Alat</h1>
          <p className="text-text-gray text-sm mt-1">Standarisasi nama alat dan masa pakai</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 shadow-lg shadow-brand-primary/20">
          <Plus size={18} />
          <span>Tambah Nama Alat</span>
        </Button>
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama alat..."
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
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Nama Alat</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Kategori</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Divisi</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Checklist</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Usia Pakai</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <Package size={32} className="mx-auto text-gray-400 mb-4" />
                    <p className="font-bold text-gray-600">Belum ada data</p>
                    <p className="text-sm text-gray-400 mt-1">Silakan tambahkan nama alat baru</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="py-4 px-6 text-sm font-bold text-text-dark">{item.nama_nama_alat}</td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-brand-primary" />
                        <span className="font-semibold">{item.kategori_alat?.nama_kategori || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#FF754C]" />
                        <span className="font-semibold">{item.divisi?.nama_divisi || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <button
                        onClick={() => checklistModal.open(item)}
                        className="text-brand-primary hover:text-brand-primary-light font-bold underline"
                      >
                        Detail
                      </button>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold">{item.standar_usia_pakai} Tahun</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleOpenEdit(item)} className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all">
                          <Edit2 size={20} />
                        </button>
                        <button onClick={() => handleDeleteClick(item)} className="p-3 bg-danger-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all" disabled={deleteMutation.isPending}>
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
        title={modal.data ? 'Edit Nama Alat' : 'Tambah Nama Alat'}
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
            label="Nama Alat"
            value={formData.nama_nama_alat}
            onChange={(e) => setFormData({ ...formData, nama_nama_alat: e.target.value })}
            placeholder="Contoh: Infusion Pump"
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-dark mb-2">Kategori</label>
              <SearchableSelect
                name="kategori_alat_id"
                options={categoryOptions}
                value={formData.kategori_alat_id}
                onChange={(e) => setFormData({ ...formData, kategori_alat_id: e.target.value })}
                placeholder="Pilih Kategori"
                searchPlaceholder="Cari kategori..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-dark mb-2">Divisi</label>
              <SearchableSelect
                name="divisi_id"
                options={divisionOptions}
                value={formData.divisi_id}
                onChange={(e) => setFormData({ ...formData, divisi_id: e.target.value })}
                placeholder="Pilih Divisi"
                searchPlaceholder="Cari divisi..."
              />
            </div>
          </div>
          <Input
            label="Standar Usia Pakai (Tahun)"
            type="number"
            value={formData.standar_usia_pakai}
            onChange={(e) => setFormData({ ...formData, standar_usia_pakai: e.target.value })}
            placeholder="Contoh: 5"
            required
          />
        </form>
      </Modal>

      <ChecklistMaintenanceModal
        isOpen={checklistModal.isOpen}
        onClose={checklistModal.close}
        toolData={checklistModal.data}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Search, Users } from 'lucide-react';
import {
  useMasterUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useMasterDivisi,
  useMasterRuangan,
  useToast,
  usePagination,
  useDebounce,
  useModal,
  usePageTitle,
} from '../../../../hooks';
import Button from '../../../../components/Button';
import Modal from '../../../../components/Modal';
import Input from '../../../../components/Input';
import Select from '../../../../components/Select';
import Pagination from '../../../../components/Pagination';
import TableSkeleton from '../../../../components/TableSkeleton';
import ConfirmDialog from '../../../../components/Alert/Alert';
import MasterApi from '../../../../api/MasterApi';

export default function MasterUser() {
  usePageTitle('Master User');
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const pagination = usePagination(10);
  const modal = useModal();


  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    email: '',
    password: '',
    wa: '',
    kategori_user_id: '',
    divisi_id: '',
    ruangan_id: '',
    active: true
  });


  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });


  const [kategoriOptions, setKategoriOptions] = useState([]);


  const { data: usersData, isLoading, refetch } = useMasterUsers({
    page: pagination.currentPage,
    per_page: pagination.perPage,
    search: debouncedSearch
  });

  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const { data: ruanganData } = useMasterRuangan({ all: 1 });


  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();


  const data = usersData?.data || [];
  const meta = usersData?.meta;


  useEffect(() => {
    if (meta) pagination.setMetadata(meta);
  }, [meta]);


  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await MasterApi.getAllKategoriUser();
        if (Array.isArray(res.data)) {
          setKategoriOptions(res.data.map(k => ({
            label: k.display_kategori,
            value: k.id_kategori_user
          })));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchKategori();
  }, []);


  const divisiOptions = (divisiData?.data || []).map(d => ({
    label: d.nama_divisi,
    value: d.id_divisi
  }));

  const ruanganOptions = (ruanganData?.data || []).map(r => ({
    label: r.nama_ruangan,
    value: r.id_ruangan
  }));


  const handleToggleStatus = (item) => {
    const newStatus = !item.active;
    setConfirmDialog({
      isOpen: true,
      title: `${newStatus ? 'Aktifkan' : 'Nonaktifkan'} User`,
      message: `Apakah Anda yakin ingin ${newStatus ? 'mengaktifkan' : 'menonaktifkan'} user "${item.nama_lengkap}"?`,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        try {
          await MasterApi.toggleUserStatus(item.id_user, newStatus);
          showToast(`Status user berhasil diubah menjadi ${newStatus ? 'Active' : 'Inactive'}`, 'success');
          refetch();
        } catch (error) {
          console.error('Error toggling user status:', error);
          showToast('Gagal mengubah status user', 'error');
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.data?.id_user) {
        await updateMutation.mutateAsync({
          id: modal.data.id_user,
          data: formData
        });
        showToast('User berhasil diperbarui', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('User berhasil ditambahkan', 'success');
      }
      modal.close();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan data', 'error');
    }
  };

  const openAddModal = () => {
    setFormData({
      nama_lengkap: '',
      username: '',
      email: '',
      password: '',
      wa: '',
      kategori_user_id: '',
      divisi_id: '',
      ruangan_id: '',
      active: true
    });
    modal.open();
  };

  const openEditModal = (item) => {
    setFormData({
      nama_lengkap: item.nama_lengkap,
      username: item.username,
      email: item.email,
      password: '',
      wa: item.wa || '',
      kategori_user_id: item.kategori_user_id,
      roleName: item.role,
      divisi_id: item.divisi_id || '',
      ruangan_id: item.ruangan_id || '',
      active: item.active
    });
    modal.open(item);
  };

  const handleDelete = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus User',
      message: `Apakah Anda yakin ingin menghapus user "${item.nama_lengkap}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        try {
          await deleteMutation.mutateAsync(item.id_user);
          showToast('User berhasil dihapus', 'success');
        } catch (error) {
          showToast('Gagal menghapus user', 'error');
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
    });
  };

  return (
    <div className="space-y-6 animate-fade-in font-[Plus_Jakarta_Sans]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Master User</h1>
          <p className="text-text-gray text-sm mt-1">Kelola data pengguna aplikasi.</p>
        </div>
        <Button
          onClick={openAddModal}
          className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
        >
          <Plus size={18} />
          <span>Tambah User</span>
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
              placeholder="Cari nama atau username..."
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
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-light border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">No</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Kategori User</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Nama</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Bagian/Ruang</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Divisi</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Username</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">No WA</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase">Email</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase text-center">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <TableSkeleton rows={5} columns={10} />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center">
                    <Users size={32} className="mx-auto text-gray-400 mb-4" />
                    <p className="font-bold text-gray-600">Belum ada data user</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_user} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium">
                      {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                    </td>
                    <td className="py-4 px-6">{item.role}</td>
                    <td className="py-4 px-6 font-bold">{item.nama_lengkap}</td>
                    <td className="py-4 px-6">{item.ruangan_nama !== '-' ? item.ruangan_nama : '-'}</td>
                    <td className="py-4 px-6">{item.divisi_nama !== '-' ? item.divisi_nama : '-'}</td>
                    <td className="py-4 px-6">{item.username}</td>
                    <td className="py-4 px-6">{item.wa || '-'}</td>
                    <td className="py-4 px-6">{item.email}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${item.active
                          ? 'bg-success-50 text-success-600 border-success-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                      >
                        {item.active ? 'Active' : 'Pending'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
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
        title={modal.data ? "Edit User" : "Tambah User Baru"}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Nama Lengkap"
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
              required
            />
          </div>

          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="No Whatsapp"
            placeholder="08xxxxxxxxxx"
            value={formData.wa}
            onChange={(e) => setFormData({ ...formData, wa: e.target.value })}
          />

          <div>
            <Input
              label={modal.data ? "Password (Kosongkan jika tidak diubah)" : "Password"}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!modal.data}
            />
            <p className="text-[10px] text-gray-400 mt-1">*Minimal 6 karakter</p>
          </div>

          {modal.data ? (
            <div className="bg-gray-50 p-1 rounded-xl">
              <Input label="Role / Kategori User" value={formData.roleName} disabled className="bg-gray-100" />
            </div>
          ) : (
            <Select
              label="Role / Kategori User"
              options={kategoriOptions}
              value={formData.kategori_user_id}
              onChange={(e) => setFormData({ ...formData, kategori_user_id: e.target.value })}
              required
            />
          )}

          <Select
            label="Divisi (Optional)"
            options={[{ label: 'Pilih Divisi', value: '' }, ...divisiOptions]}
            value={formData.divisi_id}
            onChange={(e) => setFormData({ ...formData, divisi_id: e.target.value })}
          />

          <Select
            label="Ruangan (Optional)"
            options={[{ label: 'Pilih Ruangan', value: '' }, ...ruanganOptions]}
            value={formData.ruangan_id}
            onChange={(e) => setFormData({ ...formData, ruangan_id: e.target.value })}
          />

          <div className="md:col-span-2 flex justify-end pt-4">
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              className="w-full md:w-auto"
            >
              {modal.data ? 'Simpan Perubahan' : 'Simpan User'}
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

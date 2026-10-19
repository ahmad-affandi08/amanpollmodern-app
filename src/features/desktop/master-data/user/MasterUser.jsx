import React, { useState, useEffect } from 'react';
import { refreshAllData } from '../../../../lib/queryClient';
import { ROLES } from '../../../auth/constants';
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
  useAuth,
} from '../../../../hooks';
import Button from '../../../../components/Button';
import Modal from '../../../../components/Modal';
import Input from '../../../../components/Input';
import Select from '../../../../components/Select';
import SearchableSelect from '../../../../components/SearchableSelect';
import Pagination from '../../../../components/Pagination';
import TableSkeleton from '../../../../components/TableSkeleton';
import ConfirmDialog from '../../../../components/Alert/Alert';
import MasterApi from '../../../../api/MasterApi';
import { getStatusClassesWithBorder } from '../../../../utils/status';
import useConfirmAction from '../useConfirmAction';

const STATUS_AKTIF = 'Aktif';
const STATUS_TIDAK_AKTIF = 'Tidak Aktif';

const EMPTY_FORM = {
  nama_lengkap: '',
  username: '',
  email: '',
  password: '',
  wa: '',
  kategori_user_id: '',
  divisi_id: '',
  ruangan_id: '',
  active: true
};

// Divisi/ruangan wajib per peran (sama dengan aturan backend): pembatasan data Admin Divisi
// dan Teknisi (per divisi) serta User Ruangan (per ruangan) bergantung padanya.
const needsDivisi = (kategoriId) =>
  [ROLES.ADMIN_DIVISI, ROLES.TEKNISI].includes(Number(kategoriId));
const needsRuangan = (kategoriId) => Number(kategoriId) === ROLES.USER_RUANGAN;

export default function MasterUser() {
  usePageTitle('Master User');
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id_user;
  const isSelf = (item) => currentUserId != null && Number(item.id_user) === Number(currentUserId);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const pagination = usePagination(10);
  const modal = useModal();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const { askConfirm, dialogProps } = useConfirmAction();

  const [kategoriOptions, setKategoriOptions] = useState([]);

  const { data: usersData, isLoading } = useMasterUsers({
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

  const { setMetadata } = pagination;
  useEffect(() => {
    if (meta) setMetadata(meta);
  }, [meta, setMetadata]);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await MasterApi.getAllKategoriUser({ all: 1 });
        const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setKategoriOptions(data.map(k => ({
          label: k.display_kategori,
          value: k.id_kategori_user
        })));
      } catch {
        showToast('Gagal memuat daftar peran', 'error');
      }
    };
    fetchKategori();
  }, [showToast]);

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

    if (isSelf(item) && !newStatus) {
      showToast('Anda tidak dapat menonaktifkan akun Anda sendiri.', 'warning');
      return;
    }

    askConfirm({
      title: `${newStatus ? 'Aktifkan' : 'Nonaktifkan'} User`,
      message: `Apakah Anda yakin ingin ${newStatus ? 'mengaktifkan' : 'menonaktifkan'} user "${item.nama_lengkap}"?`,
      confirmText: newStatus ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan',
      type: newStatus ? 'info' : 'warning',
      onConfirm: async () => {
        try {
          await MasterApi.toggleUserStatus(item.id_user, newStatus);
          await refreshAllData();
          showToast(`Status user berhasil diubah menjadi ${newStatus ? STATUS_AKTIF : STATUS_TIDAK_AKTIF}`, 'success');
        } catch {
          showToast('Gagal mengubah status user', 'error');
        }
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (needsDivisi(formData.kategori_user_id) && !formData.divisi_id) {
      showToast('Divisi wajib dipilih untuk Admin Divisi dan Teknisi.', 'warning');
      return;
    }
    if (needsRuangan(formData.kategori_user_id) && !formData.ruangan_id) {
      showToast('Ruangan wajib dipilih untuk User Ruangan.', 'warning');
      return;
    }

    // roleName hanya untuk tampilan, tidak dikirim ke server.
    const payload = { ...formData };
    delete payload.roleName;

    try {
      if (modal.data?.id_user) {
        await updateMutation.mutateAsync({
          id: modal.data.id_user,
          data: payload
        });
        showToast('User berhasil diperbarui', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        pagination.reset();
        showToast('User berhasil ditambahkan', 'success');
      }
      modal.close();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan data', 'error');
    }
  };

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
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
    if (isSelf(item)) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri.', 'warning');
      return;
    }

    askConfirm({
      title: 'Hapus User',
      message: `Apakah Anda yakin ingin menghapus user "${item.nama_lengkap}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(item.id_user);
          showToast('User berhasil dihapus', 'success');
        } catch (error) {
          showToast(error.response?.data?.message || 'Gagal menghapus user', 'error');
        }
      },
    });
  };

  return (
    <div className="space-y-4 animate-fade-in font-[Plus_Jakarta_Sans]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-text-dark">Master User</h1>
          <p className="text-text-gray text-xs mt-0.5">Kelola data pengguna aplikasi.</p>
        </div>
        <Button
          onClick={openAddModal}
          className="flex items-center gap-1.5 shadow-lg shadow-brand-primary/20"
        >
          <Plus size={16} />
          <span>Tambah User</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 bg-bg-light p-3 rounded-xl border border-gray-100">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama atau username..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                pagination.reset();
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100 mb-3">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-bg-light border-b border-gray-100">
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase">No</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase">Kategori User</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase">Nama</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase">Bagian/Ruang</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase">Divisi</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase">Username</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase">No WA</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase">Email</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase text-center">Status</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-text-gray uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {isLoading ? (
                <TableSkeleton rows={5} columns={10} />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center">
                    <Users size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="font-bold text-gray-600 text-xs">Belum ada data user</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_user} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-4 font-medium">
                      {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                    </td>
                    <td className="py-2.5 px-4">{item.role}</td>
                    <td className="py-2.5 px-4 font-bold">{item.nama_lengkap}</td>
                    <td className="py-2.5 px-4">{item.ruangan_nama !== '-' ? item.ruangan_nama : '-'}</td>
                    <td className="py-2.5 px-4">{item.divisi_nama !== '-' ? item.divisi_nama : '-'}</td>
                    <td className="py-2.5 px-4">{item.username}</td>
                    <td className="py-2.5 px-4">{item.wa || '-'}</td>
                    <td className="py-2.5 px-4">{item.email}</td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        disabled={isSelf(item) && item.active}
                        title={isSelf(item) && item.active ? 'Anda tidak dapat menonaktifkan akun sendiri' : undefined}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${getStatusClassesWithBorder(item.active ? STATUS_AKTIF : STATUS_TIDAK_AKTIF)}`}
                      >
                        {item.active ? STATUS_AKTIF : STATUS_TIDAK_AKTIF}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          aria-label={`Ubah user ${item.nama_lengkap}`}
                          className="p-2 bg-brand-primary text-white rounded-xl shadow-md hover:-translate-y-0.5 transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          aria-label={`Hapus user ${item.nama_lengkap}`}
                          title={isSelf(item) ? 'Anda tidak dapat menghapus akun sendiri' : undefined}
                          className="p-2 bg-danger-500 text-white rounded-xl shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                          disabled={deleteMutation.isPending || isSelf(item)}
                        >
                          <Trash2 size={14} />
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

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data ? "Edit User" : "Tambah User Baru"}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <p className="text-[10px] text-gray-400 mt-0.5">*Minimal 6 karakter</p>
          </div>

          {modal.data ? (
            <div className="bg-gray-50 p-1 rounded-xl">
              <Input label="Peran / Kategori User" value={formData.roleName} disabled className="bg-gray-100" />
            </div>
          ) : (
            <SearchableSelect
              label="Peran / Kategori User"
              options={kategoriOptions}
              value={formData.kategori_user_id}
              onChange={(e) => setFormData({ ...formData, kategori_user_id: e.target.value })}
              required
            />
          )}

          <SearchableSelect
            label={needsDivisi(formData.kategori_user_id) ? 'Divisi' : 'Divisi (Opsional)'}
            options={divisiOptions}
            value={formData.divisi_id}
            onChange={(e) => setFormData({ ...formData, divisi_id: e.target.value })}
            placeholder="Pilih Divisi"
            required={needsDivisi(formData.kategori_user_id)}
          />

          <SearchableSelect
            label={needsRuangan(formData.kategori_user_id) ? 'Ruangan' : 'Ruangan (Opsional)'}
            options={ruanganOptions}
            value={formData.ruangan_id}
            onChange={(e) => setFormData({ ...formData, ruangan_id: e.target.value })}
            placeholder="Pilih Ruangan"
            required={needsRuangan(formData.kategori_user_id)}
          />

          <div className="md:col-span-2 flex justify-end pt-3">
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

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

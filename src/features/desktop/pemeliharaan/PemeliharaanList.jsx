import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Calendar } from 'lucide-react';
import {
  usePemeliharaan,
  useDeletePemeliharaan,
  useMasterRuangan,
  useMasterUsers,
  useAuth,
  usePagination,
  useFilters,
  useDebounce,
  useModal,
  usePageTitle,
} from '../../../hooks';
import Button from '../../../components/Button';
import Pagination from '../../../components/Pagination';
import SearchableSelect from '../../../components/SearchableSelect';
import ColumnToggle from '../../../components/ColumnToggle';
import useColumnToggle from '../../../hooks/utils/useColumnToggle';
import TableSkeleton from '../../../components/TableSkeleton';
import ConfirmDialog from '../../../components/Alert/Alert';
import AddPemeliharaanModal from './AddPemeliharaanModal';
import EditPemeliharaanModal from './EditPemeliharaanModal';

// Column Definitions
const COLUMN_DEFS = [
  { key: 'no_pemeliharaan', label: 'No.', defaultVisible: true },
  { key: 'tanggal_jadwal', label: 'Tanggal Jadwal', defaultVisible: true },
  { key: 'ruangan', label: 'Ruangan', defaultVisible: true },
  { key: 'divisi', label: 'Divisi', defaultVisible: false },
  { key: 'gedung', label: 'Gedung', defaultVisible: false },
  { key: 'alat', label: 'Alat', defaultVisible: true },
  { key: 'no_inventaris', label: 'No. Inventaris', defaultVisible: false },
  { key: 'teknisi', label: 'Teknisi', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'kondisi_alat', label: 'Kondisi Alat', defaultVisible: true },
  { key: 'actions', label: 'Aksi', defaultVisible: true, alwaysVisible: true }
];

export default function PemeliharaanList() {
  usePageTitle('Daftar Pemeliharaan');
  const { user } = useAuth();

  const ROLE_ADMIN_DIVISI = 4;
  const isAdminDivisi = user?.kategori_user_id === ROLE_ADMIN_DIVISI;
  const userDivisiId = user?.divisi_id;

  // Column Toggle
  const { visibleColumns, toggleColumn, showAll, hideAll, isVisible } = useColumnToggle(
    COLUMN_DEFS,
    'pemeliharaan_columns'
  );

  const pagination = usePagination(10);
  const { filters, updateFilter, resetFilters } = useFilters({
    search: '',
    ruangan_id: '',
    teknisi_id: '',
    start_date: '',
    end_date: ''
  });
  const debouncedSearch = useDebounce(filters.search, 500);

  const addModal = useModal();
  const editModal = useModal();

  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const { data: pemeliharaanData, isLoading, refetch } = usePemeliharaan({
    ...filters,
    search: debouncedSearch,
    page: pagination.currentPage,
    per_page: pagination.perPage,
  });

  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: usersData } = useMasterUsers({ per_page: 500 });

  const deleteMutation = useDeletePemeliharaan();

  const data = pemeliharaanData?.data || [];
  const meta = pemeliharaanData?.meta;

  useEffect(() => {
    if (meta) {
      pagination.setMetadata(meta);
    }
  }, [meta]);

  const ruanganOptions = (ruanganData?.data || []);

  let teknisi = (usersData?.data || []).filter(u => {
    const role = (u.role || '').toLowerCase();
    return role === 'teknisi';
  });

  if (isAdminDivisi && userDivisiId) {
    const targetDivisiId = parseInt(userDivisiId);
    teknisi = teknisi.filter(u => parseInt(u.divisi_id) === targetDivisiId);
  }

  const teknisiOptions = teknisi;

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus pemeliharaan ini?',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          setToast({ type: 'success', message: 'Pemeliharaan berhasil dihapus' });
          setConfirmDialog({ isOpen: false });
        } catch (error) {
          setToast({ type: 'error', message: 'Gagal menghapus pemeliharaan' });
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
    });
  };

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
    pagination.reset();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Belum Selesai': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Sedang Dikerjakan': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Tindakan Lanjutan': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Selesai': { bg: 'bg-green-100', text: 'text-green-800' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Daftar Pemeliharaan</h1>
          <p className="text-text-gray text-sm mt-1">Kelola jadwal pemeliharaan berkala</p>
        </div>
        <Button
          onClick={addModal.open}
          className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
        >
          <Plus className="w-4 h-4" />
          Tambah Pemeliharaan
        </Button>
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari pemeliharaan..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <SearchableSelect
              name="ruangan_id"
              value={filters.ruangan_id}
              onChange={(e) => handleFilterChange('ruangan_id', e.target.value)}
              options={[
                { label: 'Semua Ruangan', value: '' },
                ...ruanganOptions.map(r => ({ label: r.nama_ruangan, value: r.id_ruangan }))
              ]}
              placeholder="Semua Ruangan"
              searchPlaceholder="Cari ruangan..."
            />

            <SearchableSelect
              name="teknisi_id"
              value={filters.teknisi_id}
              onChange={(e) => handleFilterChange('teknisi_id', e.target.value)}
              options={[
                { label: 'Semua Teknisi', value: '' },
                ...teknisiOptions.map(t => ({ label: t.nama_lengkap, value: t.id_user }))
              ]}
              placeholder="Semua Teknisi"
              searchPlaceholder="Cari teknisi..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-gray-600"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-gray-600"
                />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full h-[48px] border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary"
              >
                Reset Filter
              </Button>
              <ColumnToggle
                columns={COLUMN_DEFS}
                visibleColumns={visibleColumns}
                onToggle={toggleColumn}
                onShowAll={showAll}
                onHideAll={hideAll}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-bg-light border-b border-gray-100">
              <tr>
                {isVisible('no_pemeliharaan') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">No</th>}
                {isVisible('divisi') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Divisi</th>}
                {isVisible('ruangan') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Ruangan</th>}
                {isVisible('gedung') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Gedung</th>}
                {isVisible('alat') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Nama Alat</th>}
                {isVisible('no_inventaris') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">No. Inv</th>}
                {isVisible('tanggal_jadwal') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Jadwal</th>}
                {isVisible('teknisi') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Teknisi</th>}
                {isVisible('status') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Status</th>}
                {isVisible('kondisi_alat') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Kondisi</th>}
                {isVisible('actions') && <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <TableSkeleton columns={10} rows={10} />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-600">Tidak ada data pemeliharaan</p>
                    <p className="text-sm text-gray-400 mt-1">Belum ada jadwal pemeliharaan</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_pemeliharaan} className="hover:bg-gray-50/50 transition-colors">
                    {isVisible('no_pemeliharaan') && (
                      <td className="py-4 px-6 font-bold text-text-dark">
                        {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                      </td>
                    )}
                    {isVisible('divisi') && (
                      <td className="py-4 px-6 text-gray-600">
                        {item.divisi_nama || '-'}
                      </td>
                    )}
                    {isVisible('ruangan') && (
                      <td className="py-4 px-6 text-gray-600">
                        {item.ruangan_nama || '-'}
                      </td>
                    )}
                    {isVisible('gedung') && (
                      <td className="py-4 px-6 text-gray-600">
                        {item.gedung || '-'}
                      </td>
                    )}
                    {isVisible('alat') && (
                      <td className="py-4 px-6 font-medium text-text-dark">
                        {item.nama_alat_nama || '-'}
                      </td>
                    )}
                    {isVisible('no_inventaris') && (
                      <td className="py-4 px-6 text-sm">
                        <span className="px-2 py-1 rounded-md bg-brand-primary-50 text-brand-primary text-xs font-bold">
                          {item.no_inventaris || '-'}
                        </span>
                      </td>
                    )}
                    {isVisible('tanggal_jadwal') && (
                      <td className="py-4 px-6 text-text-dark font-medium">
                        {item.jadwal_pemeliharaan ? new Date(item.jadwal_pemeliharaan).toLocaleDateString('id-ID', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        }) : '-'}
                      </td>
                    )}
                    {isVisible('teknisi') && (
                      <td className="py-4 px-6">
                        {item.teknisi_nama && item.teknisi_nama !== '-' ? (
                          <span className="font-medium text-brand-primary">{item.teknisi_nama}</span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Belum ada</span>
                        )}
                      </td>
                    )}
                    {isVisible('status') && (
                      <td className="py-4 px-6">
                        {getStatusBadge(item.status)}
                      </td>
                    )}
                    {isVisible('kondisi_alat') && (
                      <td className="py-4 px-6 text-gray-600">
                        {item.kondisi_alat ? (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.kondisi_alat === 'Baik' ? 'bg-green-100 text-green-800' :
                              item.kondisi_alat === 'Rusak Ringan' ? 'bg-yellow-100 text-yellow-800' :
                                item.kondisi_alat === 'Rusak Berat' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {item.kondisi_alat}
                          </span>
                        ) : '-'}
                      </td>
                    )}
                    {isVisible('actions') && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => editModal.open(item)}
                            className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id_pemeliharaan)}
                            disabled={deleteMutation.isPending}
                            className="p-3 bg-danger-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
                            title="Hapus"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goToPage}
              totalData={pagination.totalItems}
            />
          )}
        </div>
      </div>

      <AddPemeliharaanModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onSuccess={refetch}
      />

      <EditPemeliharaanModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        pemeliharaan={editModal.data}
        onSuccess={refetch}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {confirmDialog.isOpen && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  );
}

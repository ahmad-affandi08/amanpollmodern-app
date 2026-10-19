import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Calendar } from 'lucide-react';
import KondisiBadge from '../../../components/KondisiBadge';
import StatusBadge from '../../../components/StatusBadge';
import {
  usePemeliharaan,
  useDeletePemeliharaan,
  useMasterRuangan,
  useAuth,
  useToast,
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
import { ROLES, isRole, isReadOnlyRole } from '../../auth/constants';
import { formatDateShort } from '../../../utils/format';
import useTeknisiList from './useTeknisiList';


const COLUMN_DEFS = [
  { key: 'index', label: 'No.', defaultVisible: true },
  { key: 'no_pemeliharaan', label: 'No. Pemeliharaan', defaultVisible: true },
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
  const { showToast } = useToast();

  const isSuperAdmin = isRole(user, ROLES.SUPER_ADMIN);
  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);
  // Pimpinan hanya boleh melihat: tanpa tambah, ubah, dan hapus.
  const canWrite = !isReadOnlyRole(user);

  // Sama dengan laporan pemeliharaan: Super Admin boleh menghapus semua,
  // Admin Divisi tidak boleh menghapus pemeliharaan yang sudah selesai.
  const canDelete = (item) => {
    if (isSuperAdmin) return true;
    if (isAdminDivisi) return item.status !== 'Selesai';
    return false;
  };

  // Jadwal/teknisi pemeliharaan yang sudah selesai tidak dapat diubah lagi.
  const canEdit = (item) => canWrite && item.status !== 'Selesai';

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

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: pemeliharaanData, isLoading, refetch } = usePemeliharaan({
    ...filters,
    search: debouncedSearch,
    page: pagination.currentPage,
    per_page: pagination.perPage,
  });

  const { data: ruanganData } = useMasterRuangan({ all: 1 });

  const teknisiList = useTeknisiList();

  const deleteMutation = useDeletePemeliharaan();

  const data = pemeliharaanData?.data || [];
  const meta = pemeliharaanData?.meta;

  const { setMetadata } = pagination;
  useEffect(() => {
    if (meta) {
      setMetadata(meta);
    }
  }, [meta, setMetadata]);

  const ruanganOptions = (ruanganData?.data || []);

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id_pemeliharaan);
      showToast('Pemeliharaan berhasil dihapus', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus pemeliharaan', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
    pagination.reset();
  };

  const handleResetFilters = () => {
    resetFilters();
    pagination.reset();
  };

  // Jumlah kolom yang tampil, dipakai untuk colSpan skeleton dan keadaan kosong.
  const visibleColumnCount = Math.max(1, COLUMN_DEFS.filter(col => isVisible(col.key)).length);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Daftar Pemeliharaan</h1>
          <p className="text-text-gray text-xs mt-1">Kelola jadwal pemeliharaan berkala</p>
        </div>
        {canWrite && (
          <Button
            onClick={() => addModal.open()}
            size="md"
            className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
          >
            <Plus className="w-4 h-4" />
            Tambah Pemeliharaan
          </Button>
        )}
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari pemeliharaan..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <SearchableSelect
              size="sm"
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
              size="sm"
              name="teknisi_id"
              value={filters.teknisi_id}
              onChange={(e) => handleFilterChange('teknisi_id', e.target.value)}
              options={[
                { label: 'Semua Teknisi', value: '' },
                ...teknisiList.map(t => ({ label: t.nama_lengkap, value: t.id_user }))
              ]}
              placeholder="Semua Teknisi"
              searchPlaceholder="Cari teknisi..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-gray-600 text-sm"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-gray-600 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="w-full border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary h-8 text-xs"
              >
                Reset Filter
              </Button>
              <ColumnToggle
                size="sm"
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
                {isVisible('index') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">No</th>}
                {isVisible('no_pemeliharaan') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">No. Pemeliharaan</th>}
                {isVisible('divisi') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Divisi</th>}
                {isVisible('ruangan') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Ruangan</th>}
                {isVisible('gedung') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Gedung</th>}
                {isVisible('alat') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Nama Alat</th>}
                {isVisible('no_inventaris') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">No. Inv</th>}
                {isVisible('tanggal_jadwal') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Jadwal</th>}
                {isVisible('teknisi') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Teknisi</th>}
                {isVisible('status') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Status</th>}
                {isVisible('kondisi_alat') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Kondisi</th>}
                {isVisible('actions') && <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <TableSkeleton columns={visibleColumnCount} rows={10} />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnCount} className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-600">Tidak ada data pemeliharaan</p>
                    <p className="text-sm text-gray-400 mt-1">Belum ada jadwal pemeliharaan</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_pemeliharaan} className="hover:bg-gray-50/50 transition-colors">
                    {isVisible('index') && (
                      <td className="py-3 px-4 font-bold text-text-dark">
                        {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                      </td>
                    )}
                    {isVisible('no_pemeliharaan') && (
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-brand-primary text-[10px] font-bold">
                          {item.no_pemeliharaan || '-'}
                        </span>
                      </td>
                    )}
                    {isVisible('divisi') && (
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {item.divisi_nama || '-'}
                      </td>
                    )}
                    {isVisible('ruangan') && (
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {item.ruangan_nama || '-'}
                      </td>
                    )}
                    {isVisible('gedung') && (
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {item.gedung || '-'}
                      </td>
                    )}
                    {isVisible('alat') && (
                      <td className="py-3 px-4 font-medium text-text-dark text-xs">
                        {item.nama_alat_nama || '-'}
                      </td>
                    )}
                    {isVisible('no_inventaris') && (
                      <td className="py-3 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-brand-primary-50 text-brand-primary text-[10px] font-bold">
                          {item.no_inventaris || '-'}
                        </span>
                      </td>
                    )}
                    {isVisible('tanggal_jadwal') && (
                      <td className="py-3 px-4 text-text-dark font-medium text-xs">
                        {formatDateShort(item.jadwal_pemeliharaan)}
                      </td>
                    )}
                    {isVisible('teknisi') && (
                      <td className="py-3 px-4">
                        {item.teknisi_nama && item.teknisi_nama !== '-' ? (
                          <span className="font-medium text-brand-primary text-xs">{item.teknisi_nama}</span>
                        ) : (
                          <span className="text-gray-400 text-[10px] italic">Belum ada</span>
                        )}
                      </td>
                    )}
                    {isVisible('status') && (
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                    )}
                    {isVisible('kondisi_alat') && (
                      <td className="py-3 px-4 text-gray-600">
                        {item.kondisi_alat ? (
                          <KondisiBadge kondisi={item.kondisi_alat} size="sm" />
                        ) : '-'}
                      </td>
                    )}
                    {isVisible('actions') && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit(item) && (
                            <button
                              onClick={() => editModal.open(item)}
                              className="p-2 bg-brand-primary text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canDelete(item) && (
                            <button
                              onClick={() => setDeleteTarget(item)}
                              disabled={deleteMutation.isPending}
                              className="p-2 bg-danger-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
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
          <Pagination
            size="sm"
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            totalData={pagination.totalItems}
          />
        </div>
      </div>

      <AddPemeliharaanModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onSuccess={() => { pagination.reset(); refetch(); }}
      />

      <EditPemeliharaanModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        pemeliharaan={editModal.data}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Pemeliharaan"
        message={`Apakah Anda yakin ingin menghapus pemeliharaan ${deleteTarget?.no_pemeliharaan || 'ini'}?`}
        type="danger"
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

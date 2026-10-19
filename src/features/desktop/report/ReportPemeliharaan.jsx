import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Trash2, AlertCircle, FileText, Edit } from 'lucide-react';
import {
  useReportPemeliharaan,
  useDeletePemeliharaan,
  useMasterRuangan,
  useMasterDivisi,
  useAuth,
  usePagination,
  useFilters,
  useDebounce,
  usePageTitle,
} from '../../../hooks';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import SearchableSelect from '../../../components/SearchableSelect';
import Input from '../../../components/Input';
import Pagination from '../../../components/Pagination';
import TableSkeleton from '../../../components/TableSkeleton';
import ConfirmDialog from '../../../components/Alert/Alert';
import { useToast } from '../../../components/Alert/useToast';
import KondisiBadge from '../../../components/KondisiBadge';
import StatusBadge from '../../../components/StatusBadge';
import { apiUrl } from '../../../config';
import { formatDateShort } from '../../../utils/format';
import { ROLES, isRole, isReadOnlyRole } from '../../auth/constants';
import useConfirmAction from '../master-data/useConfirmAction';
import useTeknisiOptions from './useTeknisiOptions';

export default function ReportPemeliharaan() {
  usePageTitle('Laporan Pemeliharaan');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);
  const isPimpinan = isReadOnlyRole(user);

  const { askConfirm, dialogProps } = useConfirmAction();

  const pagination = usePagination(10);
  const { filters, updateFilter, resetFilters } = useFilters({
    search: '',
    ruangan_id: '',
    divisi_id: '',
    teknisi_id: '',
    status: '',
    kondisi_alat: '',
    start_date: '',
    end_date: ''
  });
  const debouncedSearch = useDebounce(filters.search, 500);


  const { data: pemeliharaanData, isLoading } = useReportPemeliharaan({
    ...filters,
    search: debouncedSearch,
    page: pagination.currentPage,
    per_page: pagination.perPage,
  });

  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const teknisiOptions = useTeknisiOptions();
  const deleteMutation = useDeletePemeliharaan();


  const data = pemeliharaanData?.data || [];
  const meta = pemeliharaanData?.meta;

  const { setMetadata } = pagination;
  useEffect(() => {
    if (meta) setMetadata(meta);
  }, [meta, setMetadata]);


  const ruanganOptions = (ruanganData?.data || []).map(r => ({ label: r.nama_ruangan, value: r.id_ruangan }));
  const divisiOptions = (divisiData?.data || []).map(d => ({ label: d.nama_divisi, value: d.id_divisi }));


  const statusOptions = [
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Belum Selesai', label: 'Belum Selesai' },
    { value: 'Tindakan Lanjutan', label: 'Tindakan Lanjutan' }
  ];

  // Super Admin boleh menghapus semua; Admin Divisi hanya yang belum 'Selesai'
  // (aturan yang sama dengan daftar Pemeliharaan).
  const canDelete = (item) => {
    if (isRole(user, ROLES.SUPER_ADMIN)) return true;
    if (isAdminDivisi) return item.status !== 'Selesai';
    return false;
  };

  const handleDelete = (item) => {
    if (!canDelete(item)) {
      showToast('Anda tidak memiliki izin untuk menghapus data ini', 'error');
      return;
    }

    askConfirm({
      title: 'Hapus Pemeliharaan',
      message: 'Apakah Anda yakin ingin menghapus data laporan ini?',
      confirmText: 'Ya, Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(item.id_pemeliharaan);
          showToast('Laporan berhasil dihapus', 'success');
        } catch {
          showToast('Gagal menghapus laporan', 'error');
        }
      },
    });
  };

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
    pagination.reset();
  };

  const handleResetFilters = () => {
    resetFilters();
    pagination.reset();
  };

  // Unduhan lewat tautan (rute export di server tidak memakai middleware api.auth,
  // sesi dibawa cookie), jadi autentikasi tidak diubah.
  const handleExport = () => {
    window.open(apiUrl('/pemeliharaan/export-excel', {
      search: filters.search,
      ruangan_id: filters.ruangan_id,
      divisi_id: filters.divisi_id,
      teknisi_id: filters.teknisi_id,
      status: filters.status,
      kondisi_alat: filters.kondisi_alat,
      start_date: filters.start_date,
      end_date: filters.end_date,
    }), '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Laporan Pemeliharaan</h1>
          <p className="text-text-gray text-xs mt-1">Rekapitulasi jadwal dan hasil pemeliharaan alat</p>
        </div>
        <Button
          onClick={handleExport}
          className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
          size="md"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari laporan..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-sm"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <SearchableSelect
              size="sm"
              name="ruangan_id"
              value={filters.ruangan_id}
              onChange={(e) => handleFilterChange('ruangan_id', e.target.value)}
              options={[{ label: 'Semua Ruangan', value: '' }, ...ruanganOptions]}
              placeholder="Semua Ruangan"
              searchPlaceholder="Cari ruangan..."
            />

            {/* Hide divisi filter for Admin Divisi */}
            {!isAdminDivisi && (
              <SearchableSelect
                size="sm"
                name="divisi_id"
                value={filters.divisi_id}
                onChange={(e) => handleFilterChange('divisi_id', e.target.value)}
                options={[{ label: 'Semua Divisi', value: '' }, ...divisiOptions]}
                placeholder="Semua Divisi"
                searchPlaceholder="Cari divisi..."
              />
            )}

            <SearchableSelect
              size="sm"
              name="teknisi_id"
              value={filters.teknisi_id}
              onChange={(e) => handleFilterChange('teknisi_id', e.target.value)}
              options={[{ label: 'Semua Teknisi', value: '' }, ...teknisiOptions]}
              placeholder="Semua Teknisi"
              searchPlaceholder="Cari teknisi..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              size="sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[{ label: 'Semua Status', value: '' }, ...statusOptions]}
              icon={<AlertCircle className="w-4 h-4" />}
              className="bg-bg-light border-none"
            />
            <Input
              size="sm"
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="bg-bg-light border-none"
            />
            <Input
              size="sm"
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="bg-bg-light border-none"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary h-8 text-xs"
            >
              Reset Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-bg-light border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">No</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">No. Pemeliharaan</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Divisi</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Ruangan</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Nama Alat</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">No. Inv</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Merk</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Jadwal</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Teknisi</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Tanggal</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Kondisi</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <TableSkeleton columns={13} rows={10} />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="13" className="py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-600">Tidak ada data pemeliharaan</p>
                    <p className="text-sm text-gray-400 mt-1">Silakan sesuaikan filter pencarian</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_pemeliharaan} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-text-dark text-xs">
                      {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-brand-primary">
                        {item.no_pemeliharaan || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.divisi_nama || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 font-medium text-xs">{item.ruangan_nama || '-'}</td>
                    <td className="py-3 px-4 text-text-dark font-medium text-xs">{item.nama_alat_nama || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-[10px]">{item.no_inventaris || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.merk || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {item.jadwal_pemeliharaan ? formatDateShort(item.jadwal_pemeliharaan) : 'Belum Ditentukan'}
                    </td>
                    <td className="py-3 px-4 text-brand-primary font-medium text-xs">{item.teknisi_nama || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {item.tanggal_pemeriksaan ? formatDateShort(item.tanggal_pemeriksaan) : 'Belum Ditentukan'}
                    </td>
                    <td className="py-3 px-4">
                      {item.kondisi_alat ? <KondisiBadge kondisi={item.kondisi_alat} size="sm" /> : <span className="text-gray-400 text-xs">Belum Ditentukan</span>}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <button
                          onClick={() => navigate(`/report/pemeliharaan/${item.id_pemeliharaan}`)}
                          className="p-2 bg-blue-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
                          title="Detail"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Disposisi Button - Show for Pimpinan only */}
                        {isPimpinan && (
                          item.status === 'Tindakan Lanjutan' ||
                          (item.status === 'Selesai' && item.kondisi_alat === 'Rusak Berat')
                        ) && (
                            <button
                              onClick={() => window.open(`/mobile/pemeliharaan/${item.id_pemeliharaan}/disposisi`, '_blank')}
                              className="p-2 bg-success-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
                              title="Isi Disposisi"
                            >
                              <Edit size={16} />
                            </button>
                          )}

                        {canDelete(item) && (
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deleteMutation.isPending}
                            className="p-2 bg-danger-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
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

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

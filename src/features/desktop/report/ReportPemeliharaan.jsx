import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, Download, Eye, Trash2, Calendar, MapPin, Layers, User, AlertCircle, FileText } from 'lucide-react';
import {
  useReportPemeliharaan,
  useDeletePemeliharaan,
  useMasterRuangan,
  useMasterDivisi,
  useMasterUsers,
  useAuth,
  useToast,
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

export default function ReportPemeliharaan() {
  usePageTitle('Laporan Pemeliharaan');
  const navigate = useNavigate();
  const { user } = useAuth();

  const ROLE_ADMIN_DIVISI = 4;
  const isAdminDivisi = user?.kategori_user_id === ROLE_ADMIN_DIVISI;
  const userDivisiId = user?.divisi_id;

  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

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

  // Queries
  const { data: pemeliharaanData, isLoading } = useReportPemeliharaan({
    ...filters,
    search: debouncedSearch,
    page: pagination.currentPage,
    per_page: pagination.perPage,
  });

  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const { data: usersData } = useMasterUsers({ per_page: 500 });
  const deleteMutation = useDeletePemeliharaan();

  // Extract data
  const data = pemeliharaanData?.data || [];
  const meta = pemeliharaanData?.meta;

  useEffect(() => {
    if (meta) pagination.setMetadata(meta);
  }, [meta]);

  // Options
  const ruanganOptions = (ruanganData?.data || []).map(r => ({ label: r.nama_ruangan, value: r.id_ruangan }));
  const divisiOptions = (divisiData?.data || []).map(d => ({ label: d.nama_divisi, value: d.id_divisi }));

  let teknisi = (usersData?.data || []).filter(u => (u.role || '').toLowerCase() === 'teknisi');
  if (isAdminDivisi && userDivisiId) {
    teknisi = teknisi.filter(u => parseInt(u.divisi_id) === parseInt(userDivisiId));
  }
  const teknisiOptions = teknisi.map(u => ({ label: u.nama_lengkap, value: u.id_user }));

  const statusOptions = [
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Belum Selesai', label: 'Belum Selesai' }
  ];

  const kondisiOptions = [
    { value: 'Baik', label: 'Baik' },
    { value: 'Rusak Ringan', label: 'Rusak Ringan' },
    { value: 'Rusak Berat', label: 'Rusak Berat' },
    { value: 'Dalam Perbaikan', label: 'Dalam Perbaikan' }
  ];

  const canDelete = (item) => {
    if (user?.kategori_user_id === 1) return true; // Superadmin
    if (user?.kategori_user_id === 4) return item.status !== 'Selesai'; // Admin Divisi only if not finished
    return false;
  };

  const handleDelete = (item) => {
    if (!canDelete(item)) {
      setToast({ type: 'error', message: 'Anda tidak memiliki izin untuk menghapus data ini' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      id: item.id_pemeliharaan,
      title: 'Hapus Pemeliharaan',
      message: 'Apakah Anda yakin ingin menghapus data laporan ini?',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(item.id_pemeliharaan);
          setToast({ type: 'success', message: 'Laporan berhasil dihapus' });
          setConfirmDialog({ isOpen: false, id: null });
        } catch (error) {
          setToast({ type: 'error', message: 'Gagal menghapus laporan' });
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false, id: null })
    });
  };

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
    pagination.reset();
  };

  const getStatusBadge = (status) => {
    const config = {
      'Selesai': { bg: 'bg-green-100', text: 'text-green-800' },
      'Belum Selesai': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    };
    const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.bg} ${c.text}`}>{status}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Laporan Pemeliharaan</h1>
          <p className="text-text-gray text-sm mt-1">Rekapitulasi jadwal dan hasil pemeliharaan alat</p>
        </div>
        <Button
          onClick={() => {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.ruangan_id) params.append('ruangan_id', filters.ruangan_id);
            if (filters.divisi_id) params.append('divisi_id', filters.divisi_id);
            if (filters.teknisi_id) params.append('teknisi_id', filters.teknisi_id);
            if (filters.status) params.append('status', filters.status);
            if (filters.kondisi_alat) params.append('kondisi_alat', filters.kondisi_alat);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);

            window.open(`/api/pemeliharaan/export-excel?${params.toString()}`, '_blank');
          }}
          className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
        >
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari laporan..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <SearchableSelect
              name="ruangan_id"
              value={filters.ruangan_id}
              onChange={(e) => handleFilterChange('ruangan_id', e.target.value)}
              options={[{ label: 'Semua Ruangan', value: '' }, ...ruanganOptions]}
              placeholder="Semua Ruangan"
              searchPlaceholder="Cari ruangan..."
            />

            <SearchableSelect
              name="divisi_id"
              value={filters.divisi_id}
              onChange={(e) => handleFilterChange('divisi_id', e.target.value)}
              options={[{ label: 'Semua Divisi', value: '' }, ...divisiOptions]}
              placeholder="Semua Divisi"
              searchPlaceholder="Cari divisi..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchableSelect
              name="teknisi_id"
              value={filters.teknisi_id}
              onChange={(e) => handleFilterChange('teknisi_id', e.target.value)}
              options={[{ label: 'Semua Teknisi', value: '' }, ...teknisiOptions]}
              placeholder="Semua Teknisi"
              searchPlaceholder="Cari teknisi..."
            />
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[{ label: 'Semua Status', value: '' }, ...statusOptions]}
              icon={<AlertCircle className="w-4 h-4" />}
              className="bg-bg-light border-none"
            />
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="bg-bg-light border-none"
              />
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="bg-bg-light border-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary"
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
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">No</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Divisi</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Ruangan</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Nama Alat</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">No. Inv</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Merk</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Jadwal</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Teknisi</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Tanggal</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Kondisi</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-text-gray uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <TableSkeleton columns={12} rows={10} />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="12" className="py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-600">Tidak ada data pemeliharaan</p>
                    <p className="text-sm text-gray-400 mt-1">Silakan sesuaikan filter pencarian</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_pemeliharaan} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-text-dark">
                      {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{item.divisi_nama || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">{item.ruangan_nama || '-'}</td>
                    <td className="py-4 px-6 text-text-dark font-medium">{item.nama_alat_nama || '-'}</td>
                    <td className="py-4 px-6 text-gray-600 font-mono text-xs">{item.no_inventaris || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">{item.merk || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {item.jadwal_pemeliharaan ? new Date(item.jadwal_pemeliharaan).toLocaleDateString('id-ID') : 'Belum Ditentukan'}
                    </td>
                    <td className="py-4 px-6 text-brand-primary font-medium">{item.teknisi_nama || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {item.tanggal_pemeriksaan ? new Date(item.tanggal_pemeriksaan).toLocaleDateString('id-ID') : 'Belum Ditentukan'}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {item.kondisi_alat || 'Belum Ditentukan'}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/report/pemeliharaan/${item.id_pemeliharaan}`)}
                          className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                          title="Detail"
                        >
                          <Eye size={20} />
                        </button>

                        {canDelete(item) && (
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deleteMutation.isPending}
                            className="p-3 bg-danger-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
                            title="Hapus"
                          >
                            <Trash2 size={20} />
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

        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goToPage}
            />
          </div>
        )}
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {confirmDialog.isOpen && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  );
}

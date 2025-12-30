import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Calendar, User, Wrench, AlertCircle, Eye, Trash2, ClipboardCheck } from 'lucide-react';
import {
  useAduan,
  useDeleteAduan,
  useMasterRuangan,
  useMasterUsers,
  useAuth,
  useToast,
  usePagination,
  useFilters,
  useDebounce,
  useModal,
  usePageTitle,
} from '../../../hooks';
import TableSkeleton from '../../../components/TableSkeleton';
import Pagination from '../../../components/Pagination';
import Select from '../../../components/Select';
import SearchableSelect from '../../../components/SearchableSelect';
import ColumnToggle from '../../../components/ColumnToggle';
import useColumnToggle from '../../../hooks/utils/useColumnToggle';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import AddAduanModal from './AddAduanModal';
import AssignTeknisiModal from './AssignTeknisiModal';
import DetailAduanModal from './DetailAduanModal';
import InspectionModal from './InspectionModal';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import noImage from '../../../assets/img/no_image.png';

// Column Definitions
const COLUMN_DEFS = [
  { key: 'no_pendaftaran', label: 'No.', defaultVisible: true },
  { key: 'no_aduan', label: 'No. Aduan', defaultVisible: true },
  { key: 'tanggal', label: 'Tanggal Aduan', defaultVisible: true },
  { key: 'divisi_ruang', label: 'Divisi/Ruang', defaultVisible: true },
  { key: 'gedung', label: 'Gedung', defaultVisible: false },
  { key: 'alat', label: 'Alat', defaultVisible: true },
  { key: 'no_inventaris', label: 'No. Inventaris', defaultVisible: false },
  { key: 'keluhan', label: 'Keluhan', defaultVisible: true },
  { key: 'foto', label: 'Foto', defaultVisible: true },
  { key: 'pelapor', label: 'Pelapor', defaultVisible: true },
  { key: 'teknisi', label: 'Teknisi', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'actions', label: 'Aksi', defaultVisible: true, alwaysVisible: true }
];

export default function AduanList() {
  usePageTitle('Daftar Aduan');
  const { showToast } = useToast();
  const { user } = useAuth();

  // Role Constants
  const ROLE_ADMIN_DIVISI = 4;
  const isAdminDivisi = user?.kategori_user_id === ROLE_ADMIN_DIVISI;
  const userDivisiId = user?.divisi_id;

  // Column Toggle
  const { visibleColumns, toggleColumn, showAll, hideAll, isVisible } = useColumnToggle(
    COLUMN_DEFS,
    'aduan_columns'
  );

  // Hooks
  const pagination = usePagination(10);
  const { filters, updateFilter, resetFilters } = useFilters({
    search: '',
    ruangan_id: '',
    teknisi_id: '',
    start_date: '',
    end_date: ''
  });
  const debouncedSearch = useDebounce(filters.search, 500);

  // Modals
  const addModal = useModal();
  const assignModal = useModal();
  const detailModal = useModal();
  const inspectionModal = useModal();
  const imagePreviewModal = useModal();

  // Queries
  const { data: aduanData, isLoading, refetch } = useAduan({
    ...filters,
    search: debouncedSearch,
    page: pagination.currentPage,
    per_page: pagination.perPage,
  });

  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: usersData } = useMasterUsers({ per_page: 500 });

  const deleteMutation = useDeleteAduan();

  // Extract data
  const aduan = aduanData?.data || [];
  const meta = aduanData?.meta;

  // Update pagination when meta changes
  useEffect(() => {
    if (meta) {
      pagination.setMetadata(meta);
    }
  }, [meta]);

  // Prepare options
  const ruanganOptions = (ruanganData?.data || []).map(r => ({
    label: r.nama_ruangan,
    value: r.id_ruangan
  }));

  // Function to get filtered teknisi options based on equipment's division
  const getFilteredTeknisiOptions = (aduanDivisiId) => {

    let teknisi = (usersData?.data || []).filter(u => {
      const role = (u.role || '').toLowerCase();
      return role === 'teknisi';
    });

    // Filter by equipment's division
    if (aduanDivisiId) {
      const targetDivisiId = parseInt(aduanDivisiId);
      teknisi = teknisi.filter(u => parseInt(u.divisi_id) === targetDivisiId);
    }

    return teknisi.map(u => ({
      label: u.nama_lengkap,
      value: u.id_user
    }));
  };

  // Teknisi options for filter section (shows all teknisi)
  const allTeknisi = (usersData?.data || []).filter(u => {
    const role = (u.role || '').toLowerCase();
    return role === 'teknisi';
  });

  const teknisiOptions = allTeknisi.map(u => ({
    label: u.nama_lengkap,
    value: u.id_user
  }));

  // Handlers
  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aduan ini?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      showToast('Aduan berhasil dihapus', 'success');
    } catch (error) {
      showToast('Gagal menghapus aduan', 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
    pagination.reset(); // Reset to page 1 when filter changes
  };

  const handleResetFilters = () => {
    resetFilters();
    pagination.reset();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'Sedang Dikerjakan': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sedang Dikerjakan' },
      'Selesai': { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
      'Tindakan Lanjutan': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Tindakan Lanjutan' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Daftar Aduan</h1>
          <p className="text-[#808191] text-sm mt-1">Kelola aduan kerusakan alat</p>
        </div>
        <Button
          onClick={addModal.open}
          className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
        >
          <Plus className="w-4 h-4" />
          Tambah Aduan
        </Button>
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        {/* Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Cari aduan..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-light border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Ruangan Filter */}
            <SearchableSelect
              name="ruangan_id"
              value={filters.ruangan_id}
              onChange={(e) => handleFilterChange('ruangan_id', e.target.value)}
              options={[{ label: 'Semua Ruangan', value: '' }, ...ruanganOptions]}
              placeholder="Semua Ruangan"
              searchPlaceholder="Cari ruangan..."
            />

            {/* Teknisi Filter */}
            <SearchableSelect
              name="teknisi_id"
              value={filters.teknisi_id}
              onChange={(e) => handleFilterChange('teknisi_id', e.target.value)}
              options={[{ label: 'Semua Teknisi', value: '' }, ...teknisiOptions]}
              placeholder="Semua Teknisi"
              searchPlaceholder="Cari teknisi..."
            />
          </div>

          {/* Date Range & Reset */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              type="date"
              label=""
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
              className="bg-bg-light border-none"
            />
            <Input
              type="date"
              label=""
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
              className="bg-bg-light border-none"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="w-full h-[46px] border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary"
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

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-bg-light border-b border-gray-100">
              <tr>
                {isVisible('no_pendaftaran') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">No</th>}
                {isVisible('no_aduan') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">No. Aduan</th>}
                {isVisible('tanggal') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Tanggal</th>}
                {isVisible('divisi_ruang') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Divisi/Ruang</th>}
                {isVisible('gedung') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Gedung</th>}
                {isVisible('alat') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Alat</th>}
                {isVisible('no_inventaris') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">No. Inventaris</th>}
                {isVisible('keluhan') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Keluhan</th>}
                {isVisible('foto') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Foto</th>}
                {isVisible('pelapor') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Pelapor</th>}
                {isVisible('teknisi') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Teknisi</th>}
                {isVisible('status') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider">Status</th>}
                {isVisible('actions') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase tracking-wider text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <TableSkeleton columns={10} rows={10} />
              ) : aduan.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-600">Tidak ada data aduan</p>
                    <p className="text-sm text-gray-400 mt-1">Belum ada aduan yang masuk</p>
                  </td>
                </tr>
              ) : (
                aduan.map((item, index) => (
                  <tr key={item.id_aduan} className="hover:bg-gray-50/50 transition-colors">
                    {isVisible('no_pendaftaran') && (
                      <td className="py-4 px-6 font-bold text-text-dark">
                        {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                      </td>
                    )}
                    {isVisible('no_aduan') && (
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 text-xs font-bold rounded-md bg-brand-primary-50 text-brand-primary">
                          {item.no_aduan || '-'}
                        </span>
                      </td>
                    )}
                    {isVisible('tanggal') && (
                      <td className="py-4 px-6 text-text-dark">
                        {item.create_date ? new Date(item.create_date).toLocaleString('id-ID', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }).replace(/\./g, ':') : '-'}
                      </td>
                    )}
                    {isVisible('divisi_ruang') && (
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium text-text-dark">{item.ruangan_nama || '-'}</span>
                          <span className="text-xs text-gray-400">{item.divisi_nama}</span>
                        </div>
                      </td>
                    )}
                    {isVisible('gedung') && (
                      <td className="py-4 px-6 text-gray-600">
                        {item.gedung || '-'}
                      </td>
                    )}
                    {isVisible('alat') && (
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium text-text-dark">{item.nama_alat_nama || '-'}</span>
                        </div>
                      </td>
                    )}
                    {isVisible('no_inventaris') && (
                      <td className="py-4 px-6">
                        <span className="text-xs text-brand-primary bg-purple-50 px-1.5 py-0.5 rounded w-fit">{item.no_inventaris}</span>
                      </td>
                    )}
                    {isVisible('keluhan') && (
                      <td className="py-4 px-6 text-gray-600 max-w-[200px] truncate" title={item.keluhan}>
                        {item.keluhan}
                      </td>
                    )}
                    {isVisible('foto') && (
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center">
                          {item.img_keluhan ? (
                            <div className="w-20 h-20 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-brand-primary" style={{ minWidth: '80px', minHeight: '80px', width: '80px', height: '80px' }}>
                              <LazyLoadImage
                                src={item.img_keluhan}
                                alt="Foto Keluhan"
                                effect="blur"
                                className="object-cover"
                                style={{ width: '80px', height: '80px', display: 'block' }}
                                placeholderSrc={noImage}
                                onError={(e) => { e.target.src = noImage; }}
                                onClick={() => imagePreviewModal.open({ url: item.img_keluhan, alt: `Foto Keluhan - ${item.keluhan}` })}
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200" style={{ minWidth: '80px', minHeight: '80px' }}>
                              <img
                                src={noImage}
                                alt="No Image"
                                className="w-full h-full object-cover opacity-50"
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {isVisible('pelapor') && (
                      <td className="py-4 px-6 text-gray-600">
                        {item.nama_pengadu || '-'}
                      </td>
                    )}
                    {isVisible('teknisi') && (
                      <td className="py-4 px-6">
                        {item.teknisi_nama ? (
                          <span className="font-medium text-brand-primary">{item.teknisi_nama}</span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Belum ada</span>
                        )}
                      </td>
                    )}
                    {isVisible('status') && (
                      <td className="py-4 px-6">
                        {getStatusBadge(item.status_aduan)}
                      </td>
                    )}
                    {isVisible('actions') && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Assign Teknisi Button */}
                          {!item.teknisi_id && (
                            <button
                              onClick={() => assignModal.open(item)}
                              className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                              title="Tugaskan Teknisi"
                            >
                              <Wrench size={20} />
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

        {/* Pagination */}
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

      {/* Modals */}
      <AddAduanModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onSuccess={refetch}
      />

      <AssignTeknisiModal
        isOpen={assignModal.isOpen}
        onClose={assignModal.close}
        aduan={assignModal.data}
        teknisiOptions={getFilteredTeknisiOptions(assignModal.data?.divisi_id)}
        onSuccess={refetch}
      />

      <DetailAduanModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        aduan={detailModal.data}
        onUpdate={refetch}
      />

      <InspectionModal
        key={inspectionModal.data?.id_aduan || 'inspection-modal'}
        isOpen={inspectionModal.isOpen}
        onClose={inspectionModal.close}
        aduan={inspectionModal.data}
        onSuccess={refetch}
      />

      <ImagePreviewModal
        isOpen={imagePreviewModal.isOpen}
        onClose={imagePreviewModal.close}
        imageUrl={imagePreviewModal.data?.url}
        altText={imagePreviewModal.data?.alt}
      />
    </div>
  );
}

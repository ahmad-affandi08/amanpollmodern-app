import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Trash2, Calendar, Layers, MapPin, User, FileText, AlertCircle, Edit } from 'lucide-react';
import {
  useReportAduan,
  useDeleteAduan,
  useMasterRuangan,
  useMasterDivisi,
  useMasterUsers,
  useAuth,
  useToast,
  usePagination,
  useFilters,
  useDebounce,
  usePageTitle,
  useModal,
} from '../../../hooks';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import SearchableSelect from '../../../components/SearchableSelect';
import Input from '../../../components/Input';
import Pagination from '../../../components/Pagination';
import TableSkeleton from '../../../components/TableSkeleton';
import ConfirmDialog from '../../../components/Alert/Alert';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import noImage from '../../../assets/img/no_image.png';

export default function ReportAduan() {
  usePageTitle('Laporan Aduan');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const ROLE_ADMIN_DIVISI = 4;
  const ROLE_PIMPINAN = 5;
  const isAdminDivisi = Number(user?.kategori_user_id) === ROLE_ADMIN_DIVISI;
  const isPimpinan = Number(user?.kategori_user_id) === ROLE_PIMPINAN;
  const userDivisiId = user?.divisi_id;

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });
  const [selectedImage, setSelectedImage] = useState(null);
  const imagePreviewModal = useModal();

  const pagination = usePagination(10);
  const { filters, updateFilter, resetFilters } = useFilters({
    search: '',
    ruangan_id: '',
    divisi_id: '',
    teknisi_id: '',
    status_aduan: '',
    kondisi_alat: '',
    start_date: '',
    end_date: ''
  });
  const debouncedSearch = useDebounce(filters.search, 500);


  const { data: aduanData, isLoading } = useReportAduan({
    ...filters,
    search: debouncedSearch,
    page: pagination.currentPage,
    per_page: pagination.perPage,
  });

  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const { data: usersData } = useMasterUsers({ per_page: 500 });
  const deleteMutation = useDeleteAduan();


  const data = aduanData?.data || [];
  const meta = aduanData?.meta;

  useEffect(() => {
    if (meta) pagination.setMetadata(meta);
  }, [meta]);


  const ruanganOptions = (ruanganData?.data || []).map(r => ({ label: r.nama_ruangan, value: r.id_ruangan }));
  const divisiOptions = (divisiData?.data || []).map(d => ({ label: d.nama_divisi, value: d.id_divisi }));

  let teknisi = (usersData?.data || []).filter(u => (u.role || '').toLowerCase() === 'teknisi');
  if (isAdminDivisi && userDivisiId) {
    teknisi = teknisi.filter(u => parseInt(u.divisi_id) === parseInt(userDivisiId));
  }
  const teknisiOptions = teknisi.map(u => ({ label: u.nama_lengkap, value: u.id_user }));

  const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Sedang Dikerjakan', value: 'Sedang Dikerjakan' },
    { label: 'Tindakan Lanjutan', value: 'Tindakan Lanjutan' },
    { label: 'Selesai', value: 'Selesai' }
  ];

  const kondisiAlatOptions = [
    { label: 'Baik', value: 'Baik' },
    { label: 'Rusak Ringan', value: 'Rusak Ringan' },
    { label: 'Rusak Berat', value: 'Rusak Berat' },
    { label: 'Dalam Perbaikan', value: 'Dalam Perbaikan' }
  ];


  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      id,
      title: 'Hapus Aduan',
      message: 'Apakah Anda yakin ingin menghapus data laporan ini?',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          showToast('Laporan berhasil dihapus', 'success');
          setConfirmDialog({ isOpen: false, id: null });
        } catch (error) {
          showToast('Gagal menghapus laporan', 'error');
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
      'Pending': { bg: 'bg-red-500', text: 'text-white', border: 'border-red-200' },
      'Sedang Dikerjakan': { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-200' },
      'Selesai': { bg: 'bg-green-500', text: 'text-white', border: 'border-green-200' },
      'Tindakan Lanjutan': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-200' },
    };
    const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };

    return (
      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border-2 ${c.bg} ${c.text} ${c.border} shadow-sm`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Laporan Aduan</h1>
          <p className="text-text-gray text-xs mt-1">Rekapitulasi seluruh data aduan dan perbaikan</p>
        </div>
        <Button
          onClick={() => {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.ruangan_id) params.append('ruangan_id', filters.ruangan_id);
            if (filters.divisi_id) params.append('divisi_id', filters.divisi_id);
            if (filters.teknisi_id) params.append('teknisi_id', filters.teknisi_id);
            if (filters.status_aduan) params.append('status_aduan', filters.status_aduan);
            if (filters.kondisi_alat) params.append('kondisi_alat', filters.kondisi_alat);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);

            window.open(`/api/aduan/export-excel?${params.toString()}`, '_blank');
          }}
          size="md"
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
              value={filters.status_aduan}
              onChange={(e) => handleFilterChange('status_aduan', e.target.value)}
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
              onClick={resetFilters}
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
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">No. Aduan</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Tanggal Aduan</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Divisi</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Nama Ruangan</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Gedung</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">No Inventaris</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Nama Alat</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Keluhan Kerusakan</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Foto</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Nama Pengadu</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Tanggal Pemeriksaan</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Jam Pemeriksaan</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Teknisi</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Tindakan Petugas</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Rekomendasi</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Kondisi Alat</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[10px] font-bold text-text-gray uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <TableSkeleton columns={18} rows={10} />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="18" className="py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-600">Tidak ada data laporan</p>
                    <p className="text-sm text-gray-400 mt-1">Silakan sesuaikan filter pencarian</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_aduan} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-text-dark text-xs">
                      {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand-primary-50 text-brand-primary">
                        {item.no_aduan || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {item.create_date ? new Date(item.create_date).toLocaleString('id-ID', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      }).replace(/\./g, ':') : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.divisi_nama || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 font-medium text-xs">{item.ruangan_nama || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.gedung || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-[10px]">{item.no_inventaris || '-'}</td>
                    <td className="py-3 px-4 text-text-dark font-medium text-xs">{item.nama_alat_nama || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate text-xs" title={item.keluhan}>{item.keluhan}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        {item.img_keluhan ? (
                          <div
                            className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-brand-primary"
                            style={{ minWidth: '64px', minHeight: '64px', width: '64px', height: '64px' }}
                          >
                            <LazyLoadImage
                              src={item.img_keluhan}
                              alt="Foto Keluhan"
                              effect="blur"
                              className="object-cover"
                              style={{ width: '64px', height: '64px', display: 'block' }}
                              placeholderSrc={noImage}
                              onError={(e) => { e.target.src = noImage; }}
                              onClick={() => {
                                setSelectedImage(item.img_keluhan);
                                imagePreviewModal.open();
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200" style={{ minWidth: '64px', minHeight: '64px' }}>
                            <img
                              src={noImage}
                              alt="No Image"
                              className="w-full h-full object-cover opacity-50"
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.nama_pengadu || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {item.tanggal_pemeriksaan ? new Date(item.tanggal_pemeriksaan).toLocaleDateString('id-ID', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      }) : 'Belum Ditentukan'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {item.tanggal_pemeriksaan ? new Date(item.tanggal_pemeriksaan).toLocaleTimeString('id-ID', {
                        hour: '2-digit', minute: '2-digit'
                      }) : 'Belum Ditentukan'}
                    </td>
                    <td className="py-3 px-4 text-brand-primary font-medium text-xs">
                      {item.teknisi_nama || 'Belum Ditentukan'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate text-xs">{item.tindakan_teknisi || 'Belum Ditentukan'}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate text-xs">{item.rekomendasi || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.kondisi_alat || '-'}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(item.status_aduan)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-xs">
                        {/* Detail Button - Show for Sedang Dikerjakan, Selesai, Tindakan Lanjutan, or Rusak Berat */}
                        {(item.status_aduan === 'Sedang Dikerjakan' || item.status_aduan === 'Selesai' || item.status_aduan === 'Tindakan Lanjutan' || item.kondisi_alat === 'Rusak Berat') && (
                          <button
                            onClick={() => navigate(`/report/aduan/${item.id_aduan}`)}
                            className="p-2 bg-[#4FD1C5] text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </button>
                        )}

                        {/* Disposisi Button - Show for Pimpinan only */}
                        {isPimpinan && (
                          item.status_aduan === 'Tindakan Lanjutan' ||
                          item.kondisi_alat === 'Rusak Berat' ||
                          (item.status_aduan === 'Selesai' && item.kondisi_alat !== 'Baik')
                        ) && (
                            <button
                              onClick={() => window.open(`/mobile/aduan/${item.id_aduan}/disposisi`, '_blank')}
                              className="p-2 bg-success-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
                              title="Isi Disposisi"
                            >
                              <Edit size={16} />
                            </button>
                          )}

                        {/* Delete Button - Show only for unassigned aduan (no teknisi) and NOT Pimpinan */}
                        {!isPimpinan && !item.teknisi_id && (
                          <button
                            onClick={() => handleDelete(item.id_aduan)}
                            disabled={deleteMutation.isPending}
                            className="p-2 bg-danger-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr >
                ))
              )}
            </tbody >
          </table >
        </div >

        {
          pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                size="sm"
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.goToPage}
                totalData={pagination.totalItems}
              />
            </div>
          )
        }
      </div >




      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={imagePreviewModal.isOpen}
        imageUrl={selectedImage}
        onClose={imagePreviewModal.close}
      />

      {
        confirmDialog.isOpen && (
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={confirmDialog.onCancel}
            type="danger"
          />
        )
      }
    </div >
  );
}

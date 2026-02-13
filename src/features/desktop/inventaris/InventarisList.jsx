import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Printer, Download, Calendar, MapPin, Layers, Edit2, Trash2, Eye, FileText, QrCode } from 'lucide-react';
import {
  useInventaris,
  useDeleteInventaris,
  useMasterKategori,
  useMasterDivisi,
  useMasterRuangan,
  useAuth,
  useToast,
  usePagination,
  useFilters,
  useDebounce,
  useMasterNamaAlat,
  usePageTitle,
} from '../../../hooks';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import SearchableSelect from '../../../components/SearchableSelect';
import Pagination from '../../../components/Pagination';
import ConfirmDialog from '../../../components/Alert/Alert';
import TableSkeleton from '../../../components/TableSkeleton';
import ColumnToggle from '../../../components/ColumnToggle';
import useColumnToggle from '../../../hooks/utils/useColumnToggle';
import ImagePreviewModal from '../../../components/ImagePreviewModal';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import noImage from '../../../assets/img/no_image.png';
import qrCodeIcon from '../../../assets/img/icon-qr-code.png';
import InventarisApi from '../../../api/InventarisApi';

const COLUMN_DEFS = [
  { key: 'no_inventaris', label: 'No. Inventaris', defaultVisible: true },
  { key: 'nama_alat', label: 'Nama Alat', defaultVisible: true },
  { key: 'divisi', label: 'Divisi', defaultVisible: true },
  { key: 'ruangan', label: 'Nama Bagian/Ruangan', defaultVisible: true },
  { key: 'merk', label: 'Merk', defaultVisible: true },
  { key: 'model', label: 'Model/Tipe', defaultVisible: true },
  { key: 'seri', label: 'No. Seri', defaultVisible: true },
  { key: 'daya', label: 'Daya (watt)', defaultVisible: true },
  { key: 'harga', label: 'Harga', defaultVisible: true },
  { key: 'harga_ganti', label: 'Harga Ganti (AIC)', defaultVisible: true },
  { key: 'tahun_pengadaan', label: 'Tahun Pengadaan', defaultVisible: true },
  { key: 'ruang_sekarang', label: 'Letak Saat Ini/Ruang', defaultVisible: true },
  { key: 'gedung', label: 'Gedung', defaultVisible: true },
  { key: 'kategori_alat', label: 'Kategori Alat', defaultVisible: true },
  { key: 'interval_maintenance', label: 'Interval Maintenance', defaultVisible: true },
  { key: 'img_alat', label: 'Foto', defaultVisible: true },
  { key: 'file_sertifikat', label: 'Sertifikat', defaultVisible: true },
  { key: 'kadaluwarsa', label: 'Berlaku Hingga', defaultVisible: true },
  { key: 'file_sop', label: 'File SOP', defaultVisible: true },
  { key: 'qrcode', label: 'QR Code', defaultVisible: true },
  { key: 'kondisi_alat', label: 'Kondisi Alat', defaultVisible: true },
  { key: 'actions', label: 'Aksi', defaultVisible: true, alwaysVisible: true }
];

export default function InventarisList() {
  usePageTitle('Daftar Inventaris');
  const navigate = useNavigate();
  const { user } = useAuth();


  const ROLE_ADMIN_DIVISI = 4;
  const ROLE_PIMPINAN = 5;
  const isAdminDivisi = user?.kategori_user_id === ROLE_ADMIN_DIVISI;
  const isPimpinan = user?.kategori_user_id === ROLE_PIMPINAN;


  const { visibleColumns, toggleColumn, showAll, hideAll, isVisible } = useColumnToggle(
    COLUMN_DEFS,
    'inventaris_columns'
  );


  const pagination = usePagination(10);
  const { filters, updateFilter, resetFilters } = useFilters({
    search: '',
    kategori_alat_id: '',
    divisi_id: '',
    ruangan_id: '',
    tahun_awal: '',
    tahun_akhir: ''
  });
  const debouncedSearch = useDebounce(filters.search, 500);


  const { showToast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });


  const [imagePreview, setImagePreview] = useState({ isOpen: false, imageUrl: '' });


  const { data: inventarisData, isLoading, refetch } = useInventaris({
    ...filters,
    search: debouncedSearch,
    page: pagination.currentPage,
    per_page: pagination.perPage,
  });


  const { data: kategoriData } = useMasterKategori({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });
  const { data: ruanganData } = useMasterRuangan({ all: 1 });
  const { data: namaAlatData } = useMasterNamaAlat({ all: 1 });

  const deleteMutation = useDeleteInventaris();


  const dataList = inventarisData?.data || [];
  const meta = inventarisData?.meta;


  useEffect(() => {
    if (meta) {
      pagination.setMetadata(meta);
    }
  }, [meta]);


  const categories = kategoriData?.data || [];
  const divisions = divisiData?.data || [];
  const rooms = ruanganData?.data || [];



  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus inventaris ini?',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          showToast('Inventaris berhasil dihapus', 'success');
          setConfirmDialog({ isOpen: false });
        } catch (error) {
          showToast('Gagal menghapus inventaris', 'error');
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
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

  const handleExportExcel = async () => {
    try {
      const response = await InventarisApi.exportExcel(filters);

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventaris_${new Date().getTime()}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Export berhasil', 'success');
    } catch (error) {
      console.error('Export error:', error);
      console.error('Error response:', error.response);
      showToast('Gagal export data', 'error');
    }
  };


  const handlePrintLabelWithType = async (labelType, itemId = null) => {
    try {
      const params = itemId
        ? { id_inventaris: itemId, type: labelType }
        : { ...filters, type: labelType };

      const response = await InventarisApi.printLabel(params);
      const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
      window.open(url, '_blank');
      showToast('Print label berhasil dibuka', 'success');

    } catch (error) {
      console.error('Print label error:', error);
      showToast('Gagal membuka print label', 'error');
    }
  };

  const getKondisiBadge = (kondisi) => {
    const kondisiConfig = {
      'Baik': { bg: 'bg-green-100', text: 'text-green-800' },
      'Rusak Ringan': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Rusak Berat': { bg: 'bg-red-100', text: 'text-red-800' },
    };

    const config = kondisiConfig[kondisi] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {kondisi}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Daftar Inventaris</h1>
          <p className="text-[#808191] text-sm mt-1">Kelola inventaris alat medis</p>
        </div>
        <div className="grid grid-cols-1 md:flex gap-3 md:gap-2 w-full md:w-auto">
          {/* Print All Labels Button */}
          <div className="relative w-full md:w-auto">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <Printer className="w-4 h-4" />
              Print Semua Label
            </Button>
            <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handlePrintLabelWithType(e.target.value);
                  e.target.value = '';
                }
              }}
              title="Print Semua Label"
            >
              <option value="" disabled>Pilih Ukuran Label</option>
              <option value="standar">Standar (100x50mm)</option>
              <option value="kecil">Kecil (70x30mm)</option>
              <option value="besar">Besar (100x100mm)</option>
            </select>
          </div>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>

          <Button
            onClick={() => navigate('/inventaris/baru')}
            className="flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />
            Tambah Inventaris
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
        {/* Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            {/* Search Nama Alat */}
            <div>
              <SearchableSelect
                name="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                options={[
                  { label: 'Semua Alat', value: '' },
                  ...(namaAlatData?.data || []).map(item => ({
                    label: item.nama_nama_alat,
                    value: item.nama_nama_alat
                  }))
                ]}
                placeholder="Cari nama alat..."
                searchPlaceholder="Cari..."
              />
            </div>

            {/* Kategori Filter */}
            <SearchableSelect
              name="kategori_alat_id"
              value={filters.kategori_alat_id}
              onChange={(e) => handleFilterChange('kategori_alat_id', e.target.value)}
              options={[
                { label: 'Semua Kategori', value: '' },
                ...categories.map(c => ({ label: c.nama_kategori, value: c.id }))
              ]}
              placeholder="Semua Kategori"
              searchPlaceholder="Cari kategori..."
            />

            {/* Divisi Filter - Hide for Admin Divisi */}
            {!isAdminDivisi && (
              <SearchableSelect
                name="divisi_id"
                value={filters.divisi_id}
                onChange={(e) => handleFilterChange('divisi_id', e.target.value)}
                options={[
                  { label: 'Semua Divisi', value: '' },
                  ...divisions.map(d => ({ label: d.nama_divisi, value: d.id_divisi }))
                ]}
                placeholder="Semua Divisi"
                searchPlaceholder="Cari divisi..."
              />
            )}

            {/* Ruangan Filter */}
            <SearchableSelect
              name="ruangan_id"
              value={filters.ruangan_id}
              onChange={(e) => handleFilterChange('ruangan_id', e.target.value)}
              options={[
                { label: 'Semua Ruangan', value: '' },
                ...rooms.map(r => ({ label: r.nama_ruangan, value: r.id_ruangan }))
              ]}
              placeholder="Semua Ruangan"
              searchPlaceholder="Cari ruangan..."
            />

            {/* Tahun Awal */}
            <Input
              type="number"
              placeholder="Tahun Awal (ex: 2020)"
              value={filters.tahun_awal}
              onChange={(e) => handleFilterChange('tahun_awal', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
              className="bg-bg-light border-none"
            />

            {/* Tahun Akhir */}
            <Input
              type="number"
              placeholder="Tahun Akhir (ex: 2024)"
              value={filters.tahun_akhir}
              onChange={(e) => handleFilterChange('tahun_akhir', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
              className="bg-bg-light border-none"
            />

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="h-[46px] border-dashed border-gray-300 hover:border-brand-primary hover:text-brand-primary"
            >
              Reset Filter
            </Button>

            {/* Column Toggle */}
            <ColumnToggle
              columns={COLUMN_DEFS}
              visibleColumns={visibleColumns}
              onToggle={toggleColumn}
              onShowAll={showAll}
              onHideAll={hideAll}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-light border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">No</th>
                {isVisible('no_inventaris') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">No. Inventaris</th>}
                {isVisible('nama_alat') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Nama Alat</th>}
                {isVisible('divisi') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Divisi</th>}
                {isVisible('ruangan') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Nama Bagian/Ruangan</th>}
                {isVisible('merk') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Merk</th>}
                {isVisible('model') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Model/Tipe</th>}
                {isVisible('seri') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">No. Seri</th>}
                {isVisible('daya') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Daya (watt)</th>}
                {isVisible('harga') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Harga</th>}
                {isVisible('harga_ganti') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Harga Ganti (AIC)</th>}
                {isVisible('tahun_pengadaan') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Tahun Pengadaan</th>}
                {isVisible('ruang_sekarang') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Letak Saat Ini/Ruang</th>}
                {isVisible('gedung') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Gedung</th>}
                {isVisible('kategori_alat') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Kategori Alat</th>}
                {isVisible('interval_maintenance') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Interval Maintenance</th>}
                {isVisible('img_alat') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Foto</th>}
                {isVisible('file_sertifikat') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Sertifikat</th>}
                {isVisible('kadaluwarsa') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Berlaku Hingga</th>}
                {isVisible('file_sop') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">File SOP</th>}
                {isVisible('qrcode') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">QR Code</th>}
                {isVisible('kondisi_alat') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase">Kondisi Alat</th>}
                {isVisible('actions') && <th className="py-4 px-6 text-xs font-bold text-[#808191] uppercase text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <TableSkeleton columns={Object.values(visibleColumns).filter(Boolean).length + 1} rows={10} />
              ) : dataList.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="py-12 text-center">
                    <Layers size={32} className="mx-auto text-gray-400 mb-4" />
                    <p className="font-bold text-gray-600">Tidak ada data inventaris</p>
                    <p className="text-sm text-gray-400 mt-1">Coba ubah filter pencarian Anda</p>
                  </td>
                </tr>
              ) : (
                dataList.map((item, index) => (
                  <tr key={item.id || `row-${index}`} className="hover:bg-gray-50/50 transition-colors">
                    {/* No Urut */}
                    <td className="py-4 px-6 font-bold text-gray-800">
                      {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                    </td>
                    {/* No Inventaris */}
                    {isVisible('no_inventaris') && (
                      <td className="py-4 px-6 text-sm">
                        <span className="px-2 py-1 rounded-md bg-purple-50 text-[#6C5DD3] text-xs font-bold">
                          {item.no_inventaris}
                        </span>
                      </td>
                    )}

                    {/* Nama Alat */}
                    {isVisible('nama_alat') && (
                      <td className="py-4 px-6 text-sm font-bold text-text-dark">
                        {item.nama_alat?.nama_nama_alat || '-'}
                      </td>
                    )}

                    {/* Divisi */}
                    {isVisible('divisi') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.nama_alat?.divisi?.nama_divisi || item.divisi?.nama_divisi || '-'}
                      </td>
                    )}

                    {/* Ruangan */}
                    {isVisible('ruangan') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.ruangan?.nama_ruangan || '-'}
                      </td>
                    )}

                    {/* Merk */}
                    {isVisible('merk') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.merk || '-'}
                      </td>
                    )}

                    {/* Model */}
                    {isVisible('model') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.model || '-'}
                      </td>
                    )}

                    {/* No Seri */}
                    {isVisible('seri') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.seri || '-'}
                      </td>
                    )}

                    {/* Daya */}
                    {isVisible('daya') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.daya || '-'}
                      </td>
                    )}

                    {/* Harga */}
                    {isVisible('harga') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.harga ? `Rp ${parseInt(item.harga).toLocaleString('id-ID')}` : '-'}
                      </td>
                    )}

                    {/* Harga Ganti (AIC) */}
                    {isVisible('harga_ganti') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.harga_pengganti ? `Rp ${parseInt(item.harga_pengganti).toLocaleString('id-ID')}` : '-'}
                      </td>
                    )}

                    {/* Tahun Pengadaan */}
                    {isVisible('tahun_pengadaan') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.tahun_pengadaan || '-'}
                      </td>
                    )}

                    {/* Ruang Sekarang */}
                    {isVisible('ruang_sekarang') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.ruangan_sekarang?.nama_ruangan || item.ruangan?.nama_ruangan || '-'}
                      </td>
                    )}

                    {/* Gedung */}
                    {isVisible('gedung') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.gedung || '-'}
                      </td>
                    )}

                    {/* Kategori Alat */}
                    {isVisible('kategori_alat') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {(item.alat_kesehatan === 1 || item.alat_kesehatan === true)
                          ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-600">Alat Kesehatan</span>
                              {item.kategori_alkes ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium inline-block w-fit">
                                  {item.kategori_alkes}
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium inline-block w-fit">
                                  Kategori belum diisi
                                </span>
                              )}
                            </div>
                          )
                          : item.nama_alat?.kategori_alat?.nama_kategori || '-'
                        }
                      </td>
                    )}

                    {/* Interval Maintenance */}
                    {isVisible('interval_maintenance') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.interval_maintenance || '-'}
                      </td>
                    )}

                    {/* Foto */}
                    {isVisible('img_alat') && (
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center">
                          {item.img_alat_url ? (
                            <div className="w-20 h-20 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-brand-primary" style={{ minWidth: '80px', minHeight: '80px', width: '80px', height: '80px' }}>
                              <LazyLoadImage
                                src={item.img_alat_url}
                                alt="Foto Alat"
                                effect="blur"
                                className="object-cover"
                                style={{ width: '80px', height: '80px', display: 'block' }}
                                placeholderSrc={noImage}
                                onError={(e) => { e.target.src = noImage; }}
                                onClick={() => setImagePreview({ isOpen: true, imageUrl: item.img_alat_url, altText: `Foto Alat - ${item.nama_alat}` })}
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

                    {/* Sertifikat */}
                    {isVisible('file_sertifikat') && (
                      <td className="py-4 px-6 text-sm">
                        {item.file_sertifikat_url ? (
                          <a
                            href={item.file_sertifikat_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary hover:underline text-xs"
                          >
                            Tampilkan
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">No file</span>
                        )}
                      </td>
                    )}

                    {/* Kadaluwarsa */}
                    {isVisible('kadaluwarsa') && (
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.kadaluwarsa ? new Date(item.kadaluwarsa).toLocaleDateString('id-ID') : '-'}
                      </td>
                    )}

                    {/* File SOP */}
                    {isVisible('file_sop') && (
                      <td className="py-4 px-6 text-sm">
                        {item.file_sop_url ? (
                          <a
                            href={item.file_sop_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary hover:underline text-xs"
                          >
                            Tampilkan
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">No file</span>
                        )}
                      </td>
                    )}

                    {/* QR Code */}
                    {isVisible('qrcode') && (
                      <td className="py-4 px-6 text-sm">
                        {item.qrcode_url ? (
                          <img
                            src={qrCodeIcon}
                            alt="QR Code"
                            className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => setImagePreview({
                              isOpen: true,
                              imageUrl: item.qrcode_url
                            })}
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">No QR</span>
                        )}
                      </td>
                    )}

                    {/* Kondisi */}
                    {isVisible('kondisi_alat') && (
                      <td className="py-4 px-6 text-sm">
                        {getKondisiBadge(item.kondisi_alat)}
                      </td>
                    )}

                    {/* Action */}
                    {isVisible('actions') && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {isPimpinan ? (
                            /* Pimpinan View: Only Detail */
                            <button
                              onClick={() => navigate(`/inventaris/detail/${item.id}`)}
                              className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                              title="Detail"
                            >
                              <Eye size={20} />
                            </button>
                          ) : (
                            /* Admin View: All Actions */
                            <>
                              {/* Print Label Select */}
                              <div className="relative">
                                <div className="p-3 bg-cyan-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all">
                                  <Printer size={20} />
                                </div>
                                <select
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handlePrintLabelWithType(e.target.value, item.id);
                                      e.target.value = '';
                                    }
                                  }}
                                  title="Print Label"
                                >
                                  <option value="" disabled>Pilih Ukuran Label</option>
                                  <option value="standar">Standar (100x50mm)</option>
                                  <option value="kecil">Kecil (70x30mm)</option>
                                  <option value="besar">Besar (100x100mm)</option>
                                </select>
                              </div>

                              {/* View Details */}
                              <button
                                onClick={() => navigate(`/inventaris/detail/${item.id}`)}
                                className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                                title="Detail"
                              >
                                <Eye size={20} />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => navigate(`/inventaris/edit/${item.id}`)}
                                className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
                                title="Edit"
                              >
                                <Edit2 size={20} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={deleteMutation.isPending}
                                className="p-3 bg-danger-500 text-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
                                title="Hapus"
                              >
                                <Trash2 size={20} />
                              </button>
                            </>
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
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            totalData={pagination.totalItems}
          />
        </div>
      </div>

      {confirmDialog.isOpen && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ isOpen: false })}
          type="danger"
        />
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={imagePreview.isOpen}
        imageUrl={imagePreview.imageUrl}
        onClose={() => setImagePreview({ isOpen: false, imageUrl: '' })}
      />
    </div>
  );
}

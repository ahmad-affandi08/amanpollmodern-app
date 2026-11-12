import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Tag, Users, ClipboardList } from 'lucide-react';
import {
  useMasterNamaAlat,
  useCreateNamaAlat,
  useUpdateNamaAlat,
  useDeleteNamaAlat,
  useMasterKategori,
  useMasterDivisi,
  useModal,
  usePageTitle,
  useToast,
} from '../../../hooks';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import RisikoBadge from '../../../components/RisikoBadge';
import { SKOR_FUNGSI, SKOR_RISIKO_KLINIS, SKOR_PEMELIHARAAN, KELAS_AMDD, hitungRisiko } from '../../../utils/risiko';
import Modal from '../../../components/Modal';
import ConfirmDialog from '../../../components/Alert/Alert';
import SearchableSelect from '../../../components/SearchableSelect';
import DataTable from '../../../components/DataTable';
import FilterBar from '../../../components/FilterBar';
import { useLocalTable, getTableFilters } from '../../../hooks/utils/useServerTable';
import { indexColumn } from '../../../utils/tableColumns';
import ChecklistMaintenanceModal from './components/ChecklistMaintenanceModal';

const RISIKO_KOSONG = { skor_fungsi: '', skor_risiko_klinis: '', skor_pemeliharaan: '', kelas_amdd: '' };

export default function MasterNamaAlat() {
  usePageTitle('Master Nama Alat');
  const modal = useModal();
  const checklistModal = useModal();

  const [formData, setFormData] = useState({
    nama_nama_alat: '',
    standar_usia_pakai: '',
    kategori_alat_id: '',
    divisi_id: '',
    ...RISIKO_KOSONG
  });

  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);


  const { data: namaAlatData, isLoading } = useMasterNamaAlat({ all: 1 });
  const { data: kategoriData } = useMasterKategori({ all: 1 });
  const { data: divisiData } = useMasterDivisi({ all: 1 });


  const createMutation = useCreateNamaAlat();
  const updateMutation = useUpdateNamaAlat();
  const deleteMutation = useDeleteNamaAlat();


  const dataList = namaAlatData?.data || namaAlatData || [];
  const categories = kategoriData?.data || kategoriData || [];
  const divisions = divisiData?.data || divisiData || [];


  const isSaving = createMutation.isPending || updateMutation.isPending;


  const handleOpenCreate = () => {
    setFormData({
      nama_nama_alat: '',
      standar_usia_pakai: '',
      kategori_alat_id: '',
      divisi_id: '',
      ...RISIKO_KOSONG
    });
    modal.open();
  };

  const handleOpenEdit = (item) => {
    setFormData({
      nama_nama_alat: item.nama_nama_alat,
      standar_usia_pakai: item.standar_usia_pakai,
      kategori_alat_id: item.kategori_alat_id || item.kategori_alat?.id_kategori_alat || '',
      divisi_id: item.divisi_id || item.divisi?.id_divisi || '',
      skor_fungsi: item.skor_fungsi ?? '',
      skor_risiko_klinis: item.skor_risiko_klinis ?? '',
      skor_pemeliharaan: item.skor_pemeliharaan ?? '',
      kelas_amdd: item.kelas_amdd ?? ''
    });
    modal.open(item);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast('Data berhasil dihapus', 'success');
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Gagal menghapus data. Mungkin sedang digunakan.',
        'error'
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    try {

      const cleanedData = {
        nama_nama_alat: formData.nama_nama_alat,
        standar_usia_pakai: parseInt(formData.standar_usia_pakai) || 0,
        kategori_alat_id: formData.kategori_alat_id ? parseInt(formData.kategori_alat_id) : null,
        divisi_id: formData.divisi_id ? parseInt(formData.divisi_id) : null,
        skor_fungsi: formData.skor_fungsi ? parseInt(formData.skor_fungsi) : null,
        skor_risiko_klinis: formData.skor_risiko_klinis ? parseInt(formData.skor_risiko_klinis) : null,
        skor_pemeliharaan: formData.skor_pemeliharaan ? parseInt(formData.skor_pemeliharaan) : null,
        kelas_amdd: formData.kelas_amdd || null,
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
    }
  };


  const setField = (name) => (e) => setFormData({ ...formData, [name]: e.target.value });
  const risiko = hitungRisiko(formData.skor_fungsi, formData.skor_risiko_klinis, formData.skor_pemeliharaan);

  const categoryOptions = categories.map(cat => ({
    value: cat.id_kategori_alat || cat.id,
    label: cat.nama_kategori
  }));

  const divisionOptions = divisions.map(div => ({
    value: div.id_divisi || div.id,
    label: div.nama_divisi
  }));

  const columns = [
    indexColumn(),
    { id: 'nama_nama_alat', header: 'Nama Alat', cell: ({ row }) => row.original.nama_nama_alat, meta: { cellClassName: 'font-bold text-text-dark' } },
    { id: 'kategori', header: 'Kategori', cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Tag size={12} className="text-brand-primary" />
        <span className="font-semibold text-xs">{row.original.kategori_alat?.nama_kategori || '-'}</span>
      </div>
    ) },
    { id: 'divisi', header: 'Divisi', cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users size={12} className="text-[#FF754C]" />
        <span className="font-semibold text-xs">{row.original.divisi?.nama_divisi || '-'}</span>
      </div>
    ) },
    { id: 'standar_usia_pakai', header: 'Usia Pakai', cell: ({ row }) => `${row.original.standar_usia_pakai} Tahun`, meta: { cellClassName: 'font-bold' } },
    { id: 'risiko', header: 'Risiko', cell: ({ row: { original: item } }) => <RisikoBadge tingkat={item.tingkat_risiko} skor={item.skor_risiko} size="sm" /> },
    { id: 'actions', header: 'Aksi', meta: { align: 'right' }, cell: ({ row: { original: item } }) => (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => checklistModal.open(item)}
          className="p-2 bg-purple-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all"
          title="Checklist Maintenance"
        >
          <ClipboardList size={16} />
        </button>
        <button onClick={() => handleOpenEdit(item)} className="p-2 bg-brand-primary text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all" title="Edit">
          <Edit2 size={16} />
        </button>
        <button onClick={() => setDeleteTarget(item)} className="p-2 bg-danger-500 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all" title="Hapus" disabled={deleteMutation.isPending}>
          <Trash2 size={16} />
        </button>
      </div>
    ) },
  ];

  const table = useLocalTable({
    columns,
    data: dataList,
    pageSize: 10,
    getRowId: (item) => item.id,
    matchSearch: (item, q) =>
      item.nama_nama_alat?.toLowerCase().includes(q) ||
      item.kategori_alat?.nama_kategori?.toLowerCase().includes(q),
  });
  const f = getTableFilters(table);

  return (
    <div className="space-y-6 animate-fade-in">

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Nama Alat"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.nama_nama_alat ?? ''}"?`}
        type="danger"
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark">Master Nama Alat</h1>
          <p className="text-text-gray text-xs mt-1">Standarisasi nama alat dan masa pakai</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 shadow-lg shadow-brand-primary/20">
          <Plus size={16} />
          <span>Tambah Nama Alat</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <FilterBar
          search={
            <Input
              name="search"
              size="sm"
              placeholder="Cari nama alat..."
              value={f.search}
              onChange={(e) => f.setSearch(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
              className="!bg-white"
            />
          }
        />

        <DataTable
          table={table}
          isLoading={isLoading}
          empty={{ icon: Package, title: 'Belum ada data', description: 'Silakan tambahkan nama alat baru' }}
        />
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data ? 'Edit Nama Alat' : 'Tambah Nama Alat'}
        footer={
          <>
            <Button variant="ghost" onClick={modal.close} disabled={isSaving}>Batal</Button>
            <Button type="submit" form="form-nama-alat" loading={isSaving}>
              {modal.data ? 'Perbarui Data' : 'Simpan Data'}
            </Button>
          </>
        }
      >
        <form id="form-nama-alat" onSubmit={handleSubmit} className="space-y-6">
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
              <SearchableSelect
                label="Kategori"
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
              <SearchableSelect
                label="Divisi"
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

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-dark">Penilaian Risiko (Fennig-Koh)</h3>
              <RisikoBadge tingkat={risiko?.tingkat} skor={risiko?.total} />
            </div>
            <SearchableSelect
              label="Fungsi Alat"
              name="skor_fungsi"
              options={[{ label: 'Belum dinilai', value: '' }, ...SKOR_FUNGSI]}
              value={formData.skor_fungsi}
              onChange={setField('skor_fungsi')}
              placeholder="Belum dinilai"
              searchPlaceholder="Cari skor..."
            />
            <SearchableSelect
              label="Risiko Klinis (bila alat gagal)"
              name="skor_risiko_klinis"
              options={[{ label: 'Belum dinilai', value: '' }, ...SKOR_RISIKO_KLINIS]}
              value={formData.skor_risiko_klinis}
              onChange={setField('skor_risiko_klinis')}
              placeholder="Belum dinilai"
              searchPlaceholder="Cari skor..."
            />
            <SearchableSelect
              label="Persyaratan Pemeliharaan"
              name="skor_pemeliharaan"
              options={[{ label: 'Belum dinilai', value: '' }, ...SKOR_PEMELIHARAAN]}
              value={formData.skor_pemeliharaan}
              onChange={setField('skor_pemeliharaan')}
              placeholder="Belum dinilai"
              searchPlaceholder="Cari skor..."
            />
            <SearchableSelect
              label="Kelas Risiko Kemenkes (opsional)"
              name="kelas_amdd"
              options={[{ label: 'Tidak diisi', value: '' }, ...KELAS_AMDD]}
              value={formData.kelas_amdd}
              onChange={setField('kelas_amdd')}
              placeholder="Tidak diisi"
              searchPlaceholder="Cari skor..."
            />
            <p className="text-xs text-gray-500">
              Isi ketiga skor sekaligus atau kosongkan semuanya. Tinggi (9-12): PM 2x/tahun; Sedang (6-8) dan Rendah (3-5): PM 1x/tahun.
            </p>
          </div>
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

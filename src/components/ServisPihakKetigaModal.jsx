import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { useToast } from './Alert/useToast';
import { useTambahServisPihakKetiga } from '../hooks/queries/useServisPihakKetigaQueries';
import { toInputDate } from '../utils/format';
import { SERVIS_ACCEPT, SERVIS_MAKS_MB, pesanGalat } from '../utils/servisPihakKetiga';

const KONDISI_OPTIONS = [
  { value: '', label: 'Tidak disebutkan' },
  { value: 'Baik', label: 'Baik' },
  { value: 'Rusak Ringan', label: 'Rusak Ringan' },
  { value: 'Rusak Berat', label: 'Rusak Berat' },
  { value: 'Dalam Perbaikan', label: 'Dalam Perbaikan' },
];

const emptyForm = () => ({
  nama_vendor: '',
  nomor_laporan: '',
  tanggal_servis: toInputDate(),
  tindakan_vendor: '',
  kondisi_setelah: '',
  file_laporan: null,
});

/**
 * Tambah laporan servis pihak ketiga (vendor) pada aduan atau pemeliharaan.
 * Biaya tidak diisi di sini: tetap satu kali di form pemeriksaan.
 * Dipasang dengan key agar form kembali kosong tiap dibuka.
 */
export default function ServisPihakKetigaModal({ isOpen, onClose, jenis, indukId, namaVendorSaran = [] }) {
  const { showToast } = useToast();
  const tambah = useTambahServisPihakKetiga();
  const [form, setForm] = useState(emptyForm);
  const [fileKey, setFileKey] = useState(0);

  const handleClose = () => {
    setForm(emptyForm());
    setFileKey((k) => k + 1);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] || null : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Event React ikut naik lewat portal ke form induk (mis. form pemeriksaan teknisi).
    e.stopPropagation();

    if (!form.nama_vendor.trim()) {
      showToast('Nama vendor wajib diisi', 'error');
      return;
    }
    if (!form.tanggal_servis) {
      showToast('Tanggal servis wajib diisi', 'error');
      return;
    }
    if (form.tanggal_servis > toInputDate()) {
      showToast('Tanggal servis tidak boleh lebih dari hari ini', 'error');
      return;
    }
    if (!form.file_laporan) {
      showToast('File laporan wajib diunggah', 'error');
      return;
    }
    if (form.file_laporan.size > SERVIS_MAKS_MB * 1024 * 1024) {
      showToast(`Ukuran file maksimal ${SERVIS_MAKS_MB}MB`, 'error');
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        payload.append(key, typeof value === 'string' ? value.trim() : value);
      }
    });

    try {
      await tambah.mutateAsync({ jenis, id: indukId, data: payload });
      showToast('Laporan pihak ketiga berhasil ditambahkan', 'success');
      handleClose();
    } catch (error) {
      showToast(pesanGalat(error, 'Gagal menambahkan laporan pihak ketiga'), 'error');
    }
  };

  const listId = `vendor-saran-${jenis}-${indukId}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Laporan Pihak Ketiga"
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={tambah.isPending}>
            Batal
          </Button>
          <Button type="submit" form={`servis-form-${jenis}-${indukId}`} loading={tambah.isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form id={`servis-form-${jenis}-${indukId}`} onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Vendor"
          name="nama_vendor"
          maxLength={150}
          list={listId}
          placeholder="Contoh: PT Medika Jaya"
          value={form.nama_vendor}
          onChange={handleChange}
        />
        <datalist id={listId}>
          {namaVendorSaran.map((nama) => (
            <option key={nama} value={nama} />
          ))}
        </datalist>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tanggal Servis"
            name="tanggal_servis"
            type="date"
            max={toInputDate()}
            value={form.tanggal_servis}
            onChange={handleChange}
          />
          <Input
            label="No. Laporan Vendor"
            name="nomor_laporan"
            maxLength={100}
            placeholder="Opsional"
            value={form.nomor_laporan}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#808191] mb-2 pl-1">Ringkasan Tindakan</label>
          <textarea
            name="tindakan_vendor"
            rows={3}
            maxLength={5000}
            value={form.tindakan_vendor}
            onChange={handleChange}
            placeholder="Hasil pemeriksaan atau perbaikan menurut vendor (opsional)"
            className="w-full px-3 py-2 text-sm rounded-xl bg-[#F8F9FB] border border-gray-200 font-medium outline-none focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-[#B0B3C7]"
          />
        </div>

        <Select
          label="Kondisi Alat Setelah Servis"
          name="kondisi_setelah"
          value={form.kondisi_setelah}
          onChange={handleChange}
          options={KONDISI_OPTIONS}
        />
        <p className="text-[10px] text-gray-400 -mt-2 pl-1">
          Hanya catatan dari vendor. Kondisi alat resmi tetap diisi teknisi saat pemeriksaan.
        </p>

        <div>
          <label className="block text-sm font-semibold text-[#808191] mb-2 pl-1">File Laporan Vendor</label>
          <input
            key={fileKey}
            type="file"
            name="file_laporan"
            accept={SERVIS_ACCEPT}
            onChange={handleChange}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
          />
          <p className="text-[10px] text-gray-400 mt-1 pl-1">.pdf, .jpg, .png (Maks {SERVIS_MAKS_MB}MB)</p>
        </div>

        <p className="text-[10px] text-gray-500 bg-gray-50 rounded-lg p-2.5">
          Biaya servis vendor tidak diisi di sini. Masukkan total biaya perbaikan satu kali pada form pemeriksaan.
        </p>
      </form>
    </Modal>
  );
}

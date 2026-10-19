import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { useToast } from './Alert/useToast';
import { useAddKalibrasi } from '../hooks/queries/useInventarisQueries';

const EMPTY_FORM = {
  tanggal_kalibrasi: '',
  kadaluwarsa: '',
  lembaga_kalibrasi: '',
  keterangan: '',
  file_sertifikat: null,
};

/**
 * Form untuk mencatat kalibrasi baru pada sebuah alat.
 * Kalibrasi terbaru otomatis menjadi kalibrasi aktif alat.
 */
export default function KalibrasiModal({ isOpen, onClose, inventarisId, onSuccess }) {
  const { showToast } = useToast();
  const addKalibrasi = useAddKalibrasi();
  const [form, setForm] = useState(EMPTY_FORM);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] || null : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tanggal_kalibrasi) {
      showToast('Tanggal kalibrasi wajib diisi', 'error');
      return;
    }
    if (form.kadaluwarsa && form.kadaluwarsa < form.tanggal_kalibrasi) {
      showToast('Tanggal kadaluwarsa tidak boleh sebelum tanggal kalibrasi', 'error');
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        payload.append(key, value);
      }
    });

    try {
      await addKalibrasi.mutateAsync({ id: inventarisId, data: payload });
      showToast('Riwayat kalibrasi berhasil ditambahkan', 'success');
      setForm(EMPTY_FORM);
      onSuccess?.();
      onClose();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat().join(', ')
        : error.response?.data?.message || 'Gagal menambahkan riwayat kalibrasi';
      showToast(message, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Kalibrasi"
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={addKalibrasi.isPending}>
            Batal
          </Button>
          <Button type="submit" form="kalibrasi-form" loading={addKalibrasi.isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="kalibrasi-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tanggal Kalibrasi"
            name="tanggal_kalibrasi"
            type="date"
            value={form.tanggal_kalibrasi}
            onChange={handleChange}
            required
          />
          <Input
            label="Berlaku Hingga"
            name="kadaluwarsa"
            type="date"
            min={form.tanggal_kalibrasi || undefined}
            value={form.kadaluwarsa}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Lembaga / Vendor Kalibrasi"
          name="lembaga_kalibrasi"
          maxLength={150}
          placeholder="Contoh: BPFK Jakarta"
          value={form.lembaga_kalibrasi}
          onChange={handleChange}
        />

        <div>
          <label className="block text-sm font-semibold text-[#808191] mb-2 pl-1">Keterangan</label>
          <textarea
            name="keterangan"
            rows={3}
            maxLength={1000}
            value={form.keterangan}
            onChange={handleChange}
            placeholder="Catatan hasil kalibrasi (opsional)"
            className="w-full px-3 py-2 text-sm rounded-xl bg-[#F8F9FB] border border-gray-200 font-medium outline-none focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-[#B0B3C7]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#808191] mb-2 pl-1">Sertifikat Kalibrasi</label>
          <input
            type="file"
            name="file_sertifikat"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
          />
          <p className="text-[10px] text-gray-400 mt-1 pl-1">.pdf, .jpg, .png (Maks 5MB)</p>
        </div>
      </form>
    </Modal>
  );
}

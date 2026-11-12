import React, { useMemo, useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { useToast } from './Alert/useToast';
import useAuth from '../hooks/utils/useAuth';
import { useUbahStatusAset } from '../hooks/queries/useInventarisQueries';
import { useServisPihakKetiga } from '../hooks/queries/useServisPihakKetigaQueries';
import { formatDate, toInputDate } from '../utils/format';
import {
  STATUS_ASET,
  TINDAK_LANJUT,
  apiErrorMessage,
  statusAsetOf,
  statusTujuanFor,
} from '../utils/statusAset';

const KONDISI_AKTIF = ['Baik', 'Rusak Ringan', 'Dalam Perbaikan'];

const emptyForm = (tujuan) => ({
  status_aset: tujuan || '',
  tanggal_status: toInputDate(),
  alasan: '',
  lokasi_penyimpanan: '',
  tindak_lanjut: '',
  nomor_sk: '',
  tanggal_sk: '',
  nomor_ba: '',
  tanggal_ba: '',
  kondisi_alat: '',
  file_dokumen: null,
});

const textareaClass =
  'w-full px-3 py-2 text-sm rounded-xl bg-[#F8F9FB] border border-gray-200 font-medium outline-none focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-[#B0B3C7]';

/**
 * Menggudangkan alat rusak berat, menghapusnya dari daftar aset, atau mengaktifkannya kembali.
 * Penghapusan wajib memuat SK dan berita acara penghapusan (pengelolaan barang milik daerah).
 * Modal dipasang dengan key={inventaris.id} supaya form kembali kosong untuk tiap alat.
 */
export default function StatusAsetModal({ isOpen, onClose, inventaris }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const mutation = useUbahStatusAset();

  const statusSaatIni = statusAsetOf(inventaris);
  const pilihan = useMemo(() => statusTujuanFor(user, statusSaatIni), [user, statusSaatIni]);
  const [form, setForm] = useState(() => emptyForm(pilihan[0]));

  const tujuan = form.status_aset;
  const dihapus = tujuan === STATUS_ASET.DIHAPUS;
  const digudangkan = tujuan === STATUS_ASET.DIGUDANGKAN;
  const aktif = tujuan === STATUS_ASET.AKTIF;

  // Laporan vendor sebagai dasar pertimbangan teknis saat menggudangkan/menghapus (hanya informasi).
  const { data: laporanVendor = [] } = useServisPihakKetiga('inventaris', inventaris?.id, { enabled: isOpen && !aktif });

  const handleClose = () => {
    setForm(emptyForm(pilihan[0]));
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] || null : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== '') payload.append(key, value);
    });

    try {
      const res = await mutation.mutateAsync({ id: inventaris.id, data: payload });
      showToast(res?.message || 'Status alat berhasil diubah', 'success');
      setForm(emptyForm(pilihan[0]));
      onClose();
    } catch (error) {
      showToast(apiErrorMessage(error, 'Gagal mengubah status alat'), 'error');
    }
  };

  const judul = aktif ? 'Aktifkan Kembali Alat' : dihapus ? 'Hapus dari Daftar Aset' : 'Gudangkan Alat';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={judul}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button
            type="submit"
            form="status-aset-form"
            variant={dihapus ? 'danger' : 'primary'}
            loading={mutation.isPending}
            disabled={pilihan.length === 0}
          >
            Simpan
          </Button>
        </>
      }
    >
      <form id="status-aset-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl bg-[#F8F9FB] border border-gray-100 px-4 py-3 text-sm">
          <p className="font-bold text-[#11142D]">{inventaris?.nama_alat?.nama_nama_alat || 'Alat'}</p>
          <p className="text-xs text-[#808191]">
            {inventaris?.no_inventaris} · Status saat ini: <b>{statusSaatIni}</b> · Kondisi: <b>{inventaris?.kondisi_alat || '-'}</b>
          </p>
        </div>

        {!aktif && laporanVendor.length > 0 && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-xs" data-testid="ringkasan-servis-vendor">
            <p className="font-bold text-indigo-800 mb-1">
              Laporan pihak ketiga terakhir ({laporanVendor.length} laporan tercatat)
            </p>
            <p className="text-indigo-900">
              <b>{laporanVendor[0].nama_vendor}</b> · {formatDate(laporanVendor[0].tanggal_servis)}
              {laporanVendor[0].kondisi_setelah ? ` · Kondisi setelah servis: ${laporanVendor[0].kondisi_setelah}` : ''}
            </p>
            {laporanVendor[0].tindakan_vendor && (
              <p className="text-indigo-800 mt-1 line-clamp-3 whitespace-pre-line">{laporanVendor[0].tindakan_vendor}</p>
            )}
          </div>
        )}

        {pilihan.length === 0 && (
          <p className="text-sm text-red-600">Anda tidak memiliki izin untuk mengubah status alat ini.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Ubah Status Menjadi"
            name="status_aset"
            value={form.status_aset}
            onChange={handleChange}
            options={pilihan.map((s) => ({ value: s, label: s }))}
            required
          />
          <Input
            label="Tanggal"
            name="tanggal_status"
            type="date"
            max={toInputDate()}
            value={form.tanggal_status}
            onChange={handleChange}
          />
        </div>

        {digudangkan && (
          <Input
            label="Lokasi Penyimpanan (Gudang)"
            name="lokasi_penyimpanan"
            maxLength={150}
            placeholder="Contoh: Gudang Barang Rusak Lantai 1"
            value={form.lokasi_penyimpanan}
            onChange={handleChange}
            required
          />
        )}

        {aktif && (
          <Select
            label="Kondisi Alat Saat Ini"
            name="kondisi_alat"
            value={form.kondisi_alat}
            onChange={handleChange}
            placeholder="Pilih kondisi"
            options={KONDISI_AKTIF.map((k) => ({ value: k, label: k }))}
            required
          />
        )}

        {dihapus && (
          <>
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
              Penghapusan dari daftar aset harus berdasarkan Surat Keputusan (SK) pejabat berwenang dan berita acara
              penghapusan. Data alat dan seluruh riwayatnya tetap tersimpan untuk keperluan audit.
            </div>
            <Select
              label="Tindak Lanjut Penghapusan"
              name="tindak_lanjut"
              value={form.tindak_lanjut}
              onChange={handleChange}
              placeholder="Pilih tindak lanjut"
              options={TINDAK_LANJUT.map((t) => ({ value: t, label: t }))}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nomor SK Penghapusan" name="nomor_sk" maxLength={150} value={form.nomor_sk} onChange={handleChange} required />
              <Input label="Tanggal SK" name="tanggal_sk" type="date" max={toInputDate()} value={form.tanggal_sk} onChange={handleChange} required />
              <Input label="Nomor Berita Acara" name="nomor_ba" maxLength={150} value={form.nomor_ba} onChange={handleChange} required />
              <Input label="Tanggal Berita Acara" name="tanggal_ba" type="date" max={toInputDate()} value={form.tanggal_ba} onChange={handleChange} required />
            </div>
          </>
        )}

        {digudangkan && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nomor Berita Acara (opsional)" name="nomor_ba" maxLength={150} value={form.nomor_ba} onChange={handleChange} />
            <Input label="Tanggal Berita Acara" name="tanggal_ba" type="date" max={toInputDate()} value={form.tanggal_ba} onChange={handleChange} />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-[#808191] mb-2 pl-1">
            Alasan <span className="text-[#FF754C]">*</span>
          </label>
          <textarea
            name="alasan"
            rows={3}
            minLength={5}
            maxLength={1000}
            required
            value={form.alasan}
            onChange={handleChange}
            placeholder={aktif ? 'Contoh: Sudah diperbaiki vendor' : 'Contoh: Rusak berat, biaya perbaikan melebihi nilai alat'}
            className={textareaClass}
          />
        </div>

        {!aktif && (
          <div>
            <label className="block text-sm font-semibold text-[#808191] mb-2 pl-1">Dokumen SK / Berita Acara</label>
            <input
              type="file"
              name="file_dokumen"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
            />
            <p className="text-[10px] text-gray-400 mt-1 pl-1">.pdf, .jpg, .png (Maks 5MB)</p>
          </div>
        )}
      </form>
    </Modal>
  );
}

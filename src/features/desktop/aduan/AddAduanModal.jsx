import React, { useState, useEffect } from 'react';
import { refreshAllData } from '../../../lib/queryClient';
import Modal from '../../../components/Modal';
import Input from '../../../components/Input';
import SearchableSelect from '../../../components/SearchableSelect';
import Button from '../../../components/Button';
import InventarisApi from '../../../api/InventarisApi';
import AduanApi from '../../../api/AduanApi';
import { useToast, useAuth } from '../../../hooks';
import CameraCapture from '../../../components/CameraCapture';
import { Camera } from 'lucide-react';

// Sama dengan aturan backend (StoreAduanRequest): jpg/jpeg/png, maksimal 10MB.
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png'];
const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/** Mengembalikan pesan kesalahan (bahasa Indonesia) atau string kosong bila file valid. */
const validateImageFile = (file) => {
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const typeOk = ALLOWED_IMAGE_TYPES.includes(file.type) || (!file.type && ALLOWED_IMAGE_EXTENSIONS.includes(extension));
  if (!typeOk) return 'Foto harus berformat JPG, JPEG, atau PNG.';
  if (file.size > MAX_IMAGE_SIZE) return `Ukuran foto maksimal ${MAX_IMAGE_SIZE_MB}MB.`;
  return '';
};

const createInitialForm = (user) => ({
  ruangan_id: '',
  inventaris_id: '',
  divisi_id: '',
  keluhan: '',
  img_keluhan: null,
  nama_pengadu: user?.nama_lengkap || '',

  no_inventaris: '',
  nama_alat_id: '',
  nama_alat_nama: '',
  ruangan_nama: '',
  divisi_nama: '',
  merk: ''
});

/**
 * Isi form dipisahkan agar state-nya ikut dibuang saat modal ditutup:
 * membuka modal lagi selalu mulai dari form kosong.
 */
function AddAduanForm({ onClose, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState(() => createInitialForm(user));
  const [inventarisOptions, setInventarisOptions] = useState([]);
  const [loadingInventaris, setLoadingInventaris] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAllInventaris = async () => {
      try {
        // Bentuk respons `view: 'simple'` (InventarisSimpleResource): id, no_inventaris, merk,
        // nama_alat{id, nama_nama_alat}, ruangan{id, nama_ruangan}, divisi{id, nama_divisi}.
        const res = await InventarisApi.getAll({ per_page: 2000, view: 'simple' });
        if (cancelled) return;

        setInventarisOptions((res.data || []).map(item => ({
          label: `${item.no_inventaris} - ${item.nama_alat?.nama_nama_alat || 'Alat'}`,
          value: item.id,
          raw: item
        })));
      } catch (err) {
        if (cancelled) return;
        console.error('Gagal memuat daftar alat', err);
        showToast('Gagal memuat daftar alat', 'error');
      } finally {
        if (!cancelled) setLoadingInventaris(false);
      }
    };

    loadAllInventaris();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleInventarisChange = (invId) => {
    const selected = inventarisOptions.find(opt => String(opt.value) === String(invId));

    if (selected && selected.raw) {
      const item = selected.raw;

      setFormData(prev => ({
        ...prev,
        inventaris_id: invId,
        no_inventaris: item.no_inventaris || '-',
        nama_alat_id: item.nama_alat?.id || '',
        nama_alat_nama: item.nama_alat?.nama_nama_alat || '-',
        ruangan_id: item.ruangan?.id || '',
        ruangan_nama: item.ruangan?.nama_ruangan || '-',
        divisi_id: item.divisi?.id || '',
        divisi_nama: item.divisi?.nama_divisi || '-',
        merk: item.merk || '-'
      }));
    } else {
      // Pilihan dihapus: kosongkan juga data turunan dari alat sebelumnya.
      setFormData(prev => ({
        ...createInitialForm(user),
        keluhan: prev.keluhan,
        img_keluhan: prev.img_keluhan,
        nama_pengadu: prev.nama_pengadu,
        inventaris_id: invId
      }));
    }
  };

  const setImage = (file) => {
    const error = validateImageFile(file);
    if (error) {
      showToast(error, 'error');
      return false;
    }
    setFormData(prev => ({ ...prev, img_keluhan: file }));
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !setImage(file)) {
      // Kosongkan input agar file yang sama bisa dipilih ulang setelah dipilih yang valid.
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;

    if (!formData.inventaris_id || !formData.keluhan.trim()) {
      showToast('Mohon lengkapi data wajib (Inventaris, Keluhan).', 'error');
      return;
    }
    if (!formData.ruangan_id || !formData.divisi_id) {
      showToast('Alat yang dipilih belum memiliki data ruangan/divisi, sehingga aduan belum dapat dibuat. Lengkapi data alat terlebih dahulu.', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = new FormData();
      payload.append('ruangan_id', formData.ruangan_id);
      payload.append('inventaris_id', formData.inventaris_id);
      payload.append('divisi_id', formData.divisi_id);
      payload.append('keluhan', formData.keluhan.trim());
      payload.append('nama_pengadu', formData.nama_pengadu);
      if (user?.id_user) payload.append('pengadu_id', user.id_user);

      if (formData.no_inventaris) payload.append('no_inventaris', formData.no_inventaris);
      if (formData.nama_alat_id) payload.append('nama_alat_id', formData.nama_alat_id);

      if (formData.img_keluhan) {
        payload.append('img_keluhan', formData.img_keluhan);
      }

      await AduanApi.create(payload);
      await refreshAllData();
      showToast('Aduan berhasil dilaporkan', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Gagal mengirim aduan', error);
      const errors = error.response?.data?.errors;
      const detail = errors ? Object.values(errors).flat().join(', ') : '';
      showToast(detail || error.response?.data?.message || 'Gagal mengirim aduan', 'error');
      setSubmitLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <SearchableSelect
        label={loadingInventaris ? 'Memuat Alat...' : 'Pilih Alat / Inventaris'}
        name="inventaris_id"
        options={inventarisOptions}
        value={formData.inventaris_id}
        onChange={(e) => handleInventarisChange(e.target.value)}
        placeholder="-- Pilih Inventaris --"
        searchPlaceholder="Cari nomor inventaris atau nama alat..."
        required
        disabled={loadingInventaris}
        size="sm"
      />

      {/* Read Only Details */}
      <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="col-span-2">
          <label className="text-[10px] text-gray-500 font-bold uppercase">Lokasi / Ruangan</label>
          <p className="font-semibold text-sm text-gray-800">{formData.ruangan_nama || '-'}</p>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 font-bold uppercase">Nama Alat</label>
          <p className="font-semibold text-sm text-gray-800">{formData.nama_alat_nama || '-'}</p>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 font-bold uppercase">No Inventaris</label>
          <p className="font-semibold text-sm text-gray-800 break-all">{formData.no_inventaris || '-'}</p>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-gray-500 font-bold uppercase">Merk / Type</label>
          <p className="font-semibold text-sm text-gray-800">{formData.merk || '-'}</p>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 font-bold uppercase">Divisi</label>
          <p className="font-semibold text-sm text-gray-800">{formData.divisi_nama || '-'}</p>
        </div>
      </div>

      <div>
        <label htmlFor="aduan-keluhan" className="block text-xs font-semibold text-[#808191] mb-1.5 pl-1">Keluhan Kerusakan <span className="text-red-500">*</span></label>
        <textarea
          id="aduan-keluhan"
          className="w-full px-3 py-2 bg-bg-light border border-gray-200 rounded-xl text-text-dark font-medium outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all min-h-[80px] text-sm"
          value={formData.keluhan}
          onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
          placeholder="Deskripsikan kerusakan alat..."
          required
        ></textarea>
      </div>

      <Input
        label="Nama Pelapor"
        value={formData.nama_pengadu}
        onChange={(e) => setFormData({ ...formData, nama_pengadu: e.target.value })}
        required
        size="sm"
      />

      <div>
        <label className="block text-xs font-semibold text-[#808191] mb-1.5 pl-1">Foto Bukti (Opsional)</label>
        <div className="flex gap-2">
          <div className="relative flex-1 border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:bg-gray-50 hover:border-brand-primary/50 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Unggah foto bukti"
            />
            <div className="text-gray-400">
              {formData.img_keluhan && !formData.img_keluhan.name.startsWith('capture_') ? (
                <span className="text-brand-primary font-medium truncate block max-w-[150px] mx-auto text-xs">{formData.img_keluhan.name}</span>
              ) : (
                <span className="text-[10px]">Klik untuk unggah foto (JPG/PNG, maks. {MAX_IMAGE_SIZE_MB}MB)</span>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCamera(true)}
            className="flex flex-col items-center justify-center p-2 h-auto w-20 gap-1 border-dashed"
          >
            <Camera size={16} className="text-gray-500" />
            <span className="text-[9px] text-gray-500 font-normal">Ambil Foto</span>
          </Button>
        </div>

        {/* Show captured file name if from camera */}
        {formData.img_keluhan && formData.img_keluhan.name.startsWith('capture_') && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <Camera size={12} /> Foto diambil: {formData.img_keluhan.name}
          </p>
        )}

        <CameraCapture
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={setImage}
        />
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitLoading}>Batal</Button>
        <Button type="submit" loading={submitLoading} size="sm">Kirim Laporan</Button>
      </div>
    </form>
  );
}

export default function AddAduanModal({ isOpen, onClose, onSuccess }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Laporan Aduan">
      <AddAduanForm onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}

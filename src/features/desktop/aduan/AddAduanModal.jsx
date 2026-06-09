import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Input from '../../../components/Input';
import SearchableSelect from '../../../components/SearchableSelect';
import Button from '../../../components/Button';
import InventarisApi from '../../../api/InventarisApi';
import AduanApi from '../../../api/AduanApi';
import { useToast } from '../../../components/Alert/useToast';
import useAuth from '../../../hooks/utils/useAuth';
import CameraCapture from '../../../components/CameraCapture';
import { Camera } from 'lucide-react';

export default function AddAduanModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showCamera, setShowCamera] = useState(false);

  const [formData, setFormData] = useState({
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

  const [inventarisOptions, setInventarisOptions] = useState([]);
  const [loadingInventaris, setLoadingInventaris] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllInventaris();
      if (!formData.nama_pengadu && user?.nama_lengkap) {
        setFormData(prev => ({ ...prev, nama_pengadu: user.nama_lengkap }));
      }
    }
  }, [isOpen, user]);

  const loadAllInventaris = async () => {
    setLoadingInventaris(true);
    try {
      const res = await InventarisApi.getAll({ per_page: 2000, view: 'simple' });

      if (res.data) {
        setInventarisOptions(res.data.map(item => ({
          label: `${item.no_inventaris} - ${item.nama_alat?.nama_nama_alat || 'Alat'}`,
          value: item.id,
          raw: item
        })));
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat daftar alat', 'error');
    } finally {
      setLoadingInventaris(false);
    }
  };

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
        divisi_id: item.divisi?.id || item.nama_alat?.divisi?.id || '',
        divisi_nama: item.divisi?.nama_divisi || item.nama_alat?.divisi?.nama_divisi || '-',
        merk: item.merk || '-'
      }));
    } else {
      setFormData(prev => ({ ...prev, inventaris_id: invId }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, img_keluhan: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.inventaris_id || !formData.keluhan) {
      showToast('Mohon lengkapi data wajib (Inventaris, Keluhan).', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = new FormData();
      payload.append('ruangan_id', formData.ruangan_id);
      payload.append('inventaris_id', formData.inventaris_id);
      if (formData.divisi_id) payload.append('divisi_id', formData.divisi_id);
      payload.append('keluhan', formData.keluhan);
      payload.append('nama_pengadu', formData.nama_pengadu);
      if (user?.id_user) payload.append('pengadu_id', user.id_user);

      if (formData.no_inventaris) payload.append('no_inventaris', formData.no_inventaris);
      if (formData.nama_alat_id) payload.append('nama_alat_id', formData.nama_alat_id);

      if (formData.img_keluhan) {
        payload.append('img_keluhan', formData.img_keluhan);
      }

      await AduanApi.create(payload);
      showToast('Aduan berhasil dilaporkan', 'success');
      
      // Reset form state so next opening is fresh
      setFormData({
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
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      showToast(error.response?.data?.message || 'Gagal mengirim aduan', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Laporan Aduan">
      <form onSubmit={handleSubmit} className="space-y-3">
        <SearchableSelect
          label={loadingInventaris ? "Memuat Alat..." : "Pilih Alat / Inventaris"}
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
          <label className="block text-xs font-semibold text-[#808191] mb-1.5 pl-1">Keluhan Kerusakan <span className="text-red-500">*</span></label>
          <textarea
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
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-gray-400">
                {formData.img_keluhan && !formData.img_keluhan.name.startsWith('capture_') ? (
                  <span className="text-brand-primary font-medium truncate block max-w-[150px] mx-auto text-xs">{formData.img_keluhan.name}</span>
                ) : (
                  <span className="text-[10px]">Klik untuk upload foto</span>
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
            onCapture={(file) => setFormData(prev => ({ ...prev, img_keluhan: file }))}
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={submitLoading} size="sm">Kirim Laporan</Button>
        </div>
      </form>
    </Modal>
  );
}

import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import AduanApi from '../../../api/AduanApi';
import { useToast } from '../../../components/Alert/useToast';

export default function DetailAduanModal({ isOpen, onClose, aduan, onUpdate }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(aduan?.status_aduan || '');

  const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Sedang Dikerjakan', value: 'Sedang Dikerjakan' },
    { label: 'Tindakan Lanjutan', value: 'Tindakan Lanjutan' },
    { label: 'Selesai', value: 'Selesai' }
  ];

  const handleUpdateStatus = async () => {
    if (newStatus === aduan.status_aduan) return;

    setLoading(true);
    try {
      await AduanApi.updateStatus(aduan.id_aduan, newStatus);
      showToast('Status berhasil diperbarui', 'success');
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Gagal update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!aduan) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Aduan">
      <div className="space-y-6">

        {/* Header Info */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{aduan.ruangan_nama}</h3>
            <p className="text-gray-500 text-sm">{aduan.gedung || 'Gedung tidak diketahui'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Tanggal Lapor</p>
            <p className="font-medium text-gray-700">
              {new Date(aduan.create_date).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Alat Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-gray-100 rounded-xl">
            <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Nama Alat</label>
            <p className="font-semibold text-gray-800">{aduan.nama_alat_nama}</p>
          </div>
          <div className="p-3 border border-gray-100 rounded-xl">
            <label className="text-xs text-gray-400 font-bold uppercase block mb-1">No Inventaris</label>
            <p className="font-semibold text-gray-800">{aduan.no_inventaris}</p>
          </div>
        </div>

        {/* complaint Body */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Keluhan / Kerusakan</label>
          <div className="bg-[#F8F9FB] p-4 rounded-xl text-gray-700 leading-relaxed border border-gray-100">
            {aduan.keluhan}
          </div>
        </div>

        {/* Image Evidence */}
        {aduan.img_keluhan && (
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Foto Bukti</label>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              {/* Using storage URL. Assuming backend returns full URL or we prepend.
                          If backend returns filename, we assume a path. 
                          Ideally Api Resource should return 'img_url'. 
                          For now let's try direct or relative. 
                       */}
              <img
                src={aduan.img_keluhan}
                alt="Bukti Keluhan"
                className="w-full h-auto max-h-[300px] object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=No+Image'; }}
              />
            </div>
          </div>
        )}

        {/* People */}
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <div className="flex-1">
            <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Pelapor</label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                {aduan.nama_pengadu?.charAt(0)}
              </div>
              <span className="font-medium text-gray-700">{aduan.nama_pengadu}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Teknisi</label>
            {aduan.teknisi_nama ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xs">
                  {aduan.teknisi_nama.charAt(0)}
                </div>
                <span className="font-medium text-gray-700">{aduan.teknisi_nama}</span>
              </div>
            ) : (
              <span className="text-gray-400 italic text-sm">Belum ditugaskan</span>
            )}
          </div>
        </div>

        {/* Status Update Action */}
        <div className="pt-6 border-t border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">Update Status</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                options={statusOptions}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mb-0"
              />
            </div>
            <Button
              onClick={handleUpdateStatus}
              loading={loading}
              disabled={newStatus === aduan.status_aduan}
              className="h-[48px] px-6"
            >
              Update
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
}

import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import Select from '../../../components/Select';
import Button from '../../../components/Button';
import AduanApi from '../../../api/AduanApi';
import { useToast } from '../../../components/Alert/useToast';

export default function AssignTeknisiModal({ isOpen, onClose, aduan, teknisiOptions, onSuccess }) {
  const { showToast } = useToast();
  const [teknisiId, setTeknisiId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teknisiId) {
      showToast('Pilih teknisi terlebih dahulu', 'error');
      return;
    }

    setLoading(true);
    try {
      await AduanApi.assignTeknisi(aduan.id_aduan, teknisiId);
      showToast('Teknisi berhasil ditugaskan', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Gagal menugaskan teknisi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Teknisi">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="bg-gray-50 p-3 rounded-xl mb-3 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Keluhan:</p>
          <p className="font-semibold text-sm text-gray-800">{aduan?.keluhan}</p>
          <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
            <span>🏠 {aduan?.ruangan_nama}</span>
            <span>🛠 {aduan?.nama_alat_nama}</span>
            {aduan?.divisi_nama && <span>🏢 {aduan?.divisi_nama}</span>}
          </div>
        </div>

        <Select
          label="Pilih Teknisi"
          placeholder="-- Pilih Teknisi --"
          options={teknisiOptions}
          value={teknisiId}
          onChange={(e) => setTeknisiId(e.target.value)}
          required
          size="sm"
        />

        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading} size="sm">Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}

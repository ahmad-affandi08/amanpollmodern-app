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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl mb-4">
          <p className="text-sm text-gray-500 mb-1">Keluhan:</p>
          <p className="font-semibold text-gray-800">{aduan?.keluhan}</p>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
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
        />

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}

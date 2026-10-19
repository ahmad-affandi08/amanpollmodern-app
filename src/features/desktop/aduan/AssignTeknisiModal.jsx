import React, { useState, useMemo } from 'react';
import { refreshAllData } from '../../../lib/queryClient';
import Modal from '../../../components/Modal';
import Select from '../../../components/Select';
import Button from '../../../components/Button';
import AduanApi from '../../../api/AduanApi';
import { useToast } from '../../../components/Alert/useToast';

/**
 * Isi modal dipisahkan agar pilihan teknisi ikut dibuang setiap kali modal ditutup
 * atau dibuka untuk aduan lain.
 *
 * `teknisi` = daftar pengguna teknisi ({ id_user, nama_lengkap, divisi_id }).
 * Hanya teknisi dari divisi aduan yang ditampilkan.
 */
function AssignTeknisiForm({ aduan, teknisi, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [teknisiId, setTeknisiId] = useState('');
  const [loading, setLoading] = useState(false);

  const teknisiOptions = useMemo(() => {
    const divisiId = aduan?.divisi_id ? String(aduan.divisi_id) : null;
    return (teknisi || [])
      .filter(t => !divisiId || String(t.divisi_id) === divisiId)
      .map(t => ({ label: t.nama_lengkap, value: t.id_user }));
  }, [teknisi, aduan?.divisi_id]);

  // Pilihan yang tidak lagi ada di daftar opsi tidak boleh ikut terkirim.
  const selectedId = teknisiOptions.some(o => String(o.value) === String(teknisiId)) ? teknisiId : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!selectedId) {
      showToast('Pilih teknisi terlebih dahulu', 'error');
      return;
    }

    setLoading(true);
    try {
      await AduanApi.assignTeknisi(aduan.id_aduan, selectedId);
      await refreshAllData();
      showToast('Teknisi berhasil ditugaskan', 'success');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Gagal menugaskan teknisi', error);
      showToast(error.response?.data?.message || 'Gagal menugaskan teknisi', 'error');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="bg-gray-50 p-3 rounded-xl mb-3 border border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Keluhan:</p>
        <p className="font-semibold text-sm text-gray-800">{aduan?.keluhan}</p>
        <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
          <span>Ruangan: {aduan?.ruangan_nama}</span>
          <span>Alat: {aduan?.nama_alat_nama}</span>
          {aduan?.divisi_nama && <span>Divisi: {aduan.divisi_nama}</span>}
        </div>
      </div>

      <Select
        label="Pilih Teknisi"
        placeholder="-- Pilih Teknisi --"
        options={teknisiOptions}
        value={selectedId}
        onChange={(e) => setTeknisiId(e.target.value)}
        required
        size="sm"
      />
      {teknisiOptions.length === 0 && (
        <p className="text-xs text-gray-500">Belum ada teknisi yang terdaftar di divisi aduan ini.</p>
      )}

      <div className="pt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>Batal</Button>
        <Button type="submit" loading={loading} disabled={teknisiOptions.length === 0} size="sm">Simpan</Button>
      </div>
    </form>
  );
}

export default function AssignTeknisiModal({ isOpen, onClose, aduan, teknisi, onSuccess }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Teknisi">
      <AssignTeknisiForm
        key={aduan?.id_aduan}
        aduan={aduan}
        teknisi={teknisi}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}

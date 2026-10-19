import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { refreshAllData } from '../../../lib/queryClient';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import Input from '../../../components/Input';
import PemeliharaanApi from '../../../api/PemeliharaanApi';
import { useToast } from '../../../components/Alert/useToast';
import { toInputDate } from '../../../utils/format';
import useTeknisiList from './useTeknisiList';

const FORM_ID = 'form-edit-pemeliharaan';

/**
 * Isi form dipisahkan agar state diinisialisasi ulang setiap modal dibuka
 * (atau dibuka untuk data pemeliharaan lain).
 */
function EditPemeliharaanForm({ pemeliharaan, onClose, onSuccess }) {
  const { showToast } = useToast();
  const teknisiList = useTeknisiList();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    jadwal_pemeliharaan: toInputDate(pemeliharaan.jadwal_pemeliharaan),
    teknisi_id: pemeliharaan.teknisi_id || ''
  });

  // Pemeliharaan yang sudah selesai tidak boleh diubah jadwal atau teknisinya.
  const isLocked = pemeliharaan.status === 'Selesai';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isLocked) return;
    setLoading(true);

    try {
      await PemeliharaanApi.update(pemeliharaan.id_pemeliharaan || pemeliharaan.id, formData);
      await refreshAllData();
      showToast('Jadwal berhasil diperbarui', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Gagal memperbarui jadwal pemeliharaan', error);
      showToast(error.response?.data?.message || 'Gagal memperbarui jadwal', 'error');
      setLoading(false);
    }
  };

  return (
    <>
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        {/* Info Section */}
        <div className="bg-[#F8F9FB] p-3 rounded-xl border border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500 block text-[10px]">No. Inventaris</span>
              <p className="font-bold text-text-dark truncate">{pemeliharaan.no_inventaris}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Ruangan</span>
              <p className="font-bold text-text-dark truncate">{pemeliharaan.ruangan_nama}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Alat</span>
              <p className="font-bold text-text-dark truncate">{pemeliharaan.nama_alat_nama}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Divisi</span>
              <p className="font-bold text-text-dark truncate">{pemeliharaan.divisi_nama}</p>
            </div>
          </div>
        </div>

        {isLocked && (
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
            <Lock size={14} className="mt-0.5 flex-shrink-0" />
            <p>Pemeliharaan ini sudah selesai, sehingga jadwal dan teknisinya tidak dapat diubah lagi.</p>
          </div>
        )}

        {/* Editable Fields */}
        <fieldset disabled={isLocked || loading} className="space-y-3 border-0 p-0 m-0 min-w-0">
          <Input
            type="date"
            label="Jadwal Pemeliharaan"
            value={formData.jadwal_pemeliharaan}
            onChange={(e) => setFormData({ ...formData, jadwal_pemeliharaan: e.target.value })}
            required
            size="sm"
          />

          <Select
            label="Teknisi"
            value={formData.teknisi_id}
            onChange={(e) => setFormData({ ...formData, teknisi_id: e.target.value })}
            options={teknisiList.map(t => ({ value: t.id_user, label: t.nama_lengkap }))}
            placeholder="-- Pilih Teknisi --"
            size="sm"
          />
        </fieldset>
      </form>

      {/* Tombol simpan terhubung ke form lewat atribut `form`. */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>Batal</Button>
        <Button type="submit" form={FORM_ID} loading={loading} disabled={isLocked} size="sm">Simpan Perubahan</Button>
      </div>
    </>
  );
}

export default function EditPemeliharaanModal({ isOpen, onClose, onSuccess, pemeliharaan }) {
  if (!isOpen || !pemeliharaan) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Jadwal Pemeliharaan">
      <EditPemeliharaanForm
        key={pemeliharaan.id_pemeliharaan || pemeliharaan.id}
        pemeliharaan={pemeliharaan}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}

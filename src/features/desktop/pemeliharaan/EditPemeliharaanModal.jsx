import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import Input from '../../../components/Input';
import MasterApi from '../../../api/MasterApi';
import PemeliharaanApi from '../../../api/PemeliharaanApi';
import { useToast } from '../../../components/Alert/useToast';
import { useAuth } from '../../../hooks';

export default function EditPemeliharaanModal({ isOpen, onClose, onSuccess, pemeliharaan }) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teknisiOptions, setTeknisiOptions] = useState([]);


  const [formData, setFormData] = useState({
    jadwal_pemeliharaan: '',
    teknisi_id: ''
  });

  useEffect(() => {
    if (isOpen && pemeliharaan) {

      const formatDate = (dateString) => {
        if (!dateString) return '';

        return dateString.split(' ')[0];
      };

      setFormData({
        jadwal_pemeliharaan: formatDate(pemeliharaan.jadwal_pemeliharaan),
        teknisi_id: pemeliharaan.teknisi_id || ''
      });
      loadTeknisi();
    }
  }, [isOpen, pemeliharaan]);

  const loadTeknisi = async () => {
    try {
      const ROLE_ADMIN_DIVISI = 4;
      const isAdminDivisi = user?.kategori_user_id == ROLE_ADMIN_DIVISI;
      const userDivisiId = user?.divisi_id;

      const teknisiParams = {};
      if (isAdminDivisi && userDivisiId) {
        teknisiParams.divisi_id = userDivisiId;
      }

      const res = await MasterApi.getTeknisi(teknisiParams);
      let teknisiData = Array.isArray(res) ? res : (res.data || []);

      if (isAdminDivisi && userDivisiId) {
        teknisiData = teknisiData.filter(t => t.divisi_id == userDivisiId);
      }

      setTeknisiOptions(teknisiData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await PemeliharaanApi.update(pemeliharaan.id_pemeliharaan || pemeliharaan.id, formData);
      showToast('Jadwal berhasil diperbarui', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Gagal memperbarui jadwal', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !pemeliharaan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Jadwal Pemeliharaan"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmit} loading={loading} size="sm">Simpan Perubahan</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Editable Fields */}
        <div className="space-y-3">
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
            options={teknisiOptions.map(t => ({ value: t.id_user, label: t.nama_lengkap }))}
            placeholder="-- Pilih Teknisi --"
            size="sm"
          />
        </div>
      </form>
    </Modal>
  );
}

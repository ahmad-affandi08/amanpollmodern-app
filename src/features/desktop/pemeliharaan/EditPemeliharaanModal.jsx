import React, { useState, useEffect } from 'react';
import { X, Calendar, User } from 'lucide-react';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import Input from '../../../components/Input';
import MasterApi from '../../../api/MasterApi';
import PemeliharaanApi from '../../../api/PemeliharaanApi';
import { useToast } from '../../../components/Alert/useToast';

export default function EditPemeliharaanModal({ isOpen, onClose, onSuccess, pemeliharaan }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [teknisiOptions, setTeknisiOptions] = useState([]);

  const [formData, setFormData] = useState({
    jadwal_pemeliharaan: '',
    teknisi_id: ''
  });

  useEffect(() => {
    if (isOpen && pemeliharaan) {
      setFormData({
        jadwal_pemeliharaan: pemeliharaan.jadwal_pemeliharaan || '',
        teknisi_id: pemeliharaan.teknisi_id || ''
      });
      loadTeknisi();
    }
  }, [isOpen, pemeliharaan]);

  const loadTeknisi = async () => {
    try {
      const res = await MasterApi.getTeknisi();
      setTeknisiOptions(Array.isArray(res) ? res : (res.data || []));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-text-dark">Edit Jadwal Pemeliharaan</h3>
            <p className="text-gray-500 text-sm mt-1">{pemeliharaan.nama_alat_nama}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info Section */}
          <div className="bg-[#F8F9FB] p-4 rounded-xl border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">No. Inventaris:</span>
                <p className="font-bold text-text-dark">{pemeliharaan.no_inventaris}</p>
              </div>
              <div>
                <span className="text-gray-500">Ruangan:</span>
                <p className="font-bold text-text-dark">{pemeliharaan.ruangan_nama}</p>
              </div>
              <div>
                <span className="text-gray-500">Merk:</span>
                <p className="font-bold text-text-dark">{pemeliharaan.merk}</p>
              </div>
              <div>
                <span className="text-gray-500">Divisi:</span>
                <p className="font-bold text-text-dark">{pemeliharaan.divisi_nama}</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <Input
            type="date"
            label="Jadwal Pemeliharaan"
            value={formData.jadwal_pemeliharaan}
            onChange={(e) => setFormData({ ...formData, jadwal_pemeliharaan: e.target.value })}
            required
          />

          <Select
            label="Teknisi"
            value={formData.teknisi_id}
            onChange={(e) => setFormData({ ...formData, teknisi_id: e.target.value })}
            options={teknisiOptions.map(t => ({ value: t.id_user, label: t.nama_lengkap }))}
            placeholder="-- Pilih Teknisi --"
          />
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmit} loading={loading}>Simpan Perubahan</Button>
        </div>
      </div>
    </div>
  );
}

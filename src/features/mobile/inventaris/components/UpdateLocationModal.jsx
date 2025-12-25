import React, { useState, useContext } from 'react';
import { MapPin, X } from 'lucide-react';
import { useUpdateLocation } from '../../../../hooks/queries/useInventarisQueries';
import { useMasterData } from '../../../../hooks/queries/useMasterDataQueries';
import { ToastContext } from '../../../../components/Alert/ToastProvider';
import Button from '../../../../components/Button';

export default function UpdateLocationModal({ isOpen, onClose, inventarisId, currentRuanganId }) {
  const [selectedRuangan, setSelectedRuangan] = useState(currentRuanganId || '');
  const { showToast } = useContext(ToastContext);

  const { data: ruanganData } = useMasterData.ruangan();
  const ruanganList = ruanganData?.data || [];
  const updateLocationMutation = useUpdateLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRuangan) {
      showToast('Pilih ruangan terlebih dahulu', 'error');
      return;
    }

    try {
      await updateLocationMutation.mutateAsync({
        id: inventarisId,
        ruanganId: selectedRuangan
      });

      showToast('Lokasi berhasil diperbarui', 'success');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memperbarui lokasi', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-primary-light p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <MapPin size={20} />
            <h3 className="font-bold text-lg">Update Lokasi</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Pilih Ruangan Baru</label>
            <select
              value={selectedRuangan}
              onChange={(e) => setSelectedRuangan(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-sm bg-white"
            >
              <option value="">-- Pilih Ruangan --</option>
              {ruanganList.map((ruangan) => (
                <option key={ruangan.id_ruangan} value={ruangan.id_ruangan}>
                  {ruangan.nama_ruangan}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 py-2.5 rounded-xl border-gray-200"
              onClick={onClose}
              type="button"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-light"
              type="submit"
              disabled={updateLocationMutation.isPending}
            >
              {updateLocationMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

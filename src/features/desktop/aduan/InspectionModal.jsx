import React, { useState, useRef,  } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Select from '../../../components/Select';
import { useUpdateInspection } from '../../../hooks/queries/useAduanQueries';
import { useToast } from '../../../components/Alert/useToast';
import { useAuthContext } from '../../../context/AuthContext';
import SignaturePad from '../../../components/SignaturePad';
import { Loader2 } from 'lucide-react';

export default function InspectionModal({ isOpen, onClose, aduan, onSuccess }) {
  const { showToast } = useToast();
  const { user } = useAuthContext();
  const updateInspection = useUpdateInspection();

  const ttdTeknisiRef = useRef(null);
  const ttdKepalaRuangRef = useRef(null);

  const [formData, setFormData] = useState({
    tindakan_teknisi: aduan?.tindakan_teknisi || '',
    rekomendasi: aduan?.rekomendasi || '',
    kondisi_alat: aduan?.kondisi_alat || '',
    status_aduan: aduan?.status_aduan || '',
    biaya: aduan?.biaya || '0',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validate signatures if status requires them or generally always
    if (ttdTeknisiRef.current?.isEmpty()) {
      showToast('error', 'Tanda tangan teknisi harus diisi!');
      return;
    }

    if (ttdKepalaRuangRef.current?.isEmpty()) {
      showToast('error', 'Tanda tangan pengadu/kepala ruang harus diisi!');
      return;
    }

    // Check required fields
    if (!formData.status_aduan || !formData.kondisi_alat) {
      showToast('error', 'Status dan Kondisi Alat harus diisi!');
      return;
    }

    try {
      const inspectionData = {
        ...formData,
        ttd_teknisi: ttdTeknisiRef.current.toDataURL(),
        ttd_kepala_ruang: ttdKepalaRuangRef.current.toDataURL(),
      };

      await updateInspection.mutateAsync({
        id: aduan.id_aduan,
        data: inspectionData,
      });

      showToast('success', 'Pemeriksaan berhasil disimpan!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('error', error.response?.data?.message || 'Gagal menyimpan pemeriksaan');
    }
  };

  if (!aduan) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Form Pemeriksaan (Teknisi)" maxWidth="max-w-4xl">
      <div className="space-y-6">

        {/* Info Header */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 grid grid-cols- md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Alat / Inventaris</p>
            <p className="font-semibold text-gray-800">{aduan.nama_alat_nama} ({aduan.no_inventaris})</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Ruangan</p>
            <p className="text-gray-800">{aduan.ruangan_nama}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500 uppercase font-bold">Keluhan</p>
            <p className="bg-white p-2 rounded border border-blue-100 mt-1 italic text-gray-700">{aduan.keluhan}</p>
          </div>
        </div>

        {/* Disposisi Section */}
        {aduan.disposisi_tgl && (
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
              <span className="bg-orange-200 p-1 rounded">Disposisi Pimpinan</span>
              <span className="text-xs font-normal text-orange-600">
                {new Date(aduan.disposisi_tgl).toLocaleDateString('id-ID')}
              </span>
            </h4>
            <div className="bg-white p-3 rounded-lg border border-orange-100 text-gray-800">
              <p className="font-medium mb-1 text-xs text-gray-500">Dari: {aduan.disposisi_nama}</p>
              <p className="italic">"{aduan.disposisi_isi}"</p>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tindakan Teknisi</label>
              <textarea
                name="tindakan_teknisi"
                value={formData.tindakan_teknisi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none h-32"
                placeholder="Jelaskan tindakan perbaikan..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Rekomendasi</label>
              <textarea
                name="rekomendasi"
                value={formData.rekomendasi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none h-24"
                placeholder="Rekomendasi untuk user..."
              ></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Kondisi Alat</label>
              <Select
                name="kondisi_alat"
                value={formData.kondisi_alat}
                onChange={handleChange}
                options={[
                  { label: 'Indikator Kondisi', value: '' },
                  { label: 'Baik', value: 'Baik' },
                  { label: 'Rusak Ringan', value: 'Rusak Ringan' },
                  { label: 'Rusak Berat', value: 'Rusak Berat' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status Pekerjaan</label>
              <Select
                name="status_aduan"
                value={formData.status_aduan}
                onChange={handleChange}
                options={[
                  { label: 'Pilih Status', value: '' },
                  { label: 'Tindakan Lanjutan', value: 'Tindakan Lanjutan' },
                  { label: 'Selesai', value: 'Selesai' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Biaya (Rp)</label>
              <input
                type="number"
                name="biaya"
                value={formData.biaya}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div>
            <SignaturePad
              ref={ttdTeknisiRef}
              label="Tanda Tangan Teknisi"
              height={150}
            />
            <p className="text-center mt-2 font-bold text-sm text-gray-700">{user?.nama_lengkap}</p>
          </div>
          <div>
            <SignaturePad
              ref={ttdKepalaRuangRef}
              label="Tanda Tangan Pengadu/Kepala Ruang"
              height={150}
            />
            <p className="text-center mt-2 font-bold text-sm text-gray-700">{aduan.nama_pengadu}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-6 border-t border-gray-100 gap-3">
          <Button variant="outline" onClick={onClose} disabled={updateInspection.isPending}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            loading={updateInspection.isPending}
            disabled={!formData.status_aduan || !formData.kondisi_alat}
            className="px-8"
          >
            Simpan Pemeriksaan
          </Button>
        </div>
      </div>
    </Modal>
  );
}

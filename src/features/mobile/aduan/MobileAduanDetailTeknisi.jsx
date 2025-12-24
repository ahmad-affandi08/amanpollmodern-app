import React, { useRef, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { useAduanDetail, useUpdateInspection } from '../../../hooks/queries/useAduanQueries';
import { useAuthContext } from '../../../context/AuthContext';
import { ToastContext } from '../../../components/Alert/ToastProvider';
import SignaturePad from '../../../components/SignaturePad';
import { formatDate } from '../../../utils/format';

export default function MobileAduanDetailTeknisi() {
  usePageTitle('Form Pemeriksaan');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { showToast } = useContext(ToastContext);

  const { data: aduan, isLoading } = useAduanDetail(id);
  const updateInspection = useUpdateInspection();

  const ttdTeknisiRef = useRef(null);
  const ttdKepalaRuangRef = useRef(null);

  const [formData, setFormData] = useState({
    tindakan_teknisi: '',
    rekomendasi: '',
    kondisi_alat: '',
    status_aduan: '',
    biaya: '0',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate signatures
    if (ttdTeknisiRef.current?.isEmpty()) {
      showToast('error', 'Tanda tangan teknisi harus diisi!');
      return;
    }

    if (ttdKepalaRuangRef.current?.isEmpty()) {
      showToast('error', 'Tanda tangan pengadu harus diisi!');
      return;
    }

    try {
      const inspectionData = {
        ...formData,
        ttd_teknisi: ttdTeknisiRef.current.toDataURL(),
        ttd_kepala_ruang: ttdKepalaRuangRef.current.toDataURL(),
      };

      await updateInspection.mutateAsync({
        id: parseInt(id),
        data: inspectionData,
      });

      showToast('success', 'Pemeriksaan berhasil disimpan!');
      navigate('/mobile/aduan');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Gagal menyimpan pemeriksaan');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-info-500" size={32} />
      </div>
    );
  }

  if (!aduan) {
    return (
      <div className="p-4 text-center text-danger-500">
        Aduan tidak ditemukan
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Form Pemeriksaan</h1>
      </div>

      {/* Aduan Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-100">
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-600">Nama Alat</p>
            <p className="font-bold text-gray-800">{aduan.nama_alat_nama}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-600">No. Inventaris</p>
              <p className="text-sm font-medium text-gray-800">{aduan.no_inventaris}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Ruangan</p>
              <p className="text-sm font-medium text-gray-800">{aduan.ruangan_nama}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-600">Keluhan</p>
            <p className="text-sm text-gray-700">{aduan.keluhan}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Safety Check / Tindakan Teknisi */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Safety Check / Tindakan Teknisi *
          </label>
          <input
            type="text"
            name="tindakan_teknisi"
            value={formData.tindakan_teknisi}
            onChange={handleChange}
            placeholder="Masukkan tindakan yang dilakukan"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        {/* Rekomendasi */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Rekomendasi *
          </label>
          <input
            type="text"
            name="rekomendasi"
            value={formData.rekomendasi}
            onChange={handleChange}
            placeholder="Masukkan rekomendasi"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        {/* Kondisi Alat */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Kondisi Alat *
          </label>
          <select
            name="kondisi_alat"
            value={formData.kondisi_alat}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          >
            <option value="">-- Pilih Kondisi Alat --</option>
            <option value="Baik">Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </select>
        </div>

        {/* Tanda Tangan Teknisi */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <SignaturePad
            ref={ttdTeknisiRef}
            label="Tanda Tangan Teknisi Pelaksana *"
          />
        </div>

        {/* Nama Teknisi (Display Only) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Nama Teknisi
          </label>
          <p className="font-bold text-gray-800">{user?.nama_lengkap}</p>
        </div>

        {/* Tanda Tangan Pengadu */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <SignaturePad
            ref={ttdKepalaRuangRef}
            label="Tanda Tangan Pengadu *"
          />
        </div>

        {/* Nama Pengadu (Display Only) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Nama Pengadu
          </label>
          <p className="font-bold text-gray-800">{aduan.nama_pengadu}</p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Status *
          </label>
          <select
            name="status_aduan"
            value={formData.status_aduan}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          >
            <option value="">-- Pilih Status Aduan --</option>
            <option value="Tindakan Lanjutan">Tindakan Lanjutan</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        {/* Biaya */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Biaya Perbaikan (Rp) *
          </label>
          <input
            type="number"
            name="biaya"
            value={formData.biaya}
            onChange={handleChange}
            placeholder="Contoh: 150000"
            min="0"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />
          <small className="text-xs text-gray-500 mt-1 block">
            Masukkan total biaya perbaikan. Isi 0 jika tidak ada biaya.
          </small>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={updateInspection.isPending}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {updateInspection.isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={20} />
              Simpan Pemeriksaan
            </>
          )}
        </button>
      </form>
    </div>
  );
}

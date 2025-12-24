import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAduan } from '../../../../hooks/queries/useAduanQueries';
import { useAuthContext } from '../../../../context/AuthContext';
import { ToastContext } from '../../../../components/Alert/ToastProvider';
import ImageUploadPreview from './ImageUploadPreview';
import InventarisSelect from './InventarisSelect';
import DivisiSelect from './DivisiSelect';

export default function AduanForm() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { showToast } = useContext(ToastContext);
  const createAduan = useCreateAduan();

  const [formData, setFormData] = useState({
    ruangan_id: user?.ruangan_id || '',
    divisi_id: '',
    inventaris_id: '',
    nama_alat_id: '',
    no_inventaris: '',
    keluhan: '',
    nama_pengadu: '',
    pengadu_id: user?.id_user || '',
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [namaAlat, setNamaAlat] = useState('');
  const [merk, setMerk] = useState('');
  const [namaDivisi, setNamaDivisi] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wrap in useCallback to prevent infinite loop in InventarisSelect useEffect
  const handleInventarisChange = React.useCallback((selected) => {
    if (selected) {
      setFormData(prev => ({
        ...prev,
        inventaris_id: selected.id_inventaris,
        nama_alat_id: selected.id_nama_alat,
        no_inventaris: selected.no_inventaris,
        divisi_id: selected.divisi_id || prev.divisi_id, // Auto-fill divisi from selected tool
      }));
      setNamaAlat(selected.nama_alat);
      setMerk(selected.merk);
      setNamaDivisi(selected.nama_divisi || '');
    } else {
      setFormData(prev => ({
        ...prev,
        inventaris_id: '',
        nama_alat_id: '',
        no_inventaris: '',
        // Don't clear divisi_id when clearing inventaris
      }));
      setNamaAlat('');
      setMerk('');
      setNamaDivisi('');
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.divisi_id) {
      newErrors.divisi_id = 'Divisi wajib dipilih';
    }

    if (!formData.keluhan || formData.keluhan.trim().length < 10) {
      newErrors.keluhan = 'Keluhan wajib diisi minimal 10 karakter';
    }

    if (formData.nama_pengadu && formData.nama_pengadu.length > 256) {
      newErrors.nama_pengadu = 'Maksimal 256 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Mohon lengkapi form dengan benar');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Append all fields
      submitData.append('ruangan_id', formData.ruangan_id);
      submitData.append('divisi_id', formData.divisi_id);
      submitData.append('keluhan', formData.keluhan);
      submitData.append('pengadu_id', formData.pengadu_id);

      // Optional fields
      if (formData.inventaris_id) submitData.append('inventaris_id', formData.inventaris_id);
      if (formData.nama_alat_id) submitData.append('nama_alat_id', formData.nama_alat_id);
      if (formData.no_inventaris) submitData.append('no_inventaris', formData.no_inventaris);
      if (formData.nama_pengadu) submitData.append('nama_pengadu', formData.nama_pengadu);
      if (selectedImage) submitData.append('img_keluhan', selectedImage);

      await createAduan.mutateAsync(submitData);

      showToast('success', 'Aduan berhasil ditambahkan!');
      navigate('/mobile/dashboard');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Gagal menambahkan aduan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Ruangan - Disabled */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-text-dark">
          Ruangan
        </label>
        <input
          type="text"
          value={user?.ruangan_nama || ''}
          disabled
          className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
        />
      </div>

      {/* Inventaris Select */}
      <InventarisSelect
        ruanganId={user?.ruangan_id}
        value={formData.inventaris_id}
        onChange={(e) => setFormData(prev => ({ ...prev, inventaris_id: e.target.value }))}
        onInventarisChange={handleInventarisChange}
        error={errors.inventaris_id}
      />

      {/* Nama Alat - Readonly */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-text-dark uppercase text-xs text-gray-500">
          Nama Alat
        </label>
        <input
          type="text"
          value={namaAlat}
          readOnly
          className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
          placeholder="-"
        />
      </div>

      {/* No Inventaris - Readonly */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-text-dark uppercase text-xs text-gray-500">
          No Inventaris
        </label>
        <input
          type="text"
          value={formData.no_inventaris}
          readOnly
          className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
          placeholder="-"
        />
      </div>

      {/* Merk / Type - Readonly */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-text-dark uppercase text-xs text-gray-500">
          Merk / Type
        </label>
        <input
          type="text"
          value={merk}
          readOnly
          className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
          placeholder="-"
        />
      </div>

      {/* Divisi - Auto-filled from selected tool */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-text-dark">
          Divisi
        </label>
        <input
          type="text"
          value={namaDivisi || ''}
          disabled
          className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
          placeholder="Pilih alat terlebih dahulu"
        />
        {errors.divisi_id && (
          <p className="text-xs text-red-500">{errors.divisi_id}</p>
        )}
      </div>

      {/* Keluhan */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-text-dark">
          Keluhan Kerusakan <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.keluhan}
          onChange={(e) => handleChange('keluhan', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${errors.keluhan
            ? 'border-red-300 focus:ring-red-200'
            : 'border-gray-200 focus:ring-purple-200 focus:border-purple-400'
            }`}
          placeholder="Masukkan keluhan kerusakan..."
        />
        {errors.keluhan && (
          <p className="text-xs text-red-500">{errors.keluhan}</p>
        )}
      </div>

      {/* Image Upload */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-text-dark">
          Upload Gambar <span className="text-gray-400 font-normal">(Opsional)</span>
        </label>
        <ImageUploadPreview
          value={selectedImage}
          onChange={setSelectedImage}
          error={errors.img_keluhan}
        />
      </div>

      {/* Nama Pengadu */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-text-dark">
          Nama Pengadu <span className="text-gray-400 font-normal">(Opsional)</span>
        </label>
        <input
          value={formData.nama_pengadu}
          onChange={(e) => handleChange('nama_pengadu', e.target.value)}
          type="text"
          className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.nama_pengadu
            ? 'border-red-300 focus:ring-red-200'
            : 'border-gray-200 focus:ring-purple-200 focus:border-purple-400'
            }`}
          placeholder="Masukkan nama pengadu"
        />
        {errors.nama_pengadu && (
          <p className="text-xs text-red-500">{errors.nama_pengadu}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate('/mobile/dashboard')}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-gradient-to-br from-brand-primary to-brand-primary-light text-white rounded-lg font-bold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Menyimpan...</span>
            </>
          ) : (
            'Simpan Aduan'
          )}
        </button>
      </div>
    </form>
  );
}

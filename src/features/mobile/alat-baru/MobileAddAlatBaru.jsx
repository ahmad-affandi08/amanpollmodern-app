import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useCreateAlatBaru } from '../../../hooks/queries/useAlatBaruQueries';
import { useMasterNamaAlat } from '../../../hooks/queries/useMasterDataQueries';
import { useToast } from '../../../hooks';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

export default function MobileAddAlatBaru() {
  usePageTitle('Tambah Alat Baru');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createMutation = useCreateAlatBaru();

  const [formData, setFormData] = useState({
    nama_alat_id: '',
    merk: '',
    model: '',
    seri: '',
    daya: '',
    img_alat_baru: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});


  const { data: namaAlatData } = useMasterNamaAlat({ all: 1 });

  const namaAlatOptions = (namaAlatData?.data || []).map((item) => ({
    label: item.nama_nama_alat,
    value: item.id,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };



  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {

      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, img_alat_baru: 'Ukuran gambar maksimal 10MB' }));
        return;
      }


      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setErrors((prev) => ({ ...prev, img_alat_baru: 'Format harus jpg, jpeg, atau png' }));
        return;
      }

      setFormData((prev) => ({ ...prev, img_alat_baru: file }));
      setErrors((prev) => ({ ...prev, img_alat_baru: '' }));


      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, img_alat_baru: null }));
    setImagePreview(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nama_alat_id) newErrors.nama_alat_id = 'Nama alat harus dipilih';
    if (!formData.merk) newErrors.merk = 'Merk harus diisi';
    if (!formData.model) newErrors.model = 'Model/Tipe harus diisi';
    if (!formData.seri) newErrors.seri = 'No. Seri harus diisi';
    if (!formData.img_alat_baru) newErrors.img_alat_baru = 'Foto alat harus diupload';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    const submitData = new FormData();
    submitData.append('nama_alat_id', formData.nama_alat_id);
    submitData.append('merk', formData.merk);
    submitData.append('model', formData.model);
    submitData.append('seri', formData.seri);
    if (formData.daya) submitData.append('daya', formData.daya);
    if (formData.img_alat_baru) submitData.append('img_alat_baru', formData.img_alat_baru);

    try {
      await createMutation.mutateAsync(submitData);
      showToast('Alat baru berhasil ditambahkan', 'success');
      navigate('/mobile/alat-baru');
    } catch (error) {
      console.error('Error submit:', error);
      const errorMsg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : (error.response?.data?.message || 'Gagal menambahkan alat baru');

      showToast(errorMsg, 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 py-3">
        <button
          onClick={() => navigate('/mobile/alat-baru')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-text-dark" />
        </button>
        <h1 className="text-xl font-bold text-text-dark">Tambah Alat Baru</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="bg-white rounded-[20px] p-4 border border-gray-100 space-y-4">
          {/* Nama Alat */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">
              Nama Alat <span className="text-danger-500">*</span>
            </label>
            <select
              name="nama_alat_id"
              value={formData.nama_alat_id}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, nama_alat_id: e.target.value }));
                setErrors((prev) => ({ ...prev, nama_alat_id: '' }));
              }}
              className={`w-full px-4 py-3 rounded-xl border ${errors.nama_alat_id ? 'border-danger-500' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all`}
            >
              <option value="">Pilih Nama Alat</option>
              {namaAlatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.nama_alat_id && (
              <p className="text-xs text-danger-500 mt-1">{errors.nama_alat_id}</p>
            )}
          </div>

          {/* Merk */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">
              Merk <span className="text-danger-500">*</span>
            </label>
            <Input
              name="merk"
              value={formData.merk}
              onChange={handleChange}
              placeholder="Masukkan nama merk"
              error={errors.merk}
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">
              Model/Tipe <span className="text-danger-500">*</span>
            </label>
            <Input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Masukkan Tipe/Model"
              error={errors.model}
            />
          </div>

          {/* Seri */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">
              No. Seri <span className="text-danger-500">*</span>
            </label>
            <Input
              name="seri"
              value={formData.seri}
              onChange={handleChange}
              placeholder="Masukkan No Seri"
              error={errors.seri}
            />
          </div>

          {/* Daya */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">Daya (Watt)</label>
            <Input
              type="number"
              name="daya"
              value={formData.daya}
              onChange={handleChange}
              placeholder="Masukkan Daya"
              min="0"
              step="0.01"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">
              Upload Gambar Alat <span className="text-danger-500">*</span>
            </label>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-2xl border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-danger-500 text-white rounded-full shadow-lg hover:bg-danger-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all">
                <Upload className="text-gray-400 mb-2" size={40} />
                <span className="text-sm text-text-gray">Klik untuk upload gambar</span>
                <span className="text-xs text-text-gray mt-1">Max 2MB • JPG, JPEG, PNG</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            {errors.img_alat_baru && (
              <p className="text-xs text-danger-500 mt-1">{errors.img_alat_baru}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-brand-primary text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {createMutation.isPending ? 'Mengirim...' : 'Kirim'}
        </Button>
      </form>
    </div>
  );
}

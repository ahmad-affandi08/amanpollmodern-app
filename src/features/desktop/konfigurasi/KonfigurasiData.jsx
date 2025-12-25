import React, { useState, useContext, useRef } from 'react';
import { Save, Building2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useInstitutionConfig, useUpdateInstitutionConfig, useUploadLogo } from '../../../hooks/queries/useSystemConfigQueries';
import { ToastContext } from '../../../components/Alert/ToastProvider';
import { usePageTitle } from '../../../hooks';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

export default function KonfigurasiData() {
  usePageTitle('Konfigurasi Institusi');
  const { showToast } = useContext(ToastContext);
  const { data, isLoading } = useInstitutionConfig();
  const updateMutation = useUpdateInstitutionConfig();
  const uploadLogoMutation = useUploadLogo();
  const fileInputRef = useRef(null);

  const [institutionName, setInstitutionName] = useState('');
  const [city, setCity] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize form data when data loads
  React.useEffect(() => {
    if (data?.data) {
      setInstitutionName(data.data.institution_name || '');
      setCity(data.data.city || '');
      setLogoPreview(data.data.logo_url);
    }
  }, [data]);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar', 'error');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file maksimal 2MB', 'error');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleRemoveLogo = () => {
    setSelectedFile(null);
    setLogoPreview(data?.data?.logo_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload logo first if there's a new file
      if (selectedFile) {
        await uploadLogoMutation.mutateAsync(selectedFile);
        showToast('Logo berhasil diupload', 'success');
      }

      // Update config
      await updateMutation.mutateAsync({
        institution_name: institutionName,
        city: city,
      });

      showToast('Konfigurasi berhasil diperbarui', 'success');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memperbarui konfigurasi', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Konfigurasi Institusi</h1>
          <p className="text-text-gray text-sm mt-1">
            Kelola informasi institusi yang ditampilkan di laporan PDF
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0px_10px_40px_rgba(29,22,23,0.03)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-brand-primary/10 rounded-xl">
              <Building2 size={24} className="text-brand-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-dark">Data Institusi</h2>
              <p className="text-sm text-text-gray">Nama, kota, dan logo institusi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              {/* Institution Name */}
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">
                  Nama Institusi
                </label>
                <Input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Contoh: RSUD dr. SOERATNO GEMOLONG"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">
                  Kota
                </label>
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: SRAGEN"
                />
              </div>
            </div>

            {/* Right Column - Logo Upload */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-2">
                Logo Institusi
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Format: JPG, PNG. Maksimal 2MB
              </p>

              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl transition-all ${isDragging
                  ? 'border-brand-primary bg-brand-primary/5'
                  : logoPreview
                    ? 'border-gray-200'
                    : 'border-gray-300 hover:border-brand-primary'
                  }`}
              >
                {logoPreview ? (
                  // Preview with image
                  <div className="relative group">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-full h-64 object-contain p-4 rounded-2xl"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white text-text-dark rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Upload size={16} />
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <X size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  // Empty state - drag & drop area
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-text-dark mb-1">
                      Drag & drop logo di sini
                    </p>
                    <p className="text-xs text-gray-500 mb-4">atau</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-dark transition-colors text-sm font-medium inline-flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Pilih File
                    </button>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={updateMutation.isPending || uploadLogoMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            {updateMutation.isPending || uploadLogoMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}

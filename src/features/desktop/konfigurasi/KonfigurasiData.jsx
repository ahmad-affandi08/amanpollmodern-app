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

  React.useEffect(() => {
    if (data?.data) {
      setInstitutionName(data.data.institution_name || '');
      setCity(data.data.city || '');
      setLogoPreview(data.data.logo_url);
    }
  }, [data]);

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Ukuran file maksimal 10MB', 'error');
      return;
    }

    setSelectedFile(file);

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
      if (selectedFile) {
        await uploadLogoMutation.mutateAsync(selectedFile);
        showToast('Logo berhasil diupload', 'success');
      }

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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-dark">Konfigurasi Institusi</h1>
          <p className="text-text-gray text-xs mt-0.5">
            Kelola informasi institusi yang ditampilkan di laporan PDF
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <div className="p-1.5 bg-brand-primary/10 rounded-lg">
              <Building2 size={18} className="text-brand-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-dark">Data Institusi</h2>
              <p className="text-xs text-text-gray">Nama, kota, dan logo institusi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1.5">
                  Nama Institusi
                </label>
                <Input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Contoh: RSUD dr. SOERATNO GEMOLONG"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1.5">
                  Kota/Kabupaten
                </label>
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: SRAGEN"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1.5">
                Logo Institusi
              </label>
              <p className="text-[10px] text-gray-500 mb-2">
                Format: JPG, PNG. Maksimal 10MB
              </p>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl transition-all ${isDragging
                  ? 'border-brand-primary bg-brand-primary/5'
                  : logoPreview
                    ? 'border-gray-200'
                    : 'border-gray-300 hover:border-brand-primary'
                  }`}
              >
                {logoPreview ? (
                  <div className="relative group">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-full h-48 object-contain p-3 rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-text-dark rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium flex items-center gap-1.5"
                      >
                        <Upload size={14} />
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1.5"
                      >
                        <X size={14} />
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <ImageIcon size={24} className="text-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-text-dark mb-0.5">
                      Drag & drop logo di sini
                    </p>
                    <p className="text-[10px] text-gray-500 mb-3">atau</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <Upload size={14} />
                      Pilih File
                    </button>
                  </div>
                )}

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

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={updateMutation.isPending || uploadLogoMutation.isPending}
            className="flex items-center gap-1.5"
          >
            <Save size={16} />
            {updateMutation.isPending || uploadLogoMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}

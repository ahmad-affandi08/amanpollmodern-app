import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUploadPreview({ value, onChange, error }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Format file harus JPG, JPEG, atau PNG');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {/* Preview or Upload Area */}
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-danger-500 text-white rounded-full hover:bg-danger-600 transition-colors shadow-lg"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 ${error
            ? 'border-danger-300 bg-danger-50 hover:bg-danger-100'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-purple-400'
            }`}
        >
          <div className="p-4 bg-white rounded-full shadow-sm">
            <ImageIcon size={32} className={error ? 'text-red-400' : 'text-gray-400'} />
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium ${error ? 'text-red-600' : 'text-gray-600'}`}>
              Klik untuk upload gambar
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Max 2MB)</p>
          </div>
        </button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

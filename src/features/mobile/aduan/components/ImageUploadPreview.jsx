import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import CameraCapture from '../../../../components/CameraCapture';

export default function ImageUploadPreview({ value, onChange, error }) {
  const [preview, setPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const handleCapture = (file) => {
    processFile(file);
  };

  const processFile = (file) => {
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
        <div className="grid grid-cols-2 gap-3 h-32">
          <button
            type="button"
            onClick={handleClick}
            className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${error
              ? 'border-danger-300 bg-danger-50 hover:bg-danger-100'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-brand-primary'
              }`}
          >
            <div className="p-3 bg-white rounded-full shadow-sm">
              <ImageIcon size={24} className="text-gray-400" />
            </div>
            <span className="text-xs font-bold text-gray-600">Upload</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${error
              ? 'border-danger-300 bg-danger-50 hover:bg-danger-100'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-brand-primary'
              }`}
          >
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Camera size={24} className="text-gray-400" />
            </div>
            <span className="text-xs font-bold text-gray-600">Ambil Foto</span>
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Camera Component */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapture}
      />

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

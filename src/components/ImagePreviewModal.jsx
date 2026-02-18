import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Download } from 'lucide-react';

/**
 * Image Preview Modal Component
 * Clean and simple full-screen image preview
 */
export default function ImagePreviewModal({ isOpen, onClose, imageUrl, altText = 'Preview' }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = altText || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const isQRCode = imageUrl?.includes('qrcode') || altText?.toLowerCase().includes('qr');

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col animate-scale-in">
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-4">
          {/* Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all hover:scale-105 shadow-lg"
            title="Download"
          >
            <Download size={20} />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all hover:scale-105 shadow-lg"
            title="Close (ESC)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Container */}
        <div
          className="relative bg-white rounded-2xl p-6 shadow-2xl overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title for QR Code */}
          {isQRCode && (
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">QR Code</h3>
              <p className="text-sm text-gray-500">Scan untuk melihat detail</p>
            </div>
          )}

          {/* Image */}
          <div className="flex items-center justify-center">
            <img
              src={imageUrl}
              alt={altText}
              className={`${isQRCode ? 'max-w-sm' : 'max-w-full'
                } max-h-[70vh] object-contain rounded-lg`}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

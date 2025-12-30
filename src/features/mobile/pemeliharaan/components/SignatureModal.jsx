import React, { useRef, useState } from 'react';
import { X, Save } from 'lucide-react';
import SignaturePad from '../../../../components/SignaturePad';

export default function SignatureModal({ isOpen, onClose, onSubmit, title, isLoading }) {
  const signatureRef = useRef(null);
  const [nama, setNama] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate name
    if (!nama.trim()) {
      setError('Nama harus diisi');
      return;
    }

    // Validate signature
    if (signatureRef.current?.isEmpty()) {
      setError('Tanda tangan harus diisi');
      return;
    }

    // Get signature as base64
    const ttd = signatureRef.current.toDataURL();

    // Submit
    onSubmit({ nama: nama.trim(), ttd });
  };

  const handleClose = () => {
    if (!isLoading) {
      setNama('');
      setError('');
      signatureRef.current?.clear();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-sm"
              disabled={isLoading}
            />
          </div>

          {/* Signature Pad */}
          <div>
            <SignaturePad
              ref={signatureRef}
              label={
                <>
                  Tanda Tangan <span className="text-red-500">*</span>
                </>
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

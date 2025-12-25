import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { useChangePassword } from '../../../../hooks/queries/useProfileQueries';
// Toast component removed
import Button from '../../../../components/Button';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false
  });
  const [toast, setToast] = useState(null);

  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.old_password || !formData.new_password) {
      setToast({ type: 'error', message: 'Mohon lengkapi semua field' });
      return;
    }

    if (formData.new_password.length < 6) {
      setToast({ type: 'error', message: 'Password baru minimal 6 karakter' });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync(formData);
      setToast({ type: 'success', message: 'Password berhasil diubah' });

      // Reset form and close after delay
      setTimeout(() => {
        setFormData({ old_password: '', new_password: '' });
        onClose();
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal mengubah password';
      setToast({ type: 'error', message: msg });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-primary-light p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Lock size={20} />
            <h3 className="font-bold text-lg">Ganti Password</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Old Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Password Lama</label>
            <div className="relative">
              <input
                type={showPassword.old ? 'text' : 'password'}
                value={formData.old_password}
                onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-sm"
                placeholder="Masukkan password lama"
              />
              <button
                type="button"
                onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword.old ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-sm"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 py-2.5 rounded-xl border-gray-200"
              onClick={onClose}
              type="button"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-light"
              type="submit"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

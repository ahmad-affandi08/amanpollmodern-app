import React from 'react';
import { Phone, Lock, ChevronRight } from 'lucide-react';

export default function AccountInfo({ user, onChangePassword }) {
  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
        <h3 className="text-text-dark font-bold text-base">Informasi Akun</h3>
      </div>

      {/* WhatsApp */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
          <Phone size={14} />
          <span>No WhatsApp</span>
        </div>
        <p className="text-text-dark font-bold text-lg font-mono tracking-tight">
          {user?.wa || '-'}
        </p>
      </div>

      {/* Password */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
            <Lock size={14} />
            <span>Kata Sandi</span>
          </div>
          <button
            onClick={onChangePassword}
            className="text-brand-primary text-xs font-bold hover:text-brand-primary-light transition-colors flex items-center gap-1 bg-brand-primary/5 px-3 py-1.5 rounded-lg hover:bg-brand-primary/10"
          >
            Ganti Password
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-text-dark font-bold text-lg">
          <span className="text-2xl mt-1 tracking-widest">••••••••</span>
        </div>
      </div>
    </div>
  );
}

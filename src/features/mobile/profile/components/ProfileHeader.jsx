import React from 'react';
import { User } from 'lucide-react';

export default function ProfileHeader({ user }) {
  if (!user) return null;

  return (
    <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="bg-gradient-to-br from-brand-primary to-brand-primary-light p-3 rounded-full shadow-lg shadow-brand-primary/20">
        <User size={32} className="text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-text-dark font-bold text-lg truncate">
          {user.nama_lengkap}
        </h2>
        <p className="text-gray-500 text-sm font-medium truncate">
          {/* Display logic based on role */}
          {user.role}
          {user.ruangan_nama !== '-' ? ` • ${user.ruangan_nama}` : ''}
          {user.divisi_nama !== '-' ? ` • ${user.divisi_nama}` : ''}
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { User, Mail, Shield, Building2, Briefcase, Lock, Edit2 } from 'lucide-react';
import { useAuth } from '../../../hooks';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import ChangePasswordModal from '../../mobile/profile/components/ChangePasswordModal';
import Button from '../../../components/Button';

export default function Profile() {
  usePageTitle('Profile');
  const { user } = useAuth();
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  const profileItems = [
    { icon: User, label: 'Nama Lengkap', value: user?.nama_lengkap || '-' },
    { icon: User, label: 'Username', value: user?.username || '-' },
    { icon: Mail, label: 'Email', value: user?.email || '-' },
    { icon: Shield, label: 'Role', value: user?.role || '-' },
    { icon: Building2, label: 'Ruangan', value: user?.ruangan_nama || '-' },
    { icon: Briefcase, label: 'Divisi', value: user?.divisi_nama || '-' },
  ];

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{user?.nama_lengkap}</h1>
              <p className="text-sm text-gray-500">
                {user?.role || 'Role tidak tersedia'}
                {user?.wa && <span> / {user.wa}</span>}
              </p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user?.active
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                  }`}>
                  {user?.active ? '● Aktif' : '● Tidak Aktif'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Informasi Akun</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profileItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <item.icon size={16} className="text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Keamanan</h2>
          <Button
            onClick={() => setPasswordModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all text-sm font-medium shadow-sm"
          >
            <Lock size={16} />
            <span>Ganti Password</span>
          </Button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}

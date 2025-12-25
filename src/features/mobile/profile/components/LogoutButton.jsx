import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../../../hooks';
import ConfirmDialog from '../../../../components/Alert/Alert';

export default function LogoutButton() {
  const { logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 flex items-center justify-center gap-3 active:scale-95 transition-transform duration-200 group"
      >
        <div className="bg-danger-50 p-2 rounded-full group-hover:bg-danger-100 transition-colors">
          <LogOut size={20} className="text-danger-500" />
        </div>
        <span className="text-text-dark font-bold text-base">Keluar</span>
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari aplikasi?"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
        variant="danger"
        confirmText="Ya, Keluar"
        cancelText="Batal"
      />
    </>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import usePageTitle from '../../hooks/utils/usePageTitle';
import useAuth from '../../hooks/utils/useAuth';
import { isMobileRole } from '../auth/constants';

export default function NotFound() {
  usePageTitle('Halaman Tidak Ditemukan');
  const { user, isAuthenticated } = useAuth();

  const home = !isAuthenticated
    ? '/'
    : isMobileRole(user?.kategori_user_id) ? '/mobile/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-6">
      <div className="bg-white rounded-[24px] shadow-sm p-10 max-w-md w-full text-center">
        <SearchX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-dark mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-gray-500 mb-6">
          Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
        </p>
        <Link
          to={home}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

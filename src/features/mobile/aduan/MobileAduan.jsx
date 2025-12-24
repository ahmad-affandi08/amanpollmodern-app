import React from 'react';
import { AlertCircle } from 'lucide-react';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import { useAuthContext } from '../../../context/AuthContext';
import AduanForm from './components/AduanForm';
import MobileAduanListTeknisi from './MobileAduanListTeknisi';

export default function MobileAduan() {
  usePageTitle('Aduan');
  const { user } = useAuthContext();

  // Dummy loading state (you might want to pass real prop or context)
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 space-y-4 animate-pulse pt-3">
        {/* Header Skeleton */}
        <div className="bg-white rounded-[20px] p-4 border border-gray-100 h-[72px] flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded-lg w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/3"></div>
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white rounded-[20px] p-6 border border-gray-100 space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              <div className="h-12 bg-gray-50 rounded-xl border border-gray-50"></div>
            </div>
          ))}
          <div className="h-12 bg-gray-200 rounded-xl w-full mt-4"></div>
        </div>
      </div>
    );
  }

  // TEKNISI VIEW: Show List of Assigned Tasks
  if (user?.kategori_user_id === 3) {
    return <MobileAduanListTeknisi />;
  }

  // USER RUANGAN VIEW: Show Create Form
  return (
    <div className="max-w-md mx-auto px-4 space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 mt-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
            <AlertCircle className="text-pending-600" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-dark">Tambah Aduan</h1>
            <p className="text-xs text-text-gray">Laporkan kerusakan alat medis</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-[20px] p-4 shadow-lg shadow-gray-200/50 border border-gray-100/50">
        <AduanForm />
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[20px] p-4 border border-blue-200">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-info-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-info-900 mb-1">Informasi</h3>
            <ul className="text-xs text-info-700 space-y-1">
              <li>• Pastikan keluhan diisi dengan jelas</li>
              <li>• Upload gambar untuk mempercepat proses</li>
              <li>• Divisi wajib dipilih untuk penugasan teknisi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

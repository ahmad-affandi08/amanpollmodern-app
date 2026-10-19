import React from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth, usePageTitle } from '../../../hooks';
import { ROLES, isRole } from '../../auth/constants';
import AduanForm from './components/AduanForm';
import MobileAduanListTeknisi from './MobileAduanListTeknisi';

export default function MobileAduan() {
  usePageTitle('Aduan');
  const { user } = useAuth();
  const location = useLocation();
  const scannedInventarisId = location.state?.scannedInventarisId;


  if (isRole(user, ROLES.TEKNISI)) {
    return <MobileAduanListTeknisi />;
  }


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
        <AduanForm scannedInventarisId={scannedInventarisId} />
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
              <li>• Unggah gambar untuk mempercepat proses</li>
              <li>• Pilih alat; divisi terisi otomatis untuk penugasan teknisi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

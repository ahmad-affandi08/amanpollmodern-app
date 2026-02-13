import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../context/AuthContext';
import IconAduan from '../../../../assets/img/icon-aduan.png';
import IconRiwayat from '../../../../assets/img/icon-riwayat-pengaduan.png';
import IconInventaris from '../../../../assets/img/icon-inventaris.png';
import IconAlatBaru from '../../../../assets/img/icon-tambah-alat-baru.png';
import IconPemeliharaan from '../../../../assets/img/icon-pemeliharaan.png';
import IconRiwayatPemeliharaan from '../../../../assets/img/icon-riwayat-pemeliharaan.png';

export default function MenuGrid() {
  const navigate = useNavigate();
  const { user } = useAuthContext();


  const userRuanganMenuItems = [
    {
      icon: IconAduan,
      label: 'Aduan',
      path: '/mobile/aduan',
      gradient: 'from-orange-50/80 via-orange-100/50 to-orange-50/80',
      iconGradient: 'from-orange-50 via-orange-100 to-orange-300',
    },
    {
      icon: IconRiwayat,
      label: 'Riwayat Aduan',
      path: '/mobile/riwayat-aduan',
      gradient: 'from-blue-50/80 via-blue-100/50 to-blue-50/80',
      iconGradient: 'from-blue-50 via-blue-100 to-blue-300',
    },
    {
      icon: IconInventaris,
      label: 'Inventaris',
      path: '/mobile/inventaris',
      gradient: 'from-purple-50/80 via-purple-100/50 to-purple-50/80',
      iconGradient: 'from-purple-50 via-purple-100 to-purple-300',
    },
    {
      icon: IconAlatBaru,
      label: '+ Alat Baru',
      path: '/mobile/alat-baru',
      gradient: 'from-emerald-50/80 via-emerald-100/50 to-emerald-50/80',
      iconGradient: 'from-emerald-50 via-emerald-100 to-emerald-300',
    }
  ];


  const teknisiMenuItems = [
    {
      icon: IconAduan,
      label: 'Aduan',
      path: '/mobile/aduan',
      gradient: 'from-orange-50/80 via-orange-100/50 to-orange-50/80',
      iconGradient: 'from-orange-50 via-orange-100 to-orange-300',
    },
    {
      icon: IconRiwayat,
      label: 'Riwayat Aduan',
      path: '/mobile/riwayat-aduan',
      gradient: 'from-blue-50/80 via-blue-100/50 to-blue-50/80',
      iconGradient: 'from-blue-50 via-blue-100 to-blue-300',
    },
    {
      icon: IconPemeliharaan,
      label: 'Pemeliharaan',
      path: '/mobile/pemeliharaan',
      gradient: 'from-purple-50/80 via-purple-100/50 to-purple-50/80',
      iconGradient: 'from-purple-50 via-purple-100 to-purple-300',
    },
    {
      icon: IconRiwayatPemeliharaan,
      label: 'Riwayat Pemeliharaan',
      path: '/mobile/pemeliharaan/history',
      gradient: 'from-emerald-50/80 via-emerald-100/50 to-emerald-50/80',
      iconGradient: 'from-emerald-50 via-emerald-100 to-emerald-300',
    }
  ];


  const menuItems = parseInt(user?.kategori_user_id) === 3 ? teknisiMenuItems : userRuanganMenuItems;

  return (
    <div className="grid grid-cols-2 gap-4">
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => navigate(item.path)}
          className={`bg-gradient-to-br ${item.gradient} cursor-pointer rounded-[20px] p-6 shadow-lg shadow-gray-200/50 border border-white/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className={`bg-gradient-to-br ${item.iconGradient} p-4 rounded-2xl shadow-inner border border-white/60 group-hover:scale-110 transition-transform duration-300`}>
              <img src={item.icon} alt={item.label} className="w-16 h-16" />
            </div>
            <span className="text-sm font-bold text-text-dark">{item.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

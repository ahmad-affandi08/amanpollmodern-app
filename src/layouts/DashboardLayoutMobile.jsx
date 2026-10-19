import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, AlertCircle, User } from 'lucide-react';
import useAuth from '../hooks/utils/useAuth';
import { useUnreadCount } from '../hooks';
import Logo from '../assets/img/logo2-amanpoll.png';
import NotifIcon from '../assets/img/icon-notifikasi.png';
import QRIcon from '../assets/img/icon-qr-code.png';

export default function DashboardLayoutMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadCount();

  const isActive = (path) => location.pathname === path;


  const getNavItems = () => {
    const roleId = user?.kategori_user_id ? parseInt(user.kategori_user_id) : null;

    if (roleId === 2) {
      return [
        { icon: Home, label: 'Beranda', path: '/mobile/dashboard' },
        { icon: AlertCircle, label: 'Aduan', path: '/mobile/aduan' },
        { type: 'qr', path: '/mobile/scan' },
        { icon: Package, label: 'Inventaris', path: '/mobile/inventaris' },
        { icon: User, label: 'Profile', path: '/mobile/profile' },
      ];
    } else if (roleId === 3) {
      return [
        { icon: Home, label: 'Beranda', path: '/mobile/dashboard' },
        { icon: AlertCircle, label: 'Aduan', path: '/mobile/aduan' },
        { type: 'qr', path: '/mobile/scan' },
        { icon: Package, label: 'Pemeliharaan', path: '/mobile/pemeliharaan' },
        { icon: User, label: 'Profile', path: '/mobile/profile' },
      ];
    }

    return [
      { icon: Home, label: 'Beranda', path: '/mobile/dashboard' },
      { icon: AlertCircle, label: 'Aduan', path: '/mobile/aduan' },
      { type: 'qr', path: '/mobile/scan' },
      { icon: User, label: 'Profile', path: '/mobile/profile' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-brand-primary-soft">
      {/* Ultra-Modern Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-brand-primary-soft">
        <div className="max-w-md mx-auto ">
          <div className="bg-gradient-to-br from-brand-primary to-brand-primary-light rounded-b-[20px] shadow-2xl p-3.5 flex items-center justify-between backdrop-blur-sm border border-white/20">
            {/* Logo */}
            <img src={Logo} alt="Amanpoll" className="h-9 w-auto drop-shadow-lg" />

            {/* Notification Button */}
            <button
              onClick={() => navigate('/mobile/notifikasi')}
              className="relative p-2.5 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <img src={NotifIcon} alt="Notifications" className="h-5 w-5 drop-shadow-md" />
              {/* Dynamic Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with top padding for fixed header */}
      <main className="pt-[72px] pb-28">
        <Outlet />
      </main>

      {/* Ultra-Modern Sticky Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-brand-primary-soft/80">
        <div className="max-w-md mx-auto ">
          <div className="bg-white/90 backdrop-blur-md rounded-t-[20px] shadow-2xl border border-gray-200/50 relative">
            {/* QR Code Button - Ultra Elevated */}
            <button
              onClick={() => navigate('/mobile/scan')}
              className="absolute left-1/2 -translate-x-1/2 -top-7 bg-gradient-to-br from-brand-primary to-brand-primary-light p-3.5 rounded-[18px] shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white z-10"
            >
              <img src={QRIcon} alt="QR Scanner" className="h-7 w-7 drop-shadow-lg" />
            </button>

            {/* Navigation Items - Flex Layout */}
            <div className="flex items-center justify-between py-2.5 px-12">
              {/* Left Items */}
              <div className="flex gap-8">
                {navItems.slice(0, 2).map((item, index) => {
                  if (item.type === 'qr') return null;

                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <button
                      key={index}
                      onClick={() => navigate(item.path)}
                      className={`flex flex-col items-center justify-center py-2  rounded-xl transition-all duration-300 ${active ? 'text-brand-primary bg-purple-50/50' : 'text-gray-400 hover:text-brand-primary hover:bg-purple-50/30'
                        }`}
                    >
                      <Icon size={20} className={`${active ? 'mb-0.5 scale-110' : 'mb-0.5'} transition-transform`} />
                      <span className={`text-[9px] font-medium ${active ? 'font-bold' : ''}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Center Spacer for QR */}
              <div className="w-16"></div>

              {/* Right Items */}
              <div className="flex gap-8">
                {navItems.slice(3).map((item, index) => {
                  if (item.type === 'qr') return null;

                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <button
                      key={index + 3}
                      onClick={() => navigate(item.path)}
                      className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 ${active ? 'text-brand-primary bg-purple-50/50' : 'text-gray-400 hover:text-brand-primary hover:bg-purple-50/30'
                        }`}
                    >
                      <Icon size={20} className={`${active ? 'mb-0.5 scale-110' : 'mb-0.5'} transition-transform`} />
                      <span className={`text-[9px] font-medium ${active ? 'font-bold' : ''}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

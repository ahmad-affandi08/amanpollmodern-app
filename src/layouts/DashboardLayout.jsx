import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, AlertCircle, Wrench, FileText,
  Wallet, Users, QrCode, LogOut, Menu, X, ChevronDown, ChevronRight,
  User as UserIcon, Layers, Tag, Server, PlusCircle, Settings, Phone,
  Building2, Search, Bell, AlignLeft, Hammer
} from 'lucide-react';
import useAuth from '../hooks/utils/useAuth';
import Logo from '../assets/img/logo2-amanpoll.png';
import Logo3 from '../assets/img/logo3-amanpoll.png';
import NotificationBell from '../components/NotificationBell';
import { ConfirmDialog } from '../components/Alert/Alert';

export default function DashboardLayout({ children }) {
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle
  const [collapsed, setCollapsed] = useState(false); // Desktop collapse (minimized)

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({}); // State for collapsible menus
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [confirmLogout, setConfirmLogout] = useState({ isOpen: false });

  const handleLogoutClick = () => {
    setConfirmLogout({ isOpen: true });
  };

  const handleLogoutConfirm = async () => {
    setConfirmLogout({ isOpen: false });
    await logout();
    navigate('/login');
  };

  const toggleMenu = (label) => {
    // If sidebar is collapsed, expand it when user tries to open a submenu
    if (collapsed) {
      setCollapsed(false);
      // Small delay to allow expansion transition before opening menu
      setTimeout(() => {
        setOpenMenus(prev => ({
          ...prev,
          [label]: !prev[label]
        }));
      }, 150);
    } else {
      setOpenMenus(prev => ({
        ...prev,
        [label]: !prev[label]
      }));
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    // Close all submenus when collapsing to keep it clean
    if (!collapsed) {
      setOpenMenus({});
    }
  }

  // Role Constants
  const ROLE_SUPER_ADMIN = 1;
  const ROLE_USER_RUANGAN = 2;
  const ROLE_TEKNISI = 3;
  const ROLE_ADMIN_DIVISI = 4;
  const ROLE_PIMPINAN = 5;

  const currentRoleId = user?.kategori_user_id ? parseInt(user.kategori_user_id) : null;

  // Helper to check access
  const hasAccess = (allowedRoles) => {
    if (!allowedRoles) return true; // Public/All
    return allowedRoles.includes(currentRoleId);
  };

  // Menu Structure
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: Package,
      label: 'Inventaris',
      roles: [ROLE_SUPER_ADMIN, ROLE_ADMIN_DIVISI, ROLE_PIMPINAN], // Pimpinan can view
      children: [
        { icon: Layers, label: 'Master Kategori', path: '/inventaris/kategori', roles: [ROLE_SUPER_ADMIN] },
        { icon: Tag, label: 'Master Nama Alat', path: '/inventaris/nama-alat', roles: [ROLE_SUPER_ADMIN, ROLE_ADMIN_DIVISI] }, // Admin Divisi might need to see names
        { icon: Server, label: 'Data Alat', path: '/inventaris/data' },
        { icon: PlusCircle, label: 'Data Alat Baru', path: '/inventaris/baru', roles: [ROLE_SUPER_ADMIN, ROLE_ADMIN_DIVISI] }, // Pimpinan cannot add
      ].filter(child => hasAccess(child.roles))
    },
    {
      icon: AlertCircle,
      label: 'Aduan',
      path: '/aduan',
      roles: [ROLE_SUPER_ADMIN, ROLE_ADMIN_DIVISI, ROLE_TEKNISI, ROLE_USER_RUANGAN]
    },
    {
      icon: Wrench,
      label: 'Pemeliharaan',
      path: '/pemeliharaan',
      roles: [ROLE_SUPER_ADMIN, ROLE_ADMIN_DIVISI, ROLE_TEKNISI]
    },
    {
      icon: FileText,
      label: 'Report',
      roles: [ROLE_SUPER_ADMIN, ROLE_ADMIN_DIVISI, ROLE_PIMPINAN],
      children: [
        { icon: FileText, label: 'Report Aduan', path: '/report/aduan' },
        { icon: FileText, label: 'Report Pemeliharaan', path: '/report/pemeliharaan' },
      ]
    },
    {
      icon: Wallet,
      label: 'Anggaran & Biaya',
      roles: [ROLE_SUPER_ADMIN, ROLE_ADMIN_DIVISI],
      children: [
        { icon: Settings, label: 'Pengaturan Anggaran', path: '/anggaran/pengaturan', roles: [ROLE_SUPER_ADMIN] },
        { icon: Wallet, label: 'Anggaran Pemeliharaan', path: '/anggaran/pemeliharaan' },
        { icon: Hammer, label: 'Biaya Perbaikan', path: '/anggaran/biaya-perbaikan' },
      ].filter(child => hasAccess(child.roles))
    },
    {
      icon: Users,
      label: 'Pengguna',
      roles: [ROLE_SUPER_ADMIN],
      children: [
        { icon: Users, label: 'Master User', path: '/users' },
        { icon: Building2, label: 'Master Divisi', path: '/users/divisi' },
        { icon: Building2, label: 'Master Bagian/Ruangan', path: '/users/ruangan' },
      ]
    },
    {
      icon: Settings,
      label: 'Konfigurasi',
      roles: [ROLE_SUPER_ADMIN],
      children: [
        { icon: Phone, label: 'Integrasi Fonnte', path: '/konfigurasi/integrasi' },
        { icon: Settings, label: 'Sistem', path: '/konfigurasi/sistem' },
      ]
    },
    {
      icon: QrCode,
      label: 'Scanner',
      path: '/scanner',
      roles: [ROLE_SUPER_ADMIN, ROLE_ADMIN_DIVISI, ROLE_TEKNISI, ROLE_PIMPINAN]
    },
  ].filter(item => hasAccess(item.roles) && (!item.children || item.children.length > 0));

  // Helper to check if a menu or its children are active
  const isActive = (item) => {
    if (item.path) {
      return location.pathname === item.path || location.pathname.startsWith(item.path);
    }
    if (item.children) {
      return item.children.some(child => location.pathname === child.path || location.pathname.startsWith(child.path));
    }
    return false;
  };

  // Helper to check if specific path is active (for child items)
  const isPathActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-bg-light flex font-[Plus_Jakarta_Sans]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-gradient-to-br from-brand-primary to-brand-primary-light text-white transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'lg:w-[90px]' : 'lg:w-72'}
        w-72
        shadow-2xl shadow-brand-primary/20
      `}>
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className={`p-8 flex items-center justify-center transition-all duration-300 min-h-[100px] ${collapsed ? 'px-2' : ''}`}>
            {!collapsed ? (
              <img src={Logo} alt="AmanPoll Logo" className="h-16 w-auto object-contain transition-all duration-300 drop-shadow-md" />
            ) : (
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary font-bold text-2xl shadow-lg ring-4 ring-white/20">
                A
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {menuItems.map((item, index) => (
              <div key={index}>
                {/* Parent Menu Item */}
                {item.children ? (
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`
                      w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative group border border-transparent
                      ${isActive(item)
                        ? 'bg-white text-brand-primary shadow-[0_4px_20px_rgba(0,0,0,0.1)] font-bold'
                        : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-white/5'
                      }
                      ${collapsed ? 'justify-center' : 'justify-between'}
                    `}
                    title={collapsed ? item.label : ''}
                  >
                    <div className={`flex items-center gap-4 ${collapsed ? 'justify-center w-full' : ''}`}>
                      <item.icon size={22} className={`min-w-[22px] transition-colors duration-300 ${isActive(item) ? 'text-brand-primary' : 'text-current'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && (
                      <div className={`transition-transform duration-300 ${openMenus[item.label] ? 'rotate-180' : ''}`}>
                        <ChevronDown size={18} strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group border border-transparent
                      ${isActive(item)
                        ? 'bg-white text-brand-primary shadow-[0_4px_20px_rgba(0,0,0,0.1)] font-bold'
                        : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-white/5'
                      }
                       ${collapsed ? 'justify-center' : 'gap-4'}
                    `}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? item.label : ''}
                  >
                    <item.icon size={22} className={`min-w-[22px] transition-colors duration-300 ${isActive(item) ? 'text-brand-primary' : 'text-current'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )}

                {/* Submenu Items */}
                {item.children && openMenus[item.label] && !collapsed && (
                  <div className="ml-6 mt-2 pl-4 py-2 space-y-1 border-l-2 border-white/20 animate-slide-down">
                    {item.children.map((child, childIndex) => (
                      <Link
                        key={childIndex}
                        to={child.path}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                          ${isPathActive(child.path)
                            ? 'bg-white/20 text-white shadow-inner backdrop-blur-sm border border-white/10'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isPathActive(child.path) ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-110' : 'bg-white/40'}`}></div>
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Profile in Sidebar (Mobile Only) */}
          <div className="lg:hidden p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-brand-primary font-bold flex items-center justify-center shadow-lg">
                {user?.nama_lengkap?.charAt(0) || 'U'}
              </div>
              <div className="text-white">
                <p className="font-bold text-sm">{user?.nama_lengkap}</p>
                <p className="text-xs opacity-70">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ml-0 ${collapsed ? 'lg:ml-[90px]' : 'lg:ml-72'}`}>
        {/* Header */}
        <header className="bg-bg-light/90 backdrop-blur-sm sticky top-0 z-30 px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 transition-all duration-300">
          <div className="flex items-center justify-between">
            {/* Title & Toggle */}
            <div className="flex items-center gap-4">
              {/* Mobile Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 bg-white rounded-xl shadow-sm text-gray-600"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Desktop Toggle */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-2 bg-white rounded-xl shadow-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <AlignLeft size={24} className={`transform transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Logo */}
              <div className="block md:hidden">
                <img src={Logo3} alt="AmanPoll Logo" className="h-8 w-auto object-contain" />
              </div>

              {/* Breadcrumbs Replaces Static Title */}
              <nav className="hidden md:flex items-center">
                {(() => {
                  const currentPath = location.pathname;
                  let crumbs = [];

                  // Find in menu
                  for (const item of menuItems) {
                    if (item.path === currentPath) {
                      crumbs.push({ label: item.label, path: item.path, active: true });
                      break;
                    }
                    if (item.children) {
                      const childMatch = item.children.find(c => c.path === currentPath);
                      if (childMatch) {
                        crumbs.push({ label: item.label, path: null, active: false });
                        crumbs.push({ label: childMatch.label, path: childMatch.path, active: true });
                        break;
                      }
                    }
                  }

                  // Fallback
                  if (crumbs.length === 0) {
                    if (currentPath === '/' || currentPath === '/dashboard') {
                      crumbs.push({ label: 'Dashboard', path: '/dashboard', active: true });
                    } else {
                      const segments = currentPath.split('/').filter(Boolean);
                      segments.forEach((seg, index) => {
                        crumbs.push({
                          label: seg.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                          active: index === segments.length - 1
                        });
                      });
                    }
                  }

                  return crumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <ChevronRight size={18} className="text-gray-400 mx-2" />}
                      <span className={`${crumb.active ? 'text-text-dark font-bold text-lg md:text-xl lg:text-2xl' : 'text-gray-500 text-sm md:text-base lg:text-lg font-medium'}`}>
                        {crumb.label}
                      </span>
                    </React.Fragment>
                  ));
                })()}
              </nav>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-6">
              {/* Search (Optional) */}
              <div className="hidden md:flex items-center bg-white px-4 py-2.5 rounded-xl shadow-sm w-64">
                <span className="text-gray-400 mr-2">🔍</span>
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full" />
              </div>

              {/* Notifications */}
              <NotificationBell className="bg-white rounded-xl p-1 shadow-sm text-gray-600" />

              {/* User Dropdown */}
              <div className="relative bg-white rounded-xl p-1 shadow-sm text-gray-600">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-white/50 transition-colors"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-text-dark leading-tight">{user?.nama_lengkap || 'John Doe'}</p>
                    <p className="text-xs text-text-gray">{user?.role || 'Admin'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-danger-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-accent-orange/20">
                    {user?.nama_lengkap?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown size={16} className="text-text-gray" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-4 w-48 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2 z-50 animate-fade-in border border-gray-100">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-accent-orange font-semibold hover:bg-danger-500/5 transition-colors text-sm"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 px-8 pb-8">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmLogout.isOpen}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari aplikasi?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setConfirmLogout({ isOpen: false })}
        type="warning"
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  ArrowRight,
  Package,
  Wrench,
  BarChart3,
  Shield,
  Bell,
  QrCode,
  Menu,
  X
} from 'lucide-react';
import logo from '../assets/img/logo3-amanpoll.png';
import Logo3d from '../assets/img/icon-logo-3d-amanpoll.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Package,
      title: 'Manajemen Inventaris',
      description: 'Kelola aset dan peralatan dengan sistem terorganisir dan mudah diakses',
      color: 'from-brand-primary to-purple-500'
    },
    {
      icon: Wrench,
      title: 'Pemeliharaan Terjadwal',
      description: 'Jadwalkan dan monitor pemeliharaan rutin untuk kondisi optimal',
      color: 'from-accent-orange to-accent-yellow-dark'
    },
    {
      icon: Bell,
      title: 'Sistem Aduan',
      description: 'Laporkan kerusakan dengan cepat dan pantau progress secara real-time',
      color: 'from-info-500 to-info-700'
    },
    {
      icon: QrCode,
      title: 'QR Code Scanner',
      description: 'Scan QR code untuk akses informasi dan riwayat dengan instan',
      color: 'from-success-500 to-success-700'
    },
    {
      icon: BarChart3,
      title: 'Laporan & Analitik',
      description: 'Dashboard lengkap dengan visualisasi data untuk keputusan tepat',
      color: 'from-warning-500 to-warning-700'
    },
    {
      icon: Shield,
      title: 'Keamanan Terjamin',
      description: 'Role-based access control untuk keamanan dan privasi data',
      color: 'from-danger-500 to-danger-700'
    }
  ];

  return (
    <div className="min-h-screen bg-bg-light font-[Plus_Jakarta_Sans]">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
        }`}>
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src={logo} alt="AmanPoll Logo" className="h-9 w-auto" />
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-text-gray hover:text-brand-primary transition-colors font-medium text-sm">Fitur</a>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 text-sm"
              >
                Masuk
              </button>
            </div>

            <button
              className="md:hidden p-2 text-text-dark"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="px-6 py-4 space-y-3">
              <a href="#features" className="block text-text-gray hover:text-brand-primary transition-colors font-medium text-sm" onClick={() => setMobileMenuOpen(false)}>Fitur</a>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-5 py-2 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary/90 transition-all text-sm"
              >
                Masuk
              </button>
            </div>
          </div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-orange/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-6">
              <div className="inline-block px-4 py-1.5 bg-brand-primary/10 rounded-full mb-2">
                <span className="text-brand-primary font-semibold text-xs">🚀 Sistem Manajemen Aset Modern</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-text-dark tracking-tight leading-[1.1]">
                Kelola Aset dengan{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">
                  Lebih Efisien
                </span>
              </h1>

              <p className="text-lg text-text-gray leading-relaxed max-w-xl mx-auto lg:mx-0">
                Platform terpadu untuk manajemen inventaris, pemeliharaan, dan pelaporan aset.
                Tingkatkan efisiensi operasional dengan teknologi modern.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/login')}
                  className="group w-full sm:w-auto px-7 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-xl shadow-brand-primary/25 hover:bg-brand-primary/90 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <LogIn size={18} />
                  <span>Masuk Sistem</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto px-7 py-3 bg-white text-text-dark border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-brand-primary/30 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <UserPlus size={18} />
                  <span>Daftar Gratis</span>
                </button>
              </div>
            </div>

            <div className="relative w-full max-w-[400px] mx-auto lg:mx-0">
              <div className="relative aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-purple-500/20 blur-3xl rounded-full animate-pulse"></div>
                <img
                  src={Logo3d}
                  alt="AmanPoll 3D"
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-brand-primary font-semibold text-xs uppercase tracking-wider">Fitur Unggulan</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-dark mt-3 mb-4">
              Semua dalam Satu Platform
            </h2>
            <p className="text-lg text-text-gray max-w-2xl mx-auto">
              Solusi lengkap untuk mengelola aset, dari pencatatan hingga pemeliharaan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-bg-light rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-brand-primary/20"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-text-dark mb-2">{feature.title}</h3>
                <p className="text-text-gray text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-r from-brand-primary to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Siap Meningkatkan Efisiensi?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan organisasi yang telah mempercayai AmanPoll untuk mengelola aset mereka
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-brand-primary rounded-xl font-bold shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white border-2 border-white rounded-xl font-bold hover:bg-white hover:text-brand-primary transition-all duration-300 flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              <span>Login</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-text-dark py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="AmanPoll Logo" className="h-9 w-auto" />
            </div>
            <div className="text-white/70 text-xs text-center md:text-right">
              © {new Date().getFullYear()} AmanPoll. Sistem Informasi Manajemen Aset & Pemeliharaan
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

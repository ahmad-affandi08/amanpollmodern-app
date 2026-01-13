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
  CheckCircle2,
  Zap,
  Users,
  TrendingUp,
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
      description: 'Kelola aset dan alat kesehatan dengan sistem yang terorganisir dan mudah diakses',
      color: 'from-brand-primary to-purple-500'
    },
    {
      icon: Wrench,
      title: 'Pemeliharaan Terjadwal',
      description: 'Jadwalkan dan monitor pemeliharaan rutin untuk memastikan alat selalu dalam kondisi optimal',
      color: 'from-accent-orange to-accent-yellow-dark'
    },
    {
      icon: Bell,
      title: 'Sistem Aduan',
      description: 'Laporkan kerusakan dengan cepat dan pantau progress perbaikan secara real-time',
      color: 'from-info-500 to-info-700'
    },
    {
      icon: QrCode,
      title: 'QR Code Scanner',
      description: 'Scan QR code untuk akses informasi alat dan riwayat pemeliharaan dengan instan',
      color: 'from-success-500 to-success-700'
    },
    {
      icon: BarChart3,
      title: 'Laporan & Analitik',
      description: 'Dashboard lengkap dengan visualisasi data dan insights untuk pengambilan keputusan',
      color: 'from-warning-500 to-warning-700'
    },
    {
      icon: Shield,
      title: 'Keamanan Terjamin',
      description: 'Sistem role-based access control untuk menjaga keamanan dan privasi data',
      color: 'from-danger-500 to-danger-700'
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Efisiensi Operasional',
      description: 'Otomasi proses pemeliharaan dan pengelolaan aset mengurangi waktu administrasi hingga 60%'
    },
    {
      icon: TrendingUp,
      title: 'Produktivitas Meningkat',
      description: 'Notifikasi real-time dan tracking memastikan respons cepat terhadap setiap permasalahan'
    },
    {
      icon: Users,
      title: 'Kolaborasi Tim',
      description: 'Platform terpadu untuk koordinasi antara admin, teknisi, dan manajemen'
    },
    {
      icon: CheckCircle2,
      title: 'Compliance & Audit',
      description: 'Dokumentasi lengkap untuk memenuhi standar akreditasi dan audit internal'
    }
  ];

  const stats = [
    { value: '1000+', label: 'Alat Terkelola' },
    { value: '50+', label: 'User Aktif' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-bg-light font-[Plus_Jakarta_Sans]">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src={logo} alt="AmanPoll Logo" className="h-10 w-auto" />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-text-gray hover:text-brand-primary transition-colors font-medium">Fitur</a>
              <a href="#benefits" className="text-text-gray hover:text-brand-primary transition-colors font-medium">Keunggulan</a>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
              >
                Masuk
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-text-dark"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-text-gray hover:text-brand-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Fitur</a>
              <a href="#benefits" className="block text-text-gray hover:text-brand-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Keunggulan</a>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-2.5 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary/90 transition-all"
              >
                Masuk
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-orange/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Side: Hero Text */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-block px-4 py-2 bg-brand-primary/10 rounded-full mb-4">
                <span className="text-brand-primary font-semibold text-sm">🚀 Sistem Manajemen Aset Modern</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-text-dark tracking-tight leading-[1.1]">
                Kelola Aset Kesehatan dengan{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">
                  Lebih Efisien
                </span>
              </h1>

              <p className="text-xl text-text-gray leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Platform terpadu untuk manajemen inventaris, pemeliharaan, dan pelaporan aset alat kesehatan. 
                Tingkatkan efisiensi operasional dengan teknologi modern.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/login')}
                  className="group w-full sm:w-auto px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-xl shadow-brand-primary/25 hover:bg-brand-primary/90 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <LogIn size={20} />
                  <span>Masuk Sistem</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-text-dark border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50 hover:border-brand-primary/30 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <UserPlus size={20} />
                  <span>Daftar Gratis</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-brand-primary">{stat.value}</div>
                    <div className="text-sm text-text-gray mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: 3D Logo / Visual */}
            <div className="relative w-full max-w-[500px] mx-auto lg:mx-0">
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

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-brand-primary font-semibold text-sm uppercase tracking-wider">Fitur Unggulan</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mt-4 mb-6">
              Semua yang Anda Butuhkan <br className="hidden sm:block" />dalam Satu Platform
            </h2>
            <p className="text-xl text-text-gray max-w-3xl mx-auto">
              Solusi lengkap untuk mengelola aset kesehatan, dari pencatatan hingga pemeliharaan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-bg-light rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-brand-primary/20"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-dark mb-3">{feature.title}</h3>
                <p className="text-text-gray leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 bg-gradient-to-br from-brand-primary/5 to-purple-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-brand-primary font-semibold text-sm uppercase tracking-wider">Keunggulan</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mt-4 mb-6">
              Mengapa Memilih AmanPoll?
            </h2>
            <p className="text-xl text-text-gray max-w-3xl mx-auto">
              Solusi terpercaya untuk optimasi pengelolaan aset kesehatan Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 p-4 bg-brand-primary/10 rounded-2xl">
                    <benefit.icon className="w-8 h-8 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-text-dark mb-3">{benefit.title}</h3>
                    <p className="text-text-gray leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-brand-primary to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Siap Meningkatkan Efisiensi Operasional?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan rumah sakit dan klinik yang telah mempercayai AmanPoll untuk mengelola aset mereka
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-10 py-5 bg-white text-brand-primary rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-10 py-5 bg-transparent text-white border-2 border-white rounded-2xl font-bold hover:bg-white hover:text-brand-primary transition-all duration-300 flex items-center justify-center gap-3 text-lg"
            >
              <LogIn size={20} />
              <span>Login</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-dark py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="AmanPoll Logo" className="h-10 w-auto" />
            </div>
            <div className="text-white/70 text-sm text-center md:text-right">
              © {new Date().getFullYear()} AmanPoll. Sistem Informasi Manajemen Aset & Pemeliharaan
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
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

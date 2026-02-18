import React from 'react';
import Logo3d from '../../assets/img/icon-logo-3d-amanpoll.png';
import { RefreshCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MaintenancePage() {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6 relative overflow-hidden font-[Plus_Jakarta_Sans]">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-orange/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* 3D Logo Animation */}
        <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80 mb-8 group perspective-1000">
          <div className="w-full h-full relative animate-float transition-transform duration-700 transform group-hover:scale-110">
            <img
              src={Logo3d}
              alt="AmanPoll Maintenance"
              className="w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(108,93,211,0.3)]"
            />
            {/* Glow Effect behind logo */}
            <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-text-dark mb-4 tracking-tight leading-tight">
          Sistem Sedang <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-400">
            Dioptimalkan
          </span>
        </h1>

        <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
          Kami sedang melakukan peningkatan sistem agar <span className="font-bold text-brand-primary">Aman Poll</span> makin aman dan nyaman digunakan. Mohon tunggu sebentar ya!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleRefresh}
            className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <RefreshCcw size={20} className="animate-spin-slow" />
            Coba Lagi
          </button>

          <button
            onClick={handleHome}
            className="px-8 py-3.5 bg-white text-gray-600 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={20} />
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

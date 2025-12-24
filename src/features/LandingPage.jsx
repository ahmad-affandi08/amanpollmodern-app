import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';
import logo from '../assets/img/logo3-amanpoll.png';
import Logo3d from '../assets/img/icon-logo-3d-amanpoll.png';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6 relative overflow-hidden font-[Plus_Jakarta_Sans]">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-orange/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
          {/* Left Side: Hero Text */}
          <div className="text-center md:text-left flex-1 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-text-dark tracking-tight leading-[1.1]">
              Selamat Datang di <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">
                Aman Poll
              </span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed max-w-lg mx-auto md:mx-0">
              Sistem Informasi Manajemen Aset & Pemeliharaan. Kelola inventaris dan aduan dengan lebih modern.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
              <button
                onClick={() => navigate('/login')}
                className="group w-full sm:w-auto px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-xl shadow-brand-primary/25 hover:bg-brand-primary/90 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <LogIn size={20} />
                <span>Masuk Sistem</span>
              </button>

              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-600 border border-gray-100 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <UserPlus size={20} />
                <span>Daftar Akun</span>
              </button>
            </div>
          </div>

          {/* Right Side: 3D Logo / Visual */}
          <div className="flex-1 relative w-full max-w-[300px] md:max-w-[400px]">
            <div className="relative aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-purple-500/20 blur-3xl rounded-full animate-pulse-slow"></div>
              <img
                src={Logo3d}
                alt="AmanPoll 3D"
                className="w-full h-full object-contain relative z-10 animate-float drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

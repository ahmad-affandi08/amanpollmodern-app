import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/utils/useAuth';
import Button from '../../components/Button';
import Logo from '../../assets/img/icon-logo-amanpoll.png';
import LogoAmanpoll3d from '../../assets/img/icon-logo-3d-amanpoll.png';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const ThickInput = ({ label, type = "text", ...props }) => (
  <div className="mb-4">
    <label className="block text-brand-primary font-bold mb-1 ml-1 text-sm">{label}</label>
    <input
      type={type}
      {...props}
      className="w-full bg-white border-2 border-indigo-100 text-brand-primary text-base font-medium px-4 py-3 rounded-[16px] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder-gray-300"
    />
  </div>
);

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [form, setForm] = useState({ username: '', wa: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await forgotPassword(form);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err?.message || 'Gagal mereset password. Periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 font-[Plus_Jakarta_Sans] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-violet-200 rounded-full blur-[80px] opacity-40"></div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-[32px] shadow-2xl shadow-brand-primary/15 border border-white p-8 relative z-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Berhasil Direset!</h1>
          <p className="text-gray-600 mb-4">
            Password baru telah dikirim ke WhatsApp Anda. Silakan cek pesan masuk.
          </p>
          <p className="text-sm text-gray-500">
            Anda akan diarahkan ke halaman login dalam beberapa detik...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 font-[Plus_Jakarta_Sans] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-violet-200 rounded-full blur-[80px] opacity-40"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl w-full max-w-[1100px] h-auto lg:h-[80vh] rounded-[32px] shadow-2xl shadow-brand-primary/15 border border-white p-3 lg:p-4 flex flex-col lg:flex-row relative z-10 overflow-hidden lg:overflow-visible">
        <div className="hidden lg:flex w-full lg:w-[45%] h-64 lg:h-full bg-gradient-to-b from-indigo-50 to-indigo-100 rounded-[24px] items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-soft-light"></div>

          <div className="relative z-10 transform translate-y-4 lg:translate-y-8 group-hover:scale-105 transition-transform duration-700 ease-in-out">
            <img
              src={LogoAmanpoll3d}
              alt="Amanpoll 3D"
              className="w-auto h-[220px] md:h-[260px] lg:h-[300px] object-contain drop-shadow-[0_30px_60px_rgba(108,93,211,0.3)] animate-float"
            />
            <h1 className="text-xl text-center lg:text-4xl font-bold text-brand-primary mt-4">Aman Poll</h1>
          </div>

          <div className="absolute top-10 right-10 w-12 h-12 bg-yellow-300 rounded-full blur-xl opacity-60 animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-20 h-20 bg-blue-300 rounded-full blur-2xl opacity-40"></div>
        </div>

        <div className="w-full lg:w-[55%] h-full flex flex-col justify-center px-4 lg:px-12 py-6 lg:py-0 overflow-y-auto lg:overflow-visible">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <img src={Logo} alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-brand-primary">Amanpoll</span>
            </div>
          </div>

          <div className="text-center lg:text-left mb-6">
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2 tracking-tight">Lupa Password? 🔐</h1>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Tenang, Kami Bantu!</h2>
            <p className="text-gray-400 mt-1 text-sm lg:text-base">
              Masukkan username dan nomor WhatsApp kamu, password baru akan dikirim via WA.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl font-bold text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto lg:mx-0">
            <ThickInput
              label="Username"
              name="username"
              placeholder="Masukkan username kamu"
              value={form.username}
              onChange={handleChange}
              required
            />

            <ThickInput
              label="Nomor WhatsApp"
              name="wa"
              type="tel"
              placeholder="Contoh: 081234567890"
              value={form.wa}
              onChange={handleChange}
              required
            />

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6">
              <p className="text-blue-800 text-xs font-medium">
                💡 <strong>Tips:</strong> Pastikan nomor WhatsApp yang kamu masukkan sama dengan yang terdaftar di akun kamu.
              </p>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-gray-900 hover:bg-gray-900 text-white font-bold text-lg py-3 rounded-[16px] shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 transform hover:scale-[1.02] transition-all"
            >
              {loading ? 'Mengirim...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 font-medium text-sm">
              Sudah ingat password?{' '}
              <Link to="/login" className="text-brand-primary font-bold hover:underline">
                Login Sekarang
              </Link>
            </p>
          </div>

          <div className="mt-auto hidden lg:flex justify-center lg:justify-start gap-6 text-xs text-gray-400 font-medium pt-4">
            <a href="#" className="hover:text-brand-primary">Privacy Policy</a>
            <a href="#" className="hover:text-brand-primary">Terms & Condition</a>
          </div>
        </div>
      </div>
    </div>
  );
}

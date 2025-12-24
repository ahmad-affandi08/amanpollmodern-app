import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthApi from '../../api/AuthApi';
import Button from '../../components/Button';
import SearchableSelect from '../../components/SearchableSelect';
import Logo from '../../assets/img/icon-logo-amanpoll.png';
import LogoAmanpoll3d from '../../assets/img/icon-logo-3d-amanpoll.png';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

// Consistent Style with Login.jsx (Thick, Rounded 20px, large text)
const ThickInput = ({ label, type = "text", suffix, ...props }) => (
  <div className="mb-5">
    <label className="block text-brand-primary font-bold mb-2 ml-1 text-base">{label}</label>
    <div className="relative">
      <input
        type={type}
        {...props}
        className={`w-full bg-white border-[3px] border-indigo-100 text-brand-primary text-lg font-medium px-6 py-4 rounded-[20px] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder-gray-300 ${suffix ? 'pr-14' : ''}`}
      />
      {suffix && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-primary/50 hover:text-brand-primary cursor-pointer transition-colors">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

const ThickSelect = ({ label, children, ...props }) => (
  <div className="mb-5">
    <label className="block text-brand-primary font-bold mb-2 ml-1 text-base">{label}</label>
    <div className="relative">
      <select
        {...props}
        className="w-full bg-white border-[3px] border-indigo-100 text-brand-primary text-lg font-medium px-6 py-4 rounded-[20px] focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all cursor-pointer appearance-none"
      >
        {children}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-primary pointer-events-none">
        <svg width="14" height="9" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L6 6L11 1" /></svg>
      </div>
    </div>
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Identity, 2: Security
  const [form, setForm] = useState({
    kategori_user_id: '',
    nama_lengkap: '',
    username: '',
    wa: '',
    email: '',
    password: '',
    password_confirmation: '',
    ruangan_id: '',
    divisi_id: '',
  });

  const [kategoriUserList, setKategoriUserList] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [kategori, ruangan, divisi] = await Promise.all([
          AuthApi.getKategoriUser(),
          AuthApi.getRuangan(),
          AuthApi.getDivisi(),
        ]);
        setKategoriUserList(Array.isArray(kategori) ? kategori : []);
        setRuanganList(Array.isArray(ruangan) ? ruangan : []);
        setDivisiList(Array.isArray(divisi) ? divisi : []);
      } catch (err) {
        console.error('Failed to fetch master data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchMasterData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      // Manual validation for Step 1
      if (!form.kategori_user_id || !form.nama_lengkap || !form.username) {
        setError("Lengkapi data langkah 1 dulu ya!");
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (form.password !== form.password_confirmation) {
      setError('Konfirmasi kata sandi tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      await AuthApi.register(form);
      setSuccess('Registrasi berhasil! Mohon tunggu persetujuan.');
      setForm({
        kategori_user_id: '', nama_lengkap: '', username: '', wa: '',
        email: '', password: '', password_confirmation: '', ruangan_id: '', divisi_id: '',
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const message = err.message || (err.errors ? Object.values(err.errors).flat().join(', ') : 'Terjadi kesalahan saat registrasi');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 lg:p-8 font-[Plus_Jakarta_Sans] relative overflow-hidden">

      {/* Background Blobs (Identical to Login) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-violet-200 rounded-full blur-[80px] opacity-40"></div>
      </div>

      {/* Main Card (Fixed Size like Login) */}
      <div className="bg-white/80 backdrop-blur-xl w-full max-w-[1400px] h-full lg:h-[85vh] rounded-[40px] shadow-2xl shadow-brand-primary/15 border border-white p-4 lg:p-6 flex flex-col lg:flex-row relative z-10 overflow-hidden">

        {/* LEFT SIDE - ILLUSTRATION */}
        <div className="hidden lg:flex w-full lg:w-[45%] h-48 lg:h-full bg-gradient-to-b from-indigo-50 to-indigo-100 rounded-[32px] items-center justify-center relative overflow-hidden group shrink-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-soft-light"></div>

          {/* Mascot (Animated) */}
          <div className="relative z-10 transform translate-y-2 lg:translate-y-10 group-hover:scale-105 transition-transform duration-700 ease-in-out">
            <img
              src={LogoAmanpoll3d}
              alt="Amanpoll 3D"
              className="w-auto h-[280px] md:h-[320px] lg:h-[380px] object-contain drop-shadow-[0_30px_60px_rgba(108,93,211,0.3)] animate-float"
            />
            <h1 className="text-2xl text-center lg:text-5xl font-bold text-brand-primary">Aman Poll</h1>
          </div>
          <div className="absolute top-10 right-10 w-12 h-12 bg-yellow-300 rounded-full blur-xl opacity-60 animate-pulse"></div>
        </div>

        {/* RIGHT SIDE - FORM WIZARD */}
        <div className="w-full lg:w-[55%] h-full flex flex-col justify-center px-4 lg:px-20 py-8 lg:py-0 overflow-y-auto lg:overflow-visible relative">

          {/* Progress Dots */}
          <div className="absolute top-8 right-8 flex gap-2 hidden lg:flex">
            <div className={`w-3 h-3 rounded-full transition-colors ${step >= 1 ? 'bg-brand-primary' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-colors ${step >= 2 ? 'bg-brand-primary' : 'bg-gray-200'}`}></div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <img src={Logo} alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-brand-primary">Amanpoll</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-gray-900 mb-2 tracking-tight">Kenalan Yuk! 👋</h1>
            <p className="text-gray-400 text-lg">
              {step === 1 ? 'Isi identitas diri kamu dulu.' : 'Sekarang amankan akunmu.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 text-red-500 rounded-2xl font-bold text-sm text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="w-20 h-20 bg-success-300 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
                <ArrowRight className="text-gray-900" size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">{success}</h2>
              <p className="text-sm text-gray-400">Mengalihkan...</p>
            </div>
          ) : (
            <form onSubmit={step === 2 ? handleSubmit : handleNext} className="w-full max-w-lg mx-auto lg:mx-0">

              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <div className="animate-fade-in space-y-4">
                  <ThickSelect
                    label="Kamu Siapa?"
                    name="kategori_user_id"
                    value={form.kategori_user_id}
                    onChange={handleChange}
                    required
                    disabled={dataLoading}
                  >
                    <option value="">Pilih Tipe Akun</option>
                    {kategoriUserList.map(k => <option key={k.id} value={k.id}>{k.display_kategori}</option>)}
                  </ThickSelect>

                  {/* Conditional Fields */}
                  {kategoriUserList.find(k => String(k.id) === String(form.kategori_user_id))?.display_kategori === 'User Ruangan' && (
                    <SearchableSelect
                      label="Ruangan"
                      name="ruangan_id"
                      options={ruanganList.map(r => ({
                        value: r.id_ruangan,
                        label: r.nama_ruangan,
                      }))}
                      value={form.ruangan_id}
                      onChange={(e) => setForm({ ...form, ruangan_id: e.target.value })}
                      placeholder="Pilih Ruangan"
                      searchPlaceholder="Cari ruangan..."
                      required
                    />
                  )}

                  {kategoriUserList.find(k => String(k.id) === String(form.kategori_user_id))?.display_kategori === 'Teknisi' && (
                    <SearchableSelect
                      label="Divisi"
                      name="divisi_id"
                      options={divisiList.map(d => ({
                        value: d.id_divisi,
                        label: d.nama_divisi,
                      }))}
                      value={form.divisi_id}
                      onChange={(e) => setForm({ ...form, divisi_id: e.target.value })}
                      placeholder="Pilih Divisi"
                      searchPlaceholder="Cari divisi..."
                      required
                    />
                  )}

                  <ThickInput label="Nama Lengkap" name="nama_lengkap" placeholder="Nama lengkap kamu" value={form.nama_lengkap} onChange={handleChange} required />
                  <ThickInput label="Username" name="username" placeholder="Buat username unik" value={form.username} onChange={handleChange} required />

                  <div className="mt-8">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full bg-gray-900 hover:bg-gray-900 text-white font-black text-xl py-5 rounded-[20px] shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      Lanjut Langkah 2 <ArrowRight size={24} />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: SECURITY */}
              {step === 2 && (
                <div className="animate-fade-in space-y-4">
                  <ThickInput label="Email" name="email" type="email" placeholder="email@kamu.com" value={form.email} onChange={handleChange} required />
                  <ThickInput label="WhatsApp" name="wa" placeholder="08xxxxx" value={form.wa} onChange={handleChange} required />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ThickInput
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="*******"
                      value={form.password}
                      onChange={handleChange}
                      required
                      suffix={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-brand-primary hover:text-brand-primary/80">{showPassword ? <EyeOff size={24} /> : <Eye size={24} />}</button>}
                    />
                    <ThickInput
                      label="Konfirmasi"
                      name="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="*******"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      required
                      suffix={<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-brand-primary hover:text-brand-primary/80">{showConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}</button>}
                    />
                  </div>

                  <div className="mt-8 flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg py-5 rounded-[20px] transition-all"
                    >
                      Kembali
                    </button>
                    <Button
                      type="submit"
                      loading={loading}
                      className="w-2/3 bg-gray-900 hover:bg-gray-900 text-white font-black text-xl py-5 rounded-[20px] shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
                    >
                      {loading ? 'Daftar...' : 'Selesai & Daftar'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-gray-500 font-medium">
                  Sudah punya akun?{' '}
                  <Link to="/login" className="text-brand-primary font-bold hover:underline">
                    Masuk Aja Disini
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

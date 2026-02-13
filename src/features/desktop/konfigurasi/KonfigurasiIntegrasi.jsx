import { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, TestTube, CheckCircle, XCircle, Loader2, BookOpen, ExternalLink, MessageCircle, Copy, Check, Info, AlertTriangle } from 'lucide-react';
import { useFonnteConfig, useSaveFonnteConfig, useTestFonnteConnection } from '../../../hooks';
import { useToast } from '../../../components/Alert/useToast';
import usePageTitle from '../../../hooks/utils/usePageTitle';

const KonfigurasiIntegrasi = () => {
  usePageTitle('Konfigurasi Integrasi Fonnte');
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    api_token: '',
  });
  const [showToken, setShowToken] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [copied, setCopied] = useState(false);


  const { data: config, isLoading } = useFonnteConfig();
  const saveMutation = useSaveFonnteConfig();
  const testMutation = useTestFonnteConnection();


  useEffect(() => {
    if (config) {
      setFormData({
        api_token: config.api_token || '',
      });
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTestStatus(null);
  };

  const handleTestConnection = async () => {
    if (!formData.api_token) {
      showToast('Mohon isi API Token terlebih dahulu', 'error');
      return;
    }

    try {
      const result = await testMutation.mutateAsync(formData.api_token);
      if (result.data.success) {
        setTestStatus('success');
        showToast('Koneksi berhasil! Token valid.', 'success');
      } else {
        setTestStatus('error');
        showToast(result.data.message || 'Koneksi gagal', 'error');
      }
    } catch (error) {
      setTestStatus('error');
      showToast('Koneksi gagal: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.api_token) {
      showToast('Mohon isi API Token', 'error');
      return;
    }

    try {
      await saveMutation.mutateAsync(formData);
      showToast('Konfigurasi berhasil disimpan', 'success');
    } catch (error) {
      showToast('Gagal menyimpan konfigurasi: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('https://fonnte.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c4a6e] to-[#075985] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-teal-400/20 blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20 text-white">
              <MessageCircle size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Integrasi WhatsApp</h1>
              <p className="text-sky-100 text-lg">Hubungkan aplikasi dengan Fonnte WhatsApp Gateway.</p>
            </div>
          </div>
          <a href="https://fonnte.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white text-sky-900 rounded-xl font-bold hover:bg-sky-50 transition-colors shadow-lg">
            Buka Fonnte <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Configuration */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
          <div className="bg-white rounded-3xl p-1 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="bg-white rounded-[20px] p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Save size={20} />
                </div>
                <h2 className="text-xl font-bold text-text-dark">Konfigurasi API</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Fonnte API Token <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type={showToken ? 'text' : 'password'}
                      name="api_token"
                      value={formData.api_token}
                      onChange={handleChange}
                      placeholder="Tempel API Token disini..."
                      className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">API Token bisa Anda dapatkan dari Dashboard Fonnte.</p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending || !formData.api_token}
                    className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                  >
                    {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    Simpan Konfigurasi
                  </button>

                  <button
                    onClick={handleTestConnection}
                    disabled={testMutation.isPending || !formData.api_token}
                    className="px-6 py-3 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl font-bold hover:bg-purple-100 transition-all flex items-center gap-2"
                  >
                    {testMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <TestTube size={18} />}
                    Tes Koneksi
                  </button>
                </div>

                {/* Test Result Area */}
                <div className={`overflow-hidden transition-all duration-300 ${testStatus ? 'max-h-24 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${testStatus === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    {testStatus === 'success' ? <CheckCircle className="shrink-0" /> : <XCircle className="shrink-0" />}
                    <div>
                      <p className="font-bold">{testStatus === 'success' ? 'Koneksi Berhasil' : 'Koneksi Gagal'}</p>
                      <p className="text-xs opacity-90">{testStatus === 'success' ? 'Akun WhatsApp terhubung dan siap digunakan.' : 'Periksa kembali Token API atau status perangkat Anda di Fonnte.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Documentation */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-text-dark flex items-center gap-2">
                <BookOpen size={18} className="text-gray-400" />
                Panduan Singkat
              </h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="prose prose-sm text-gray-600">
                <h4 className="flex items-center gap-2 text-text-dark font-bold text-sm mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Apa itu Fonnte?
                </h4>
                <p className="text-xs leading-relaxed mb-4">
                  Fonnte adalah layanan WhatsApp Gateway yang memungkinkan aplikasi mengirim notifikasi WhatsApp secara otomatis.
                </p>

                <h4 className="flex items-center gap-2 text-text-dark font-bold text-sm mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Cara Mendapatkan API Token:
                </h4>

                <ol className="relative border-l border-gray-200 ml-2 space-y-4">
                  {[
                    { text: "Kunjungi fonnte.com", link: "https://fonnte.com" },
                    { text: "Daftar atau login ke akun Fonnte" },
                    { text: "Masuk ke Dashboard" },
                    { text: "Buka menu Device, lalu kaitkan perangkat WhatsApp dengan scan QR Code" },
                    { text: "Pastikan status device Connected" },
                    { text: "Kembali ke menu Dashboard" },
                    { text: "Salin API Token / API Key yang tersedia" }
                  ].map((step, idx) => (
                    <li key={idx} className="ml-4">
                      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-200"></div>
                      <span className="text-xs text-gray-600 block leading-tight">
                        {step.link ? (
                          <a href={step.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                            {step.text}
                          </a>
                        ) : step.text}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-3 mt-6 pt-6 border-t border-gray-100">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-blue-800 text-xs leading-relaxed">
                    <strong>Tips:</strong> Pastikan device WhatsApp Anda sudah terkoneksi dan aktif di dashboard Fonnte sebelum menggunakan fitur ini.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-yellow-800 text-xs leading-relaxed">
                    <strong>Penting:</strong> Jangan bagikan API Token Anda kepada siapapun. Token ini bersifat rahasia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KonfigurasiIntegrasi;

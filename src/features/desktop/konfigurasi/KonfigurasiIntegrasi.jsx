import { useState } from 'react';
import { Eye, EyeOff, Save, TestTube, CheckCircle, XCircle, Loader2, BookOpen, ExternalLink, MessageCircle, Info, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useWhatsAppConfig, useSaveWhatsAppConfig, useTestWhatsAppConnection } from '../../../hooks';
import { useToast } from '../../../components/Alert/useToast';
import usePageTitle from '../../../hooks/utils/usePageTitle';

const TEMPLATE_EXAMPLE = 'Notifikasi AMANPOLL: {{1}} Terima kasih.';

// Field bersyarat (show_when) hanya tampil bila semua syaratnya cocok dengan isian saat ini.
const isVisible = (field, values) =>
  Object.entries(field.show_when || {}).every(([key, expected]) => values[key] === expected);

const KonfigurasiIntegrasi = () => {
  usePageTitle('Integrasi WhatsApp');
  const { showToast } = useToast();

  const { data: config, isLoading } = useWhatsAppConfig();
  const saveMutation = useSaveWhatsAppConfig();
  const testMutation = useTestWhatsAppConnection();

  // null = belum memilih: tampilkan provider aktif dari server.
  const [selectedId, setSelectedId] = useState(null);
  // Perubahan pengguna per provider: { [providerId]: { [fieldKey]: value } }.
  const [edits, setEdits] = useState({});
  const [visibleSecrets, setVisibleSecrets] = useState({});
  const [testTarget, setTestTarget] = useState('');
  const [testResult, setTestResult] = useState(null);

  const providers = config?.providers || [];
  const activeId = config?.active_provider || null;
  const currentId = selectedId ?? activeId ?? providers[0]?.id;
  const provider = providers.find((p) => p.id === currentId);

  if (isLoading || !provider) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  const values = { ...provider.values, ...(edits[provider.id] || {}) };
  const visibleFields = provider.fields.filter((f) => isVisible(f, values));
  const missingRequired = visibleFields.some((f) => f.required && !String(values[f.key] ?? '').trim());
  const needsTestTarget = !!provider.requires_test_target;

  const handleSelect = (id) => {
    setSelectedId(id);
    setTestResult(null);
  };

  const handleChange = (key, value) => {
    setEdits((prev) => ({ ...prev, [provider.id]: { ...(prev[provider.id] || {}), [key]: value } }));
    setTestResult(null);
  };

  const payload = () => ({ provider: provider.id, fields: values });

  const handleTest = async () => {
    if (missingRequired) {
      showToast('Lengkapi semua isian yang wajib terlebih dahulu', 'error');
      return;
    }
    if (needsTestTarget && !testTarget.trim()) {
      showToast('Provider ini diuji dengan mengirim pesan nyata: isi Nomor Tes', 'error');
      return;
    }

    try {
      const result = await testMutation.mutateAsync({ ...payload(), test_target: testTarget.trim() || null });
      const ok = !!result.data.success;
      setTestResult({ ok, message: result.data.message });
      showToast(result.data.message || (ok ? 'Koneksi berhasil' : 'Koneksi gagal'), ok ? 'success' : 'error');
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      setTestResult({ ok: false, message });
      showToast('Koneksi gagal: ' + message, 'error');
    }
  };

  const handleSave = async () => {
    if (missingRequired) {
      showToast('Lengkapi semua isian yang wajib terlebih dahulu', 'error');
      return;
    }

    try {
      const result = await saveMutation.mutateAsync(payload());
      // Setelah tersimpan, tampilkan nilai dari server (rahasia kembali tersamar).
      setEdits((prev) => ({ ...prev, [provider.id]: {} }));
      showToast(result.data?.message || 'Konfigurasi berhasil disimpan', 'success');
    } catch (error) {
      showToast('Gagal menyimpan konfigurasi: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const renderField = (field) => {
    const common = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-xs';
    const id = `wa-${provider.id}-${field.key}`;
    const shown = !!visibleSecrets[id];

    return (
      <div key={field.key}>
        <label htmlFor={id} className="block text-xs font-bold text-gray-700 mb-1.5">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>

        {field.type === 'select' ? (
          <select id={id} value={values[field.key] ?? ''} onChange={(e) => handleChange(field.key, e.target.value)} className={common}>
            {Object.entries(field.options || {}).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <input
              id={id}
              type={field.secret && !shown ? 'password' : 'text'}
              value={values[field.key] ?? ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder || ''}
              autoComplete="off"
              className={`${common} ${field.secret ? 'pr-10 font-mono' : ''}`}
            />
            {field.secret && (
              <button
                type="button"
                onClick={() => setVisibleSecrets((prev) => ({ ...prev, [id]: !shown }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {shown ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
        )}
        {field.help && <p className="text-[10px] text-gray-400 mt-1">{field.help}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c4a6e] to-[#075985] p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-teal-400/20 blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20 text-white">
              <MessageCircle size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 tracking-tight">Integrasi WhatsApp</h1>
              <p className="text-sky-100 text-sm">
                Pilih penyedia pengiriman WhatsApp. Aktif saat ini:{' '}
                <strong>{providers.find((p) => p.id === activeId)?.label || 'belum ada'}</strong>.
              </p>
            </div>
          </div>
          <a href={provider.docs_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-white text-sky-900 rounded-lg font-bold hover:bg-sky-50 transition-colors shadow-lg text-sm">
            Dokumentasi {provider.label} <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {providers.map((p) => {
          const selected = p.id === provider.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p.id)}
              className={`text-left rounded-xl border p-4 transition-all bg-white ${selected ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-md' : 'border-gray-100 hover:border-gray-300 shadow-sm'}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-sm text-text-dark">{p.label}</span>
                {p.id === activeId && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700">Aktif</span>}
              </div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${p.official ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}`}>
                {p.official ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                {p.official ? 'WA Resmi' : 'Tidak resmi'}
              </span>
              <p className="text-[10px] text-gray-500 mt-2">{p.is_configured ? 'Sudah dikonfigurasi' : 'Belum dikonfigurasi'}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Save size={16} />
                </div>
                <h2 className="text-base font-bold text-text-dark">Konfigurasi {provider.label}</h2>
              </div>
              <p className="text-[11px] text-gray-500 mb-5">{provider.description}</p>

              <div className="space-y-4">
                {visibleFields.map(renderField)}

                <div>
                  <label htmlFor="wa-test-target" className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nomor Tes {needsTestTarget ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(opsional)</span>}
                  </label>
                  <input
                    id="wa-test-target"
                    type="text"
                    value={testTarget}
                    onChange={(e) => { setTestTarget(e.target.value); setTestResult(null); }}
                    placeholder="08123456789"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-xs"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {needsTestTarget
                      ? `${provider.label} diuji dengan mengirim pesan nyata ke nomor ini.`
                      : 'Bila diisi, pesan tes ikut dikirim ke nomor ini setelah kredensial terverifikasi.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending || missingRequired}
                    className="flex-1 py-2.5 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-primary/20 flex items-center justify-center gap-1.5 text-sm"
                  >
                    {saveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Simpan &amp; Aktifkan
                  </button>

                  <button
                    onClick={handleTest}
                    disabled={testMutation.isPending || missingRequired}
                    className="px-5 py-2.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg font-bold hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 text-sm"
                  >
                    {testMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <TestTube size={16} />}
                    Tes Koneksi
                  </button>
                </div>

                {testResult && (
                  <div className={`flex items-start gap-2 p-3 rounded-lg border ${testResult.ok ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    {testResult.ok ? <CheckCircle className="shrink-0" size={18} /> : <XCircle className="shrink-0" size={18} />}
                    <div>
                      <p className="font-bold text-xs">{testResult.ok ? 'Koneksi Berhasil' : 'Koneksi Gagal'}</p>
                      <p className="text-[10px] opacity-90 break-words">{testResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-text-dark flex items-center gap-1.5">
                <BookOpen size={16} className="text-gray-400" />
                Panduan {provider.label}
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <ol className="relative border-l border-gray-200 ml-1.5 space-y-3">
                {provider.steps.map((step, idx) => (
                  <li key={idx} className="ml-3">
                    <div className="absolute -left-1 mt-1 h-2 w-2 rounded-full border border-white bg-gray-200"></div>
                    <span className="text-[10px] text-gray-600 block leading-tight">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                {provider.official ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 flex gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-blue-800 text-[10px] leading-relaxed">
                      <strong>Template pesan.</strong> WhatsApp resmi hanya mengizinkan pesan pertama ke pengguna lewat template yang disetujui. Buat satu template kategori <em>Utility</em> dengan satu variabel; seluruh isi notifikasi (dari menu Template Notifikasi) dimasukkan ke variabel itu. Contoh isi template:
                      <code className="block mt-1 p-1.5 bg-white/70 rounded font-mono">{TEMPLATE_EXAMPLE}</code>
                      <span className="block mt-1">Variabel tidak boleh berada di awal atau akhir teks template. Baris baru pada notifikasi diganti tanda &quot; | &quot;.</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2.5 flex gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-yellow-800 text-[10px] leading-relaxed">
                      <strong>Tidak resmi:</strong> Fonnte memakai nomor WhatsApp biasa. Nomor bisa diblokir WhatsApp dan layanan tidak dijamin. Untuk penggunaan jangka panjang, pilih provider WA Resmi.
                    </p>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2.5 flex gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-yellow-800 text-[10px] leading-relaxed">
                    <strong>Penting:</strong> Jangan bagikan token/API key kepada siapa pun. Menyimpan akan menjadikan {provider.label} sebagai provider aktif; isian provider lain tetap tersimpan.
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

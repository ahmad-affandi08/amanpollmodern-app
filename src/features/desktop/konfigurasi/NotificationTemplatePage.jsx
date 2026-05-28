import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, RefreshCw, MessageSquare, Wrench, Package, ListChecks, BellRing } from 'lucide-react';
import KonfigurasiApi from '../../../api/KonfigurasiApi';
import Button from '../../../components/Button';
import { useToast } from '../../../components/Alert/useToast';
import Modal from '../../../components/Modal';
import amanpollLogo from '../../../assets/img/icon-logo-3d-amanpoll.png';

export default function NotificationTemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Aduan');
  const { showToast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await KonfigurasiApi.getNotificationTemplates();
      setTemplates(response.data?.data || []);
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat template notifikasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setEditContent(template.konten_pesan);
    setEditIsActive(template.is_active !== undefined ? template.is_active : true);
  };

  const handleSave = async () => {
    if (!editContent.trim()) {
      showToast('Konten pesan tidak boleh kosong', 'warning');
      return;
    }

    setSaving(true);
    try {
      await KonfigurasiApi.updateNotificationTemplate(selectedTemplate.kode_template, {
        konten_pesan: editContent,
        is_active: editIsActive
      });
      showToast('Template berhasil diperbarui', 'success');
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error(error);
      showToast('Gagal memperbarui template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-editor');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = editContent.substring(0, start) + variable + editContent.substring(end);
      setEditContent(newText);
      // Optional: Set cursor position after inserted variable
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
        textarea.focus();
      }, 0);
    } else {
      setEditContent(prev => prev + ' ' + variable);
    }
  };

  // Group templates
  const groups = [
    { name: 'Aduan', icon: MessageSquare, prefix: 'aduan_' },
    { name: 'Pemeliharaan', icon: Wrench, prefix: 'pemeliharaan_' },
    { name: 'Inventaris & Kalibrasi', icon: Package, prefixes: ['inventaris_', 'location_', 'alat_', 'calibration_'] },
    { name: 'Disposisi', icon: ListChecks, prefix: 'disposisi_' },
    { name: 'Lainnya', icon: BellRing, prefix: 'lainnya' }, // Fallback
  ];

  const getFilteredTemplates = () => {
    const group = groups.find(g => g.name === activeTab);
    return templates.filter(t => {
      if (group.name === 'Lainnya') {
        return !groups.some(g => g.name !== 'Lainnya' &&
          (g.prefix ? t.kode_template.startsWith(g.prefix) : g.prefixes.some(p => t.kode_template.startsWith(p)))
        );
      }
      if (group.prefixes) {
        return group.prefixes.some(p => t.kode_template.startsWith(p));
      }
      return t.kode_template.startsWith(group.prefix);
    });
  };

  const generatePreviewText = (text, availableVars) => {
    let preview = text;
    // Replace known variables with sample data for preview
    const sampleData = {
      '[nama_alat]': 'Patient Monitor',
      '[no_inventaris]': 'INV/2024/001',
      '[nama_ruangan]': 'IGD',
      '[no_aduan]': 'ADU-2410-001',
      '[keluhan]': 'Layar mati total saat dihidupkan',
      '[tanggal_aduan]': '10/10/2024',
      '[nama_teknisi]': 'Budi Santoso',
      '[nama_pimpinan]': 'Dr. Andi',
      '[tanggal_pemeliharaan]': '15/10/2024',
      '[kondisi]': 'RUSAK BERAT',
      '[link_laporan]': 'https://app.com/laporan',
      '[link_disposisi]': 'https://app.com/disposisi',
      '[nama_divisi]': 'Elektromedik',
      '[ruangan_lama]': 'Poli Umum',
      '[ruangan_baru]': 'Poli Anak',
      '[tanggal_kadaluwarsa]': '01/12/2024',
      '[catatan]': 'Tolong segera dicek ya',
      '[isi_disposisi]': 'Segera perbaiki dan koordinasikan dengan vendor',
      '[nama_lengkap]': 'Ahmad Affandi',
      '[password_baru]': 'Aman1234'
    };

    if (availableVars) {
      const vars = JSON.parse(availableVars);
      vars.forEach(v => {
        const replacement = sampleData[v] || '...';
        // Global replace
        preview = preview.split(v).join(`*${replacement}*`);
      });
    }
    return preview;
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 flex flex-col min-h-[80vh]">
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 rounded-t-2xl">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare size={24} className="text-brand-primary hidden sm:block" />
            Pengaturan Teks Pesan Notifikasi
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Pilih kategori, lalu klik tombol Edit untuk mengubah isi pesan otomatis.
          </p>
        </div>
        <Button variant="outline" onClick={fetchTemplates} className="flex items-center gap-2 bg-white w-full sm:w-auto justify-center">
          <RefreshCw size={16} /> Segarkan Data
        </Button>
      </div>

      <div className="flex flex-1 flex-col md:flex-row min-h-0">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/30 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0 hide-scrollbar">
          <div className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">Kategori Pesan</div>
          {groups.map(group => {
            const Icon = group.icon;
            const isActive = activeTab === group.name;
            return (
              <button
                key={group.name}
                onClick={() => setActiveTab(group.name)}
                className={`flex md:w-full items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all duration-200 text-left shrink-0 md:shrink whitespace-nowrap md:whitespace-normal border ${
                  isActive
                  ? 'bg-brand-primary text-white font-bold border-brand-primary'
                  : 'text-gray-600 bg-white md:bg-transparent hover:bg-white border-gray-200 md:border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span>{group.name}</span>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getFilteredTemplates().map((template) => (
              <div
                key={template.kode_template}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-brand-primary transition-all flex flex-col group relative"
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base mb-1">{template.nama_template}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                        {template.kode_template}
                      </span>
                      {template.is_active ? (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-md border border-green-200">Aktif</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-md border border-red-200">Nonaktif</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEdit(template)} 
                    className="shrink-0 text-brand-primary bg-indigo-50 hover:bg-brand-primary hover:text-white border border-indigo-100 transition-colors text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    Edit Pesan
                  </button>
                </div>

                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl flex-1 border border-gray-100 whitespace-pre-wrap leading-relaxed">
                  {template.konten_pesan}
                </div>
              </div>
            ))}

            {getFilteredTemplates().length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                Belum ada template di kategori ini.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title={`Ubah Teks: ${selectedTemplate?.nama_template}`}
        size="4xl"
      >
        {selectedTemplate && (
          <div className="flex flex-col lg:flex-row gap-6 max-h-[80vh] lg:h-[65vh] lg:min-h-[500px] overflow-y-auto lg:overflow-hidden p-1">
            {/* Editor Side */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-0 lg:pr-2 hide-scrollbar">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-3 text-sm text-blue-800">
                <AlertCircle size={20} className="shrink-0 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <span className="font-bold block mb-1">Cara Menggunakan Variabel:</span>
                  Klik tombol-tombol variabel di bawah ini untuk menyisipkannya otomatis ke dalam kotak teks. Saat pesan dikirim, teks di dalam tanda kurung kotak `[...]` akan diganti dengan data aslinya.
                </div>
              </div>

              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                {selectedTemplate.variabel_tersedia && JSON.parse(selectedTemplate.variabel_tersedia).map(v => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:border-brand-primary hover:text-brand-primary rounded-lg text-xs font-bold font-mono transition-all active:scale-95"
                    type="button"
                    title={`Sisipkan ${v} ke dalam teks`}
                  >
                    + {v}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex flex-col min-h-[300px]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-2">
                  <label className="block text-sm font-bold text-gray-700">Kotak Teks Pesan</label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors w-fit">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-brand-primary rounded border-gray-300 focus:ring-brand-primary"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                    />
                    <span className="text-sm font-semibold text-gray-700 select-none">Notifikasi Aktif</span>
                  </label>
                </div>
                <textarea
                  id="template-editor"
                  className="w-full flex-1 border border-gray-300 rounded-xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none bg-gray-50 focus:bg-white transition-colors"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Ketik pesan Anda di sini..."
                />
              </div>
            </div>

            {/* Preview Side (WhatsApp Style) */}
            <div className="w-full lg:w-[350px] flex flex-col min-h-[450px] shrink-0 pb-4 lg:pb-0">
              <label className="block text-sm font-bold text-gray-700 mb-2">Preview (Simulasi Pesan WA)</label>
              <div className="flex-1 border border-gray-200 rounded-2xl overflow-hidden flex flex-col bg-[#efeae2] relative">
                {/* WA Header */}
                <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 z-10">
                  <div className="w-8 h-8 rounded-full flex justify-center items-center overflow-hidden shadow-sm">
                    <img src={amanpollLogo} className="w-full h-full object-cover" alt="AmanPoll" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">AmanPoll</div>
                    <div className="text-[10px] text-white/80">Online</div>
                  </div>
                </div>

                {/* WA Background Pattern */}
                <div className="absolute inset-0 opacity-[0.06] z-0 pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-solid-color-thumbnail.jpg")', backgroundSize: 'cover' }}></div>

                {/* Chat Area */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end z-10">
                  <div className="bg-white rounded-xl rounded-tl-sm p-3 max-w-[90%] relative">
                    <div className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                      {generatePreviewText(editContent, selectedTemplate.variabel_tersedia)}
                    </div>
                    <div className="text-[10px] text-gray-400 text-right mt-1">10:45 AM</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => setSelectedTemplate(null)}>Batal</Button>
                <Button onClick={handleSave} loading={saving} className="flex items-center gap-2">
                  <Save size={16} /> Simpan Perubahan
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Shield, Settings, Server, AlertTriangle, CheckCircle, Power, Lock, Zap, ArrowRight, Activity } from 'lucide-react';
import { useSystemStatus, useToggleMaintenance } from '../../../hooks/useSystem';
import { useToast } from '../../../components/Alert/useToast';
import usePageTitle from '../../../hooks/utils/usePageTitle';

const KonfigurasiSistem = () => {
  usePageTitle('Konfigurasi Sistem');
  const { showToast } = useToast();

  const { data: statusData, isLoading } = useSystemStatus();
  const toggleMutation = useToggleMaintenance();

  const [secret, setSecret] = useState('');
  const isMaintenanceMode = statusData?.maintenance_mode;

  const handleToggle = async (enable) => {
    try {
      const result = await toggleMutation.mutateAsync({ enable, secret });
      showToast(result.message, 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah status maintenance', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1c2e] to-[#2d2f45] p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-primary/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-accent-orange/20 blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 tracking-tight">System Configuration</h1>
            <p className="text-white/60 text-sm">Kontrol penuh atas status dan aksesibilitas sistem aplikasi.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <Activity className={isMaintenanceMode ? "text-red-400 animate-pulse" : "text-green-400"} size={16} />
            <span className="font-semibold tracking-wide text-xs">
              SYSTEM STATUS: <span className={isMaintenanceMode ? "text-red-400" : "text-green-400"}>{isLoading ? 'CHECKING...' : (isMaintenanceMode ? 'MAINTENANCE' : 'ONLINE')}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-transform duration-500 ${isMaintenanceMode ? 'bg-red-500 text-white rotate-12' : 'bg-green-500 text-white'}`}>
                    <Power size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-dark">Maintenance Mode</h2>
                    <p className="text-gray-500 text-xs mt-0.5">Control Access Control</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isMaintenanceMode ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {isMaintenanceMode ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="mb-6">
                <div className={`p-4 rounded-xl border transition-all duration-300 ${isMaintenanceMode ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                  <h3 className={`font-bold text-sm mb-1.5 ${isMaintenanceMode ? 'text-red-800' : 'text-green-800'}`}>
                    {isMaintenanceMode ? '🔒 Sistem Terkunci' : '✅ Sistem Berjalan Normal'}
                  </h3>
                  <p className={`leading-relaxed text-xs ${isMaintenanceMode ? 'text-red-600' : 'text-green-600'}`}>
                    {isMaintenanceMode
                      ? 'Saat ini sistem sedang dalam perbaikan. Akses publik ditutup sementara. Gunakan token rahasia untuk akses bypass.'
                      : 'Seluruh fitur aplikasi dapat diakses oleh semua pengguna. Pastikan untuk memberitahu pengguna sebelum mengaktifkan mode maintenance.'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-6 relative group focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Bypass Secret Token
                </label>
                <div className="flex items-center gap-2">
                  <Lock className="text-gray-300 group-focus-within:text-brand-primary transition-colors" size={16} />
                  <input
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="e.g., supersecret123"
                    className="flex-1 bg-transparent border-none outline-none text-text-dark font-medium placeholder:text-gray-300 font-mono text-sm"
                  />
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                </div>
              </div>

              <button
                onClick={() => handleToggle(!isMaintenanceMode)}
                disabled={toggleMutation.isPending}
                className={`w-full py-3 rounded-lg font-bold text-sm text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2
                  ${isMaintenanceMode
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30'
                  }`}
              >
                {toggleMutation.isPending ? (
                  <Zap className="animate-spin" size={18} />
                ) : (
                  isMaintenanceMode ? <ArrowRight size={18} /> : <Power size={18} />
                )}
                {isMaintenanceMode ? 'Matikan Maintenance (Go Live)' : 'Aktifkan Mode Maintenance'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
            <h3 className="font-bold text-base text-text-dark mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Shield size={16} />
              </span>
              Security Guidelines
            </h3>

            <div className="space-y-6 relative">
              <div className="absolute left-[13px] top-2 bottom-0 w-0.5 bg-gray-100"></div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full border-4 border-white bg-blue-500 shadow-md z-10"></div>
                <h4 className="font-bold text-text-dark mb-0.5 text-sm">Persiapan</h4>
                <p className="text-gray-500 text-xs leading-relaxed">Pastikan semua pekerjaan tersimpan. Beritahu tim bahwa sistem akan down untuk sementara.</p>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full border-4 border-white bg-brand-primary shadow-md z-10"></div>
                <h4 className="font-bold text-text-dark mb-0.5 text-sm">Aktivasi</h4>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Isi <strong>Secret Token</strong> jika Anda butuh akses saat down. Klik tombol aktivasi.
                </p>
                <div className="mt-2 bg-gray-50 rounded-lg p-2 text-[10px] font-mono text-gray-600 border border-gray-200">
                  {window.location.origin}/bypass/[secret-token]
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full border-4 border-white bg-gray-300 shadow-md z-10"></div>
                <h4 className="font-bold text-text-dark mb-0.5 text-sm">Pemulihan</h4>
                <p className="text-gray-500 text-xs leading-relaxed">Setelah selesai, matikan mode maintenance agar pengguna dapat mengakses aplikasi kembali.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KonfigurasiSistem;

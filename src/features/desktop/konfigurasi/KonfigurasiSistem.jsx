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
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1c2e] to-[#2d2f45] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-primary/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-accent-orange/20 blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">System Configuration</h1>
            <p className="text-white/60 text-lg">Kontrol penuh atas status dan aksesibilitas sistem aplikasi.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <Activity className={isMaintenanceMode ? "text-red-400 animate-pulse" : "text-green-400"} />
            <span className="font-semibold tracking-wide">
              SYSTEM STATUS: <span className={isMaintenanceMode ? "text-red-400" : "text-green-400"}>{isLoading ? 'CHECKING...' : (isMaintenanceMode ? 'MAINTENANCE' : 'ONLINE')}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Control Panel */}
        <div className="lg:col-span-7 space-y-8">
          {/* Status Card */}
          <div className="bg-white rounded-3xl p-1 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-[20px] p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 ${isMaintenanceMode ? 'bg-red-500 text-white rotate-12' : 'bg-green-500 text-white'}`}>
                    <Power size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-dark">Maintenance Mode</h2>
                    <p className="text-gray-500 text-sm mt-0.5">Control Access Control</p>
                  </div>
                </div>
                {/* Status Badge */}
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isMaintenanceMode ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {isMaintenanceMode ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="mb-8">
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${isMaintenanceMode ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${isMaintenanceMode ? 'text-red-800' : 'text-green-800'}`}>
                    {isMaintenanceMode ? '🔒 Sistem Terkunci' : '✅ Sistem Berjalan Normal'}
                  </h3>
                  <p className={`leading-relaxed ${isMaintenanceMode ? 'text-red-600' : 'text-green-600'}`}>
                    {isMaintenanceMode
                      ? 'Saat ini sistem sedang dalam perbaikan. Akses publik ditutup sementara. Gunakan token rahasia untuk akses bypass.'
                      : 'Seluruh fitur aplikasi dapat diakses oleh semua pengguna. Pastikan untuk memberitahu pengguna sebelum mengaktifkan mode maintenance.'}
                  </p>
                </div>
              </div>

              {/* Secret Token Input - Only show when enabling or active */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8 relative group focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Bypass Secret Token
                </label>
                <div className="flex items-center gap-3">
                  <Lock className="text-gray-300 group-focus-within:text-brand-primary transition-colors" size={20} />
                  <input
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="e.g., supersecret123"
                    className="flex-1 bg-transparent border-none outline-none text-text-dark font-medium placeholder:text-gray-300 font-mono"
                  />
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Optional</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleToggle(!isMaintenanceMode)}
                disabled={toggleMutation.isPending}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3
                  ${isMaintenanceMode
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30'
                  }`}
              >
                {toggleMutation.isPending ? (
                  <Zap className="animate-spin" />
                ) : (
                  isMaintenanceMode ? <ArrowRight /> : <Power />
                )}
                {isMaintenanceMode ? 'Matikan Maintenance (Go Live)' : 'Aktifkan Mode Maintenance'}
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-full">
            <h3 className="font-bold text-xl text-text-dark mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Shield size={18} />
              </span>
              Security Guidelines
            </h3>

            <div className="space-y-8 relative">
              {/* Timeline Line */}
              <div className="absolute left-[15px] top-2 bottom-0 w-0.5 bg-gray-100"></div>

              {/* Step 1 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white bg-blue-500 shadow-md z-10"></div>
                <h4 className="font-bold text-text-dark mb-1">Persiapan</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Pastikan semua pekerjaan tersimpan. Beritahu tim bahwa sistem akan down untuk sementara.</p>
              </div>

              {/* Step 2 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white bg-brand-primary shadow-md z-10"></div>
                <h4 className="font-bold text-text-dark mb-1">Aktivasi</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Isi <strong>Secret Token</strong> jika Anda butuh akses saat down. Klik tombol aktivasi.
                </p>
                <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 border border-gray-200">
                  {window.location.origin}/bypass/[secret-token]
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white bg-gray-300 shadow-md z-10"></div>
                <h4 className="font-bold text-text-dark mb-1">Pemulihan</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Setelah selesai, matikan mode maintenance agar pengguna dapat mengakses aplikasi kembali.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KonfigurasiSistem;

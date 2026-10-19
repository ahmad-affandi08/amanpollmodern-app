import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import useAuth from '../hooks/utils/useAuth';
import { getRoleId, isMobileRole } from '../features/auth/constants';
import { isStandalone } from './usePwaInstall';

const CHECK_INTERVAL_MS = 60 * 60 * 1000;
let watching = false;

function Registration() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration || watching) return;
      watching = true;

      // Aplikasi terpasang bisa terbuka berhari-hari: cek versi baru berkala dan saat dibuka kembali.
      const check = () => registration.update().catch(() => {});
      setInterval(check, CHECK_INTERVAL_MS);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="alert"
      className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white border border-brand-primary/20 shadow-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-primary-soft text-brand-primary flex items-center justify-center shrink-0">
          <RefreshCw size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-text-dark">Versi baru AmanPoll tersedia</p>
          <p className="text-xs text-text-gray mt-0.5">
            Muat ulang untuk memakai pembaruan. Simpan dulu data yang sedang Anda isi.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold active:scale-95 transition-transform"
            >
              Nanti
            </button>
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="flex-1 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold active:scale-95 transition-transform"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Service worker hanya didaftarkan untuk peran mobile (User Ruangan, Teknisi) atau bila
 * aplikasi sudah dibuka dari layar utama. Pengguna desktop tidak terpengaruh sama sekali.
 */
export default function PwaUpdatePrompt() {
  const { user } = useAuth();
  const killed = import.meta.env.VITE_PWA_KILL === 'true';
  const enabled = !killed && (isMobileRole(getRoleId(user)) || isStandalone());

  return enabled ? <Registration /> : null;
}

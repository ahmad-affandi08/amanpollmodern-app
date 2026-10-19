import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import usePwaInstall from './usePwaInstall';
import IosInstallGuide from './IosInstallGuide';
import iconLogo from '../assets/img/icon-logo-3d-amanpoll.png';

const DISMISS_KEY = 'pwa_install_dismissed_at';
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

const dismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < SNOOZE_MS;
  } catch {
    return false;
  }
};

const rememberDismiss = () => {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // penyimpanan diblokir: banner akan tampil lagi pada kunjungan berikutnya
  }
};

/** Ajakan memasang aplikasi di beranda mobile. Hilang setelah terpasang atau ditunda 14 hari. */
export default function InstallBanner() {
  const { canPrompt, needsIosGuide, promptInstall } = usePwaInstall();
  const [hidden, setHidden] = useState(dismissedRecently);
  const [guideOpen, setGuideOpen] = useState(false);

  if (hidden || (!canPrompt && !needsIosGuide)) return null;

  const dismiss = () => {
    rememberDismiss();
    setHidden(true);
  };

  const handleInstall = async () => {
    if (canPrompt) {
      const outcome = await promptInstall();
      if (outcome === 'dismissed') dismiss();
      return;
    }
    setGuideOpen(true);
  };

  return (
    <>
      <div className="relative flex items-center gap-3 bg-white rounded-[20px] p-3.5 shadow-sm border border-brand-primary/15">
        <img src={iconLogo} alt="" className="w-11 h-11 object-contain shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-dark leading-tight">Pasang AmanPoll di HP Anda</p>
          <p className="text-xs text-text-gray mt-0.5">Buka lebih cepat dari layar utama, seperti aplikasi biasa.</p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold active:scale-95 transition-transform"
        >
          <Download size={14} />
          {canPrompt ? 'Pasang' : 'Caranya'}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center shadow-sm"
        >
          <X size={12} />
        </button>
      </div>
      <IosInstallGuide isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}

import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot, promptInstall } from './installStore';

/** Aplikasi sedang dibuka dari ikon layar utama (bukan tab browser). */
export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches === true ||
  window.navigator.standalone === true;

/** iPhone/iPad: tidak ada dialog pasang otomatis, pengguna harus lewat menu Bagikan. */
export const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

export default function usePwaInstall() {
  const { deferredPrompt, installed } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const standalone = installed || isStandalone();

  return {
    standalone,
    /** Browser siap menampilkan dialog pasang. */
    canPrompt: Boolean(deferredPrompt) && !standalone,
    /** Perlu panduan manual (iOS). */
    needsIosGuide: isIos() && !standalone,
    promptInstall,
  };
}

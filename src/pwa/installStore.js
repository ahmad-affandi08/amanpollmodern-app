/**
 * Penyimpan kecil untuk event `beforeinstallprompt` (Chrome/Edge/Android).
 * Event ini hanya dikirim sekali dan bisa terjadi sebelum komponen React tampil,
 * jadi pendengarnya dipasang sejak awal di main.jsx (initInstallPrompt).
 */
let state = { deferredPrompt: null, installed: false };
const listeners = new Set();

const setState = (next) => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
};

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getSnapshot = () => state;

export function initInstallPrompt() {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (event) => {
    // Tahan mini-infobar bawaan browser; tombol pasang kita tampilkan sendiri.
    event.preventDefault();
    setState({ deferredPrompt: event });
  });

  window.addEventListener('appinstalled', () => {
    setState({ deferredPrompt: null, installed: true });
  });
}

/** Tampilkan dialog pasang bawaan browser. Mengembalikan 'accepted' | 'dismissed' | null. */
export async function promptInstall() {
  const { deferredPrompt } = state;
  if (!deferredPrompt) return null;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  // Event hanya bisa dipakai sekali.
  setState({ deferredPrompt: null });
  return outcome;
}

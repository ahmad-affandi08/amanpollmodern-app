import { useEffect, useRef } from 'react';

let lockCount = 0;
let previousOverflow = '';

/**
 * Kunci scroll halaman selama overlay (modal, preview, dialog) terbuka.
 * Dihitung dengan counter: overlay bertumpuk tidak saling membuka kunci,
 * scroll baru kembali setelah overlay TERAKHIR ditutup.
 */
export const useBodyScrollLock = (active) => {
  useEffect(() => {
    if (!active) return undefined;

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [active]);
};

const escapeStack = [];

/**
 * Panggil `onClose` saat tombol Escape ditekan, hanya untuk overlay yang paling atas
 * (menekan Escape tidak lagi menutup semua modal yang bertumpuk sekaligus).
 */
export const useEscapeKey = (active, onClose) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return undefined;

    const token = Symbol('overlay');
    escapeStack.push(token);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && escapeStack[escapeStack.length - 1] === token) {
        onCloseRef.current?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      const index = escapeStack.indexOf(token);
      if (index !== -1) escapeStack.splice(index, 1);
    };
  }, [active]);
};

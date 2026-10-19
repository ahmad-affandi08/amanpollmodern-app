import { useState, useCallback, useMemo } from 'react';

/**
 * State untuk satu ConfirmDialog pada halaman master (hapus / ubah status).
 *
 * Pemakaian:
 *   const { confirm, dialogProps } = useConfirmAction();
 *   confirm({ title, message, confirmText, type, onConfirm: async () => { ... } });
 *   <ConfirmDialog {...dialogProps} />
 *
 * Dialog baru ditutup SETELAH onConfirm selesai (ConfirmDialog mengunci tombolnya
 * selama onConfirm berjalan), jadi klik ganda tidak mengirim permintaan dua kali.
 */
export default function useConfirmAction() {
  const [options, setOptions] = useState(null);

  const confirm = useCallback((next) => setOptions(next), []);
  const close = useCallback(() => setOptions(null), []);

  const dialogProps = useMemo(() => ({
    isOpen: Boolean(options),
    title: options?.title,
    message: options?.message,
    confirmText: options?.confirmText,
    type: options?.type || 'danger',
    onConfirm: async () => {
      try {
        await options?.onConfirm?.();
      } finally {
        setOptions(null);
      }
    },
    onCancel: close,
  }), [options, close]);

  return { confirm, close, dialogProps };
}

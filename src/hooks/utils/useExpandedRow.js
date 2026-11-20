import { useRef, useState } from 'react';

/** Lama animasi tutup panel baris (ms): sama dengan transisi `duration-300` di komponen panel detail. */
const CLOSE_MS = 300;

/**
 * Baris tabel yang bisa dibuka satu per satu. Hanya satu baris terbuka pada satu waktu agar tabel tidak
 * memanjang. Menutup menjalankan animasi (`closing`) dulu, baru panelnya dilepas.
 */
export default function useExpandedRow() {
  const [expandedId, setExpandedId] = useState(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);

  const toggleRow = (id) => {
    clearTimeout(closeTimer.current);
    if (expandedId === id && !closing) {
      setClosing(true);
      closeTimer.current = setTimeout(() => { setExpandedId(null); setClosing(false); }, CLOSE_MS);
    } else {
      setClosing(false);
      setExpandedId(id);
    }
  };

  return { expandedId, closing, toggleRow };
}

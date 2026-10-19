import React from 'react';
import { WifiOff } from 'lucide-react';
import useOnlineStatus from './useOnlineStatus';

/** Penanda saat perangkat kehilangan sinyal; data tidak disimpan offline, jadi pengguna perlu tahu. */
export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] w-[calc(100%-2rem)] max-w-md flex items-start gap-3 rounded-2xl bg-[#11142D] text-white px-4 py-3 shadow-2xl"
    >
      <WifiOff size={18} className="mt-0.5 shrink-0 text-amber-400" />
      <p className="text-xs leading-relaxed">
        <span className="font-bold block text-sm">Tidak ada koneksi internet</span>
        Data tidak dapat dimuat atau dikirim sampai sinyal kembali. Halaman yang sudah terbuka tetap bisa dilihat.
      </p>
    </div>
  );
}

import React from 'react';
import EmptyStateArt from './EmptyStateArt';

/**
 * Tampilan data kosong / hasil tidak ditemukan / gagal memuat, dengan ilustrasi SVG.
 *
 * @param {'kosong'|'cari'|'pilih'|'galat'} variant  kosong = belum ada data, cari = tidak ada hasil pencarian/filter,
 *                                                   pilih = menunggu pilihan pengguna, galat = gagal memuat
 * @param {string}    title
 * @param {string}    description
 * @param {ReactNode} action   mis. tombol "Coba lagi"
 * @param {boolean}   compact  ilustrasi lebih kecil (di dalam tabel atau kartu)
 */
export default function EmptyState({ variant = 'kosong', title, description, action, compact = false, className = '' }) {
  return (
    <div
      role={variant === 'galat' ? 'alert' : 'status'}
      className={`flex flex-col items-center text-center ${compact ? 'py-6' : 'py-12'} ${className}`}
    >
      <EmptyStateArt variant={variant} className={compact ? 'w-24 h-24' : 'w-36 h-36'} />
      <p className="mt-3 text-sm font-bold text-text-dark">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

import React from 'react';
import { Download } from 'lucide-react';

/**
 * Tombol Export PDF yang sama di semua halaman. Beri `href` untuk tautan, atau `onClick` untuk aksi.
 * variant 'solid' untuk aksi utama di layar mobile, 'outline' (bawaan) di desktop.
 */
export default function ExportButton({ href, onClick, variant = 'outline', full = false, children = 'Export PDF' }) {
  const warna =
    variant === 'solid'
      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90'
      : 'bg-white text-brand-primary border-[1.5px] border-brand-primary hover:bg-brand-primary/10';
  const className = `inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors ${full ? 'w-full h-12' : 'h-10 px-4'} ${warna}`;
  const isi = (
    <>
      <Download size={16} />
      {children}
    </>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{isi}</a>
  ) : (
    <button type="button" onClick={onClick} className={className}>{isi}</button>
  );
}

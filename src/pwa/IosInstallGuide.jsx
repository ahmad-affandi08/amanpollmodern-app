import React from 'react';
import { Share, SquarePlus } from 'lucide-react';
import Modal from '../components/Modal';

/** Panduan manual: iPhone/iPad tidak punya tombol pasang otomatis. */
export default function IosInstallGuide({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pasang di iPhone / iPad" size="sm">
      <div className="px-6 py-5 space-y-4 text-sm text-text-dark">
        <p className="text-text-gray text-xs">Gunakan browser Safari, lalu ikuti langkah berikut:</p>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-brand-primary-soft text-brand-primary font-bold flex items-center justify-center shrink-0">1</span>
            <span>Ketuk tombol <b>Bagikan</b> <Share size={14} className="inline -mt-1" /> di bagian bawah layar.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-brand-primary-soft text-brand-primary font-bold flex items-center justify-center shrink-0">2</span>
            <span>Pilih <b>Tambah ke Layar Utama</b> <SquarePlus size={14} className="inline -mt-1" /></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-brand-primary-soft text-brand-primary font-bold flex items-center justify-center shrink-0">3</span>
            <span>Ketuk <b>Tambah</b>. Ikon AmanPoll akan muncul di layar utama.</span>
          </li>
        </ol>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
        >
          Mengerti
        </button>
      </div>
    </Modal>
  );
}

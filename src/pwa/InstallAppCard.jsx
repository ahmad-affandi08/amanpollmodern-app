import React, { useState } from 'react';
import { Smartphone, CheckCircle2 } from 'lucide-react';
import usePwaInstall from './usePwaInstall';
import IosInstallGuide from './IosInstallGuide';

/** Kartu di halaman Profil: tempat tetap untuk memasang aplikasi (banner di beranda bisa ditutup). */
export default function InstallAppCard() {
  const { standalone, canPrompt, needsIosGuide, promptInstall } = usePwaInstall();
  const [guideOpen, setGuideOpen] = useState(false);

  if (standalone) {
    return (
      <div className="flex items-center gap-3 bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
        <CheckCircle2 size={20} className="text-success-600 shrink-0" />
        <p className="text-sm font-semibold text-text-dark">Aplikasi sudah terpasang di perangkat ini</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-primary-soft text-brand-primary flex items-center justify-center shrink-0">
          <Smartphone size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-text-dark">Pasang Aplikasi</p>
          <p className="text-xs text-text-gray mt-0.5">
            Tambahkan AmanPoll ke layar utama agar terbuka lebih cepat tanpa mengetik alamat.
          </p>
        </div>
      </div>

      {canPrompt && (
        <button
          type="button"
          onClick={promptInstall}
          className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
        >
          Pasang Sekarang
        </button>
      )}
      {!canPrompt && needsIosGuide && (
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold active:scale-95 transition-transform"
        >
          Lihat Caranya
        </button>
      )}
      {!canPrompt && !needsIosGuide && (
        <p className="text-xs text-text-gray bg-gray-50 rounded-xl p-3">
          Buka menu browser (titik tiga di pojok kanan atas), lalu pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.
        </p>
      )}

      <IosInstallGuide isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}

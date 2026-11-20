import React, { useState } from 'react';
import { Check, ChevronDown, Copy, Info } from 'lucide-react';
import { useToast } from './Alert/useToast';
import {
  HURUF_KELOMPOK,
  dasarHitungan,
  formatRealisasi,
  kelompokkan,
  salinRealisasi,
} from '../utils/realisasiSki';

function Keterangan({ baris }) {
  return (
    <>
      <p className="mt-0.5 text-[11px] text-text-gray whitespace-normal">{baris.definisi}</p>
      {baris.catatan && (
        <p className="mt-1 flex items-start gap-1 text-[11px] text-amber-700 whitespace-normal">
          <Info size={12} className="mt-0.5 shrink-0" />
          {baris.catatan}
        </p>
      )}
    </>
  );
}

/**
 * Kartu satu indikator (layar sempit). Yang dicari pengguna adalah angkanya untuk disalin ke form IKI,
 * jadi angka dan tombol Salin di depan; definisi & catatan panjang dilipat supaya halaman tidak sepanjang tabel.
 */
function KartuIndikator({ baris, nomor, onSalin }) {
  const [tersalin, setTersalin] = useState(false);
  const kosong = baris.realisasi === null || baris.realisasi === undefined;
  const dasar = dasarHitungan(baris);

  const salin = async () => {
    if (await onSalin(baris)) {
      setTersalin(true);
      setTimeout(() => setTersalin(false), 1800);
    }
  };

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-md bg-brand-primary/10 px-1 text-[11px] font-bold text-brand-primary">
          {nomor}
        </span>
        <h3 className="flex-1 text-xs font-semibold leading-snug text-text-dark">{baris.nama}</h3>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold leading-none tabular-nums text-text-dark">{formatRealisasi(baris)}</span>
            {!kosong && <span className="text-[11px] font-semibold text-text-gray">{baris.satuan}</span>}
          </p>
          {dasar && <p className="mt-0.5 text-[11px] text-text-gray">{dasar}</p>}
        </div>
        <button
          type="button"
          onClick={salin}
          disabled={kosong}
          aria-label={`Salin realisasi ${baris.nama}`}
          className={`flex h-9 min-w-[84px] shrink-0 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${tersalin
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-brand-primary/30 text-brand-primary active:bg-brand-primary/10'}`}
        >
          {tersalin ? <Check size={14} /> : <Copy size={14} />}
          {tersalin ? 'Tersalin' : 'Salin'}
        </button>
      </div>

      {baris.satuan === '%' && !kosong && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
          <div className="h-full rounded-full bg-brand-primary" style={{ width: `${Math.min(100, Math.max(0, Number(baris.realisasi)))}%` }} />
        </div>
      )}

      <details className="group mt-2 border-t border-gray-100 pt-0.5">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-[11px] font-semibold text-brand-primary [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            Keterangan
            {baris.catatan && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Ada catatan</span>
            )}
          </span>
          <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="pb-0.5"><Keterangan baris={baris} /></div>
      </details>
    </article>
  );
}

/**
 * Daftar realisasi SKI sebagai kartu (halaman mobile teknisi). Versi lebar berformat form IKI ada di LembarSkiTable.
 */
export default function RealisasiSkiList({ indikator }) {
  const { showToast } = useToast();
  const kelompok = kelompokkan(indikator);

  const salin = async (baris) => {
    try {
      await salinRealisasi(baris);
      showToast(`Realisasi ${formatRealisasi(baris)} disalin`, 'success');
      return true;
    } catch {
      showToast('Gagal menyalin. Salin angkanya secara manual.', 'error');
      return false;
    }
  };

  return (
    <div className="space-y-4">
      {kelompok.map((grup) => (
        <section key={grup.nama}>
          <h2 className="mb-1.5 flex items-baseline justify-between text-[11px] font-bold text-text-dark uppercase tracking-wider">
            <span>{HURUF_KELOMPOK[grup.nama]}. {grup.nama}</span>
            <span className="font-medium normal-case tracking-normal text-text-gray">{grup.baris.length} indikator</span>
          </h2>
          <div className="space-y-2">
            {grup.baris.map((baris, i) => (
              <KartuIndikator key={baris.kode} nomor={i + 1} baris={baris} onSalin={salin} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

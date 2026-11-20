import React from 'react';

// Palet sama dengan ilustrasi menu/empty state: garis navy, aksen biru/kuning/merah (+ hijau untuk sukses).
const LINE = '#1F3C6E';
const BLOB = 'M20 70C12 42 32 20 62 16c30-4 54 14 56 42 2 28-18 46-48 48-26 2-46-8-50-36Z';

const Latar = ({ warna }) => (
  <>
    <path d={BLOB} fill={warna} className="pop" />
    <circle cx="104" cy="96" r="2.5" fill="#fff" />
    <circle cx="16" cy="100" r="2" fill="#fff" />
  </>
);

const Percik = ({ warna }) => (
  <>
    <circle cx="98" cy="26" r="3.5" fill={warna} className="twinkle d1" />
    <circle cx="20" cy="40" r="3" fill={warna} className="twinkle d2" />
    <circle cx="100" cy="88" r="2.5" fill={warna} className="twinkle d3" />
  </>
);

/** Sukses: lingkaran hijau, centang tergambar, percikan berkedip. */
const Sukses = () => (
  <>
    <Latar warna="#DFF5EA" />
    <circle cx="60" cy="60" r="30" fill="none" stroke="#2FB67C" strokeWidth="3" className="ring" />
    <circle cx="60" cy="60" r="30" fill="#2FB67C" stroke={LINE} strokeWidth="4" className="pop" />
    <path d="M46 61l10 10 19-21" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="draw" />
    <Percik warna="#FFC832" />
  </>
);

/** Gagal: lingkaran merah, silang tergambar, sedikit bergetar. */
const Gagal = () => (
  <>
    <Latar warna="#FDE7E8" />
    <circle cx="60" cy="60" r="30" fill="none" stroke="#E5484D" strokeWidth="3" className="ring" />
    <g className="shake">
      <circle cx="60" cy="60" r="30" fill="#E5484D" stroke={LINE} strokeWidth="4" />
      <path d="M49 49l22 22" stroke="#fff" strokeWidth="7" strokeLinecap="round" pathLength="1" className="draw" />
      <path d="M71 49 49 71" stroke="#fff" strokeWidth="7" strokeLinecap="round" pathLength="1" className="draw" style={{ animationDelay: '0.55s' }} />
    </g>
  </>
);

const SEGITIGA = 'M60 22 98 88a6 6 0 0 1-5 9H27a6 6 0 0 1-5-9Z';

/** Bahaya (hapus/aksi tak bisa dibatalkan): segitiga merah bergoyang, tanda seru memantul. */
const Bahaya = () => (
  <>
    <Latar warna="#FDE7E8" />
    <circle cx="60" cy="62" r="34" fill="none" stroke="#E5484D" strokeWidth="3" className="ring" />
    <g className="wobble">
      <path d={SEGITIGA} fill="#E5484D" stroke={LINE} strokeWidth="4" strokeLinejoin="round" />
      <g className="bounce">
        <path d="M60 47v21" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
        <circle cx="60" cy="80" r="4.2" fill="#fff" />
      </g>
    </g>
  </>
);

/** Peringatan: segitiga kuning, tanda seru navy memantul. */
const Peringatan = () => (
  <>
    <Latar warna="#FFF3D6" />
    <circle cx="60" cy="62" r="34" fill="none" stroke="#FFC832" strokeWidth="3" className="ring" />
    <g className="wobble">
      <path d={SEGITIGA} fill="#FFC832" stroke={LINE} strokeWidth="4" strokeLinejoin="round" />
      <g className="bounce">
        <path d="M60 47v21" stroke={LINE} strokeWidth="7" strokeLinecap="round" />
        <circle cx="60" cy="80" r="4.2" fill={LINE} />
      </g>
    </g>
  </>
);

/** Info: lingkaran biru dengan huruf i, titiknya memantul. */
const Info = () => (
  <>
    <Latar warna="#E3EDF4" />
    <circle cx="60" cy="60" r="30" fill="none" stroke="#3B7BD6" strokeWidth="3" className="ring" />
    <circle cx="60" cy="60" r="30" fill="#3B7BD6" stroke={LINE} strokeWidth="4" className="pop" />
    <circle cx="60" cy="47" r="4.5" fill="#fff" className="bounce" />
    <path d="M60 58v19" stroke="#fff" strokeWidth="7" strokeLinecap="round" pathLength="1" className="draw" />
    <Percik warna="#FFC832" />
  </>
);

const ART = { success: Sukses, error: Gagal, danger: Bahaya, warning: Peringatan, info: Info };

/**
 * Ilustrasi SVG beranimasi untuk dialog. `type`: success | error | danger | warning | info (lainnya = info).
 * Dekoratif (disembunyikan dari pembaca layar); judul dan pesan dialog yang menyampaikan artinya.
 */
export default function AlertArt({ type = 'info', className = '' }) {
  const Art = ART[type] || Info;

  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" focusable="false" className={`alert-art ${className}`}>
      <Art />
    </svg>
  );
}

import React from 'react';

// Gaya mengikuti ikon menu (gumpalan latar, bentuk datar bergaris navy, aksen biru/kuning/merah).
const LINE = '#1F3C6E';
const BLOB = 'M38 152C24 104 56 60 108 52c52-8 98 18 105 70 7 50-34 86-84 90-48 4-80-18-91-60Z';

const Latar = () => (
  <>
    <path d={BLOB} fill="#E3EDF4" />
    <circle cx="214" cy="170" r="3" fill="#fff" />
    <circle cx="30" cy="196" r="2.5" fill="#fff" />
    <circle cx="196" cy="62" r="2" fill="#fff" />
  </>
);

const Balon = ({ x, y, w = 56, h = 34, fill = '#FFC832', children }) => (
  <>
    <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} stroke={LINE} strokeWidth="4" />
    <path d={`M${x + w - 16} ${y + h - 1}l9 12-17-7Z`} fill={fill} stroke={LINE} strokeWidth="4" strokeLinejoin="round" />
    {children}
  </>
);

/** Data kosong: kotak terbuka tanpa isi. */
const Kosong = () => (
  <>
    <Latar />
    <path d="M62 112 84 84h62l22 28Z" fill="#8EC3F7" stroke={LINE} strokeWidth="5" strokeLinejoin="round" />
    <path d="M62 112 48 92l24-16 12 8Z" fill="#A9C2E6" stroke={LINE} strokeWidth="5" strokeLinejoin="round" />
    <path d="M168 112l14-20-24-16-12 8Z" fill="#A9C2E6" stroke={LINE} strokeWidth="5" strokeLinejoin="round" />
    <rect x="62" y="112" width="106" height="70" rx="7" fill="#3B7BD6" stroke={LINE} strokeWidth="5" />
    <rect x="100" y="112" width="30" height="16" fill="#FFC832" stroke={LINE} strokeWidth="4" />
    <Balon x={148} y={28}>
      <circle cx="165" cy="45" r="4" fill="#fff" />
      <circle cx="177" cy="45" r="4" fill="#fff" />
      <circle cx="189" cy="45" r="4" fill="#fff" />
    </Balon>
  </>
);

/** Tidak ada hasil pencarian/filter: kertas dan kaca pembesar. */
const Cari = () => (
  <>
    <Latar />
    <rect x="58" y="44" width="92" height="124" rx="9" fill="#fff" stroke={LINE} strokeWidth="5" />
    <rect x="72" y="64" width="50" height="8" rx="4" fill="#A9C2E6" />
    <rect x="72" y="84" width="64" height="8" rx="4" fill="#A9C2E6" />
    <rect x="72" y="104" width="40" height="8" rx="4" fill="#A9C2E6" />
    <path d="m162 158 26 26" stroke={LINE} strokeWidth="16" strokeLinecap="round" />
    <path d="m162 158 26 26" stroke="#FFC832" strokeWidth="7" strokeLinecap="round" />
    <circle cx="140" cy="134" r="30" fill="#DCEBFB" stroke={LINE} strokeWidth="5" />
    <path d="M126 124a18 18 0 0 1 14-8" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    <Balon x={16} y={64} fill="#E5484D">
      <path d="M38 77a6 6 0 1 1 8 5.5c-2 1-2.5 2-2.5 4.5" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="43.5" cy="92" r="2.6" fill="#fff" />
    </Balon>
  </>
);

/** Belum memilih sesuatu: kartu profil dengan kursor. */
const Pilih = () => (
  <>
    <Latar />
    <rect x="52" y="52" width="116" height="106" rx="10" fill="#fff" stroke={LINE} strokeWidth="5" />
    <circle cx="84" cy="92" r="17" fill="#8EC3F7" stroke={LINE} strokeWidth="4" />
    <circle cx="84" cy="87" r="6" fill="#fff" />
    <path d="M72 102a12 9 0 0 1 24 0Z" fill="#fff" />
    <rect x="110" y="84" width="44" height="8" rx="4" fill="#A9C2E6" />
    <rect x="110" y="100" width="30" height="8" rx="4" fill="#A9C2E6" />
    <rect x="66" y="128" width="88" height="8" rx="4" fill="#A9C2E6" />
    <rect x="66" y="142" width="58" height="8" rx="4" fill="#A9C2E6" />
    <path d="M148 120v54l13-12 10 22 11-5-10-21 17-1Z" fill="#FFC832" stroke={LINE} strokeWidth="4" strokeLinejoin="round" />
    <Balon x={16} y={64} fill="#3B7BD6">
      <path d="m33 81 8 8 15-16" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </Balon>
  </>
);

/** Gagal memuat: jendela dengan lencana merah. */
const Galat = () => (
  <>
    <Latar />
    <rect x="50" y="52" width="126" height="104" rx="10" fill="#fff" stroke={LINE} strokeWidth="5" />
    <path d="M50 62a10 10 0 0 1 10-10h106a10 10 0 0 1 10 10v16H50Z" fill="#2F5FAE" stroke={LINE} strokeWidth="5" strokeLinejoin="round" />
    <circle cx="65" cy="65" r="3.5" fill="#fff" />
    <circle cx="78" cy="65" r="3.5" fill="#fff" />
    <circle cx="91" cy="65" r="3.5" fill="#fff" />
    <rect x="64" y="92" width="70" height="8" rx="4" fill="#A9C2E6" />
    <rect x="64" y="108" width="50" height="8" rx="4" fill="#A9C2E6" />
    <rect x="64" y="124" width="60" height="8" rx="4" fill="#A9C2E6" />
    <circle cx="170" cy="148" r="26" fill="#E5484D" stroke={LINE} strokeWidth="5" />
    <path d="M170 133v16" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
    <circle cx="170" cy="162" r="4" fill="#fff" />
  </>
);

const ART = { kosong: Kosong, cari: Cari, pilih: Pilih, galat: Galat };

/** Ilustrasi SVG untuk empty state. Dekoratif (disembunyikan dari pembaca layar); teksnya ada di EmptyState. */
export default function EmptyStateArt({ variant = 'kosong', className = '' }) {
  const Art = ART[variant] || Kosong;

  return (
    <svg viewBox="8 8 214 214" fill="none" aria-hidden="true" focusable="false" className={className}>
      <Art />
    </svg>
  );
}

import { useState } from 'react';

export const OPSI_PERIODE = [
  { label: 'Bulan ini', value: 'bulan_ini' },
  { label: '3 bulan terakhir', value: '3_bulan' },
  { label: '6 bulan terakhir', value: '6_bulan' },
  { label: '12 bulan terakhir', value: '12_bulan' },
  { label: 'Tahun ini', value: 'tahun_ini' },
  { label: 'Semua waktu', value: 'semua' },
];

/** Filter bersama halaman analisis: periode, (untuk pemantau lintas divisi) divisi, dan kategori alat (halaman yang mendukungnya). */
export function useAnalisisFilter() {
  const [periode, setPeriode] = useState('12_bulan');
  const [divisiId, setDivisiId] = useState('');
  const [kategoriId, setKategoriId] = useState('');
  return { periode, setPeriode, divisiId, setDivisiId, kategoriId, setKategoriId };
}

/** "▲ 25% dari periode lalu"; null bila tidak ada pembanding atau keduanya nol. */
export const selisih = (sekarang, sebelum) => {
  if (sebelum === null || sebelum === undefined || (!sekarang && !sebelum)) return null;
  if (!sebelum) return `▲ naik dari 0 pada periode lalu`;
  const persen = Math.round(((sekarang - sebelum) / sebelum) * 100);
  if (persen === 0) return 'Sama dengan periode lalu';
  return `${persen > 0 ? '▲' : '▼'} ${Math.abs(persen)}% dari periode lalu`;
};

/** Gabungkan beberapa keterangan kartu, abaikan yang kosong. */
export const gabung = (...bagian) => bagian.filter(Boolean).join(' · ');

export const TOOLTIP_STYLE = { borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
export const AXIS_TICK = { fontSize: 12, fill: '#6b7280' };


/** Palet grafik: dipakai bergilir per batang/irisan supaya grafik tidak satu warna. */
export const PALET_GRAFIK = ['#6C5DD3', '#FF754C', '#FFAF4E', '#3F8CFF', '#10B981', '#EC4899', '#06B6D4', '#F0C782'];
export const warnaKe = (i) => PALET_GRAFIK[i % PALET_GRAFIK.length];

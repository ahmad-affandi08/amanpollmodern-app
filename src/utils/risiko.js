/**
 * Skor risiko peralatan medis metode Fennig-Koh (Pedoman Manajemen Risiko Alkes, MFK 7).
 * Total = fungsi (1-5) + risiko klinis (1-5) + pemeliharaan (1-2); 9-12 Tinggi, 6-8 Sedang, 3-5 Rendah.
 */

export const SKOR_FUNGSI = [
  { value: 5, label: '5 - Pendukung kehidupan (life support)' },
  { value: 4, label: '4 - Penunjang kritis / bedah' },
  { value: 3, label: '3 - Terapis / diagnostik' },
  { value: 2, label: '2 - Laboratorium' },
  { value: 1, label: '1 - Penunjang umum' },
];

export const SKOR_RISIKO_KLINIS = [
  { value: 5, label: '5 - Kematian pasien' },
  { value: 4, label: '4 - Cedera parah permanen' },
  { value: 3, label: '3 - Cedera ringan / salah diagnosis' },
  { value: 2, label: '2 - Ketidaknyamanan minor' },
  { value: 1, label: '1 - Tanpa risiko signifikan' },
];

export const SKOR_PEMELIHARAAN = [
  { value: 2, label: '2 - Kompleks / padat kalibrasi' },
  { value: 1, label: '1 - Pemeriksaan berkala sederhana' },
];

export const KELAS_AMDD = [
  { value: 'A', label: 'A - Risiko rendah' },
  { value: 'B', label: 'B - Rendah-sedang' },
  { value: 'C', label: 'C - Sedang-tinggi' },
  { value: 'D', label: 'D - Risiko tinggi' },
];

/** Hitung pratinjau total/tingkat di form; angka resmi tetap dari API (TingkatRisikoEnum). */
export const hitungRisiko = (fungsi, klinis, pemeliharaan) => {
  const parts = [fungsi, klinis, pemeliharaan].map((v) => (v === '' || v == null ? NaN : Number(v)));
  if (parts.some(Number.isNaN)) return null;

  const total = parts[0] + parts[1] + parts[2];
  return { total, tingkat: total >= 9 ? 'Tinggi' : total >= 6 ? 'Sedang' : 'Rendah' };
};

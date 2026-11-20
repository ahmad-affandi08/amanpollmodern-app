/** Util bersama halaman Realisasi SKI (desktop untuk pemantau, mobile untuk teknisi). */

const huruf = (teks) => teks.charAt(0).toUpperCase() + teks.slice(1);

export const OPSI_BULAN = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: huruf(new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2026, i, 1))),
}));

/** Tahun berjalan dan tiga tahun sebelumnya (terbaru di atas). */
export const opsiTahun = (sekarang = new Date()) =>
  Array.from({ length: 4 }, (_, i) => {
    const tahun = sekarang.getFullYear() - i;
    return { value: tahun, label: String(tahun) };
  });

/** Huruf kelompok pada form SKI: A. Kuantitas, B. Kualitas. */
export const HURUF_KELOMPOK = { Kuantitas: 'A', Kualitas: 'B' };

/** Kelompokkan baris indikator mengikuti urutan dari server. */
export const kelompokkan = (indikator = []) =>
  indikator.reduce((hasil, baris) => {
    const grup = hasil.find((g) => g.nama === baris.kelompok);
    if (grup) grup.baris.push(baris);
    else hasil.push({ nama: baris.kelompok, baris: [baris] });
    return hasil;
  }, []);

/** Angka yang ditampilkan: "3", "66,67", atau "-" bila belum bisa dihitung. */
export const formatRealisasi = (baris) => {
  if (baris.realisasi === null || baris.realisasi === undefined) return '-';
  const persen = baris.satuan === '%';

  return Number(baris.realisasi).toLocaleString('id-ID', {
    minimumFractionDigits: persen ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

/** Dasar hitungan untuk indikator persen: "2 dari 3 aduan". Kosong untuk indikator jumlah. */
export const dasarHitungan = (baris) => {
  if (baris.penyebut === null || baris.penyebut === undefined) return '';
  return baris.penyebut === 0 ? 'Belum ada aduan' : `${baris.pembilang} dari ${baris.penyebut} aduan`;
};

/** Salin angka polos (titik desimal, tanpa %), seperti yang diketik di kolom Realisasi IKI. */
export const salinRealisasi = (baris) => navigator.clipboard.writeText(String(baris.realisasi));

export const unduhBlob = (blob, namaFile) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = namaFile;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/** Angka seperti di form IKI: dua desimal dan titik ("4.00"). Kosong bila belum ada nilainya. */
export const angkaForm = (nilai) => (nilai === null || nilai === undefined ? '' : Number(nilai).toFixed(2));

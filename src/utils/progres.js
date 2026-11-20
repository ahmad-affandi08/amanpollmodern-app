import { parseDate } from './format';

export const LANGKAH_ADUAN = ['Masuk', 'Ditugaskan', 'Diperiksa', 'Selesai'];

/**
 * Sejauh mana aduan sudah ditangani: 1 Masuk, 2 Ditugaskan (ada teknisi), 3 Diperiksa (hasil pemeriksaan
 * tersimpan), 4 Selesai. Status Selesai berarti semua langkah sebelumnya terlewati, walau data lama tidak
 * mencatat teknisi atau tanggalnya.
 */
export const progresAduan = (aduan) => {
  let langkah = 1;
  if (aduan.teknisi_id || aduan.tanggal_penugasan) langkah = 2;
  if (aduan.tanggal_pemeriksaan) langkah = 3;
  if (aduan.status_aduan === 'Selesai') langkah = 4;

  return {
    langkah,
    label: LANGKAH_ADUAN[langkah - 1],
    // Tanggal tiap langkah (untuk tooltip); null bila belum tercapai atau tidak dicatat.
    tanggal: [
      aduan.create_date,
      aduan.tanggal_penugasan,
      aduan.tanggal_pemeriksaan,
      aduan.status_aduan === 'Selesai' ? aduan.tanggal_pemeriksaan : null,
    ],
  };
};

/** Nomor hari kalender (zona waktu lokal), supaya selisih dihitung per tanggal, bukan per jam. */
const nomorHari = (tanggal) => Math.floor(Date.UTC(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate()) / 86400000);

/**
 * Jadwal pemeliharaan dibandingkan dengan realisasinya: { label, tone } dengan tone 'ok' | 'telat' | 'netral'.
 * Sudah diperiksa: tepat waktu bila diperiksa paling lambat pada hari jadwal (aturan sama dengan analisis kinerja).
 * Belum diperiksa: lewat jadwal bila tanggalnya sudah lampau. Null bila tidak ada jadwal atau tidak bisa dinilai.
 */
export const ketepatanJadwal = ({ jadwal, diperiksa, status, hariIni = new Date() }) => {
  const tglJadwal = parseDate(jadwal);
  if (!tglJadwal) return null;

  const tglPeriksa = parseDate(diperiksa);
  if (tglPeriksa) {
    const telat = nomorHari(tglPeriksa) - nomorHari(tglJadwal);
    return telat <= 0 ? { label: 'Tepat waktu', tone: 'ok' } : { label: `Terlambat ${telat} hari`, tone: 'telat' };
  }
  // Selesai tanpa tanggal pemeriksaan (data lama): tidak ada dasar untuk menilai.
  if (status === 'Selesai') return null;

  const lewat = nomorHari(hariIni) - nomorHari(tglJadwal);
  if (lewat > 0) return { label: `Lewat jadwal ${lewat} hari`, tone: 'telat' };
  return { label: lewat === 0 ? 'Jadwal hari ini' : `${-lewat} hari lagi`, tone: 'netral' };
};

import { formatDate, formatDateTime } from './format';

const BELUM = 'Belum Ditentukan';
const ada = (v) => (v && v !== BELUM ? v : null);

/** Bagian teks (label + isi) yang terisi saja. */
const bagian = (...pasangan) => pasangan.filter(([, teks]) => teks).map(([label, teks]) => ({ label, teks }));
/** Foto bukti (sebelum/sesudah) yang ada saja. */
const foto = (sebelum, sesudah) => [['Foto sebelum', sebelum], ['Foto sesudah', sesudah]].filter(([, src]) => src).map(([label, src]) => ({ label, src }));
/** Tanda tangan yang ada saja. */
const ttd = (...daftar) => daftar.filter(([, , gambar]) => gambar).map(([label, nama, gambar]) => ({ label, nama, gambar }));

/** Riwayat penanganan aduan: pemeriksaan di riwayat (snapshot) lalu pemeriksaan terkini. */
export const susunRiwayatAduan = (aduan) => {
  const history = aduan.history || [];
  const items = history.map((h, i) => ({
    key: `h-${h.id ?? i}`,
    judul: i === 0 ? 'Pemeriksaan awal' : `Pemeriksaan ke-${i + 1}`,
    status: h.status_aduan,
    tanggal: h.tanggal_pemeriksaan ? formatDateTime(h.tanggal_pemeriksaan) : null,
    bagian: bagian(['Tindakan teknisi', h.tindakan_teknisi], ['Rekomendasi', h.rekomendasi]),
    kondisi: ada(h.kondisi_alat),
    ttd: ttd(['TTD teknisi', aduan.teknisi_nama, h.ttd_teknisi], ['TTD pelapor', aduan.nama_pengadu, h.ttd_kepala_ruang]),
  }));

  if (aduan.tindakan_teknisi) {
    items.push({
      key: 'terkini',
      judul: history.length > 0 ? 'Pemeriksaan lanjutan' : 'Laporan pengerjaan',
      status: aduan.status_aduan,
      tanggal: aduan.tanggal_pemeriksaan ? formatDateTime(aduan.tanggal_pemeriksaan) : null,
      bagian: bagian(['Tindakan teknisi', aduan.tindakan_teknisi], ['Rekomendasi', aduan.rekomendasi]),
      kondisi: ada(aduan.kondisi_alat),
      ttd: ttd(['TTD teknisi', aduan.teknisi_nama, aduan.ttd_teknisi], ['TTD pelapor', aduan.nama_pengadu, aduan.ttd_kepala_ruang]),
    });
  }

  return items;
};

/** Langkah alur status aduan: Dilaporkan, Ditugaskan, Diperiksa, Selesai. */
export const langkahAlurAduan = (aduan) => {
  const pertama = (aduan.history || [])[0]?.tanggal_pemeriksaan || aduan.tanggal_pemeriksaan;
  const selesai = aduan.status_aduan === 'Selesai';
  const lanjutan = aduan.status_aduan === 'Tindakan Lanjutan';
  const ditugaskan = !!aduan.teknisi_nama;

  return [
    { label: 'Dilaporkan', selesai: true, waktu: formatDateTime(aduan.create_date), oleh: aduan.nama_pengadu },
    {
      label: 'Ditugaskan',
      selesai: ditugaskan,
      waktu: aduan.tanggal_penugasan ? formatDateTime(aduan.tanggal_penugasan) : ditugaskan ? 'Waktu tidak tercatat' : 'Belum ditugaskan',
      oleh: ditugaskan ? `Kepada ${aduan.teknisi_nama}` : null,
    },
    { label: 'Diperiksa', selesai: !!pertama, waktu: pertama ? formatDateTime(pertama) : 'Belum diperiksa', oleh: pertama ? aduan.teknisi_nama : null },
    {
      label: 'Selesai',
      selesai,
      waktu: selesai ? formatDateTime(aduan.tanggal_pemeriksaan) : lanjutan ? 'Menunggu tindakan lanjutan' : 'Belum selesai',
      oleh: selesai ? aduan.teknisi_nama : null,
    },
  ];
};

/** Riwayat pemeliharaan: pemeriksaan di riwayat (snapshot) lalu hasil terkini bila sudah diperiksa. */
export const susunRiwayatPemeliharaan = (p) => {
  const history = p.history || [];
  const items = history.map((h, i) => ({
    key: `h-${h.id ?? i}`,
    judul: i === 0 ? 'Pemeriksaan awal' : `Pemeriksaan ke-${i + 1}`,
    status: h.status,
    tanggal: h.tanggal_pemeriksaan ? formatDate(h.tanggal_pemeriksaan) : null,
    bagian: bagian(['Keterangan', h.keterangan_pemeliharaan], ['Rekomendasi', h.rekomendasi]),
    kondisi: ada(h.kondisi_alat),
    foto: foto(h.foto_sebelum, h.foto_sesudah),
    ttd: ttd(['TTD teknisi', p.teknisi_nama, h.ttd_teknisi], ['TTD kepala ruangan', null, h.ttd_kepala_ruang]),
  }));

  if (p.tanggal_pemeriksaan || p.status === 'Selesai' || p.status === 'Tindakan Lanjutan') {
    items.push({
      key: 'terkini',
      judul: history.length > 0 ? (p.status === 'Selesai' ? 'Pemeriksaan akhir' : 'Pemeriksaan lanjutan') : 'Hasil pemeriksaan',
      status: p.status,
      tanggal: p.tanggal_pemeriksaan ? formatDate(p.tanggal_pemeriksaan) : null,
      bagian: bagian(['Keterangan', p.keterangan_pemeliharaan], ['Rekomendasi', p.rekomendasi]),
      kondisi: ada(p.kondisi_alat),
      foto: foto(p.foto_sebelum, p.foto_sesudah),
      ttd: ttd(['TTD teknisi', p.teknisi_nama, p.ttd_teknisi], ['TTD kepala ruangan', p.nama_kepala_ruangan, p.ttd_kepala_ruang]),
    });
  }

  return items;
};

/** Langkah alur status pemeliharaan: Dijadwalkan, Diperiksa, Selesai. */
export const langkahAlurPemeliharaan = (p) => {
  const selesai = p.status === 'Selesai';
  const lanjutan = p.status === 'Tindakan Lanjutan';

  return [
    { label: 'Dijadwalkan', selesai: true, waktu: formatDate(p.jadwal_pemeliharaan), oleh: null },
    {
      label: 'Diperiksa',
      selesai: !!p.tanggal_pemeriksaan,
      waktu: p.tanggal_pemeriksaan ? formatDate(p.tanggal_pemeriksaan) : 'Belum dilakukan',
      oleh: p.tanggal_pemeriksaan && p.teknisi_nama !== '-' ? p.teknisi_nama : null,
    },
    {
      label: 'Selesai',
      selesai,
      waktu: selesai ? formatDate(p.tanggal_pemeriksaan) : lanjutan ? 'Menunggu tindakan lanjutan' : 'Belum selesai',
      oleh: null,
    },
  ];
};

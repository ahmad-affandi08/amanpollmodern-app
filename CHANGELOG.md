# Catatan Perubahan

Aturan penomoran dan langkah rilis ada di [VERSIONING.md](VERSIONING.md). Entri terbaru di atas.

## [1.2.0] - 2026-11-16

### Baru
- **Waktu penugasan teknisi** pada aduan: dicatat saat Admin Divisi memilih (atau mengganti) teknisi, tampil di export Excel,
  PDF aduan, kolom "Waktu Penugasan" di Laporan Aduan, dan detail aduan (desktop dan mobile).
  Aduan yang sudah ditugaskan sebelum fitur ini tampil "-" karena waktunya tidak pernah tersimpan.

### Diubah
- **Tampilan halaman detail dirapikan** (Detail Laporan Aduan dan Pemeliharaan di desktop, detail aduan dan pemeliharaan di mobile,
  serta form pemeriksaan teknisi): satu warna merek, tanpa gradien, label minimal 12px, tombol Export PDF seragam.
  Halaman laporan kini punya **alur status** (Dilaporkan, Ditugaskan, Diperiksa, Selesai) dan satu garis waktu riwayat penanganan.
  Detail pemeliharaan sekarang juga menampilkan keterangan, rekomendasi, dan biaya.
  Gaya yang sama dipakai di halaman Disposisi, Detail Notifikasi, Detail Inventaris, Detail Anggaran, dan Detail Alat Baru.
  Foto yang tidak ada kini tampil sebagai penanda netral, bukan ikon hitam raksasa.

### Catatan deploy
- Jalankan migrasi `2026_11_16_000001_add_tanggal_penugasan_to_aduan` (hanya menambah satu kolom).

## [1.1.0] - 2026-11-13

### Baru
- **Riwayat alat rusak berat.** Alat rusak berat tidak lagi hilang saat dihapus: bisa **digudangkan** atau **dihapus dari daftar aset**
  (wajib SK dan berita acara untuk penghapusan), dan bisa diaktifkan kembali. Semua perubahan tercatat (siapa, kapan, alasan, lokasi).
  Menu baru **Riwayat Alat Rusak Berat**; di detail alat ada banner status dan tab riwayat. Riwayat aduan dan pemeliharaan tetap terbaca.
- **Laporan servis pihak ketiga (vendor)** pada aduan dan pemeliharaan: unggah PDF/foto laporan vendor (banyak laporan per aduan),
  tampil di detail aduan/pemeliharaan, form pemeriksaan teknisi, tab baru di detail alat, PDF dan Excel, serta filter "Pihak Ketiga".
  Biaya tetap diisi satu kali di form pemeriksaan.
- **Nomor versi** tampil di sidebar dan halaman Profil.

### Diperbaiki
- Panel laporan vendor kini satu kolom di halaman mobile pada layar lebar.

### Perubahan perilaku
- Aduan atau pemeliharaan yang sudah punya laporan vendor **tidak dapat dihapus**.

### Catatan deploy
- Jalankan migrasi: `2026_11_12_000001_add_status_aset_and_status_log_to_inventaris`, `2026_11_13_000001_create_servis_pihak_ketiga_table`,
  dan versi baru `2026_10_19_000001_create_kalibrasi_history_table`.
  Periksa tipe `id_inventaris`, `id_aduan`, `id_pemeliharaan` (bertanda atau tidak) dan **backup database lebih dulu**.
- `upload_max_filesize` dan `post_max_size` PHP minimal 10 MB (unggahan laporan vendor).

## [1.0.0] - versi dasar (sebelum nomor versi dicatat)

Seluruh fitur yang sudah berjalan sebelum nomor versi dicatat, yaitu inventaris, aduan, pemeliharaan, kalibrasi,
penilaian dan register risiko alat, anggaran, analisis, notifikasi WhatsApp, dan aplikasi PWA.

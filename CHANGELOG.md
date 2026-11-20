# Catatan Perubahan

Aturan penomoran dan langkah rilis ada di [VERSIONING.md](VERSIONING.md). Entri terbaru di atas.

## [1.3.2] - 2026-11-21

### Diperbaiki
- Daftar **Tugas Saya** (mobile teknisi) kini hanya memuat tugas aktif (Sedang Dikerjakan dan Tindakan Lanjutan). Sebelumnya aduan yang
  sudah Selesai ikut tampil karena server mengabaikan filter beberapa status. Kartu aduan Selesai tidak lagi menampilkan tombol
  pemeriksaan.

### Diubah
- Tautan "Langsung isi pemeriksaan" dihapus dari kartu tugas: pemeriksaan dibuka lewat tombol "Isi pemeriksaan" setelah "Mulai kerjakan" ditekan.

## [1.3.1] - 2026-11-21

### Baru
- **Tombol "Mulai kerjakan"** di kartu Tugas Saya (mobile teknisi): mencatat waktu respons saat teknisi mulai menangani aduan,
  sekali saja. Setelah ditekan, kartu menampilkan "Direspons …" dan tombol "Isi pemeriksaan". Teknisi tetap bisa langsung mengisi
  pemeriksaan; waktu respons lalu terisi saat penyimpanan pertama (cara lama). Tidak ada migrasi baru.

## [1.3.0] - 2026-11-21

### Baru
- **Realisasi SKI** (menu Analisis di desktop, dan halaman teknisi di mobile): angka realisasi bulanan per teknisi dari data AmanPoll
  (9 indikator: Kuantitas dan Kualitas) dalam format form IKI, tombol salin per angka, dan **export Excel**. Hanya indikator yang datanya
  tercatat di AmanPoll yang tampil. Target, bobot, dan nilai belum termasuk.
- **Tingkat kerusakan** (Ringan/Berat) dan **waktu respons** pada aduan, dipakai untuk indikator SKI dan analisis keandalan.
  Aduan lama tampil "Belum dinilai" karena datanya tidak pernah tersimpan.
- **Foto sebelum dan sesudah (opsional)** pada form pemeliharaan teknisi. Tampil di riwayat pemeriksaan (desktop dan mobile)
  dan di PDF hasil pemeliharaan. Foto diperkecil di HP sebelum dikirim (maks 5 MB).
- **Analisis:** filter **Kategori Alat** di Keandalan Alat, grafik **Pemeliharaan yang Masih Aktif** dan pemisahan aduan/pemeliharaan
  pada Top Performer di Kinerja Teknisi, tombol **Export Excel** di tiap halaman analisis, dan grafik yang kini berwarna.
- **Nama resmi unit kerja** pada Master Divisi (dipakai di lembar SKI).

### Diubah
- Menu **Analisis** dipindah tepat di bawah Anggaran & Biaya.
- Daftar Aduan, Pemeliharaan, dan laporan memakai **detail baris yang bisa dilipat**; keadaan kosong dan dialog memakai ilustrasi SVG.
- Rentang tanggal memakai satu komponen **DateRangePicker**; tombol dan kontrol filter diseragamkan (tinggi 36px, latar putih).
- Favicon memakai logo transparan.

### Catatan deploy
- Jalankan migrasi (semuanya hanya menambah kolom): `2026_11_20_000001_add_tingkat_kerusakan_dan_tanggal_respon_to_aduan`,
  `2026_11_20_000002_add_nama_resmi_to_divisi`, `2026_11_21_000001_add_foto_sebelum_sesudah_to_pemeliharaan`,
  dan `2026_11_21_000002_add_foto_to_pemeliharaan_history`. **Backup database lebih dulu.**
- Pastikan `php artisan storage:link` sudah ada dan folder `storage/app/public/pemeliharaan/foto` bisa ditulis web server.

## [1.2.1] - 2026-11-20

### Diperbaiki
- Filter di Daftar Aduan dan Daftar Pemeliharaan tampil dalam satu baris di layar lebar (sebelumnya filter tanggal turun ke baris kedua
  setelah filter "Semua Servis" ditambahkan).

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

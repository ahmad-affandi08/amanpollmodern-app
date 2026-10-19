# PWA AmanPoll (User Ruangan & Teknisi)

Aplikasi bisa dipasang di layar utama HP (Android dan iPhone/iPad) dan terbuka seperti aplikasi biasa.

## Cara kerja
- **Hanya untuk peran mobile.** Service worker hanya didaftarkan untuk User Ruangan dan Teknisi (atau bila aplikasi sudah dibuka dari layar utama). Super Admin, Admin Divisi, dan Pimpinan (desktop) serta tautan disposisi publik tidak terpengaruh.
- **Data tidak disimpan offline.** Semua request `/api/*` selalu ke server (`NetworkOnly`), jadi data pribadi tidak tersimpan di cache perangkat dan tidak pernah basi. Yang disimpan hanya berkas aplikasi (JS/CSS/ikon/font) dan foto unggahan (cache sementara 14 hari).
- **Tanpa sinyal:** aplikasi tetap terbuka dan tampil penanda "Tidak ada koneksi internet". Data baru tidak dapat dimuat/dikirim sampai sinyal kembali; tambah/ubah data gagal seketika dengan pesan error (tidak menunggu lalu terkirim ganda).
- **Pembaruan:** setelah deploy, pengguna melihat kartu "Versi baru AmanPoll tersedia" dengan tombol **Muat Ulang** (tidak memaksa reload agar form yang sedang diisi aman). Aplikasi mengecek versi baru tiap jam dan saat dibuka kembali.
- **Pemasangan:** banner di Beranda (ditutup = ditunda 14 hari) dan kartu "Pasang Aplikasi" di halaman Profil. Android/Chrome: tombol Pasang. iPhone/iPad: panduan "Bagikan → Tambah ke Layar Utama".

## Deploy (Domainesia / cPanel)
1. `npm run build`, unggah **seluruh isi `dist/`** (termasuk `.htaccess`, `sw.js`, `workbox-*.js`, `manifest.webmanifest`, folder `icons/`). Hapus berkas lama yang tidak ada di build baru.
2. `.htaccess` di `public/` sudah menambahkan: tipe `application/manifest+json` dan `Cache-Control: no-cache` untuk `sw.js` dan `manifest.webmanifest` (wajib, supaya pembaruan sampai ke pengguna).
3. Situs harus HTTPS (sudah).
4. Cek: buka situs di Chrome HP sebagai User Ruangan, menu ⋮ → "Instal aplikasi" harus muncul, dan banner "Pasang AmanPoll" tampil di Beranda.

## Tombol darurat (bila ada masalah dengan PWA)
Jalankan `PWA_SELF_DESTROY=true npm run build` lalu unggah `dist/`. Service worker lama di semua perangkat akan mencopot dirinya dan menghapus cache, dan aplikasi berhenti mendaftarkannya. Setelah masalah selesai, build normal seperti biasa.

## Catatan
- Ikon: `public/icons/` (192, 512, maskable 512, apple-touch 180). Ganti file dengan nama sama untuk mengubah ikon.
- Sesi login mengikuti `SESSION_LIFETIME` di backend (default 120 menit tidak aktif). Naikkan nilainya bila pengguna PWA diharapkan tetap login lebih lama.
- Pengembangan: service worker tidak aktif di `npm run dev`. Uji dengan `npm run build && npm run preview`.

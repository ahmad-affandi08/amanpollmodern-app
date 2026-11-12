# Aturan Versi AmanPoll

Nomor versi tampil di bawah sidebar (desktop) dan di halaman Profil (mobile). Satu nomor berlaku untuk
**seluruh AmanPoll** (`application` + `webservices`), supaya pengguna, admin, dan developer menyebut versi yang sama.

- **Sumber tunggal:** `version` di [`package.json`](package.json). Tidak ada nomor versi lain yang diketik manual.
- **Riwayat:** [`CHANGELOG.md`](CHANGELOG.md), satu entri per rilis.
- Nomor ikut tertanam saat `npm run build`, jadi mengubahnya otomatis memicu pemberitahuan "Versi baru tersedia" di PWA.

## Format: `MAJOR.MINOR.PATCH` (contoh `1.4.2`)

| Naik | Kapan | Contoh |
|---|---|---|
| **PATCH** `1.4.2 → 1.4.3` | Perbaikan yang **tidak menambah fitur**: bug, salah hitung, tampilan berantakan, salah teks. Tidak ada migrasi database. | Kartu laporan terpecah per huruf; filter tidak jalan; typo di form |
| **MINOR** `1.4.3 → 1.5.0` | **Ada yang baru bagi pengguna** dan tidak merusak cara kerja lama: menu, halaman, field, laporan, atau aturan baru. Boleh ada migrasi yang **hanya menambah** tabel/kolom. | Riwayat alat rusak berat; laporan servis pihak ketiga; kolom baru di Excel |
| **MAJOR** `1.5.0 → 2.0.0` | Perubahan besar yang **mengubah cara kerja lama atau butuh tindakan**: migrasi yang mengubah/menghapus data, hak akses peran berubah besar, alur utama diganti, API lama tidak lagi dikenali aplikasi lama. | Peran baru yang menggeser hak akses; ganti alur login; hapus fitur |

Bila satu rilis memuat beberapa jenis perubahan, **ikuti yang paling tinggi** (ada fitur baru + perbaikan bug → MINOR).
Naik MINOR atau MAJOR mengembalikan angka di kanannya ke `0`.

## Kapan versi TIDAK dinaikkan

Versi hanya berubah bila **pengguna atau server produksi menerima sesuatu yang berbeda**. Jangan naikkan untuk:

- tes (`tests/`), dokumentasi, komentar, README, file `.claude/`
- refactor atau rapikan kode **tanpa mengubah perilaku**
- konfigurasi atau skrip pengembangan lokal
- build ulang tanpa perubahan kode
- commit setengah jalan, eksperimen, atau pekerjaan yang belum dirilis

## Kapan menaikkan: saat rilis, bukan tiap commit

Versi dinaikkan **sekali per rilis**, yaitu saat sekumpulan perubahan dinyatakan siap dipasang di produksi. Beberapa commit boleh
masuk satu rilis. Commit biasa (`feat:`, `fix:`, `chore:`) tidak mengubah nomor.

## Langkah rilis

1. Pastikan semua perubahan sudah di-commit, tes backend lulus, dan `npm run lint` bersih.
2. Tentukan jenis kenaikan (PATCH/MINOR/MAJOR) dengan tabel di atas.
3. Tambahkan entri di [`CHANGELOG.md`](CHANGELOG.md) (tanggal, ringkasan, dan **catatan deploy**: migrasi apa yang perlu dijalankan).
4. Di folder `application`:
   ```bash
   npm version patch   # atau: minor / major
   ```
   Perintah ini mengubah `package.json` dan `package-lock.json`, membuat commit `1.x.y`, dan membuat tag `v1.x.y`.
5. `npm run build` (hasilnya masuk ke `webservices/public`), commit hasil build di `webservices`.
6. Push kedua repo beserta tag: `git push origin main --follow-tags` (di `application`) dan `git push origin main` (di `webservices`).
7. Di produksi: backup database, jalankan migrasi yang tercatat di catatan deploy, lalu periksa nomor versi di sidebar sudah sesuai.

## Hotfix

Bug serius di produksi: perbaiki, naikkan **PATCH**, rilis dengan langkah yang sama. Tidak perlu menunggu rilis berikutnya.

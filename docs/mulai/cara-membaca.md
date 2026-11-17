---
title: Cara membaca dokumentasi ini
urutan: 1
---

# Cara membaca dokumentasi ini

Dokumentasi ini menjelaskan kode Buddhi Sports untuk pembaca yang baru mengenal TSX, Laravel, dan Inertia. Setiap file inti punya satu halaman sendiri. File yang kecil atau mirip satu sama lain (misalnya komponen UI dasar, migration, dan tes) dijelaskan per kelompok.

Isi dokumentasi ini mengikuti kode di branch `main` repo `griceskie/buddhi_sports` per 17 November 2026. Kalau kodenya berubah, halaman yang bersangkutan juga perlu diperbarui.

## Urutan baca yang disarankan

1. Baca [Cara aplikasi bekerja](./cara-kerja). Halaman ini menunjukkan perjalanan satu klik dari browser ke database dan kembali lagi.
2. Baca [Dasar PHP dan Laravel](./dasar-laravel) dan [Dasar TSX dan React](./dasar-tsx). Keduanya hanya membahas bagian bahasa yang benar-benar dipakai di proyek ini.
3. Baca [Alur bisnis](./alur-bisnis) supaya kamu paham status booking dan pembayaran sebelum membaca controller.
4. Setelah itu, buka file mana pun dari menu di kiri. Mulailah dari [routes/web.php](/backend/route/web), karena semua alamat halaman berawal dari sana.

[Aturan kode](./aturan-kode) dan [Glosarium](./glosarium) bisa kamu buka kapan saja saat menemukan istilah atau kebiasaan yang belum jelas.

## Susunan setiap halaman file

Setiap halaman file memakai susunan yang sama:

- **Kotak info di atas**: lokasi file, jenisnya, dan file lain yang berhubungan langsung.
- **Ringkasan**: guna file ini dalam satu atau dua paragraf.
- **Posisinya dalam alur**: siapa yang memanggil file ini dan apa yang dipanggilnya.
- **Isi file**: fungsi demi fungsi. Setiap fungsi dijelaskan gunanya, logikanya langkah demi langkah, lalu potongan kode penting beserta artinya.
- **Aturan di file ini**: kebiasaan atau batasan yang harus dijaga kalau kamu mengubah file ini.
- **FAQ**: pertanyaan yang sering muncul saat pertama kali membaca file ini.

Potongan kode di dokumentasi ini kadang dipendekkan. Bagian yang dihapus ditandai dengan `// ...`. Untuk melihat kode lengkapnya, buka file aslinya di repo.

## Peta folder proyek

Folder yang paling sering kamu buka:

| Folder | Isinya |
| --- | --- |
| `routes/` | Daftar alamat (URL) dan controller yang menanganinya. |
| `app/Http/Controllers/` | Controller: menerima permintaan, mengecek isian, membaca dan menyimpan data, lalu memilih halaman yang ditampilkan. |
| `app/Support/` | Aturan bisnis yang dipakai banyak controller, misalnya jam buka, batas bayar, log aktivitas, dan hitungan analisis. |
| `app/Models/` | Model: wakil tabel database dalam kode PHP. Dipakai terutama untuk login. |
| `app/Http/Middleware/` | Kode yang berjalan di setiap permintaan, misalnya data bersama untuk semua halaman. |
| `database/migrations/` | Riwayat perubahan struktur tabel database. |
| `database/seeders/` | Data awal dan data contoh. |
| `config/` | Pengaturan. File milik proyek ini: `pembayaran.php` dan `pengelola.php`. |
| `resources/js/Pages/` | Halaman React. Nama file di sini dipakai controller saat memanggil `Inertia::render`. |
| `resources/js/Layouts/` | Kerangka halaman: menu, sidebar, dan wadah isi. |
| `resources/js/Components/` | Komponen yang dipakai berulang. Subfolder `ui/` berisi komponen dasar (tombol, input, dialog). |
| `resources/css/` | Warna, ukuran huruf, dan gaya global. |
| `tests/` | Tes otomatis yang dijalankan dengan `php artisan test`. |

## FAQ

**Kenapa tidak semua file punya halaman sendiri?**
Proyek ini punya sekitar 250 file kode. Komponen UI dasar di `Components/ui/`, migration, dan tes sebagian besar mengikuti pola yang sama, jadi lebih jelas kalau dijelaskan per kelompok. Lihat bagian "File lain (per kelompok)" di menu.

**Bagaimana menjalankan dokumentasi ini di komputer sendiri?**
Jalankan `npm install` lalu `npm run dev` di folder repo dokumentasi, lalu buka alamat yang muncul di terminal (biasanya `http://localhost:5173`).

**Bagaimana menambah halaman baru?**
Buat file `.md` di folder yang sesuai, misalnya `docs/frontend/komponen/`. Isi bagian atasnya dengan `title:` dan `urutan:`. Menu di kiri dibuat otomatis dari folder, jadi halaman baru langsung muncul.

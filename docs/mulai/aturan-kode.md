---
title: Aturan kode
urutan: 6
---

# Aturan kode

Aturan di halaman ini berlaku untuk seluruh proyek. Sumbernya adalah file `CLAUDE.md` di repo kode, ditambah keputusan yang diambil selama pengembangan. Setiap halaman file juga punya bagian "Aturan di file ini" untuk aturan yang lebih khusus.

## Empat prinsip kerja

Empat prinsip ini tertulis di bagian atas `CLAUDE.md` dan berlaku untuk setiap perubahan.

### Pikirkan dulu sebelum menulis kode

- Tuliskan asumsimu. Kalau ragu, tanya.
- Kalau ada beberapa cara membaca permintaan, sebutkan semuanya. Jangan memilih diam-diam.
- Kalau ada cara yang lebih sederhana, sampaikan.

### Sesederhana mungkin

- Tulis kode sesedikit mungkin yang menyelesaikan masalah.
- Jangan menambah fitur, pilihan, atau pengaturan yang tidak diminta.
- Jangan membuat abstraksi untuk kode yang hanya dipakai sekali.
- Jangan menangani galat untuk keadaan yang tidak mungkin terjadi.

### Ubah seperlunya saja

- Sentuh hanya baris yang perlu. Jangan merapikan kode, komentar, atau format di sekitarnya.
- Ikuti gaya kode yang sudah ada, walaupun kamu lebih suka gaya lain.
- Kalau menemukan kode mati yang tidak berhubungan, sebutkan saja, jangan dihapus.
- Kalau perubahanmu membuat import atau fungsi tidak terpakai, hapus yang itu.

Ujiannya: setiap baris yang berubah harus bisa dijelaskan hubungannya dengan permintaan.

### Kerja dengan tujuan yang bisa dicek

- Ubah tugas menjadi hasil yang bisa diuji. Contoh: "perbaiki bug" menjadi "tulis tes yang mengulang bug itu, lalu buat tesnya lulus".
- Untuk tugas berlangkah banyak, tulis rencana singkat beserta cara mengecek setiap langkah.

## Aturan backend

- **Controller data master memakai `DB::table(...)`, bukan Eloquent.** Pola ini mengikuti templat awal proyek. Model Eloquent tetap ada dan dipakai terutama untuk login (`Auth`).
- **Nama controller data master**: `Master{Model}Controller`, dengan fungsi `tampilData`, `insertData`, `updateData`, dan `deleteData{Model}`. Contoh: `MasterBookingController::deleteDataBooking`.
- **Form Tambah dan Edit bukan halaman terpisah.** Keduanya muncul sebagai panel samping (*sheet*) di halaman TampilData, lewat `Components/FormSheet.tsx`.
- **Controller mengembalikan `Inertia::render('Folder/Halaman', [...])`**, bukan view Blade. Satu-satunya view Blade yang dipakai adalah `app.blade.php` (wadah) dan templat PDF laporan.
- **Hitungan di PHP, React hanya menampilkan.** Angka, persentase, dan kalimat ringkasan di Analisis bisnis dan Laporan dihitung di `app/Support/`. Halaman React tidak menghitung ulang.
- **Aturan bisnis yang dipakai di banyak tempat masuk ke `app/Support/`.** Contohnya jam buka, batas bayar, status yang menahan jam, dan kunci laporan.
- **Simpan yang berkaitan di dalam satu transaksi.** Perubahan data dan baris log-nya ditulis di dalam `DB::transaction` yang sama, supaya keduanya berhasil atau gagal bersama.
- **Log hanya lewat `LogAktivitas::catat()`.** Jangan menulis ke tabel `log_aktivitas` dengan cara lain. Password tidak pernah dicatat. Nomor HP dan email dicatat dalam bentuk tersensor.
- **File privat di disk `local`.** Bukti transfer dan PDF laporan disimpan di `storage/app/private/` dan hanya bisa dibuka lewat controller yang mengecek hak akses. Foto lapangan boleh publik (disk `public`).
- **Jangan kirim hash password ke browser.** Saat mengambil data akun untuk halaman, pilih kolom yang perlu saja, misalnya `->get(['idAdmin', 'namaAdmin'])`.
- **Pesan untuk pengguna ditulis dalam Bahasa Indonesia.** Pesan bawaan Laravel memakai bahasa Inggris (`APP_LOCALE=en`), jadi pesan penting ditulis sendiri di parameter kedua `validate()`.

## Aturan frontend

- **Pakai komponen di `Components/ui/` sebelum membuat yang baru.** Isinya tombol, input, dialog, sheet, tabel, badge, dan lainnya.
- **Komponen Breeze lama sudah dihapus.** Jangan memakai lagi `TextInput`, `PrimaryButton`, `Dropdown`, `Modal`, atau `FlashMessage`.
- **Pesan sukses dan gagal tampil sebagai toast.** Dari server, kirim `->with('success', ...)`. Dari browser, panggil `toast.success()` atau `toast.error()`. Jangan menaruh banner pesan di halaman.
- **Warna memakai token, bukan warna mentah.** Tulis `bg-background`, `text-muted-foreground`, `text-destructive`, `bg-canvas`, dan sejenisnya. Jangan memakai `gray-500` atau `indigo-600`. Penjelasan lapisan warnanya ada di `panduan.md` di repo kode.
- **Ukuran huruf memakai skala proyek** (`text-large-title` sampai `text-caption-2`). Kalau menambah nama ukuran baru, daftarkan juga di `resources/js/lib/cn.ts`.
- **Komponen yang menerima `ref` harus memakai `React.forwardRef`** (React 18). Komponen `ui/button` tidak memakai `forwardRef`, jadi jangan dipakai sebagai `render` pemicu popup Base UI. Pakai kelas `buttonVariants()` di elemen pemicunya.
- **Satu tombol utama per halaman memakai `variant="elevated"`.** Contohnya "Booking sekarang" dan "Kirim bukti pembayaran".
- **Jam ditulis dengan titik**, misalnya 08.00–22.00 (EYD). Nilai yang dikirim ke server tetap `HH:MM`.
- **Ke penyewa, sebut "pengelola", bukan "admin".**

## Aturan kerja dengan Git

- Jangan push langsung ke `main`. Buat branch baru untuk setiap tugas, lalu buka pull request.
- Sebelum membuka pull request, jalankan:
  1. `npx tsc --noEmit` untuk memeriksa tipe.
  2. `npm run build` untuk merakit frontend.
  3. `php artisan test` untuk tes otomatis. Semua tes harus lulus.
- Jangan commit file `.env`. File ini berisi pengaturan lokal dan rahasia.
- Setelah perubahan besar, perbarui `CLAUDE.md` (catatan progres) dan `implementation-plan.md`.
- Pull request yang bertumpuk di-merge berurutan. Jangan me-merge PR ke branch dasarnya setelah branch dasar itu masuk `main`.

## FAQ

**Kenapa tidak memakai Eloquent di mana-mana, padahal lebih singkat?**
Templat awal proyek memakai `DB::table`, dan seluruh controller data master mengikutinya. Mencampur dua gaya di file yang sama membuat kode lebih sulit dibaca. Ikuti gaya yang sudah ada di file yang kamu ubah.

**Bolehkah menghitung total di React supaya lebih cepat?**
Untuk tampilan sementara, misalnya total saat penyewa memilih jam, boleh. Untuk angka yang disimpan atau dilaporkan, hitungan tetap dilakukan di PHP. Server tidak boleh percaya angka kiriman browser.

**Di mana aturan warna dan huruf dijelaskan lebih lengkap?**
Di file `panduan.md` di repo kode. File itu menjelaskan lapisan warna (palet iOS, alias shadcn, kelas Tailwind) dan variabel lain seperti radius dan lebar sidebar.

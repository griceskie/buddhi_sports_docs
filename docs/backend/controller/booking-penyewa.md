---
title: BookingPenyewaController.php
urutan: 1
---

# BookingPenyewaController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/BookingPenyewaController.php`
- **Jenis:** controller (PHP)
- **Dipakai oleh:** route penyewa di [web.php](/backend/route/web) (grup `auth`)
- **Berhubungan dengan:** [Pemesanan](/backend/support/pemesanan), [FotoLapangan](/backend/support/foto-lapangan), halaman [Home](/frontend/penyewa/dashboard), [Booking saya](/frontend/penyewa/booking), dan [Bayar](/frontend/penyewa/bayar)
:::

## Ringkasan

Controller ini mengurus semua yang dilakukan penyewa dengan booking: melihat jadwal, membuat booking, mengubah jadwal, mengirim bukti bayar, membatalkan, dan melihat daftar booking. Aturan booking (jam buka, jam yang ditahan, batas bayar) tidak ditulis di sini, tetapi diambil dari [Pemesanan](/backend/support/pemesanan).

| Route | Fungsi | Gunanya |
| --- | --- | --- |
| `GET /dashboard` | `home()` | Halaman Home: daftar lapangan dan jam yang sudah terisi. |
| `POST /booking` | `store()` | Membuat booking baru. |
| `GET /booking` | `daftar()` | Halaman Booking saya. |
| `GET /booking/{id}/bayar` | `bayar()` | Halaman Konfirmasi dan bayar. |
| `POST /booking/{id}/bukti` | `unggahBukti()` | Mengirim atau mengirim ulang bukti transfer. |
| `POST /booking/{id}/batal` | `batal()` | Penyewa membatalkan booking. |
| `PATCH /booking/{id}/jadwal` | `ubahJadwal()` | Mengubah tanggal dan jam. |

## Posisinya dalam alur

```text
Home ──(pilih jam, Booking sekarang)──► store() ──► halaman Bayar
                                                     │
                       kirim bukti ◄─────────────────┤
                       ubah jadwal ◄─────────────────┤
                       batalkan    ◄─────────────────┘
```

Semua route ini ada di grup `auth`, jadi hanya penyewa yang sudah login yang bisa memakainya. `Auth::id()` selalu berisi `idPenyewa` penyewa itu.

## Isi file

### Pesan tetap

```php
public const PESAN_DIAMBIL = 'Jam ini sudah diambil penyewa lain yang lebih dulu mengirim bukti bayar. Ubah jadwal atau batalkan booking ini.';
public const PESAN_DIAMBIL_DITOLAK = '... Hubungi pengelola untuk pindah jadwal.';
```

Dua pesan ini dipakai saat bukti tidak bisa diterima karena jamnya sudah ditahan booking lain. Pesannya dibuat `public const` supaya tes bisa memeriksa teks yang sama.

### `home()`

**Gunanya:** menyiapkan halaman Home.

Mengirim dua props:

- `lapangan`: semua lapangan. Kolom `foto` (teks JSON berisi path) diubah menjadi daftar URL oleh `FotoLapangan::urls()`.
- `terisi`: jam yang sudah ditahan, dari `terisi()`. Halaman memakainya untuk menggambar jam yang tidak bisa dipilih.

### `store()`

**Gunanya:** membuat booking baru, lalu membuka halaman Bayar.

**Logikanya:**

1. `validasiJadwal()` memeriksa tanggal dan jam. Booking baru juga wajib membawa `idLapangan` yang ada di tabel `lapangans`.
2. Jam diubah ke format database: `sprintf('%02d:00:00', 16)` menjadi `'16:00:00'`.
3. Di dalam transaksi, `kunciLapangan()` mengunci baris lapangan dan mengecek bentrok.
4. Booking disimpan dengan status `Dipesan`, total = tarif × jumlah jam, dan `created_at` = sekarang. Waktu ini menjadi awal hitungan batas bayar.
5. `insertGetId()` mengembalikan ID booking baru, lalu penyewa diarahkan ke `/booking/{id}/bayar`.

```php
$idBooking = DB::transaction(function () use (...) {
    $lapangan = $this->kunciLapangan(...);
    return DB::table('bookings')->insertGetId([...], 'idBooking');
});
```

`DB::transaction(function () { ... })` menjalankan semua isi fungsi sebagai satu kesatuan. Kalau ada yang gagal di tengah, semua perubahan dibatalkan. Nilai yang di-`return` dari dalam fungsi menjadi hasil `DB::transaction`.

### `validasiJadwal()`

**Gunanya:** satu aturan tanggal dan jam, dipakai oleh `store()` dan `ubahJadwal()`.

**Logikanya:**

1. Validasi bentuk:
   - `tanggal` berformat `YYYY-MM-DD`, mulai hari ini sampai 29 hari ke depan (30 hari termasuk hari ini).
   - `jamMulai` dan `jamSelesai` berbentuk `HH:00` (jam penuh), dicek dengan regex `/^\d{2}:00$/`.
2. Jam harus di antara 08 dan 22.
3. Jam selesai harus setelah jam mulai.
4. Kalau tanggalnya hari ini, jam mulai harus setelah jam sekarang. Pukul 15.20, jam 15 sudah tidak bisa dipilih.

Fungsi ini mengembalikan tiga nilai sekaligus: `[$data, $mulai, $selesai]`. Pemanggilnya membongkarnya dengan `[$data, $mulai, $selesai] = $this->validasiJadwal($request);`.

Parameter `$aturanLain` menambah aturan khusus. `$aturanLain + [...]` menggabungkan dua array, dan isi `$aturanLain` didahulukan.

Pelanggaran yang tidak bisa ditulis sebagai aturan validasi biasa dilempar dengan `ValidationException::withMessages([...])`. Hasilnya sama dengan galat validasi lain: pesan muncul di bawah field yang disebut.

### `kunciLapangan()`

**Gunanya:** mencegah dua penyewa mendapat jam yang sama pada saat bersamaan. Harus dipanggil di dalam transaksi.

```php
$lapangan = DB::table('lapangans')->where('idLapangan', $idLapangan)->lockForUpdate()->first();
```

`lockForUpdate()` mengunci baris lapangan itu sampai transaksi selesai. Kalau dua penyewa menekan Booking sekarang di detik yang sama untuk lapangan yang sama, penyewa kedua menunggu sampai penyewa pertama selesai. Setelah itu cek bentrok penyewa kedua melihat booking penyewa pertama.

Setelah dikunci, dua hal dicek:

- Lapangan berstatus `Perbaikan`? Tolak.
- `Pemesanan::jamDiambil(...)` bernilai benar? Tolak. Jam dianggap diambil kalau sudah ada booking `Dikonfirmasi`, atau booking `Dipesan` yang buktinya sedang menunggu verifikasi.

Fungsi ini mengembalikan baris lapangan, supaya pemanggil bisa membaca `tarifPerJam` tanpa query lagi.

### `ubahJadwal()`

**Gunanya:** penyewa memindahkan booking ke tanggal atau jam lain di lapangan yang sama.

**Logikanya:**

1. `Pemesanan::batalkanKedaluwarsa()` dijalankan dulu, supaya booking yang sudah lewat batas bayar tidak bisa dipindah.
2. `milikSaya()` mengambil booking. Booking milik orang lain menghasilkan 404.
3. Hanya booking `Dipesan` tanpa baris pembayaran yang boleh dipindah. Kalau sudah ada bukti, penyewa diminta menghubungi pengelola.
4. Tanggal dan jam baru divalidasi dengan aturan yang sama dengan booking baru.
5. Lapangan dikunci, bentrok dicek, lalu tanggal, jam, dan total diperbarui.

Batas bayar tidak dihitung ulang, karena `created_at` tidak diubah. Ini keputusan pemilik proyek, supaya penyewa tidak bisa memperpanjang waktu bayar dengan memindah jadwal.

### `bayar()`

**Gunanya:** menyiapkan halaman Konfirmasi dan bayar.

Props:

- `booking`: data booking dalam bentuk dari `detail()`.
- `rekening`: data transfer dari `config/pembayaran.php`.
- `terisi`: memakai `Inertia::optional(...)`. Props ini tidak dikirim saat halaman pertama dibuka. Halaman memintanya lewat partial reload saat penyewa membuka Ubah jadwal. Dengan begitu, membuka halaman Bayar tetap ringan.

### `unggahBukti()`

**Gunanya:** menyimpan bukti transfer.

**Logikanya:**

1. Batalkan booking yang kedaluwarsa, lalu ambil booking milik penyewa.
2. Tolak kalau bukti sudah dikirim dan belum ditolak.
3. Tolak kalau booking tidak berstatus `Dipesan`.
4. Validasi file: wajib, JPG atau PNG, maksimal 2 MB (`max:2048` dalam kilobyte).
5. Simpan file di disk `local` (privat), folder `bukti/`. `store()` memberi nama acak dan mengembalikan path-nya, misalnya `bukti/aB3x...jpg`.
6. Di dalam transaksi:
   - Kunci baris lapangan.
   - Kalau jamnya sudah ditahan booking lain, hapus file yang baru disimpan, lalu tolak dengan `PESAN_DIAMBIL` atau `PESAN_DIAMBIL_DITOLAK`.
   - Kalau ini kiriman ulang setelah ditolak, hapus file lama dan perbarui baris pembayaran yang sama.
   - Kalau ini kiriman pertama, buat baris pembayaran baru.
7. Kembali ke halaman sebelumnya dengan pesan sukses.

Setiap kiriman mengisi `status = 'Menunggu Verifikasi'`, `dikirimPada = now()`, dan mengosongkan `alasanTolak`. Sejak saat itu, jamnya ditahan untuk penyewa ini.

Satu booking hanya punya satu baris pembayaran. Kiriman ulang mengganti isi baris itu, bukan menambah baris baru.

### `batal()`

**Gunanya:** penyewa membatalkan booking sendiri.

Hanya boleh selama booking `Dipesan` dan belum ada bukti, karena belum ada uang yang perlu dikembalikan. Booking diubah menjadi `Dibatalkan` dengan `dibatalkanPenyewa = true`. Tanda ini membedakannya dari pembatalan otomatis, sehingga halaman bisa menulis "Anda membatalkan booking ini."

### `daftar()`

**Gunanya:** menyiapkan halaman Booking saya.

Semua booking milik penyewa, dari yang terbaru, masing-masing dalam bentuk `detail()`. Props `rekening` dan `terisi` sama dengan halaman Bayar, karena popup pembayaran di halaman ini memakai komponen yang sama.

### `query()` dan `milikSaya()`

`query()` adalah query dasar untuk semua fungsi di atas:

- `join` ke `lapangans` untuk nama, jenis, tarif, dan foto lapangan.
- `leftJoin` ke `pembayarans`. Kata `left` berarti booking tanpa pembayaran tetap ikut, dengan kolom pembayaran berisi `null`.
- `where('bookings.idPenyewa', Auth::id())`: hanya booking milik penyewa yang login.

`milikSaya($id)` memakai query itu untuk satu booking. Kalau tidak ditemukan, hasilnya 404. Penyewa tidak bisa membuka booking orang lain dengan mengganti nomor di alamat, karena booking orang lain memang tidak ada di hasil query-nya.

### `detail()`

**Gunanya:** mengubah satu baris database menjadi data yang dikirim ke halaman.

Beberapa isi yang perlu diperhatikan:

| Kunci | Isinya |
| --- | --- |
| `kode` | Kode tampilan, misalnya `BK-0012`. |
| `jamMulai`, `jamSelesai` | Dipotong menjadi `16:00` (tanpa detik). |
| `foto` | URL foto pertama lapangan, atau `null`. |
| `jamDiambil` | Benar kalau booking belum dibayar (atau buktinya ditolak) dan jamnya sudah ditahan booking lain. Halaman lalu menyembunyikan langkah transfer. |
| `batasBayar` | Batas waktu bayar dalam format ISO 8601, untuk hitung mundur di halaman. |
| `buktiUrl` | Alamat route privat `pembayaran.bukti`, bukan path file. |

Path file bukti tidak pernah dikirim ke browser. Browser hanya mendapat alamat route yang memeriksa hak akses sebelum memberikan file.

### `terisi()`

Jam yang ditahan dari hari ini sampai 29 hari ke depan, memakai `Pemesanan::tahanJam(...)`. Hanya kolom yang dibutuhkan halaman yang diambil, tanpa data penyewa lain.

### `rekening()`

Data rekening tujuan transfer dari `config/pembayaran.php`, yang membaca `BANK_*` di `.env`.

## Aturan di file ini

- Setiap fungsi yang membaca atau mengubah booking menjalankan `Pemesanan::batalkanKedaluwarsa()` lebih dulu, supaya statusnya selalu terbaru.
- Booking selalu diambil lewat `milikSaya()`, tidak pernah langsung dengan `DB::table('bookings')->find($id)`.
- Cek bentrok selalu di dalam transaksi, setelah baris lapangan dikunci.
- Pesan galat ditulis dalam Bahasa Indonesia di controller. Di layar ditulis "pengelola", bukan "admin".
- Jam dikirim ke server dalam bentuk `HH:MM`. Pesan untuk penyewa menulis jam dengan titik (08.00–22.00).

## FAQ

**Kenapa booking yang belum dibayar tidak menahan jam?**
Supaya orang yang hanya iseng membuat booking tidak menutup jam untuk penyewa lain. Jam baru ditahan setelah bukti dikirim. Kalau dua orang memesan jam yang sama, yang lebih dulu mengirim bukti yang mendapat jamnya.

**Apa yang terjadi kalau penyewa mentransfer, tetapi jamnya sudah diambil orang lain?**
Halaman sudah menyembunyikan langkah transfer saat `jamDiambil` benar, jadi seharusnya penyewa tidak mentransfer. Kalau kiriman bukti tetap ditolak karena bentrok, file buktinya dihapus dan penyewa diminta mengubah jadwal atau menghubungi pengelola.

**Kenapa `ubahJadwal` memakai `PATCH`, sedangkan yang lain `POST`?**
`PATCH` adalah kebiasaan untuk mengubah sebagian data yang sudah ada. Di React, halaman memanggilnya dengan `router.patch(...)`.

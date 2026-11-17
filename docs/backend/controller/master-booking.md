---
title: MasterBookingController.php
urutan: 6
---

# MasterBookingController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/MasterBookingController.php`
- **Jenis:** controller master data (PHP)
- **Dipakai oleh:** route Admin di [web.php](/backend/route/web) (grup `auth:admin`)
- **Berhubungan dengan:** [Pemesanan](/backend/support/pemesanan), [LogAktivitas](/backend/support/log-aktivitas), halaman [Master Booking](/frontend/admin/master-booking)
:::

## Ringkasan

Controller ini dipakai Admin untuk mengelola booking secara manual, misalnya booking yang diterima langsung di lokasi. Polanya sama dengan [MasterPenyewaController](./master-penyewa), ditambah cek jadwal bentrok, kunci lapangan, dan alasan wajib saat membatalkan.

| Route | Fungsi |
| --- | --- |
| `GET /tampilbooking` | `tampilData()` |
| `POST /insertbooking` | `insertData()` |
| `POST /updatebooking` | `updateData()` |
| `DELETE /deletebooking/{idhapus}` | `deleteDataBooking()` |

## Isi file

### `tampilData()`

1. `Pemesanan::batalkanKedaluwarsa()` dijalankan dulu, supaya status di tabel ini sama dengan halaman lain walaupun penjadwal belum berjalan.
2. Semua booking dikirim, ditambah kolom `tanpaBayar`.
3. Pilihan untuk form: penyewa (ID, nama, email, tanpa hash password), lapangan, dan Admin (ID dan nama).
4. `idAdminLogin`: ID Admin yang sedang login, supaya form Tambah langsung memilih Admin itu.

#### Kolom `tanpaBayar`

```php
->selectRaw("(bookings.status = 'Dikonfirmasi' and not exists (select 1 from pembayarans where ... and pembayarans.status = 'Terverifikasi')) as tanpaBayar")
```

Bernilai benar untuk booking `Dikonfirmasi` yang tidak punya pembayaran terverifikasi. Ini biasanya booking yang dikonfirmasi Admin lewat form tanpa melalui verifikasi bukti. Booking seperti ini mengisi jadwal, tetapi tidak menambah pemasukan di laporan. Tabel menampilkan keterangan "Tanpa pembayaran" di sampingnya.

```php
->map(fn ($b) => tap($b, fn ($b) => $b->tanpaBayar = (bool) $b->tanpaBayar));
```

`tap($nilai, $fungsi)` menjalankan fungsi pada nilai, lalu mengembalikan nilai itu. Di sini dipakai untuk mengubah `0`/`1` dari database menjadi `false`/`true`.

### `validasiBooking()`

**Gunanya:** satu aturan validasi untuk Tambah dan Edit.

| Field | Aturannya |
| --- | --- |
| `txtpenyewa`, `txtlapangan`, `txtadmin` | Wajib, dan harus ada di tabelnya (`exists:`). |
| `txttanggal` | Tanggal yang sah. Admin boleh mengisi tanggal yang sudah lewat, misalnya untuk mencatat booking yang terlupa. |
| `txtjammulai` | Salah satu dari `08:00` sampai `21:00`. |
| `txtjamselesai` | Salah satu dari `09:00` sampai `22:00`, dan setelah jam mulai. |
| `txttotal` | Angka bulat, minimal 0. |
| `txtstatus` | Salah satu dari `Pemesanan::STATUS`. |

```php
$jam = fn (int $dari, int $sampai) => array_map(fn ($h) => sprintf('%02d:00', $h), range($dari, $sampai));
```

Fungsi kecil ini membuat daftar jam. `$jam(8, 21)` menghasilkan `['08:00', '09:00', ..., '21:00']`. `Rule::in(...)` lalu memastikan jam yang dikirim ada di daftar itu.

Pesan galat menulis jam dengan titik (08.00), sedangkan nilai yang dikirim form tetap `08:00`.

### `isLapanganTerbooking()`

**Gunanya:** mengecek apakah jam itu sudah dipakai booking lain di lapangan dan tanggal yang sama.

- Kalau booking yang sedang disimpan berstatus `Dibatalkan`, cek dilewati. Booking batal tidak menahan jam.
- Booking lain yang `Dibatalkan` tidak dihitung.
- Booking yang sedang diedit dikecualikan, supaya tidak dianggap bentrok dengan dirinya sendiri.
- Syarat bertumpuk sama dengan di tempat lain: mulai sebelum yang lain selesai, dan selesai setelah yang lain mulai.

::: warning Beda dengan sisi penyewa
Di sini booking `Dipesan` tanpa bukti juga dihitung bentrok. Di sisi penyewa, booking seperti itu tidak menahan jam. Aturan yang lebih ketat ini disengaja: Admin tidak boleh menimpa booking penyewa yang sedang menunggu pembayaran.
:::

### `kunciDanCekJadwal()`

**Gunanya:** dijalankan di dalam transaksi simpan.

1. Kunci baris lapangan (`lockForUpdate`), sama seperti sisi penyewa.
2. Kalau lapangan sedang `Perbaikan`, tolak booking baru atau booking yang dipindah ke lapangan itu. Membatalkan booking tetap boleh.
3. Cek bentrok dengan `isLapanganTerbooking()`.

Galat dilempar dengan `ValidationException`, jadi muncul di bawah field Lapangan di sheet, bukan sebagai halaman galat.

Parameter `$lapanganBaru` bernilai benar untuk Tambah, dan untuk Edit hanya kalau lapangannya diganti. Dengan begitu, booking lama di lapangan yang kemudian masuk perbaikan masih bisa diedit, misalnya untuk dibatalkan.

### `insertData()`

1. Validasi.
2. Di dalam transaksi: kunci dan cek jadwal, simpan, lalu catat di log dengan kode booking baru (`BK-0012`).

Booking yang dibuat Admin tidak punya `created_at`. Akibatnya, booking ini tidak pernah kedaluwarsa otomatis dan tidak dihitung sebagai "booking masuk hari ini" di dashboard.

### `updateData()`

1. Validasi, ditambah `txtid`.
2. Ambil baris lama, 404 kalau tidak ada.
3. Kalau status berubah menjadi `Dibatalkan`, alasan wajib diisi (`txtalasanbatal`, maksimal 255 karakter).
4. Di dalam transaksi: kunci dan cek jadwal, perbarui, lalu catat di log. Alasan pembatalan disimpan di kolom `catatan` baris log, bukan di tabel booking.

Alasan hanya diminta saat status benar-benar berubah menjadi batal. Mengedit booking yang sudah batal tidak meminta alasan lagi.

### `deleteDataBooking()`

Hapus dan catat di log. Kalau booking sudah punya pembayaran, foreign key menolak, dan Admin melihat pesan "Booking tidak bisa dihapus karena masih memiliki data pembayaran." Untuk booking seperti itu, Admin sebaiknya mengubah statusnya menjadi `Dibatalkan`.

## Aturan di file ini

- Cek bentrok selalu di dalam transaksi, setelah baris lapangan dikunci.
- Daftar jam dan status diambil dari konstanta [Pemesanan](/backend/support/pemesanan), tidak ditulis ulang.
- Total bayar diisi otomatis di form (tarif × jam), tetapi tetap boleh diubah Admin. Server hanya memastikan angkanya sah.
- Membatalkan booking wajib dengan alasan, dan alasannya hanya disimpan di log.

## FAQ

**Kenapa booking yang dikonfirmasi Admin lewat form tidak masuk pemasukan laporan?**
Laporan menghitung uang yang benar-benar diterima, yaitu pembayaran `Terverifikasi`. Mengubah status booking tidak membuat pembayaran. Tanda "Tanpa pembayaran" membantu Admin melihat booking seperti ini.

**Bagaimana membatalkan booking yang sudah dibayar?**
Ubah statusnya menjadi `Dibatalkan` dan tulis alasannya. Jamnya langsung kosong lagi. Baris pembayarannya tetap ada, karena pembayaran terverifikasi bersifat final. Pengembalian uang dilakukan di luar aplikasi.

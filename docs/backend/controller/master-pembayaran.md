---
title: MasterPembayaranController.php
urutan: 7
---

# MasterPembayaranController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/MasterPembayaranController.php`
- **Jenis:** controller master data (PHP)
- **Dipakai oleh:** route Admin di [web.php](/backend/route/web). `awalPeriode()` dan `ringkasan()` juga dipakai [ManagerController](./manager).
- **Berhubungan dengan:** [KunciLaporan](/backend/support/kunci-laporan), [AdminDashboardController](./admin-dashboard) (`bukti()`), [LogAktivitas](/backend/support/log-aktivitas), halaman [Master Pembayaran](/frontend/admin/master-pembayaran)
:::

## Ringkasan

Controller ini dipakai Admin untuk melihat dan mengoreksi data pembayaran per bulan. Karena menyangkut uang, aturannya paling ketat di antara controller master:

- Status `Terverifikasi` hanya bisa didapat lewat tombol Terima di panel verifikasi, tidak lewat form ini.
- Pembayaran yang sudah `Terverifikasi` tidak bisa diubah statusnya.
- Pembayaran di bulan yang laporannya sudah diserahkan tidak bisa ditambah, diubah, atau dihapus.
- Satu booking hanya boleh punya satu pembayaran.

| Route | Fungsi |
| --- | --- |
| `GET /tampilpembayaran?periode=YYYY-MM` | `tampilData()` |
| `POST /insertpembayaran` | `insertData()` |
| `POST /updatepembayaran` | `updateData()` |
| `DELETE /deletepembayaran/{idhapus}` | `deleteDataPembayaran()` |

## Isi file

### Pesan tetap

- `PESAN_BUKTI`: dipakai saat path bukti tidak berada di folder `bukti/`.
- `PESAN_LEWAT_TERIMA`: dipakai saat form mencoba memberi status `Terverifikasi`.

### `awalPeriode()`

```php
return is_string($periode) && preg_match('/^(\d{4})-(0[1-9]|1[0-2])$/', $periode, $m)
    ? Carbon::create((int) $m[1], (int) $m[2], 1)
    : today()->startOfMonth();
```

Membaca `?periode=2026-10` menjadi tanggal 1 Oktober 2026. Regex ini hanya menerima 4 angka tahun, tanda hubung, lalu bulan 01 sampai 12. `$m` berisi bagian yang tertangkap: `$m[1]` tahun dan `$m[2]` bulan. Kalau isinya tidak sah atau kosong, dipakai bulan ini.

### `ringkasan()`

Menghitung jumlah dan total rupiah untuk setiap status (`terverifikasi`, `menunggu`, `ditolak`). Fungsi ini dipakai juga halaman Pembayaran Manager.

### `tampilData()`

Props yang dikirim:

| Props | Isinya |
| --- | --- |
| `datapembayaran` | Baris pembayaran bulan itu, apa adanya dari database. |
| `bukti` | Baris yang sama dalam bentuk `AdminDashboardController::bukti()`, untuk panel verifikasi saat baris diklik. |
| `periode` | Bulan dan tahun yang dibuka. |
| `terkunci` | Benar kalau laporan bulan itu sudah diserahkan. Halaman lalu menonaktifkan Tambah, Edit, dan Hapus. |
| `databooking` | Pilihan booking di form: kode, nama penyewa, lapangan, tanggal. |
| `dataadmin`, `datamanager` | Hanya ID dan nama. |
| `ringkasan`, `laporan`, `namaLaporan` | Masih dikirim untuk tes lama, walaupun halaman sekarang tidak menampilkan widget ringkasan. |

### `insertData()`

**Logikanya:**

1. Validasi:
   - `txtbooking` harus ada di tabel `bookings`
   - `txtbukti` (kalau diisi) harus diawali `bukti/` dan tidak boleh berisi `..`
   - `txtstatus` hanya `Menunggu Verifikasi` atau `Ditolak`
   - `txtalasan` wajib kalau statusnya `Ditolak` (`required_if:txtstatus,Ditolak`).
2. Tolak kalau bulan tanggal bayar sudah terkunci.
3. Tolak kalau booking itu sudah punya pembayaran.
4. Simpan dan catat di log.
5. `return back()`: kembali ke halaman sebelumnya, jadi `?periode=` yang sedang dibuka tetap terjaga.

#### Kenapa path bukti dibatasi?

Disk `local` juga menyimpan PDF laporan. Tanpa batasan `bukti/` dan larangan `..`, seseorang bisa mengisi path seperti `laporan/...` atau `../.env`, lalu membukanya lewat route bukti. [BuktiBayarController](./bukti-bayar) juga mengecek hal yang sama, sebagai lapisan kedua.

### `updateData()`

**Logikanya:**

1. Validasi, sama dengan Tambah, tetapi `txtstatus` hanya dicek sebagai teks.
2. Tolak kalau booking yang dipilih sudah punya pembayaran lain.
3. Ambil baris lama, 404 kalau tidak ada.
4. Cek kunci untuk **dua** tanggal: tanggal bayar lama dan tanggal bayar baru. Pembayaran tidak boleh dipindah keluar dari bulan yang terkunci, dan tidak boleh dipindah masuk ke bulan yang terkunci.
5. Kalau status lama `Terverifikasi`, status baru harus tetap `Terverifikasi`.
6. Kalau status baru `Terverifikasi` tetapi status lama bukan, tolak dengan `PESAN_LEWAT_TERIMA`.
7. Simpan dan catat di log.

```php
foreach (array_filter([$lama['tglBayar'] ?? null, $data['tglBayar']]) as $tgl) {
```

`array_filter` tanpa fungsi membuang nilai kosong (`null`, `''`). Jadi perulangan hanya mengecek tanggal yang benar-benar ada.

Pembayaran terverifikasi masih bisa dikoreksi jumlah, tanggal, atau buktinya selama bulannya belum terkunci. Yang tidak bisa diubah hanya statusnya.

### `deleteDataPembayaran()`

1. Ambil baris lama, 404 kalau tidak ada.
2. Tolak kalau bulannya terkunci.
3. Hapus dan catat di log.
4. Kalau pembayaran masih dirujuk tabel laporan, foreign key menolak dan Admin melihat pesan galat.

## Aturan di file ini

- `Terverifikasi` hanya lewat `AdminDashboardController::terima()`. Hanya fungsi itu yang mengecek bentrok jam dan mengubah booking menjadi `Dikonfirmasi`.
- Setiap perubahan dicek ke [KunciLaporan](/backend/support/kunci-laporan) lebih dulu.
- Galat yang menyangkut field dikirim dengan `back()->withErrors([...])`, supaya muncul di bawah field di sheet.
- Setelah simpan, kembali dengan `back()`, bukan `redirect('/tampilpembayaran')`, supaya bulan yang dibuka tidak berubah. Hanya hapus yang gagal karena foreign key yang kembali ke alamat tetap.

## FAQ

**Admin salah menerima bukti. Bagaimana memperbaikinya?**
Status pembayarannya tidak bisa diubah. Ubah status booking menjadi `Dibatalkan` di halaman Booking (dengan alasan), supaya jamnya kosong lagi. Uang dikembalikan di luar aplikasi.

**Laporan bulan itu sudah diserahkan, tetapi ada pembayaran yang salah. Bagaimana?**
Minta Manager mengirim permintaan revisi. Selama permintaan revisi terbuka, kunci bulan itu dibuka. Setelah data diperbaiki, Admin membuat ulang laporannya, dan kuncinya aktif lagi.

**Kenapa ada dua bentuk data pembayaran, `datapembayaran` dan `bukti`?**
`datapembayaran` adalah baris mentah untuk tabel dan form. `bukti` sudah digabung dengan booking, penyewa, dan lapangan, lalu dibentuk untuk panel verifikasi, termasuk cek bentrok jam.

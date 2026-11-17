---
title: AdminDashboardController.php
urutan: 2
---

# AdminDashboardController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/AdminDashboardController.php`
- **Jenis:** controller (PHP)
- **Dipakai oleh:** route Admin di [web.php](/backend/route/web). `dataHariIni()` dan `bukti()` juga dipakai [ManagerController](/backend/controller/manager) dan [MasterPembayaranController](/backend/controller/master-pembayaran).
- **Berhubungan dengan:** halaman [Dashboard Admin](/frontend/admin/dashboard-admin), [DrawerVerifikasi](/frontend/komponen/drawer-verifikasi), [Pemesanan](/backend/support/pemesanan), [LogAktivitas](/backend/support/log-aktivitas)
:::

## Ringkasan

Controller ini menyiapkan dashboard Admin dan menjalankan dua keputusan terpenting Admin: **menerima** dan **menolak** bukti bayar. Bagian ini juga menyimpan kapan lonceng notifikasi terakhir dibuka.

| Route | Fungsi | Gunanya |
| --- | --- | --- |
| `GET /dashboard-admin` | `index()` | Halaman dashboard Admin. |
| `POST /verifikasi/{id}/terima` | `terima()` | Menerima bukti: pembayaran `Terverifikasi`, booking `Dikonfirmasi`. |
| `POST /verifikasi/{id}/tolak` | `tolak()` | Menolak bukti dengan alasan. |
| `POST /notifikasi/dibaca` | `tandaiNotifikasiDibaca()` | Menandai notifikasi sudah dibaca (Admin dan Manager). |

## Isi file

### `index()`

```php
return Inertia::render('Dashboard/Admin', [...$this->dataHariIni($request), 'terbaru' => $this->terbaru()]);
```

`...` (spread) menuang isi array `dataHariIni()` ke array props, lalu menambah `terbaru`. Halaman Pemantauan Manager memakai `dataHariIni()` yang sama, tanpa `terbaru`.

### `dataHariIni()`

**Gunanya:** semua data "hari ini" untuk dashboard Admin dan Pemantauan Manager.

**Logikanya:**

1. Batalkan booking kedaluwarsa, supaya angka dan antrean sudah bersih.
2. Baca `?tanggal=YYYY-MM-DD`. Tanggal ini hanya mengganti kartu Jadwal. Angka di kartu statistik tetap untuk hari ini. Tanggal yang tidak sah, misalnya `2026-02-30`, diabaikan dan diganti hari ini.
3. Ambil jadwal untuk dua keperluan:
   - `jadwalHariIni`: hanya hari ini, untuk angka statistik.
   - `jadwal`: dari 7 hari sebelum sampai 30 hari setelah tanggal yang dipilih. Dengan begitu, Admin bisa pindah hari di browser tanpa meminta data lagi ke server.
4. Hitung angka statistik.
5. Susun antrean verifikasi dan tugas lain.

#### Jadwal yang ditampilkan

```php
->where(fn ($q) => $q->whereIn('bookings.status', Pemesanan::STATUS_MENAHAN_JAM)
    ->orWhere(fn ($q) => $q->where('bookings.status', 'Dipesan')->where('pembayarans.status', 'Menunggu Verifikasi')))
```

Jadwal hanya menampilkan booking yang menahan jam: `Dikonfirmasi`, atau `Dipesan` dengan bukti yang menunggu verifikasi. Booking yang belum dibayar tidak tampil, karena bisa ada banyak di jam yang sama dan belum tentu jadi.

`where(fn ($q) => ...)` membungkus syarat dalam tanda kurung. Hasilnya `(status IN (...) OR (status = 'Dipesan' AND pembayaran = 'Menunggu Verifikasi'))`. Tanpa bungkus ini, `OR` bisa bercampur dengan syarat tanggal di luarnya.

#### Angka statistik (`stat`)

| Kunci | Artinya |
| --- | --- |
| `jamTerisi` / `jamTotal` | Jam terkonfirmasi hari ini dibanding jam buka semua lapangan (jumlah lapangan × 14). |
| `bookingMasuk` | Booking yang dibuat penyewa hari ini, menurut `created_at`. |
| `bookingMasukBatal` | Berapa dari booking itu yang sudah batal. |
| `bookingMasukBelumBayar` | Berapa yang masih `Dipesan` tanpa bukti. |
| `terverifikasiJumlah` / `terverifikasiN` | Rupiah dan jumlah bukti yang diterima hari ini, menurut `diverifikasiPada`. |

```php
'terverifikasiJumlah' => (int) (clone $verifikasiHariIni)->sum('jumlahBayar'),
'terverifikasiN' => (clone $verifikasiHariIni)->count(),
```

`clone` membuat salinan query sebelum dipakai. Query Laravel bisa berubah saat dijalankan, jadi satu query yang dipakai dua kali sebaiknya disalin dulu.

#### Antrean verifikasi

Semua bukti `Menunggu Verifikasi`, diurutkan dari yang paling lama dikirim (antrean siapa cepat dia dapat). Bukti lama tanpa `dikirimPada` ditaruh paling bawah oleh `orderByRaw('pembayarans.dikirimPada IS NULL')`. Setiap baris dibentuk oleh `bukti()`.

### `bukti()`

**Gunanya:** satu baris bukti dalam bentuk yang dibaca [DrawerVerifikasi](/frontend/komponen/drawer-verifikasi). Fungsinya `public static`, supaya halaman Pembayaran dan Pemantauan bisa memakai bentuk yang sama.

Isi yang perlu diperhatikan:

- `bentrokDengan`: kode booking lain yang sudah `Dikonfirmasi` di jam yang sama, atau `null`. Kalau terisi, tombol Terima dinonaktifkan dan alasannya ditampilkan.
- `menitTunggu`: berapa menit bukti sudah menunggu, dihitung hanya di jam buka (`Pemesanan::menitOperasional`). Bukti yang dikirim pukul 21.50 lalu dicek pukul 08.10 besoknya dihitung 30 menit, bukan 10 jam lebih.
- `buktiBayar`: alamat route privat, bukan path file.
- `buktiPdf`: benar kalau filenya PDF. Bukti lama boleh PDF, bukti baru hanya gambar.

#### Cek bentrok

```php
->where('jamMulai', '<', $p->jamSelesai)->where('jamSelesai', '>', $p->jamMulai)
```

Dua rentang jam bertumpuk kalau yang satu mulai sebelum yang lain selesai, dan selesai setelah yang lain mulai. Contoh: 16.00–18.00 dan 17.00–19.00 bertumpuk (16 < 19 dan 18 > 17). Sedangkan 16.00–18.00 dan 18.00–20.00 tidak bertumpuk, karena 18 > 18 salah.

### `terbaru()`

16 booking terakhir untuk kartu Booking terbaru, termasuk nomor HP penyewa untuk tombol Chat WA. Tab status (Semua, Dipesan, dan seterusnya) disaring di browser.

### `tugasLain()`

**Gunanya:** daftar "Tugas lain" di kartu Perlu tindakan. Hanya tugas yang memang ada yang dimasukkan.

1. **Laporan perlu revisi:** laporan yang diminta revisi Manager dan belum diperiksa. Selalu paling atas.
2. **Laporan bulan lalu:** kalau belum ada PDF-nya:
   - masih ada bukti bulan itu yang menunggu, jadi tugasnya "tertahan" dengan tombol Tinjau ke bukti pertama
   - semua bukti sudah diproses, jadi tugasnya "siap dibuat" dengan tombol Buat ke halaman Laporan.
3. **Bukti ditolak belum dikirim ulang:** booking `Dipesan` dengan pembayaran `Ditolak` yang tanggal mainnya belum lewat. Booking seperti ini tidak kedaluwarsa otomatis, jadi Admin perlu menghubungi penyewa atau membatalkannya.

`translatedFormat('F')` dengan `locale('id')` menulis nama bulan dalam Bahasa Indonesia, misalnya "Oktober".

::: tip Catatan kecil
Di atas `tugasLain()` ada dua komentar dokumentasi. Komentar pertama (tentang "Tugas lain") seharusnya ada di atas `tugasLain()`, tetapi letaknya terdorong ke atas `bukti()`. Ini hanya soal letak komentar dan tidak memengaruhi cara kerja.
:::

### `terima()`

**Gunanya:** Admin menerima bukti bayar.

**Logikanya:** semua langkah ada di dalam satu transaksi.

1. Ambil data pembayaran dan bookingnya dengan `pembayaran()`. Kalau tidak ada, 404.
2. `belumBisaDiputuskan()`: tolak kalau pembayaran sudah diproses atau booking tidak `Dipesan`.
3. Kunci baris lapangan, supaya dua Admin yang menerima jam yang sama di detik yang sama tidak sama-sama lolos.
4. Cek bentrok dengan booking `Dikonfirmasi` lain. Kalau bentrok, minta Admin menolak bukti ini.
5. Ubah pembayaran menjadi `Terverifikasi` (kosongkan alasan tolak, catat Admin dan waktu verifikasi).
6. Ubah booking menjadi `Dikonfirmasi`.
7. Catat di log aktivitas dengan perubahan dari dan ke.

Transaksinya mengembalikan `['success' => ...]` atau `['error' => ...]`, lalu `back()->with($hasil)` mengirimnya sebagai flash. Halaman menampilkannya sebagai toast hijau atau merah.

### `tolak()`

**Gunanya:** Admin menolak bukti bayar.

1. Alasan wajib diisi, maksimal 500 karakter. Penyewa perlu tahu apa yang salah sebelum mengirim ulang.
2. Cek yang sama dengan `terima()`.
3. Ubah pembayaran menjadi `Ditolak` dengan alasannya, lalu catat di log. Booking tetap `Dipesan`.

Pesan suksesnya dikirim sebagai `error` supaya toast-nya merah. Ini disengaja, karena penolakan perlu terlihat berbeda dari penerimaan.

Setelah ditolak, jamnya dilepas. Penyewa bisa mengirim bukti baru, dan baris pembayaran yang sama akan dipakai lagi.

### `pembayaran()` dan `belumBisaDiputuskan()`

`pembayaran()` mengambil satu pembayaran beserta booking dan nama penyewanya. `belumBisaDiputuskan()` mengembalikan pesan alasan kalau pembayaran tidak boleh diputuskan lagi, atau `null` kalau boleh.

```php
if ($pesan = $this->belumBisaDiputuskan($p)) {
    return ['error' => $pesan];
}
```

Baris ini mengisi `$pesan` dan langsung mengeceknya. Kalau isinya teks, berarti ada alasan menolak, dan fungsi berhenti.

### `tandaiNotifikasiDibaca()`

Mengisi `notifDibacaPada` dengan waktu sekarang, di tabel `admins` atau `managers` sesuai siapa yang login. Disimpan per akun, jadi berlaku di semua perangkat.

## Aturan di file ini

- Status `Terverifikasi` hanya bisa didapat lewat `terima()`. Form Edit Pembayaran tidak menawarkan status itu.
- Setiap keputusan dicatat di [log aktivitas](/backend/support/log-aktivitas) di dalam transaksi yang sama. Kalau pencatatan gagal, keputusannya juga dibatalkan.
- `terima()` mengunci baris lapangan sebelum mengecek bentrok, sama seperti saat penyewa membuat booking.
- Admin yang memutuskan diambil dari `Auth::guard('admin')->id()`, bukan dari isi form.

## FAQ

**Kenapa bukti bisa ditolak, padahal jamnya sudah ditahan?**
Bukti yang menunggu verifikasi memang menahan jam supaya penyewa lain tidak mengambilnya. Kalau Admin menolak, tahanan itu lepas. Penyewa bisa mengirim bukti baru, tetapi kalau sementara itu jamnya sudah ditahan orang lain, kiriman barunya ditolak dan penyewa diminta menghubungi pengelola.

**Kenapa Terima bisa dinonaktifkan karena bentrok?**
Data lama atau booking yang diisi Admin lewat form bisa membuat dua booking di jam yang sama. Kalau salah satunya sudah `Dikonfirmasi`, booking lainnya tidak boleh ikut dikonfirmasi. Admin perlu menolak bukti itu atau memindahkan bookingnya.

**Apa bedanya `jadwalHariIni` dan `jadwal`?**
`jadwalHariIni` selalu hari ini dan dipakai untuk angka. `jadwal` mencakup beberapa minggu di sekitar tanggal yang dipilih, untuk kartu Jadwal yang bisa digeser per hari.

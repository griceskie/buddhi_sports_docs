---
title: NotifikasiAdmin.php
urutan: 7
---

# NotifikasiAdmin.php

::: info Tentang file ini
- **Lokasi:** `app/Support/NotifikasiAdmin.php`
- **Jenis:** kelas pembantu (PHP)
- **Dipakai oleh:** [HandleInertiaRequests](/backend/route/handle-inertia-requests) (props bersama `pengelola.notifikasi`)
- **Ditampilkan oleh:** lonceng di `Components/pengelola/NotifikasiHeader.tsx`
:::

## Ringkasan

Kelas ini menyusun isi lonceng notifikasi di header panel Admin, paling banyak 5 baris. Ada empat sumber notifikasi:

| Sumber | Judul di lonceng | Dibuka ke |
| --- | --- | --- |
| Bukti bayar yang menunggu verifikasi | "Bukti bayar baru · nama penyewa" | Dashboard, dengan panel verifikasi langsung terbuka |
| Laporan yang diperiksa Manager dalam 7 hari terakhir | "Laporan sudah diperiksa Manager" | Halaman Laporan pembayaran |
| Laporan yang diminta revisi dalam 7 hari terakhir | "Laporan perlu revisi" | Halaman Laporan, langsung di bulan itu |
| Booking mendatang yang dibatalkan penyewa | "Booking dibatalkan · nama penyewa" | Halaman Booking |

Versi Manager ada di [NotifikasiManager](./notifikasi-manager), yang memakai bentuk data yang sama.

## Isi file

### `untuk()`

Fungsi ini mengumpulkan keempat sumber, menggabungkannya, lalu memotongnya menjadi 5 baris. Setiap baris berbentuk:

```php
[
    'id' => 'bayar-12',          // unik, dipakai sebagai key di React
    'jenis' => 'bayar',           // menentukan ikon: bayar, laporan, batal
    'judul' => 'Bukti bayar baru · Rina Wulandari',
    'ket' => 'BK-0012 · Airlangga',
    'waktu' => '2026-11-17T14:05:00+07:00',   // atau null
    'href' => '...',              // halaman yang dibuka saat diklik
    'baru' => true,               // tampil tebal dengan titik
]
```

#### Sumber 1: bukti bayar menunggu

```php
$bayar = DB::table('pembayarans')
    ->join('bookings', 'bookings.idBooking', '=', 'pembayarans.idBooking')
    ->join('penyewas', 'penyewas.idPenyewa', '=', 'bookings.idPenyewa')
    ->join('lapangans', 'lapangans.idLapangan', '=', 'bookings.idLapangan')
    ->where('pembayarans.status', 'Menunggu Verifikasi')
    ->orderByDesc('pembayarans.dikirimPada')
    ->limit(self::BATAS)
    ->get([/* ... */])
    ->map(fn ($r) => [ /* ... */ 'href' => route('dashboard.admin', ['bukti' => $r->idPembayaran]), /* ... */ ]);
```

- Tiga `join` mengambil nama penyewa dan nama lapangan sekaligus.
- `route('dashboard.admin', ['bukti' => 12])` menghasilkan `/dashboard-admin?bukti=12`. Dashboard membaca `?bukti=` dan langsung membuka panel verifikasi untuk bukti itu.
- Sebuah bukti dianggap baru kalau dikirim setelah Admin terakhir membuka lonceng (`admins.notifDibacaPada`).

#### Sumber 2 dan 3: laporan

Laporan yang diperiksa Manager dan laporan yang diminta revisi, masing-masing dalam 7 hari terakhir (`now()->subDays(7)`). Keduanya tidak pernah ditandai baru, karena sifatnya informasi.

Untuk revisi, alamatnya menyertakan bulannya, misalnya `/tampillaporanpembayaran?periode=2026-10`. `sprintf('%04d-%02d', 2026, 10)` menulis angka dengan nol di depan sampai panjangnya pas.

#### Sumber 4: booking dibatalkan penyewa

Booking dengan `dibatalkanPenyewa = true` yang tanggal mainnya hari ini atau nanti. Tabel booking tidak menyimpan kapan pembatalan terjadi, jadi `waktu`-nya `null`. Karena itu baris-baris ini selalu ditaruh paling bawah.

#### Menggabungkan dan memotong

```php
$bertanggal = $bayar->concat($laporan)->concat($revisi)->sortByDesc('waktu')->values();
$daftar = $bertanggal->concat($batal)->take(self::BATAS)->values()->all();
```

1. Gabungkan sumber yang punya waktu, lalu urutkan dari yang terbaru.
2. Tambahkan booking batal di belakangnya.
3. Ambil 5 teratas.

`concat` menyambung dua Collection. `values()` merapikan nomor urutnya. `all()` mengubah Collection menjadi array biasa.

#### Angka "baru"

```php
'baru' => DB::table('pembayarans')->where('status', 'Menunggu Verifikasi')
    ->when($dibaca, fn ($q) => $q->where('dikirimPada', '>', $dibaca))->count(),
```

Angka di lonceng menghitung semua bukti menunggu yang dikirim setelah lonceng terakhir dibuka, bukan hanya 5 yang tampil. `when($dibaca, ...)` menambah syarat waktu hanya kalau Admin pernah membuka lonceng. Kalau belum pernah, semua bukti menunggu dihitung.

## Aturan di file ini

- Bentuk setiap baris (`id`, `jenis`, `judul`, `ket`, `waktu`, `href`, `baru`) harus sama dengan versi Manager. Komponen lonceng di React memakai bentuk itu untuk kedua peran.
- `id` harus unik di seluruh daftar. Karena itu ada awalan per sumber: `bayar-`, `laporan-`, `revisi-`, `batal-`.
- Jam ditulis dengan titik (16.00–18.00), sesuai aturan EYD proyek.

## FAQ

**Kenapa booking yang dibatalkan otomatis tidak masuk notifikasi?**
Pembatalan otomatis adalah hal rutin dan tidak perlu ditindaklanjuti. Yang perlu Admin tahu adalah booking yang sengaja dibatalkan penyewa, karena jamnya kembali kosong.

**Bagaimana titik di lonceng hilang?**
Saat Admin membuka lonceng, halaman mengirim `POST /notifikasi/dibaca`. `AdminDashboardController::tandaiNotifikasiDibaca` mengisi `notifDibacaPada` dengan waktu sekarang, sehingga semua yang lebih lama tidak lagi dianggap baru.

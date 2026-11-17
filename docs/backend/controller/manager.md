---
title: ManagerController.php
urutan: 3
---

# ManagerController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/ManagerController.php`
- **Jenis:** controller (PHP)
- **Dipakai oleh:** route Manager di [web.php](/backend/route/web) (grup `auth:manager`)
- **Berhubungan dengan:** [AdminDashboardController](./admin-dashboard), [MasterPembayaranController](./master-pembayaran), [AnalitikBisnis](/backend/support/analitik-bisnis), [LogAktivitas](/backend/support/log-aktivitas), halaman di [Manager](/frontend/manager/pemantauan)
:::

## Ringkasan

Controller ini berisi seluruh panel Manager. Manager hanya melihat data operasional (pembayaran, lapangan, jadwal), lalu bertindak di dua hal: memeriksa laporan bulanan dan mengelola akun Admin.

| Route | Fungsi | Halaman atau tindakan |
| --- | --- | --- |
| `GET /dashboard-manager` | `dashboard()` | Pemantauan |
| `GET /manager/analisis` | `analisis()` | Analisis bisnis |
| `GET /manager/pembayaran` | `pembayaran()` | Pembayaran (hanya lihat) |
| `GET /manager/lapangan` | `lapangan()` | Lapangan (hanya lihat) |
| `GET /manager/laporan` | `laporanPembayaran()` | Laporan pembayaran |
| `POST /manager/laporan/{id}/diperiksa` | `tandaiDiperiksa()` | Menandai laporan sudah diperiksa |
| `POST /manager/laporan/{id}/revisi` | `mintaRevisi()` | Meminta Admin merevisi laporan |
| `GET /manager/admin` | `admin()` | Data admin |
| `POST /manager/admin` | `tambahAdmin()` | Menambah Admin |
| `PUT /manager/admin/{id}/password` | `resetPasswordAdmin()` | Mereset password Admin |
| `DELETE /manager/admin/{id}` | `hapusAdmin()` | Menghapus Admin |

## Isi file

### `dashboard()`: Pemantauan

```php
return Inertia::render('Manager/Pemantauan', [
    ...app(AdminDashboardController::class)->dataHariIni($request),
    'aktivitas' => $this->aktivitasHariIni(),
]);
```

Pemantauan adalah cermin dashboard Admin tanpa tombol tindakan. Datanya diambil dari `dataHariIni()` milik [AdminDashboardController](./admin-dashboard), jadi angka keduanya selalu sama.

`app(AdminDashboardController::class)` meminta Laravel membuatkan objek controller itu. Cara ini lebih aman daripada `new AdminDashboardController`, karena Laravel mengisi kebutuhan objek itu sendiri.

Halaman ini memperbarui diri setiap 30 detik (polling di React). Polling hanya meminta props hari ini, bukan seluruh halaman.

### `aktivitasHariIni()`

Menggabungkan dua sumber:

- bukti bayar yang dikirim penyewa hari ini (dari `pembayarans.dikirimPada`)
- tindakan di log aktivitas hari ini, paling banyak 30 baris.

Keduanya dibentuk sama (`id`, `waktu`, `siapa`, `peran`, `aksi`, `teks`, `catatan`), digabung, diurutkan dari yang terbaru, lalu dipotong menjadi 30.

```php
'peran' => $r->peran ?? ($r->idAdmin ? 'admin' : 'sistem'),
```

Baris log lama belum punya kolom `peran`. Untuk baris itu, peran ditebak dari `idAdmin`: terisi berarti Admin, kosong berarti Sistem. `??` berarti "pakai nilai kiri kalau tidak null, kalau null pakai nilai kanan".

`LogAktivitas::KATA_KERJA` mengubah kode aksi menjadi kata kerja, misalnya `terima` menjadi "menerima".

### `analisis()`

1. Validasi isi query string. Nilai yang sah untuk `jenis` dan `tab` diambil dari konstanta [AnalitikBisnis](/backend/support/analitik-bisnis), sehingga daftarnya hanya ditulis di satu tempat.
2. `(new AnalitikBisnis)->halaman($q)` menghitung semuanya.

`'in:'.implode(',', AnalitikBisnis::JENIS)` menghasilkan aturan `in:bulan,kuartal,tahun,rentang`.

### `pembayaran()`

Semua pembayaran di satu bulan. Bulannya dibaca oleh `MasterPembayaranController::awalPeriode($request)` dari `?periode=YYYY-MM`, sama dengan halaman Pembayaran Admin.

Setiap baris dibentuk oleh `AdminDashboardController::bukti()`, ditambah alasan tolak dan waktu verifikasi. Karena bentuknya sama, halaman Manager bisa memakai [DrawerVerifikasi](/frontend/komponen/drawer-verifikasi) dalam mode `hanyaLihat`.

`ringkasan` (jumlah dan rupiah per status) dihitung oleh `MasterPembayaranController::ringkasan()`.

### `lapangan()`

Untuk setiap lapangan, dihitung:

| Kunci | Artinya |
| --- | --- |
| `pemasukan` | Pemasukan terverifikasi bulan lalu, menurut tanggal bayar. |
| `terisi` | Persen jam terisi bulan lalu, dibulatkan 1 angka di belakang koma. |
| `hariIni` | Jumlah booking dan jam terkonfirmasi hari ini. |
| `depan` | Jumlah booking terkonfirmasi setelah hari ini, sampai 30 hari ke depan. |

Bulan lalu dipakai karena bulan itu sudah selesai, jadi angkanya tidak berubah lagi.

```php
->groupBy('bookings.idLapangan')->selectRaw('bookings.idLapangan as id, SUM(pembayarans.jumlahBayar) as rp')->pluck('rp', 'id');
```

Query ini menjumlah pemasukan per lapangan di database. `pluck('rp', 'id')` membuat daftar dengan ID lapangan sebagai kunci dan rupiah sebagai nilai, misalnya `[1 => 2400000, 2 => 1850000]`.

`(array) $l + [...]` mengubah baris lapangan menjadi array, lalu menambah kunci baru.

### `laporanPembayaran()`

Mengirim semua laporan (terbaru dulu) dan `menunggu`: ID laporan **terlama** yang sudah diserahkan, belum diperiksa, dan tidak sedang direvisi. Laporan ini muncul di kotak peringatan di atas tabel.

Laporan diurutkan dari yang terbaru, jadi `->last()` mengambil yang terlama. `?->idLaporan` berarti "ambil `idLaporan` kalau ada, kalau tidak ada hasilnya `null`".

### `tandaiDiperiksa()`

1. Ambil laporan, 404 kalau tidak ada.
2. Tolak kalau laporan belum punya PDF.
3. Kalau belum diperiksa: isi `diperiksaPada`, kosongkan catatan revisi, dan catat di log.

Sejak diperiksa, laporan terkunci. Admin tidak bisa membuat ulang, mengedit, atau menghapusnya. Pembayaran di bulan itu juga terkunci (lihat [KunciLaporan](/backend/support/kunci-laporan)).

Kalau laporannya sudah diperiksa, fungsi ini tidak mengubah apa-apa, tetapi tetap mengembalikan pesan sukses. Menekan tombolnya dua kali tidak menimbulkan galat.

### `mintaRevisi()`

1. Catatan wajib diisi, maksimal 500 karakter.
2. Tolak kalau laporan sudah diperiksa atau belum punya PDF.
3. Isi `catatanRevisi` dan `revisiPada`, lalu catat di log. Catatan di log dipotong menjadi 255 karakter, sesuai panjang kolomnya.

Selama permintaan revisi terbuka, kunci pembayaran bulan itu dibuka, supaya Admin bisa memperbaiki data. Permintaan revisi selesai saat Admin membuat ulang laporan atau Manager menandainya diperiksa.

### `admin()`

Daftar Admin dengan tiga keterangan tambahan:

- `aktivitasTerakhir`: waktu baris log terakhir milik Admin itu.
- `pembayaran`, `laporan`, `booking`: berapa baris di setiap tabel yang masih mencatat Admin itu.

Angka-angka ini menjelaskan kenapa sebuah Admin tidak bisa dihapus. Halaman menonaktifkan tombol Hapus selama salah satunya lebih dari 0.

```php
$hitung = fn (string $tabel) => DB::table($tabel)->whereNotNull('idAdmin')->groupBy('idAdmin')->selectRaw('idAdmin, COUNT(*) as n')->pluck('n', 'idAdmin');
[$pembayaran, $laporan, $booking] = [$hitung('pembayarans'), $hitung('laporan_pembayarans'), $hitung('bookings')];
```

`$hitung` adalah fungsi kecil yang dipakai tiga kali untuk tiga tabel. Baris kedua menjalankannya dan membongkar hasilnya ke tiga variabel sekaligus.

### `tambahAdmin()`

Validasi nama, username unik, dan password sesuai `Password::defaults()` (minimal 8 karakter). Password disimpan sebagai hash dengan `Hash::make()`. Log hanya mencatat nama dan username.

### `resetPasswordAdmin()`

Mengganti password Admin. Log hanya mencatat "Diganti", tidak pernah isi password.

Route Manager memakai middleware `auth.session`, jadi setelah password direset, sesi Admin itu berakhir pada permintaan berikutnya. Admin harus masuk lagi dengan password baru.

### `hapusAdmin()`

```php
try {
    DB::transaction(function () { /* hapus + catat log */ });
} catch (QueryException $e) {
    return back()->with('error', 'Admin tidak bisa dihapus karena masih tercatat di booking, pembayaran, atau laporan.');
}
```

Kalau Admin masih dirujuk tabel lain lewat foreign key, database menolak penghapusan dan Laravel melempar `QueryException`. `catch` menangkapnya dan mengubahnya menjadi pesan yang bisa dibaca. Karena hapus dan catat log ada di satu transaksi, log tidak tertulis kalau penghapusan gagal.

### `laporan()`

Query dasar laporan: semua kolom yang dibutuhkan halaman, ditambah nama Admin pembuatnya. Memakai `leftJoin`, jadi laporan tetap tampil walaupun Admin pembuatnya tidak ada.

## Aturan di file ini

- Manager tidak mengubah booking atau pembayaran. Data operasional di panel Manager hanya untuk dilihat.
- Setiap tindakan Manager (periksa, revisi, tambah, reset, hapus) dicatat di log di dalam transaksi yang sama.
- Isi password tidak pernah dicatat di log atau dikirim ke halaman.
- Bentuk data yang juga dipakai Admin (bukti, ringkasan, data hari ini) diambil dari controller Admin, tidak ditulis ulang di sini.

## FAQ

**Kenapa Manager tidak bisa menerima atau menolak bukti?**
Pembagian tugasnya begitu: Admin mengurus operasional harian, Manager mengawasi. Pemantauan menunjukkan bukti yang sudah terlalu lama menunggu, supaya Manager bisa menegur Admin, tetapi keputusannya tetap di Admin.

**Kalau Admin lupa password, siapa yang mereset?**
Manager, lewat halaman Data admin. Kalau Manager yang lupa password, aplikasi tidak punya peran di atasnya. Password Manager direset dari server dengan `php artisan manager:reset-password {username}` (lihat [console.php](/backend/route/console)).

**Bagaimana cara menghapus Admin yang sudah pernah bekerja?**
Tidak bisa, selama namanya masih tercatat di booking, pembayaran, atau laporan. Ini disengaja, supaya riwayat tetap utuh. Cukup ganti password-nya kalau Admin itu tidak boleh masuk lagi.

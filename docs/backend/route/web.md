---
title: routes/web.php
urutan: 1
---

# routes/web.php

::: info Tentang file ini
- **Lokasi:** `routes/web.php`
- **Jenis:** daftar rute (PHP)
- **Berhubungan dengan:** semua controller di `app/Http/Controllers/`, [routes/auth.php](./auth)
:::

## Ringkasan

File ini adalah daftar semua alamat halaman di Buddhi Sports, kecuali login, daftar, dan reset password penyewa (yang ada di `routes/auth.php`). Setiap baris menghubungkan satu alamat dengan satu fungsi di controller.

Rute dikelompokkan menurut siapa yang boleh membukanya: tamu, penyewa, Admin, Manager, atau gabungan Admin dan Manager. Pengelompokan ini adalah lapisan keamanan pertama. Penyewa yang mencoba membuka `/tampilbooking`, misalnya, sudah ditolak sebelum controller dijalankan.

## Posisinya dalam alur

Setiap permintaan dari browser masuk ke sini lebih dulu. Laravel mencocokkan alamat dan metode (GET, POST, dan seterusnya), menjalankan middleware kelompoknya, lalu memanggil fungsi controller. Lihat [Cara aplikasi bekerja](/mulai/cara-kerja) untuk gambaran lengkapnya.

## Isi file

### Halaman depan

```php
Route::get('/', fn () => Inertia::render('Landing'));
```

Alamat `/` langsung menampilkan halaman `Pages/Landing.tsx` tanpa controller. `fn () => ...` adalah fungsi pendek, karena halaman ini tidak butuh data. Halaman ini sementara, sampai landing page sungguhan selesai dirancang.

### Kelompok penyewa: booking dan bayar

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [BookingPenyewaController::class, 'home'])->name('dashboard');
    Route::get('/booking', [BookingPenyewaController::class, 'daftar'])->name('booking');
    Route::post('/booking', [BookingPenyewaController::class, 'store'])->name('booking.store');
    Route::get('/booking/{idBooking}/bayar', [BookingPenyewaController::class, 'bayar'])->whereNumber('idBooking')->name('booking.bayar');
    Route::post('/booking/{idBooking}/bukti', [BookingPenyewaController::class, 'unggahBukti'])->whereNumber('idBooking')->name('booking.bukti');
    Route::post('/booking/{idBooking}/batal', [BookingPenyewaController::class, 'batal'])->whereNumber('idBooking')->name('booking.batal');
    Route::patch('/booking/{idBooking}/jadwal', [BookingPenyewaController::class, 'ubahJadwal'])->whereNumber('idBooking')->name('booking.jadwal');
});
```

- `auth` berarti hanya penyewa yang sudah login. Guard bawaan (`web`) adalah penyewa.
- `verified` mengecek verifikasi email. Model `Penyewa` tidak memakai fitur verifikasi email, jadi pengecekan ini selalu lolos.
- Ada dua rute dengan alamat yang sama, `/booking`. `GET /booking` membuka halaman Booking saya, sedangkan `POST /booking` menyimpan booking baru. Laravel membedakannya dari metode permintaan.
- `{idBooking}` adalah ID booking di alamat. `whereNumber` menolak alamat seperti `/booking/abc/bayar`.
- Semua fungsi ada di [BookingPenyewaController](/backend/controller/booking-penyewa).

| Alamat | Gunanya |
| --- | --- |
| `GET /dashboard` | Home penyewa: pilih lapangan, tanggal, dan jam. |
| `GET /booking` | Booking saya: daftar booking milik penyewa. |
| `POST /booking` | Menyimpan booking baru. |
| `GET /booking/{id}/bayar` | Halaman Konfirmasi dan bayar. |
| `POST /booking/{id}/bukti` | Mengunggah bukti transfer. |
| `POST /booking/{id}/batal` | Penyewa membatalkan booking sendiri. |
| `PATCH /booking/{id}/jadwal` | Penyewa mengubah tanggal atau jam. |

### Kelompok penyewa: profil

```php
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
```

Halaman Profile penyewa. Rute hapus akun (`DELETE /profile`) masih ada, tetapi tombolnya sengaja dimatikan di halaman. Lihat [ProfileController](/backend/controller/profile).

### Login pengelola

```php
Route::middleware('guest')->group(function () {
    Route::get('/login-pengelola', [PengelolaAuthenticatedSessionController::class, 'create'])->name('login.pengelola');
    Route::post('/login-pengelola', [PengelolaAuthenticatedSessionController::class, 'store']);
});
Route::get('/login-pengelola/status', [PengelolaAuthenticatedSessionController::class, 'status'])
    ->middleware('throttle:30,1')->name('login.pengelola.status');
Route::post('/logout-pengelola', [PengelolaAuthenticatedSessionController::class, 'destroy'])->name('logout.pengelola');
```

- `guest` berarti halaman login hanya untuk yang belum login.
- `/login-pengelola/status` dipakai panel pratinjau di halaman login. Rute ini publik, jadi dibatasi `throttle:30,1`: paling banyak 30 permintaan per menit dari satu alamat IP.
- Fungsinya dijelaskan di [halaman controller login pengelola](/backend/controller/pengelola-login).

### Bukti transfer privat

```php
Route::get('/pembayaran/{idPembayaran}/bukti', [BuktiBayarController::class, 'tampil'])
    ->middleware('auth:web,admin,manager')->whereNumber('idPembayaran')->name('pembayaran.bukti');
```

`auth:web,admin,manager` berarti boleh dibuka siapa saja yang login, apa pun perannya. Pengecekan yang lebih rinci (penyewa hanya boleh membuka bukti miliknya sendiri) ada di [BuktiBayarController](/backend/controller/bukti-bayar).

### Kelompok Admin dan Manager bersama

```php
Route::middleware(['auth:admin,manager', 'auth.session'])->group(function () {
    Route::get('/profile-pengelola', [PengelolaProfileController::class, 'edit'])->name('profile.pengelola');
    // ... ubah profil dan password
    Route::post('/notifikasi/dibaca', [AdminDashboardController::class, 'tandaiNotifikasiDibaca'])->name('notifikasi.dibaca');
    Route::get('/log-aktivitas', [LogAktivitasController::class, 'tampilData'])->name('log.aktivitas');
    Route::post('/log-aktivitas/periksa', [LogAktivitasController::class, 'periksa'])->name('log.aktivitas.periksa');
    Route::get('/laporanpembayaran/{idLaporan}/pdf', [LaporanPembayaranController::class, 'unduh'])->whereNumber('idLaporan')->name('laporan.pdf');
});
```

- Fitur yang dipakai kedua peran: profil, tanda notifikasi sudah dibaca, log aktivitas, dan membuka PDF laporan.
- `auth.session` mengakhiri sesi kalau password akun diganti dari tempat lain. Contohnya, setelah Manager mereset password seorang Admin, Admin itu otomatis keluar pada permintaan berikutnya.
- Log aktivitas sengaja tidak punya rute ubah atau hapus.

### Kelompok Admin

```php
Route::middleware(['auth:admin', 'auth.session'])->group(function () {
    Route::get('/dashboard-admin', [AdminDashboardController::class, 'index'])->name('dashboard.admin');
    Route::post('/verifikasi/{idPembayaran}/terima', [AdminDashboardController::class, 'terima'])->whereNumber('idPembayaran')->name('verifikasi.terima');
    Route::post('/verifikasi/{idPembayaran}/tolak', [AdminDashboardController::class, 'tolak'])->whereNumber('idPembayaran')->name('verifikasi.tolak');
    Route::post('/laporanpembayaran/buat', [LaporanPembayaranController::class, 'buat'])->name('laporan.buat');

    Route::get('/tampilpenyewa', [MasterPenyewaController::class, 'tampilData']);
    Route::delete('/deletepenyewa/{idhapus}', [MasterPenyewaController::class, 'deleteDataPenyewa']);
    Route::post('/insertpenyewa', [MasterPenyewaController::class, 'insertData']);
    Route::post('/updatepenyewa', [MasterPenyewaController::class, 'updateData']);
    // ... pola yang sama untuk lapangan, booking, pembayaran, laporan pembayaran
});
```

Data master (penyewa, lapangan, booking, pembayaran, laporan pembayaran) memakai pola alamat yang sama:

| Alamat | Metode | Fungsi controller |
| --- | --- | --- |
| `/tampil{data}` | GET | `tampilData` — halaman tabel beserta form sheet |
| `/insert{data}` | POST | `insertData` — simpan data baru |
| `/update{data}` | POST | `updateData` — simpan perubahan (ID dikirim di isian `txtid`) |
| `/delete{data}/{idhapus}` | DELETE | `deleteData{Data}` — hapus |

Pola nama ini berasal dari templat awal proyek, jadi sebagian rute data master tidak diberi `->name()`. Halaman React memanggilnya dengan alamat langsung, misalnya `post('/insertpenyewa')`.

Rute hapus memakai metode `DELETE`, bukan `GET`. Kalau memakai `GET`, sebuah tautan atau gambar di halaman lain bisa menghapus data tanpa sengaja. `DELETE` hanya bisa dikirim lewat form dengan token CSRF.

Komentar di file ini mengingatkan bahwa Admin sengaja tidak punya rute untuk data Admin dan Manager.

### Kelompok Manager

```php
Route::middleware(['auth:manager', 'auth.session'])->group(function () {
    Route::get('/dashboard-manager', [ManagerController::class, 'dashboard'])->name('dashboard.manager');
    Route::get('/manager/analisis', [ManagerController::class, 'analisis'])->name('manager.analisis');
    // ... pembayaran, lapangan, laporan (hanya lihat)
    Route::post('/manager/laporan/{idLaporan}/diperiksa', [ManagerController::class, 'tandaiDiperiksa'])->name('manager.laporan.diperiksa');
    Route::post('/manager/laporan/{idLaporan}/revisi', [ManagerController::class, 'mintaRevisi'])->name('manager.laporan.revisi');
    Route::get('/manager/admin', [ManagerController::class, 'admin'])->name('manager.admin');
    Route::post('/manager/admin', [ManagerController::class, 'tambahAdmin'])->name('manager.admin.tambah');
    Route::put('/manager/admin/{idAdmin}/password', [ManagerController::class, 'resetPasswordAdmin'])->name('manager.admin.password');
    Route::delete('/manager/admin/{idAdmin}', [ManagerController::class, 'hapusAdmin'])->name('manager.admin.hapus');
});
```

Manager hanya bisa melihat pembayaran, lapangan, dan laporan. Yang bisa diubah Manager hanya dua hal: status pemeriksaan laporan (diperiksa atau minta revisi) dan akun Admin. Semua fungsinya ada di [ManagerController](/backend/controller/manager).

### Rute login penyewa

```php
require __DIR__.'/auth.php';
```

Baris terakhir memuat [routes/auth.php](./auth), yang berisi login, daftar, dan reset password penyewa.

## Aturan di file ini

- Setiap rute baru masuk ke kelompok middleware yang sesuai perannya. Jangan membuat rute Admin di luar kelompok `auth:admin`.
- Rute yang mengubah data memakai `POST`, `PATCH`, `PUT`, atau `DELETE`, tidak pernah `GET`.
- Tambahkan `->whereNumber(...)` untuk setiap parameter ID.
- Beri nama (`->name(...)`) untuk rute baru, supaya halaman React bisa memanggilnya dengan `route('nama')`.
- Pola alamat data master (`/tampil...`, `/insert...`) dipertahankan untuk data master yang sudah ada. Untuk fitur baru, pakai alamat yang lebih deskriptif seperti rute Manager.

## FAQ

**Bagaimana melihat semua rute beserta middleware-nya?**
Jalankan `php artisan route:list`. Tambahkan `--path=manager` untuk menyaring rute yang alamatnya mengandung "manager".

**Kenapa Admin yang membuka `/dashboard` (Home penyewa) diarahkan ke `/login`?**
Kelompok penyewa memakai guard `web`. Login Admin memakai guard `admin`, jadi bagi guard `web`, Admin dianggap belum login.

**Apakah satu browser bisa login sebagai penyewa dan Admin sekaligus?**
Bisa, karena guard-nya berbeda. Tetapi keduanya berbagi satu sesi, sehingga Log Out di satu peran ikut mengeluarkan peran lain. Saat menguji, pakai browser atau jendela incognito yang berbeda untuk tiap peran.

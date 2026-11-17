---
title: HandleInertiaRequests.php
urutan: 6
---

# HandleInertiaRequests.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Middleware/HandleInertiaRequests.php`
- **Jenis:** middleware (PHP)
- **Berhubungan dengan:** [app.tsx](/frontend/dasar/app), [types/index.d.ts](/frontend/dasar/types), [NotifikasiAdmin](/backend/support/notifikasi-admin), [NotifikasiManager](/backend/support/notifikasi-manager)
:::

## Ringkasan

Middleware ini berjalan di setiap permintaan Inertia. Tugasnya menambahkan *props bersama*, yaitu data yang dikirim ke semua halaman tanpa perlu ditulis ulang di setiap controller. Contohnya: siapa yang sedang login, jumlah notifikasi, titik merah di menu penyewa, dan pesan sukses atau gagal.

## Posisinya dalam alur

Controller memanggil `Inertia::render('Halaman', [...])`. Sebelum dikirim ke browser, Inertia menggabungkan data dari controller dengan isi fungsi `share()` di file ini. Di React, props bersama dibaca dengan `usePage().props`.

## Isi file

### `$rootView`

```php
protected $rootView = 'app';
```

Nama view Blade yang menjadi wadah halaman pada kunjungan pertama, yaitu `resources/views/app.blade.php`.

### `share()`

Fungsi ini mengembalikan array props bersama. Banyak isinya ditulis sebagai fungsi (*closure*), misalnya `fn () => ...`. Alasannya dua:

- Nilainya baru dihitung saat benar-benar dikirim, setelah middleware `auth:admin` atau `auth:manager` memilih guard. Jadi `$request->user()` sudah mengembalikan akun yang benar.
- Saat *partial reload* (`router.reload({ only: [...] })`), props yang tidak diminta tidak dihitung sama sekali.

#### `auth`

```php
'auth' => ['user' => $request->user()],
```

Akun yang sedang login: penyewa, Admin, atau Manager, tergantung guard rute. Kosong (`null`) untuk tamu.

#### `pengelola`

```php
'pengelola' => function () use ($request) {
    $user = $request->user();
    if ($user instanceof Admin) {
        return [
            'role' => 'admin',
            'nama' => $user->namaAdmin,
            'username' => $user->username,
            'menungguVerifikasi' => DB::table('pembayarans')->where('status', 'Menunggu Verifikasi')->count(),
            'notifikasi' => NotifikasiAdmin::untuk($user),
        ];
    }
    if ($user instanceof Manager) {
        return [ /* role manager, nama, username, laporanBelumDiperiksa, notifikasi */ ];
    }
    return null;
},
```

- `instanceof` mengecek jenis akun. Admin dan Manager mendapat data yang berbeda.
- `menungguVerifikasi` adalah angka di badge menu Pembayaran pada sidebar Admin.
- `laporanBelumDiperiksa` adalah angka di badge menu Laporan pada sidebar Manager. Yang dihitung: laporan yang sudah punya PDF tetapi belum diperiksa.
- `notifikasi` berisi daftar lonceng notifikasi di header. Isinya disusun oleh [NotifikasiAdmin](/backend/support/notifikasi-admin) atau [NotifikasiManager](/backend/support/notifikasi-manager).
- Untuk penyewa dan tamu, nilainya `null`.

#### `temaPanel`

```php
'temaPanel' => fn () => $request->user() instanceof Admin || $request->user() instanceof Manager || $request->routeIs('login.pengelola'),
```

`true` untuk halaman Admin, Manager, dan halaman login pengelola. Nilai ini menentukan apakah tema panel pengelola (warna dan gaya dari `resources/css/admin.css`) dipasang. Pemasangnya ada di `app.blade.php` dan [app.tsx](/frontend/dasar/app).

#### `perluTindakan`

```php
'perluTindakan' => function () use ($request) {
    $user = $request->user();
    if (! $user instanceof Penyewa) {
        return 0;
    }
    return DB::table('bookings')
        ->leftJoin('pembayarans', 'pembayarans.idBooking', '=', 'bookings.idBooking')
        ->where('bookings.idPenyewa', $user->idPenyewa)
        ->where('bookings.status', 'Dipesan')
        ->where('bookings.tanggal', '>=', today()->toDateString())
        ->where(fn ($q) => $q->whereNull('pembayarans.idPembayaran')->orWhere('pembayarans.status', 'Ditolak'))
        ->count();
},
```

Jumlah booking milik penyewa yang masih perlu ditindaklanjuti. Angka ini menyalakan titik merah di tombol menu akun dan angka di menu Booking saya.

Booking dihitung kalau memenuhi semua syarat berikut:

1. Milik penyewa yang sedang login.
2. Statusnya `Dipesan`.
3. Tanggal mainnya hari ini atau nanti.
4. Belum punya pembayaran sama sekali, atau pembayarannya `Ditolak`.

`leftJoin` dipakai, bukan `join`, supaya booking yang belum punya baris pembayaran tetap ikut. Kolom pembayarannya bernilai `null`, dan itu yang dicek `whereNull`.

`where(fn ($q) => ...->orWhere(...))` membungkus dua syarat "atau" di dalam kurung. Tanpa pembungkus itu, `orWhere` akan berlaku untuk seluruh query dan hasilnya salah.

#### `waPengelola`

```php
'waPengelola' => fn () => $request->user() instanceof Penyewa ? config('pengelola.wa') : null,
```

Nomor WhatsApp untuk tautan "Hubungi pengelola". Hanya dikirim ke penyewa.

#### `flash`

```php
'flash' => Inertia::always(fn () => [
    'error' => session('error'),
    'success' => session('success'),
]),
```

Pesan sekali tampil dari controller (`->with('success', '...')`). [app.tsx](/frontend/dasar/app) menampilkannya sebagai toast.

`Inertia::always` berarti props ini tetap dikirim walaupun halaman hanya meminta sebagian props (*partial reload*). Tanpa `always`, halaman menyimpan nilai `flash` yang lama, dan toast yang sama muncul dua kali.

## Aturan di file ini

- Hanya taruh di sini data yang benar-benar dibutuhkan banyak halaman. Data untuk satu halaman dikirim dari controller-nya.
- Bungkus nilai yang perlu query dengan `fn () => ...` atau `function () use ($request) {...}`, supaya tidak dihitung kalau tidak diminta.
- Jangan kirim data rahasia. Ingat, `auth.user` ikut terkirim ke browser. Kolom `password` disembunyikan oleh `$hidden` di model (untuk penyewa juga `remember_token`).
- Kalau menambah props bersama, tambahkan juga tipenya di `resources/js/types/index.d.ts`.

## FAQ

**Bagaimana membaca props bersama di React?**
`const { perluTindakan, waPengelola } = usePage<PageProps>().props;`

**Kenapa angka badge kadang tidak langsung berubah?**
Props bersama dihitung ulang setiap kali halaman berpindah atau dimuat ulang. Kalau kamu tidak berpindah halaman, angka lama tetap tampil. Halaman Pemantauan Manager meminta data baru setiap 30 detik.

**Apakah `password` ikut terkirim di `auth.user`?**
Tidak. Model `Penyewa`, `Admin`, dan `Manager` mendaftarkan `password` di `$hidden` (`Penyewa` juga `remember_token`), jadi kolom itu dibuang saat data diubah menjadi JSON.

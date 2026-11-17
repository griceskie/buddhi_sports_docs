---
title: Model lain
urutan: 1
---

# Model lain

::: info Tentang halaman ini
- **Lokasi:** `app/Models/` (`Admin.php`, `Manager.php`, `Lapangan.php`, `Booking.php`, `Pembayaran.php`, `LaporanPembayaran.php`, `User.php`)
- **Jenis:** model Eloquent (PHP)
- **Lihat juga:** [Penyewa.php](/backend/model/penyewa), yang dijelaskan di halamannya sendiri
:::

## Ringkasan

Setiap tabel utama punya satu model. Bentuknya hampir sama, jadi dijelaskan bersama di halaman ini.

Hampir semua query di proyek ini memakai `DB::table(...)`, bukan model. Model terutama dipakai untuk dua hal:

- **login**: `Admin`, `Manager`, dan `Penyewa` dipakai guard Laravel
- **seeder dan tes**: misalnya `Admin::whereIn(...)` di DemoSeeder.

## Pola yang sama di semua model

```php
class Booking extends Model
{
    protected $primaryKey = 'idBooking';
    public $timestamps = false;
    protected $fillable = [ ... ];
    ...relasi...
}
```

| Bagian | Artinya |
| --- | --- |
| `$primaryKey` | Nama kolom ID: `idAdmin`, `idManager`, `idLapangan`, `idBooking`, `idPembayaran`, `idLaporan`. |
| `$timestamps = false` | Tabel tidak punya `created_at` dan `updated_at` bawaan Laravel. `bookings.created_at` ada, tetapi ditambahkan dan diisi sendiri oleh controller. |
| `$fillable` | Kolom yang boleh diisi sekaligus. |
| `$hidden` | Hanya di model yang dipakai login: `password` tidak ikut saat model diubah ke JSON. |

## Model per model

### `Admin` dan `Manager`

Keduanya `extends Authenticatable`, sehingga bisa dipakai login. Guard `admin` memakai `Admin`, dan guard `manager` memakai `Manager` (lihat `config/auth.php`).

- `$fillable`: nama (`namaAdmin` atau `namaManager`), `username`, `password`.
- `$hidden`: `password`.
- Relasi `Admin`: `laporanPembayarans()`, `pembayarans()`, `bookings()`. Relasi `Manager`: `laporanPembayarans()`.

[PengelolaProfileController](/backend/controller/pengelola-profile) memakai `instanceof Admin` untuk tahu siapa yang sedang login.

### `Lapangan`

Relasi `bookings()`: satu lapangan punya banyak booking.

Kolom `foto` berisi teks JSON berupa daftar path. Model tidak mengubahnya otomatis. [FotoLapangan](/backend/support/foto-lapangan) yang membacanya.

### `Booking`

Relasi:

- `penyewa()`, `lapangan()`, `admin()`: `belongsTo`, yaitu booking ini milik satu penyewa, satu lapangan, dan (opsional) satu Admin.
- `pembayaran()`: `hasOne`, yaitu satu booking punya paling banyak satu pembayaran.

### `Pembayaran`

Relasi `admin()` dan `booking()`.

### `LaporanPembayaran`

Relasi `manager()`, `admin()`, dan `pembayaran()`.

### `User`

Model bawaan Laravel, dengan tabel `users`. Aplikasi tidak memakainya. Hanya dua tes bawaan Breeze yang masih memakainya (`EmailVerificationTest` dan `PasswordUpdateTest`).

## Arti relasi

| Relasi | Artinya | Contoh |
| --- | --- | --- |
| `hasMany` | Satu punya banyak | Satu lapangan punya banyak booking. |
| `hasOne` | Satu punya satu | Satu booking punya satu pembayaran. |
| `belongsTo` | Milik satu | Satu booking milik satu penyewa. |

Parameter kedua dan ketiga di setiap relasi adalah nama kolom, karena kolom proyek ini tidak memakai nama bawaan Laravel (`booking_id`, `id`):

```php
return $this->belongsTo(Penyewa::class, 'idPenyewa', 'idPenyewa');
```

## Aturan

- Model baru mengikuti pola yang sama: `$primaryKey` dengan awalan `id`, `$timestamps = false`, dan `$fillable`.
- Query data di controller tetap memakai `DB::table(...)`, sesuai kebiasaan proyek.

## FAQ

**Relasi di model tidak dipakai. Apakah boleh dihapus?**
Jangan dihapus tanpa alasan. Relasi tidak memberatkan apa pun, dan berguna kalau suatu saat ada kode yang memakai Eloquent, misalnya di tes.

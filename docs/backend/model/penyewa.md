---
title: Penyewa.php
urutan: 1
---

# Penyewa.php

::: info Tentang file ini
- **Lokasi:** `app/Models/Penyewa.php`
- **Jenis:** model Eloquent (PHP)
- **Dipakai oleh:** guard `web` (login penyewa), [RegisteredUserController](/backend/controller/registered-user), [ProfileController](/backend/controller/profile), [MasterPenyewaController](/backend/controller/master-penyewa) (aturan No HP), tes (`Penyewa::factory()`)
- **Model lain:** dijelaskan bersama di [Model lain](/kelompok/model-lain)
:::

## Ringkasan

Model ini mewakili tabel `penyewas`. Penyewa adalah satu-satunya model yang benar-benar sering dipakai sebagai objek, karena Laravel butuh model untuk login. Sebagian besar query lain di proyek ini memakai `DB::table(...)`.

File ini juga menyimpan satu aturan penting: format No HP.

## Isi file

### Kelas induk

```php
class Penyewa extends Authenticatable
{
    use HasFactory, Notifiable;
```

- `Authenticatable` (sebenarnya kelas `User` bawaan Laravel yang diberi nama lain) membuat model ini bisa dipakai untuk login: punya password, sesi, dan "ingat saya".
- `HasFactory` memungkinkan tes membuat penyewa palsu dengan `Penyewa::factory()->create()`. Pembuatnya ada di `database/factories/PenyewaFactory.php`.
- `Notifiable` memungkinkan pengiriman email, misalnya tautan reset password.

### Aturan No HP

```php
public const ATURAN_NO_HP = 'regex:/^08\d{8,11}$/';
public const PESAN_NO_HP = 'Nomor HP harus diawali 08 dan berisi 10–13 angka.';
```

Regex `^08\d{8,11}$` berarti:

| Bagian | Artinya |
| --- | --- |
| `^` | Mulai dari awal teks. |
| `08` | Dua karakter pertama harus `08`. |
| `\d{8,11}` | Lalu 8 sampai 11 angka. Totalnya 10 sampai 13 angka. |
| `$` | Sampai akhir teks, tanpa karakter lain. |

Jadi `081234567890` lolos, sedangkan `+6281234567890`, `0812-3456-7890`, dan `8123456789` tidak lolos.

No HP disimpan sebagai angka saja, supaya tautan Chat WA di dashboard Admin selalu benar. Aturan ini dipakai di tiga tempat: Register, Profile penyewa, dan form Penyewa milik Admin. Karena disimpan sebagai konstanta, ketiganya selalu sama.

### Kunci dan kolom

```php
protected $primaryKey = 'idPenyewa';
public $timestamps = false;
```

- Kunci utamanya `idPenyewa`, bukan `id` bawaan Laravel.
- `timestamps = false`: tabel ini tidak punya kolom `created_at` dan `updated_at`, jadi Laravel tidak boleh mengisinya.

Semua model di proyek ini memakai dua pengaturan ini.

### `$fillable` dan `$hidden`

- `$fillable`: kolom yang boleh diisi sekaligus lewat `create([...])` atau `fill([...])`. Kolom lain diabaikan, sehingga orang tidak bisa menyelipkan kolom tambahan lewat form.
- `$hidden`: kolom yang tidak ikut saat model diubah menjadi JSON. Karena itu, `auth.user` di props bersama tidak pernah membawa hash password.

### `bookings()`

```php
public function bookings()
{
    return $this->hasMany(Booking::class, 'idPenyewa', 'idPenyewa');
}
```

Relasi "satu penyewa punya banyak booking". Relasi ini disediakan, tetapi kode aplikasi saat ini membaca booking dengan `DB::table('bookings')->where('idPenyewa', ...)`.

## Aturan di file ini

- Aturan format data penyewa yang dipakai di beberapa tempat disimpan sebagai konstanta di model ini.
- Kolom baru yang diisi lewat Register atau Profile harus ditambahkan ke `$fillable`.
- Kolom rahasia harus ditambahkan ke `$hidden`.

## FAQ

**Kenapa model ini dipakai, padahal controller master memakai `DB::table`?**
Login Laravel (`Auth::login`, `Auth::user`, reset password) bekerja dengan model. Untuk data biasa, proyek ini mengikuti template awal yang memakai query builder.

**Masih ada `app/Models/User.php`. Apakah dipakai?**
Hanya oleh dua tes bawaan Breeze yang tersisa. Aplikasi sendiri tidak memakainya.

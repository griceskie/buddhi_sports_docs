---
title: FotoLapangan.php
urutan: 6
---

# FotoLapangan.php

::: info Tentang file ini
- **Lokasi:** `app/Support/FotoLapangan.php`
- **Jenis:** kelas pembantu (PHP)
- **Dipakai oleh:** [MasterLapanganController](/backend/controller/master-lapangan), [BookingPenyewaController](/backend/controller/booking-penyewa), [LogAktivitas](./log-aktivitas), [routes/console.php](/backend/route/console)
:::

## Ringkasan

Setiap lapangan bisa punya sampai 6 foto. File fotonya disimpan di disk `public` (`storage/app/public/lapangan/`), dan alamat filenya disimpan sebagai teks JSON di kolom `lapangans.foto`. Contoh isi kolom itu:

```json
["lapangan/aB3k9.webp", "lapangan/Zq81m.webp"]
```

Kelas ini membaca isi kolom itu dengan aman dan mengubahnya menjadi alamat yang bisa dipakai di tag `<img>`.

## Isi file

### `MAKS`

```php
public const MAKS = 6;
```

Jumlah foto paling banyak per lapangan. Dipakai di validasi form Lapangan.

### `paths()`

```php
public static function paths(?string $json): array
{
    return array_values(array_filter(json_decode($json ?? '[]', true) ?: [], 'is_string'));
}
```

Mengubah isi kolom `foto` menjadi daftar path. Baca dari dalam ke luar:

1. `$json ?? '[]'`: kalau kolomnya kosong (`null`), anggap daftar kosong.
2. `json_decode(..., true)`: ubah teks JSON menjadi array PHP.
3. `?: []`: kalau JSON-nya rusak dan hasilnya `null`, pakai array kosong.
4. `array_filter(..., 'is_string')`: buang isi yang bukan teks.
5. `array_values(...)`: rapikan nomor urut array mulai dari 0 lagi.

Hasilnya selalu berupa daftar, tidak pernah galat, walaupun isi kolomnya aneh.

### `url()` dan `urls()`

```php
public static function url(string $path): string
{
    return '/storage/'.ltrim($path, '/');
}

public static function urls(?string $json): array
{
    return array_map([self::class, 'url'], self::paths($json));
}
```

- `url()` mengubah path `lapangan/aB3k9.webp` menjadi alamat `/storage/lapangan/aB3k9.webp`. Alamat ini bisa dibuka browser karena folder `public/storage` adalah tautan ke `storage/app/public` (dibuat dengan `php artisan storage:link`).
- `urls()` melakukan hal yang sama untuk semua foto sebuah lapangan.

Alamatnya sengaja relatif (diawali `/`, tanpa nama host). Fungsi bawaan `Storage::url()` memakai `APP_URL` dari `.env`, misalnya `http://localhost`. Kalau aplikasi dibuka di alamat lain, misalnya `http://127.0.0.1:8000`, foto dengan alamat lengkap itu tidak tampil. Alamat relatif selalu mengikuti alamat yang sedang dibuka.

## Aturan di file ini

- Simpan path relatif (`lapangan/...`) di database, bukan alamat lengkap.
- Untuk menampilkan foto, selalu pakai `FotoLapangan::urls()`, bukan `Storage::url()`.
- Foto lapangan boleh publik. Bukti transfer dan PDF laporan tidak boleh memakai cara ini, karena keduanya privat.

## FAQ

**Foto tidak tampil di browser. Apa yang salah?**
Kemungkinan besar tautan `public/storage` belum dibuat. Jalankan `php artisan storage:link` sekali.

**Kenapa foto disimpan sebagai JSON, bukan di tabel sendiri?**
Jumlahnya sedikit (paling banyak 6), selalu dibaca bersama lapangannya, dan tidak perlu dicari satu per satu. Satu kolom JSON cukup dan lebih sederhana.

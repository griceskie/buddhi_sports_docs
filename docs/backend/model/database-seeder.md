---
title: DatabaseSeeder.php
urutan: 2
---

# DatabaseSeeder.php

::: info Tentang file ini
- **Lokasi:** `database/seeders/DatabaseSeeder.php`
- **Jenis:** seeder (PHP)
- **Dijalankan oleh:** `php artisan migrate:fresh --seed` atau `php artisan db:seed`
- **Dipanggil juga oleh:** [DemoSeeder](./demo-seeder)
:::

## Ringkasan

Seeder adalah kelas yang mengisi database dengan data awal. File ini mengisi data dasar yang selalu dibutuhkan aplikasi:

- satu Manager: Jarwo, username `Manager1`
- satu Admin: Budi, username `Admin1`
- empat lapangan.

Password akun ada di `PRD.md`, bagian Appendices. Data contoh untuk pengujian (penyewa, booking, pembayaran) ada di [DemoSeeder](./demo-seeder), bukan di sini.

## Isi file

### `run()`

**Logikanya:**

1. Buat Manager `Manager1` kalau belum ada.
2. Buat Admin `Admin1` kalau belum ada.
3. Untuk setiap lapangan di daftar, buat kalau namanya belum ada.

| Lapangan | Jenis | Tarif per jam |
| --- | --- | --- |
| Airlangga | Bulu Tangkis | Rp50.000 |
| Cendrawasih | Bulu Tangkis | Rp50.000 |
| Garuda | Bulu Tangkis | Rp50.000 |
| Merpati | Basket | Rp100.000 |

```php
foreach ([
    ['Airlangga', 'Bulu Tangkis', 50000],
    // ...
] as [$nama, $jenis, $tarif]) {
```

`as [$nama, $jenis, $tarif]` membongkar setiap baris daftar langsung ke tiga variabel.

Password disimpan sebagai hash dengan `Hash::make(...)`, sama seperti akun yang dibuat lewat aplikasi.

## Aturan di file ini

- Setiap baris dicek dulu dengan `exists()`, jadi seeder ini aman dijalankan berkali-kali tanpa membuat data ganda.
- Hanya data yang dibutuhkan aplikasi untuk berjalan yang masuk ke sini. Data contoh masuk ke `DemoSeeder`.

## FAQ

**Apa bedanya `migrate:fresh --seed` dan `db:seed`?**
`migrate:fresh --seed` menghapus semua tabel, membuatnya ulang, lalu menjalankan seeder. Semua data hilang. `db:seed` hanya menjalankan seeder di database yang sudah ada, dan karena seeder ini memeriksa data lebih dulu, tidak ada yang tergandakan.

**Nama lapangan di database berbeda dengan contoh di PR booking lama. Mana yang benar?**
Yang di file ini (Airlangga, Cendrawasih, Garuda, Merpati). Seeder dari PR lama memakai nama lain dan tidak dipakai.

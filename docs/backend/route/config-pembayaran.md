---
title: config/pembayaran.php
urutan: 4
---

# config/pembayaran.php

::: info Tentang file ini
- **Lokasi:** `config/pembayaran.php`
- **Jenis:** pengaturan (PHP)
- **Berhubungan dengan:** `.env`, [Pemesanan.php](/backend/support/pemesanan), [BookingPenyewaController](/backend/controller/booking-penyewa)
:::

## Ringkasan

File ini menyimpan dua hal: rekening tujuan transfer yang ditampilkan ke penyewa, dan batas waktu bayar. Semua nilainya dibaca dari `.env`, jadi bisa diubah tanpa menyentuh kode.

## Posisinya dalam alur

Kode lain membaca nilai di sini dengan fungsi `config()`. Contohnya `config('pembayaran.batas_bayar_menit')` atau `config('pembayaran.bank')`.

## Isi file

```php
return [
    'bank' => env('BANK_NAMA', 'BCA'),
    'nomor_rekening' => env('BANK_NO_REKENING', '0000000000'),
    'atas_nama' => env('BANK_ATAS_NAMA', 'Buddhi Sports'),

    'batas_bayar_menit' => (int) env('BATAS_BAYAR_MENIT', 60),
];
```

- File config di Laravel mengembalikan satu array. Nama file (`pembayaran`) menjadi awalan saat dibaca: `config('pembayaran.bank')`.
- `env('BANK_NAMA', 'BCA')` membaca `BANK_NAMA` dari `.env`. Kalau tidak ada, nilai bawaannya `BCA`.
- `(int)` mengubah nilai dari `.env` (selalu berupa teks) menjadi angka.

| Kunci | Variabel `.env` | Bawaan | Dipakai untuk |
| --- | --- | --- | --- |
| `bank` | `BANK_NAMA` | BCA | Nama bank di kartu rekening halaman bayar. |
| `nomor_rekening` | `BANK_NO_REKENING` | 0000000000 | Nomor rekening yang bisa disalin penyewa. |
| `atas_nama` | `BANK_ATAS_NAMA` | Buddhi Sports | Nama pemilik rekening. |
| `batas_bayar_menit` | `BATAS_BAYAR_MENIT` | 60 | Menit sejak booking dibuat sampai booking tanpa bukti dibatalkan otomatis. |

`batas_bayar_menit` dipakai di dua tempat:

- `Pemesanan::batasBayar()` menghitung jam batas yang ditampilkan ke penyewa, termasuk hitung mundurnya.
- `Pemesanan::batalkanKedaluwarsa()` membatalkan booking yang melewati batas itu.

## Aturan di file ini

- Nilai rekening saat ini masih contoh. Ganti di `.env` sebelum aplikasi dipakai sungguhan.
- Jangan menulis nilai rahasia langsung di file ini. Taruh di `.env`, lalu baca dengan `env()`.

## FAQ

**Bagaimana menguji pembatalan otomatis tanpa menunggu sejam?**
Isi `BATAS_BAYAR_MENIT=5` di `.env`, lalu buat booking dan tunggu lima menit tanpa mengirim bukti.

**Perubahan di `.env` tidak terbaca. Kenapa?**
Kalau pernah menjalankan `php artisan config:cache`, Laravel memakai salinan pengaturan yang lama. Jalankan `php artisan config:clear`.

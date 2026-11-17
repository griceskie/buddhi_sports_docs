---
title: config/pengelola.php
urutan: 5
---

# config/pengelola.php

::: info Tentang file ini
- **Lokasi:** `config/pengelola.php`
- **Jenis:** pengaturan (PHP)
- **Berhubungan dengan:** [controller login pengelola](/backend/controller/pengelola-login), [HandleInertiaRequests](./handle-inertia-requests), komponen `HubungiPengelola`
:::

## Ringkasan

File ini menyimpan pengaturan yang berhubungan dengan pengelola: ambang "banyak" untuk panel pratinjau di halaman login pengelola, lama cache panel itu, dan nomor WhatsApp pengelola untuk penyewa.

## Isi file

```php
return [
    'ambang_banyak' => [
        'admin' => 5,
        'manager' => 2,
    ],
    'cache_status_detik' => 300,
    'wa' => env('PENGELOLA_WA', '6281389947501'),
];
```

### `ambang_banyak`

Halaman `/login-pengelola` punya panel pratinjau yang memberi gambaran sebelum login. Contohnya: "Ada pembayaran yang menunggu verifikasi". Halaman ini bisa dibuka siapa saja, jadi panel itu tidak pernah menampilkan angka, nama, atau nominal. Isinya hanya tingkat: tidak ada, ada, atau banyak.

- Untuk Admin, yang dihitung adalah pembayaran `Menunggu Verifikasi`. Mulai 5, statusnya "banyak".
- Untuk Manager, yang dihitung adalah laporan yang belum diperiksa. Mulai 2, statusnya "banyak".

### `cache_status_detik`

Hasil status panel pratinjau disimpan 300 detik (5 menit). Halaman publik jadi tidak menanyai database setiap kali dibuka.

### `wa`

Nomor WhatsApp pengelola untuk tautan "Hubungi pengelola" di halaman penyewa. Formatnya angka saja, diawali kode negara `62` tanpa `+` dan tanpa `0` di depan. Nilainya bisa diganti lewat `PENGELOLA_WA` di `.env`.

Nomor ini dikirim ke halaman lewat props bersama `waPengelola` di [HandleInertiaRequests](./handle-inertia-requests), dan hanya untuk penyewa.

## Aturan di file ini

- Panel pratinjau login tidak boleh menampilkan data rinci. Kalau mengubah ambang, yang berubah hanya kapan "ada" menjadi "banyak".
- Nomor WhatsApp ditulis tanpa spasi, tanda hubung, atau `+`, karena dipakai langsung di alamat `https://wa.me/{nomor}`.

## FAQ

**Nomor di file ini ikut tersimpan di repo. Apakah aman?**
Nomor bawaan di file ini bisa dibaca siapa pun yang punya akses ke repo. Kalau repo-nya akan dibuka untuk umum, kosongkan nilai bawaannya dan isi nomor hanya di `.env`.

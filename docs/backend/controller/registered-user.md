---
title: RegisteredUserController.php
urutan: 15
---

# RegisteredUserController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/Auth/RegisteredUserController.php`
- **Jenis:** controller (PHP), bawaan Laravel Breeze yang sudah disesuaikan
- **Dipakai oleh:** route `register` di `routes/auth.php` (lihat [auth.php](/backend/route/auth))
- **Berhubungan dengan:** halaman [Register](/frontend/penyewa/register), model [Penyewa](/backend/model/penyewa)
:::

## Ringkasan

Controller ini membuat akun penyewa baru dari halaman Register, lalu langsung memasukkan penyewa itu ke aplikasi. Breeze aslinya membuat `User`. Di proyek ini, yang dibuat adalah `Penyewa`.

| Route | Fungsi |
| --- | --- |
| `GET /register` | `create()` |
| `POST /register` | `store()` |

## Isi file

### `create()`

Membuka halaman `Auth/Register`.

### `store()`

**Logikanya:**

1. **Validasi:**

   | Field | Aturannya |
   | --- | --- |
   | `namaPenyewa` | Wajib, maksimal 255 karakter. |
   | `noHp` | Wajib, `Penyewa::ATURAN_NO_HP`, dengan pesan `Penyewa::PESAN_NO_HP`. |
   | `email` | Wajib, huruf kecil, format email, belum dipakai penyewa lain. |
   | `password` | Wajib, minimal 8 karakter, dan sama dengan `password_confirmation`. |

   `'unique:'.Penyewa::class` mengecek keunikan di tabel milik model `Penyewa`, yaitu `penyewas`.

2. **Buat penyewa** dengan `Penyewa::create([...])`. Password di-hash dulu dengan `Hash::make()`.
3. **Kirim event `Registered`.** Event ini bawaan Laravel. Di proyek ini tidak ada yang mendengarkannya untuk hal khusus, karena verifikasi email tidak dipakai.
4. **Login otomatis** dengan `Auth::login($penyewa)` di guard `web`.
5. **Arahkan ke Home** (`route('dashboard', absolute: false)` menghasilkan `/dashboard`).

`absolute: false` membuat alamat relatif, tanpa nama domain. Dengan begitu, pengalihan tetap benar walaupun aplikasi dibuka dari alamat yang berbeda dengan `APP_URL`.

## Aturan di file ini

- Nama field mengikuti nama kolom tabel (`namaPenyewa`, `noHp`), bukan `name` seperti Breeze aslinya.
- No HP dikirim halaman sebagai angka saja. Komponen `PhoneInput` hanya menampilkan spasi, tidak mengirimnya.

## FAQ

**Kenapa memakai `Penyewa::create`, bukan `DB::table`?**
`Auth::login()` membutuhkan objek model. Bagian autentikasi bawaan Breeze memang memakai Eloquent, berbeda dari controller master data.

**Apakah ada verifikasi email setelah daftar?**
Tidak. Penyewa langsung bisa memakai aplikasi setelah mendaftar.

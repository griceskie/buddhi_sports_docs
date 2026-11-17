---
title: PengelolaAuthenticatedSessionController.php
urutan: 13
---

# PengelolaAuthenticatedSessionController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/Auth/PengelolaAuthenticatedSessionController.php`
- **Jenis:** controller login (PHP)
- **Dipakai oleh:** route `login.pengelola*` dan `logout.pengelola` di [web.php](/backend/route/web)
- **Berhubungan dengan:** halaman [Login pengelola](/frontend/admin/login-pengelola), [config/pengelola.php](/backend/route/config-pengelola), [LogAktivitas](/backend/support/log-aktivitas)
:::

## Ringkasan

Controller ini mengurus login dan logout Admin dan Manager di `/login-pengelola`. Satu halaman punya dua tab (Admin dan Manager). Tab yang dipilih menentukan guard yang dipakai. Controller ini juga menyediakan status singkat untuk panel pratinjau di sisi kanan halaman login.

| Route | Fungsi |
| --- | --- |
| `GET /login-pengelola` | `create()` |
| `POST /login-pengelola` | `store()` |
| `GET /login-pengelola/status` | `status()` |
| `POST /logout-pengelola` | `destroy()` |

Penyewa login di halaman yang berbeda (`/login`), dengan controller bawaan Breeze.

## Isi file

### `create()`

Membuka halaman `Auth/LoginPengelola`.

### `status()`

**Gunanya:** memberi tahu panel pratinjau apakah ada pekerjaan menunggu, tanpa membocorkan data.

```php
$status = Cache::remember('login-pengelola-status', config('pengelola.cache_status_detik'), function () { ... });
```

`Cache::remember(kunci, detik, fungsi)` mengembalikan nilai dari cache kalau ada. Kalau belum ada atau sudah kedaluwarsa, fungsi dijalankan, hasilnya disimpan, lalu dikembalikan. Hasilnya disimpan selama 5 menit.

Isinya hanya tingkat untuk setiap peran:

| Peran | Yang dihitung |
| --- | --- |
| `admin` | Bukti bayar yang menunggu verifikasi |
| `manager` | Laporan yang sudah diserahkan dan belum diperiksa |

Setiap jumlah diubah menjadi `tidak ada`, `ada`, atau `banyak`. Batas "banyak" diatur di `config/pengelola.php` (`ambang_banyak`).

Endpoint ini terbuka untuk umum, jadi sengaja tidak mengirim angka, nama, atau rupiah. Route-nya juga dibatasi 30 permintaan per menit per alamat IP (`throttle:30,1`).

### `store()`

**Logikanya:**

1. **Validasi:** `role` harus `admin` atau `manager`, lalu username dan password wajib diisi.
2. **Batas percobaan:**

   ```php
   $kunci = 'login-pengelola|'.$guard.'|'.Str::lower($username).'|'.$request->ip();
   if (RateLimiter::tooManyAttempts($kunci, 5)) { ... }
   ```

   Setiap gabungan peran, username, dan alamat IP hanya boleh salah 5 kali per menit. Setelah itu, login ditolak dengan pesan "Coba lagi dalam n detik".
3. **Coba login:** `Auth::guard($guard)->attempt(...)` mencocokkan username dan password di tabel `admins` atau `managers`.
4. **Kalau gagal:**
   - tambah hitungan percobaan (`RateLimiter::hit($kunci, 60)`, berlaku 60 detik)
   - kalau username-nya memang ada, catat di log sebagai `gagal` oleh Sistem, beserta alamat IP
   - tampilkan "Username atau password salah." di bawah field Password.
5. **Kalau berhasil:**
   - hapus hitungan percobaan
   - buat ID sesi baru (`session()->regenerate()`) supaya ID sesi lama tidak bisa dipakai orang lain
   - catat login di log
   - arahkan ke dashboard sesuai peran. `redirect()->intended(...)` lebih dulu membuka halaman yang tadinya ingin dibuka sebelum diminta login.

Login gagal untuk username yang tidak ada tidak dicatat. Kalau dicatat, tebakan acak bisa memenuhi log.

Pesan galat sengaja tidak menyebut apakah username atau password yang salah, supaya orang lain tidak bisa menebak username mana yang terdaftar.

### `destroy()`

Logout dari guard `admin` dan `manager` (mana yang aktif), hapus isi sesi, buat token CSRF baru, lalu kembali ke `/login-pengelola`.

## Aturan di file ini

- Admin dan Manager memakai guard sendiri-sendiri. Penyewa (guard `web`) tidak pernah login di sini.
- Endpoint publik tidak boleh mengirim angka atau nama.
- Setiap login berhasil dan setiap login gagal untuk username yang ada dicatat di log aktivitas.

## FAQ

**Bagaimana kalau Admin dan Manager login di browser yang sama?**
Bisa, karena guard-nya berbeda. Tetapi logout dari salah satunya juga mengakhiri sesi browser itu untuk keduanya, karena `destroy()` mengosongkan seluruh sesi.

**Kenapa batasnya per username dan IP, bukan per IP saja?**
Supaya satu orang yang salah ketik tidak mengunci rekan kerja yang memakai jaringan kantor yang sama, sementara tebakan password untuk satu akun tetap dibatasi.

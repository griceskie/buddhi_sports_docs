---
title: routes/auth.php
urutan: 2
---

# routes/auth.php

::: info Tentang file ini
- **Lokasi:** `routes/auth.php`
- **Jenis:** daftar rute (PHP), bawaan Laravel Breeze
- **Berhubungan dengan:** controller di `app/Http/Controllers/Auth/`, [routes/web.php](./web)
:::

## Ringkasan

File ini berisi rute akun penyewa: daftar, login, lupa password, reset password, ganti password, dan logout. Isinya hampir sama dengan bawaan paket Laravel Breeze. Yang berubah adalah controller-nya, karena akun penyewa memakai model `Penyewa` (bukan `User`).

Login Admin dan Manager tidak ada di sini. Rute itu ada di `routes/web.php` (`/login-pengelola`).

## Posisinya dalam alur

Baris terakhir `routes/web.php` memuat file ini dengan `require __DIR__.'/auth.php';`. Jadi semua rute di sini ikut aktif seperti rute di `web.php`.

## Isi file

### Rute untuk tamu

```php
Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});
```

`guest` berarti hanya untuk penyewa yang belum login. Penyewa yang sudah login dan membuka `/login` diarahkan ke Home.

| Alamat | Gunanya |
| --- | --- |
| `GET /register`, `POST /register` | Halaman daftar dan simpan akun baru. Lihat [RegisteredUserController](/backend/controller/registered-user). |
| `GET /login`, `POST /login` | Halaman login dan proses login. |
| `GET /forgot-password`, `POST /forgot-password` | Meminta tautan reset password lewat email. |
| `GET /reset-password/{token}`, `POST /reset-password` | Halaman dan proses membuat password baru dari tautan email. |

### Rute untuk penyewa yang sudah login

```php
Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)->name('verification.notice');
    // ... verifikasi email
    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])->name('password.confirm');
    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);
    Route::put('password', [PasswordController::class, 'update'])->name('password.update');
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
```

- `PUT /password` dipakai baris Password di halaman Profile penyewa.
- `POST /logout` mengeluarkan penyewa, lalu mengarahkannya ke `/login`.
- Rute verifikasi email dan konfirmasi password adalah bawaan Breeze. Penyewa tidak memakai verifikasi email, jadi rute verifikasi praktis tidak pernah dibuka.

Controller-controller ini dijelaskan bersama di [Controller auth bawaan Breeze](/kelompok/auth-breeze).

## Aturan di file ini

- Jangan menambah rute Admin atau Manager di sini. Rute pengelola ada di `routes/web.php`.
- Nama rute di file ini (`login`, `register`, `password.update`, dan seterusnya) dipakai oleh halaman React dan oleh Laravel sendiri. Contohnya, tamu yang membuka halaman terlindung diarahkan ke rute bernama `login`. Jangan mengganti nama-nama ini.

## FAQ

**Apakah lupa password bisa dicoba di komputer lokal?**
Bisa, tetapi email tidak benar-benar terkirim. Di `.env`, `MAIL_MAILER=log`, jadi isi email (termasuk tautan reset) ditulis ke `storage/logs/laravel.log`. Salin tautannya dari file itu ke browser.

**Kenapa ada dua rute dengan alamat `login`?**
`GET login` menampilkan halaman, `POST login` memproses isian. Laravel membedakannya dari metode permintaan. Hanya yang `GET` yang diberi nama `login`.

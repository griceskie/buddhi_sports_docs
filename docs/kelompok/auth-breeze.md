---
title: Auth bawaan Breeze
urutan: 2
---

# Auth bawaan Breeze

::: info Tentang halaman ini
- **Lokasi:** `app/Http/Controllers/Auth/` (kecuali dua controller pengelola), `app/Http/Requests/Auth/LoginRequest.php`, `routes/auth.php`, dan halaman `resources/js/Pages/Auth/` (`ForgotPassword`, `ResetPassword`, `ConfirmPassword`, `VerifyEmail`)
- **Jenis:** controller dan halaman bawaan Laravel Breeze, sudah disesuaikan
- **Lihat juga:** [auth.php](/backend/route/auth), [RegisteredUserController](/backend/controller/registered-user), [Login](/frontend/penyewa/login), [Register](/frontend/penyewa/register)
:::

## Ringkasan

Laravel Breeze adalah paket awal yang menyediakan login, daftar, lupa password, dan ganti password. Proyek ini memakainya untuk **penyewa** (guard `web`). Di `config/auth.php`, guard itu memakai model `Penyewa`, bukan `User`.

Admin dan Manager tidak memakai bagian ini. Mereka punya controller sendiri: [PengelolaAuthenticatedSessionController](/backend/controller/pengelola-login) dan [PengelolaProfileController](/backend/controller/pengelola-profile).

## Daftar controller

| Controller | Route | Gunanya | Disesuaikan? |
| --- | --- | --- | --- |
| `AuthenticatedSessionController` | `GET/POST /login`, `POST /logout` | Login dan logout penyewa | Logout memakai guard `web` dan kembali ke `/login` |
| `RegisteredUserController` | `GET/POST /register` | Daftar akun | Ya, lihat [halamannya](/backend/controller/registered-user) |
| `PasswordResetLinkController` | `GET/POST /forgot-password` | Mengirim tautan reset password lewat email | Tidak |
| `NewPasswordController` | `GET /reset-password/{token}`, `POST /reset-password` | Mengatur password baru dari tautan email | Tidak |
| `PasswordController` | `PUT /password` | Ganti password dari Profile | Pesan sukses "Password diperbarui." |
| `ConfirmablePasswordController` | `GET/POST /confirm-password` | Meminta password lagi sebelum tindakan sensitif | Tidak dipakai halaman mana pun |
| `EmailVerificationPromptController`, `VerifyEmailController`, `EmailVerificationNotificationController` | `/verify-email...` | Verifikasi email | Tidak dipakai, karena tabel `penyewas` tidak punya kolom verifikasi email |

## Alur yang dipakai

### Login

1. `GET /login` membuka [Login](/frontend/penyewa/login).
2. `POST /login`: `LoginRequest::authenticate()` mencocokkan email dan password, dan membatasi percobaan yang salah.
3. Sesi dibuat ulang, lalu penyewa diarahkan ke halaman yang tadinya ingin dibuka, atau ke Home.

### Lupa password

1. Penyewa mengisi email di `/forgot-password`.
2. Laravel membuat token, menyimpannya di tabel `password_reset_tokens`, lalu mengirim tautan lewat email.
3. Tautan membuka `/reset-password/{token}`, dan penyewa mengisi password baru.

::: warning Email belum aktif
`.env` masih memakai `MAIL_MAILER=log`, jadi email tidak benar-benar terkirim. Isinya ditulis ke `storage/logs/laravel.log`. Untuk pengujian, tautan reset bisa disalin dari file itu. Pengiriman sungguhan lewat Mailtrap menunggu data akun dari pemilik proyek.
:::

### Ganti password

Dari halaman [Profile](/frontend/penyewa/profile-edit), `PUT /password` dengan password saat ini, password baru (minimal 8), dan konfirmasinya.

## Aturan

- Jangan mengembalikan model `User` sebagai model login penyewa.
- Komponen Breeze lama (`TextInput`, `PrimaryButton`, `Modal`, dan sebagainya) sudah dihapus. Halaman auth memakai komponen `ui/`.
- Halaman Login dan Register memakai teks Bahasa Inggris. Halaman lupa password masih memakai teks bawaan.

## FAQ

**Kenapa ada controller yang tidak dipakai?**
Controller verifikasi email dan konfirmasi password adalah bawaan Breeze. Route-nya masih ada, tetapi tidak ada halaman yang mengarah ke sana. Pemilik proyek memilih untuk tidak menghapus file bawaan tanpa alasan.

**Bagaimana Laravel tahu login penyewa memakai tabel `penyewas`?**
Lewat `config/auth.php`: provider `users` memakai model `Penyewa`, dan guard `web` memakai provider itu. Model `Penyewa` menentukan tabel dan kunci utamanya.

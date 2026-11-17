---
title: PengelolaProfileController.php
urutan: 14
---

# PengelolaProfileController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/Auth/PengelolaProfileController.php`
- **Jenis:** controller (PHP)
- **Dipakai oleh:** route `profile.pengelola*` di [web.php](/backend/route/web), grup `auth:admin,manager`
- **Berhubungan dengan:** halaman [Profile pengelola](/frontend/admin/profile-pengelola), [LogAktivitas](/backend/support/log-aktivitas)
:::

## Ringkasan

Controller ini mengurus halaman Profile Admin dan Manager: mengubah nama dan username, serta mengganti password sendiri. Satu controller melayani dua peran, karena `$request->user()` otomatis berisi akun yang sedang login, Admin atau Manager.

| Route | Fungsi |
| --- | --- |
| `GET /profile-pengelola` | `edit()` |
| `PATCH /profile-pengelola` | `update()` |
| `PUT /profile-pengelola/password` | `updatePassword()` |

## Isi file

### `edit()`

Membuka halaman `Pengelola/Profile`. Datanya diambil dari props bersama `pengelola`.

### `update()`

**Logikanya:**

1. Validasi nama dan username. Username harus unik di tabel milik peran itu:

   ```php
   Rule::unique($user->getTable(), 'username')->ignore($user->getKey(), $user->getKeyName()),
   ```

   - `getTable()` berisi `admins` atau `managers`.
   - `getKey()` berisi ID akun.
   - `getKeyName()` berisi nama kolom ID, yaitu `idAdmin` atau `idManager`.

   Satu baris ini bekerja untuk kedua peran tanpa `if`.
2. Tentukan nama kolom nama: `namaAdmin` atau `namaManager`, dengan `instanceof Admin`.
3. Di dalam transaksi: simpan, lalu catat hanya field yang benar-benar berubah. Kalau tidak ada yang berubah, tidak ada baris log.
4. Toast "Profile disimpan."

```php
$user->{$kolomNama}
```

Kurung kurawal dipakai untuk membaca properti yang namanya disimpan di variabel. Kalau `$kolomNama` berisi `'namaAdmin'`, baris ini sama dengan `$user->namaAdmin`.

### `updatePassword()`

1. Validasi:
   - password saat ini benar (`current_password`)
   - password baru minimal 8 karakter (`Password::defaults()`)
   - konfirmasinya sama (`confirmed`, yang mencocokkan dengan field `password_confirmation`).
2. Di dalam transaksi: simpan hash password baru, lalu catat "Password: Diganti" di log.
3. Toast "Password diganti. Pakai password baru saat masuk berikutnya."

Sesi yang sedang dipakai tetap berjalan. Sesi di perangkat lain berakhir pada permintaan berikutnya, karena route pengelola memakai middleware `auth.session`.

## Aturan di file ini

- Pesan galat validasi ditulis lengkap dalam Bahasa Indonesia di controller.
- Isi password tidak pernah dicatat.
- Perubahan profile dicatat dengan jenis objek `Profil`.

## FAQ

**Admin lupa password. Bisa direset dari halaman ini?**
Tidak. Halaman ini hanya untuk mengganti password yang masih diingat. Password Admin direset oleh Manager di halaman Data admin. Password Manager direset dari server dengan `php artisan manager:reset-password {username}`.

**Kenapa Profile pengelola terpisah dari Profile penyewa?**
Tabel, kolom, dan aturannya berbeda. Penyewa punya No HP dan email, sedangkan pengelola hanya punya nama dan username. Tampilan keduanya juga mengikuti desain panel masing-masing.

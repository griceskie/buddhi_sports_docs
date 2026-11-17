---
title: ProfileController.php
urutan: 12
---

# ProfileController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/ProfileController.php` dan aturan validasinya di `app/Http/Requests/ProfileUpdateRequest.php`
- **Jenis:** controller (PHP), bawaan Laravel Breeze yang sudah disesuaikan
- **Dipakai oleh:** route `profile.*` penyewa di [web.php](/backend/route/web)
- **Berhubungan dengan:** halaman [Profile penyewa](/frontend/penyewa/profile-edit), model [Penyewa](/backend/model/penyewa)
:::

## Ringkasan

Controller ini mengurus halaman Profile penyewa: menampilkan halaman, menyimpan nama, No HP, dan email, serta menghapus akun. Ganti password tidak ada di sini, tetapi di `Auth/PasswordController` (lihat [Auth bawaan Breeze](/kelompok/auth-breeze)).

| Route | Fungsi |
| --- | --- |
| `GET /profile` | `edit()` |
| `PATCH /profile` | `update()` |
| `DELETE /profile` | `destroy()` |

## Isi file

### `edit()`

Membuka halaman `Profile/Edit`. Data penyewa tidak dikirim sebagai props khusus, karena halaman membacanya dari props bersama `auth.user` (lihat [HandleInertiaRequests](/backend/route/handle-inertia-requests)).

### `update()`

```php
public function update(ProfileUpdateRequest $request): RedirectResponse
{
    $request->user()->fill($request->validated());
    $request->user()->save();
    return Redirect::route('profile.edit')->with('success', 'Profil disimpan.');
}
```

**Logikanya:**

1. Laravel menjalankan validasi di `ProfileUpdateRequest` **sebelum** fungsi ini dimulai. Kalau gagal, penyewa langsung dikembalikan ke halaman dengan pesan galat, dan isi fungsi tidak berjalan.
2. `fill($request->validated())` mengisi model penyewa dengan field yang lolos validasi saja.
3. `save()` menyimpan ke database.
4. Kembali ke halaman Profile dengan toast "Profil disimpan."

Fungsi ini memakai model Eloquent (`$request->user()`), bukan `DB::table`. Itu wajar, karena file ini bawaan Breeze.

#### `ProfileUpdateRequest`

Sebuah **Form Request** adalah kelas yang hanya berisi aturan validasi. Laravel menjalankannya otomatis kalau kelas itu ditulis sebagai tipe parameter fungsi.

| Field | Aturannya |
| --- | --- |
| `namaPenyewa` | Wajib, maksimal 255 karakter. |
| `noHp` | Wajib, `Penyewa::ATURAN_NO_HP` (angka saja, diawali 08, 10 sampai 13 digit). |
| `email` | Wajib, huruf kecil, format email, unik kecuali untuk penyewa ini sendiri. |

Halaman selalu mengirim ketiga field ini sekaligus, walaupun penyewa hanya membuka satu baris (misalnya hanya mengubah No HP).

### `destroy()`

1. Penyewa harus mengetik password saat ini (`current_password`).
2. Logout, hapus penyewa, akhiri sesi, buat token baru, lalu arahkan ke `/`.

::: warning Tidak dipakai saat ini
Tombol Hapus akun di halaman Profile sedang dinonaktifkan. Penyewa yang punya booking juga tidak bisa dihapus, karena foreign key `bookings.idPenyewa` menolak, dan fungsi ini belum menangani galat itu. Route-nya masih ada, tetapi tidak punya tampilan.
:::

## Aturan di file ini

- Aturan No HP diambil dari model `Penyewa`, sama dengan Register dan form Admin.
- Pesan sukses dikirim sebagai flash `success`, yang tampil sebagai toast.

## FAQ

**Kenapa ada catatan tentang `email_verified_at` di kode?**
Breeze aslinya mengosongkan status verifikasi email saat email diganti. Tabel `penyewas` tidak punya kolom itu, karena verifikasi email tidak dipakai, jadi bagian itu dihapus.

**Apakah penyewa perlu mengetik password untuk mengubah email?**
Tidak. Penyewa sudah login, dan perubahan email tidak memengaruhi booking. Password hanya diminta untuk ganti password dan hapus akun.

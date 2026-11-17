---
title: Auth/Login.tsx
urutan: 2
---

# Auth/Login.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Auth/Login.tsx`
- **Jenis:** halaman Inertia (TSX), bawaan Breeze yang sudah didesain ulang
- **Dibuka di:** `/login`
- **Server:** `Auth/AuthenticatedSessionController` (lihat [Auth bawaan Breeze](/kelompok/auth-breeze))
- **Layout:** [GuestLayout](/frontend/layout/guest-layout)
:::

## Ringkasan

Halaman login penyewa dengan email dan password. Teks di halaman ini berbahasa Inggris ("Welcome back👋, mate!"), sesuai pilihan pemilik proyek. Setelah berhasil, penyewa dibawa ke Home.

Halaman ini contoh dasar form Inertia, jadi baca bagian `useForm` dengan teliti. Pola yang sama dipakai di hampir semua form di aplikasi.

## Isi file

### Props

```tsx
export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
```

- `status`: pesan dari server, misalnya setelah password berhasil direset. Ditampilkan di kotak hijau di atas form.
- `canResetPassword`: benar kalau route lupa password tersedia. Kalau benar, tautan "Forgot your password?" tampil.

### `useForm`

```tsx
const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false as boolean,
});
```

`useForm` dari Inertia menyimpan isi form dan mengurus pengirimannya.

| Nilai | Gunanya |
| --- | --- |
| `data` | Isi form saat ini, misalnya `data.email`. |
| `setData('email', nilai)` | Mengubah satu field. |
| `post(url, pilihan)` | Mengirim form dengan metode POST. |
| `processing` | Benar selama form sedang dikirim. Dipakai untuk menonaktifkan tombol. |
| `errors` | Pesan galat validasi dari server, per field, misalnya `errors.email`. |
| `reset('password')` | Mengosongkan field tertentu. |

`false as boolean` memberi tahu TypeScript bahwa `remember` boleh `true` atau `false`. Tanpa itu, TypeScript mengira nilainya hanya boleh `false`.

### `submit`

```tsx
const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), { onFinish: () => reset('password') });
};
```

1. `e.preventDefault()` mencegah browser mengirim form dengan cara lama (memuat ulang halaman). Inertia yang mengirimnya.
2. `post(route('login'))` mengirim ke `POST /login`.
3. `onFinish` berjalan setelah selesai, baik berhasil maupun gagal. Field password dikosongkan supaya tidak tertinggal di layar.

Kalau server menolak, `errors` terisi, dan pesannya muncul lewat `<InputError message={errors.email} />`.

### Satu field

```tsx
<div className="grid gap-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" value={data.email} autoComplete="username"
           onChange={(e) => setData('email', e.target.value)} />
    <InputError message={errors.email} />
</div>
```

Pola Label, kontrol, lalu `InputError` dipakai di semua form.

- `htmlFor` dan `id` yang sama menghubungkan label dengan kolomnya. Mengklik label memindahkan kursor ke kolom, dan pembaca layar membacakan labelnya.
- `autoComplete` membantu browser mengisi otomatis email dan password yang tersimpan.

### Bagian lain

- `PasswordInput`: kolom password dengan tombol tampilkan atau sembunyikan.
- `Checkbox` "Keep me logged in": mengisi `remember`, supaya sesi bertahan lebih lama.
- Tombol `variant="elevated"`, `disabled={processing}`, supaya tidak terkirim dua kali.
- Tautan "Create an account" ke halaman Register.

## Aturan di file ini

- Form selalu memakai `useForm` dan `route('...')`, bukan alamat yang ditulis manual.
- Setiap field punya `Label`, dan `InputError` di bawahnya.
- Teks halaman Login dan Register berbahasa Inggris. Pesan galat dari server mengikuti bahasa aplikasi (`APP_LOCALE=en`).

## FAQ

**Kenapa pesan galatnya berbahasa Inggris, padahal sebagian aplikasi berbahasa Indonesia?**
Pesan bawaan Laravel mengikuti `APP_LOCALE`, yang bernilai `en`. Pesan yang ditulis sendiri di controller berbahasa Indonesia.

**Admin mencoba login di sini dan gagal. Kenapa?**
Halaman ini hanya untuk penyewa (guard `web`, tabel `penyewas`). Admin dan Manager login di `/login-pengelola`.

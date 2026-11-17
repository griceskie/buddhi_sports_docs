---
title: Pengelola/Profile.tsx
urutan: 9
---

# Pengelola/Profile.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Pengelola/Profile.tsx`
- **Jenis:** halaman Inertia (TSX), dipakai Admin dan Manager
- **Dibuka di:** `/profile-pengelola`, route `profile.pengelola`
- **Server:** [PengelolaProfileController](/backend/controller/pengelola-profile)
- **Komponen penting:** [FormSheet](/frontend/komponen/form-sheet), `PasswordInput`, `Tooltip`
:::

## Ringkasan

Halaman Profile untuk Admin dan Manager. Isinya dua kartu:

1. **Kartu akun:** avatar inisial, nama, badge peran (dengan tooltip tugas peran itu), tombol **Ubah profile**, dan baris Username.
2. **Kartu Keamanan:** baris Password dengan tombol **Ganti password**, dan catatan apa yang harus dilakukan kalau lupa password.

Kedua tombol membuka form di sheet samping.

## Isi file

### Teks per peran

```tsx
const PERAN = {
    admin: { label: 'Admin', tugas: 'Mengelola booking, memverifikasi bukti bayar, dan membuat laporan bulanan.',
             lupa: 'Lupa password? Minta Manager mereset password Anda dari halaman Data admin.' },
    manager: { label: 'Manager', tugas: '...', lupa: 'Password Manager tidak bisa direset dari aplikasi. ...' },
};
const peran = PERAN[pengelola.role === 'manager' ? 'manager' : 'admin'];
```

Semua teks yang berbeda per peran dikumpulkan di satu objek. Halaman cukup memilih salah satunya.

### Data akun

```tsx
const pengelola = usePage<PageProps>().props.pengelola!;
```

Data diambil dari props bersama `pengelola`. Tanda `!` di akhir memberi tahu TypeScript bahwa nilainya pasti ada. Halaman ini hanya bisa dibuka oleh pengelola yang login, jadi `pengelola` tidak mungkin `null`.

### Satu sheet, dua form

```tsx
const sheet = useFormSheet<'profil' | 'password'>();
...
<FormSheet open={sheet.open} onClose={sheet.tutup}>
    {sheet.row === 'password' ? <FormPassword key={sheet.versi} onDone={sheet.tutup} /> : <FormProfil key={sheet.versi} onDone={sheet.tutup} />}
</FormSheet>
```

`useFormSheet` biasanya menyimpan baris tabel yang diedit. Di halaman ini, yang disimpan adalah nama form (`'profil'` atau `'password'`). Tombol memanggil `sheet.buka('profil')` atau `sheet.buka('password')`, dan sheet menampilkan form yang sesuai.

### `FormProfil`

```tsx
const { data, setData, patch, errors, processing } = useForm({ nama: pengelola.nama, username: pengelola.username });
patch(route('profile.pengelola.update'), { preserveScroll: true, onSuccess: onDone });
```

Mengirim `PATCH` dengan nama dan username. Setelah berhasil, sheet tertutup dan toast "Profile disimpan." muncul. Nama baru langsung terlihat di header dan sidebar, karena props bersama ikut diperbarui.

### `FormPassword`

Tiga kolom `PasswordInput`: password saat ini, password baru (dengan petunjuk "Minimal 8 karakter"), dan ulangi password baru. Dikirim dengan `PUT` ke `profile.pengelola.password`.

### `Baris`

Komponen kecil untuk satu baris kartu: judul dan keterangan di kiri, isi atau tombol di kanan. Kalau layar sempit, isinya turun ke baris berikutnya (`flex-wrap`).

### Badge peran dengan tooltip

```tsx
<TooltipTrigger render={<span tabIndex={0} className="... focus-visible:ring-2" />}>
```

Badge diberi `tabIndex={0}`, supaya tooltip juga bisa dibuka dengan keyboard, tidak hanya dengan mouse.

## Aturan di file ini

- Satu halaman untuk dua peran. Perbedaannya hanya di objek `PERAN`.
- Mengubah data akun selalu lewat sheet, bukan langsung di kartu.
- Tidak ada tombol reset password di sini. Reset untuk Admin dilakukan Manager, dan reset untuk Manager dilakukan dari server.

## FAQ

**Kenapa tidak ada field email atau No HP?**
Akun pengelola hanya punya nama, username, dan password di database.

**Setelah ganti password, apakah perlu login ulang?**
Tidak di perangkat yang sedang dipakai. Sesi di perangkat lain berakhir pada permintaan berikutnya.

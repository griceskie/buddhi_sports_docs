---
title: Auth/LoginPengelola.tsx
urutan: 1
---

# Auth/LoginPengelola.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Auth/LoginPengelola.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/login-pengelola`, route `login.pengelola`
- **Server:** [PengelolaAuthenticatedSessionController](/backend/controller/pengelola-login)
- **Layout:** [PengelolaGuestLayout](/frontend/layout/pengelola-guest-layout)
:::

## Ringkasan

Halaman login Admin dan Manager. Ada tab **Admin** dan **Manager** di atas form. Tab yang dipilih ikut dikirim sebagai `role`, dan server memakainya untuk memilih tabel akun yang dicek. Panel di kanan menunjukkan apakah ada pekerjaan menunggu untuk peran yang dipilih, tanpa angka.

## Isi file

### Form

```tsx
const { data, setData, post, processing, errors, reset } = useForm<{ role: Peran; username: string; password: string }>({
    role: 'admin',
    username: '',
    password: '',
});
```

`useForm<{...}>` memberi tipe pada isi form. Dengan begitu, `role` hanya boleh `'admin'` atau `'manager'`.

### Tab peran

```tsx
<Tabs value={data.role} onValueChange={(v) => setData('role', v as Peran)}>
    <TabsList aria-label="Peran">
        <TabsTrigger value="admin">Admin</TabsTrigger>
        <TabsTrigger value="manager">Manager</TabsTrigger>
    </TabsList>
</Tabs>
```

Tab di sini tidak mengganti isi halaman. Tab hanya mengubah satu nilai di form. Tombol Login ikut berubah menjadi "Login sebagai Admin" atau "Login sebagai Manager", supaya pengguna tahu peran yang dipilih.

### Panel pratinjau

```tsx
<PengelolaGuestLayout panel={<PanelPratinjauLogin peran={data.role} />}>
```

`PanelPratinjauLogin` mengambil data dari `GET /login-pengelola/status`, yang hanya mengirim `tidak ada`, `ada`, atau `banyak`. Panel lalu menampilkan pratinjau untuk peran yang sedang dipilih.

### Galat

```tsx
<Input aria-invalid={!!errors.username} ... />
<InputError message={errors.username} />
```

`aria-invalid` memberi tanda pada kolom yang salah. Komponen `Input` memberi garis merah, dan pembaca layar mengumumkannya.

Galat login selalu muncul di bawah field Password: "Username atau password salah." atau "Terlalu banyak percobaan masuk...".

## Aturan di file ini

- Satu halaman untuk dua peran. Jangan membuat halaman login terpisah.
- Teks halaman berbahasa Indonesia, berbeda dari login penyewa.
- Halaman ini memakai tema panel pengelola, termasuk mode gelap.

## FAQ

**Pengguna salah memilih tab. Apa yang terjadi?**
Server mencari username di tabel peran yang dipilih. Admin yang login di tab Manager mendapat pesan "Username atau password salah." Pesan itu sengaja tidak menyebut tab yang salah.

**Setelah login, ke mana pengguna dibawa?**
Admin ke dashboard Admin, Manager ke Pemantauan. Kalau sebelumnya pengguna mencoba membuka halaman lain dan diminta login, setelah login ia dibawa ke halaman itu.

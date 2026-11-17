---
title: PengelolaGuestLayout.tsx
urutan: 4
---

# PengelolaGuestLayout.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Layouts/PengelolaGuestLayout.tsx`
- **Jenis:** layout React (TSX)
- **Dipakai oleh:** halaman [Login pengelola](/frontend/admin/login-pengelola)
- **Berhubungan dengan:** `Components/pengelola/TombolTema.tsx`, `Components/pengelola/PanelPratinjauLogin.tsx`
:::

## Ringkasan

Bingkai halaman login Admin dan Manager, mengikuti Design System Administrator. Ada dua bagian:

- **Kiri:** logo kecil, label "Panel pengelola", tombol tema terang atau gelap, lalu form login.
- **Kanan:** panel pratinjau yang berisi status singkat pekerjaan yang menunggu. Panel ini disembunyikan di layar di bawah 900px.

Login penyewa memakai [GuestLayout](./guest-layout), yang tampilannya berbeda.

## Isi file

### Props

| Props | Gunanya |
| --- | --- |
| `children` | Form login. |
| `panel` | Isi panel kanan. Kalau tidak dikirim, panel tidak ditampilkan. |

### Bagian kiri

```tsx
<section className="flex min-w-0 flex-1 basis-[380px] flex-col gap-8 px-5 py-6 min-[900px]:px-[clamp(24px,4vw,56px)] ...">
```

- `flex-1 basis-[380px]`: bagian kiri mulai dari lebar 380px, lalu ikut melebar.
- `clamp(24px, 4vw, 56px)`: jarak tepi mengikuti 4% lebar layar, paling kecil 24px dan paling besar 56px.
- `min-w-0`: mencegah teks panjang mendorong lebar bagian ini melebihi layar.

Form dibatasi 360px (`max-w-[360px]`), sama dengan lebar form penyewa.

### Bagian kanan

```tsx
{panel && (
    <aside aria-label="Ringkasan panel" className="hidden ... min-[900px]:flex">
        <div className="w-full max-w-[520px]">{panel}</div>
    </aside>
)}
```

- `hidden ... min-[900px]:flex`: disembunyikan di layar kecil, ditampilkan mulai 900px.
- `aria-label` memberi nama bagian ini untuk pembaca layar.
- `flex-[1.15_1_400px]`: bagian kanan sedikit lebih lebar daripada bagian kiri.

### Tombol tema

`TombolTema` mengganti mode terang dan gelap. Pilihannya disimpan di cookie `tema_pengelola` dan juga berlaku setelah login. Tanpa pilihan, tema mengikuti pengaturan perangkat.

## Aturan di file ini

- Layout ini hanya untuk tamu panel pengelola. Halaman penyewa tidak memakainya.
- Panel kanan tidak boleh menampilkan angka, nama, atau rupiah, karena halaman ini terbuka untuk siapa saja. Datanya diambil dari `GET /login-pengelola/status` (lihat [PengelolaAuthenticatedSessionController](/backend/controller/pengelola-login)).

## FAQ

**Kenapa halaman login pengelola punya tombol tema, sedangkan halaman penyewa tidak?**
Panel pengelola punya mode gelap, sedangkan halaman penyewa selalu terang. Tombol di halaman login membuat pengelola bisa memilih tema sebelum masuk.

**Kenapa ukurannya memakai `min-[900px]`, bukan `md:` atau `lg:`?**
Rancangannya memakai 900px sebagai titik pindah, dan angka itu tidak sama dengan titik bawaan Tailwind (768px untuk `md` dan 1024px untuk `lg`).

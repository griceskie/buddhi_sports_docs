---
title: AdminSidebar.tsx
urutan: 18
---

# AdminSidebar.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/AdminSidebar.tsx`
- **Jenis:** komponen React (TSX) dan satu fungsi pembantu
- **Dipakai oleh:** [AdminSidebarLayout](/frontend/layout/admin-sidebar-layout)
- **Memakai:** `ui/sidebar`, `Components/pengelola/MenuAkunPengelola.tsx`
:::

## Ringkasan

Sidebar panel pengelola. Menunya mengikuti peran:

| Admin | Manager |
| --- | --- |
| **Utama:** Dashboard | **Utama:** Pemantauan, Analisis bisnis |
| **Penyewaan:** Penyewa, Lapangan, Booking, Pembayaran | **Data:** Pembayaran, Lapangan |
| **Laporan:** Laporan pembayaran | **Laporan:** Laporan pembayaran |
| **Pengawasan:** Log aktivitas | **Pengguna:** Admin |
| | **Pengawasan:** Log aktivitas |

Di atas ada logo dan label "Panel admin" atau "Panel manager". Di bawah ada profil (inisial dan nama) yang membuka menu akun. Menu tertentu punya angka badge: Pembayaran (bukti menunggu, Admin) dan Laporan pembayaran (laporan belum diperiksa, Manager).

Sidebar bisa diciutkan menjadi ikon saja. Label menu lalu muncul sebagai tooltip.

## Isi file

### Daftar menu

```tsx
type Menu = { href: string; label: string; icon: LucideIcon };
type Kelompok = { label?: string; menu: Menu[] };

const MENU_ADMIN: Kelompok[] = [ ... ];
const MENU_MANAGER: Kelompok[] = [ ... ];
```

Menu ditulis sebagai data, bukan JSX. Komponen lalu menggambarnya dengan `map`. Menambah menu cukup dengan menambah satu baris di daftar.

Komentar di kode menjelaskan aturan pentingnya: Admin tidak punya menu data Admin atau Manager, karena Admin tidak boleh mengelola akun pengelola lain.

### `judulHalamanPengelola()`

```tsx
export function judulHalamanPengelola(url: string, peran: 'admin' | 'manager') {
    const path = url.split('?')[0];
    if (path.startsWith('/profile-pengelola')) return 'Profile';
    const kelompok = peran === 'admin' ? MENU_ADMIN : MENU_MANAGER;
    const beranda = kelompok[0].menu[0].href;
    const semua = kelompok.flatMap((k) => k.menu);
    return semua.find((m) => (m.href === beranda ? path === m.href : path.startsWith(m.href)))?.label ?? (...);
}
```

Judul di header atas diambil dari label menu yang cocok dengan alamat halaman. Halaman Profile punya judul sendiri.

`flatMap` menggabungkan semua menu dari semua kelompok menjadi satu daftar.

Menu beranda (Dashboard atau Pemantauan) dicocokkan persis. Menu lain cukup dicocokkan awalnya, supaya alamat seperti `/tampilpembayaran?periode=2026-10` tetap cocok dengan menu Pembayaran.

### Badge

```tsx
const badge: Record<string, { jumlah: number; label: string }> = {
    '/tampilpembayaran': { jumlah: halaman.pengelola?.menungguVerifikasi ?? 0, label: 'menunggu verifikasi' },
    '/manager/laporan': { jumlah: halaman.pengelola?.laporanBelumDiperiksa ?? 0, label: 'laporan belum diperiksa' },
};
```

Angka badge dipetakan per alamat menu, dan diambil dari props bersama `pengelola`. Badge hanya tampil kalau angkanya lebih dari 0, dan punya `aria-label` seperti "3 menunggu verifikasi".

### Menu aktif

```tsx
const aktif = (href: string) => (href === beranda ? url.split('?')[0] === href : url.startsWith(href));
```

Aturan cocoknya sama dengan judul. Menu aktif diberi tanda `isActive`.

### Tautan menu

```tsx
<SidebarMenuButton tooltip={item.label} isActive={aktif(item.href)} render={<Link href={item.href} />}>
    <item.icon />
    <span>{item.label}</span>
</SidebarMenuButton>
```

`render={<Link ... />}` membuat tombol menu digambar sebagai tautan Inertia. Pindah halaman jadi tanpa memuat ulang browser.

`<item.icon />` menggambar komponen ikon yang disimpan di data menu.

### Profil di bawah

`PenggunaMenu` menampilkan inisial, nama, dan peran pengelola. Menekannya membuka menu akun yang sama dengan menu di header (`IsiMenuAkunPengelola`): Profile, Log aktivitas, mode gelap, dan Log Out.

## Aturan di file ini

- Halaman Admin atau Manager baru yang perlu menu harus ditambahkan ke `MENU_ADMIN` atau `MENU_MANAGER`. Judul header ikut otomatis.
- Komponen yang dipakai sebagai target `render` Base UI harus memakai `forwardRef`. Kalau tidak, popup menu tidak menempel dan tidak terlihat.

## FAQ

**Bagaimana sidebar mengingat keadaan diciutkan?**
`ui/sidebar` menyimpannya di cookie `sidebar_state`, jadi tetap sama setelah pindah halaman atau memuat ulang.

**Kenapa ada menu akun di header dan di bawah sidebar?**
Rancangan di kanvas menampilkan profil di bawah sidebar, sedangkan header juga perlu menu akun saat sidebar diciutkan atau di HP. Keduanya memakai isi menu yang sama.

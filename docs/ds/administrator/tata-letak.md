---
title: Tipografi dan tata letak
urutan: 3
---

# Tipografi dan tata letak

::: info Tentang halaman ini
- **Sumber di kode:** `Layouts/AdminSidebarLayout.tsx`, `Components/AdminSidebar.tsx`, `Components/ui/sidebar.tsx`, `Components/pengelola/HeaderPengelola.tsx`, `Components/pengelola/JudulHalaman.tsx`
:::

## Tipografi

- Font sama dengan penyewa: **Geist Variable**.
- Teks dasar panel **14px** (`text-sm`), dipasang di `main` `AdminSidebarLayout`.
- Teks abu (`text-muted-foreground`) minimal 14px. Jangan memakai `text-xs` atau `text-[11–13px]` untuk teks abu.
- Judul halaman 20px dengan ketebalan medium (`JudulHalaman`). Judul kartu 14–16px semibold.
- Angka yang dibandingkan memakai `tabular-nums`.
- Skala tipografi penyewa (`text-title-1`, `text-footnote`, dan sejenisnya) tidak dipakai di panel. Panel memakai skala bawaan Tailwind.

## Bingkai panel

```text
┌──────────┬───────────────────────────────────────┐
│ Sidebar  │ Header 56px (menempel)                │
│ 256px    ├───────────────────────────────────────┤
│ (48px    │ main: padding 24px, jarak 24px        │
│ saat     │   JudulHalaman + aksi                 │
│ diciut-  │   kartu / tabel                       │
│ kan)     │                                       │
└──────────┴───────────────────────────────────────┘
```

| Bagian | Ukuran |
| --- | --- |
| Sidebar terbuka | 256px (`16rem`) |
| Sidebar diciutkan | 48px (`3rem`), hanya ikon dengan tooltip |
| Sidebar di HP | sheet 288px (`18rem`) dari kiri |
| Kepala sidebar | 56px dengan garis bawah |
| Header | 56px (`h-14`), menempel di atas |
| `main` | `flex flex-col gap-6 p-4 sm:p-6 text-sm`, tanpa batas lebar |

Lebar isi mengikuti layar. Tabel dan jadwal yang lebih lebar dari layar digulir di dalam wadahnya sendiri. Halaman tidak pernah bergulir ke samping.

## Header

Urutannya tetap: tombol sidebar, judul halaman, lalu di kanan lonceng notifikasi, tombol tema, dan menu akun. Judulnya diambil dari label menu yang aktif (`judulHalamanPengelola`).

## Sidebar

- Kelompok menu dengan label kecil abu.
- Item aktif berlatar `sidebar-accent`.
- Badge angka di menu tertentu (bukti menunggu untuk Admin, laporan belum diperiksa untuk Manager).
- Profil di bawah: inisial, nama, peran. Menu akunnya sama dengan di header.
- Ctrl+B atau Cmd+B menciutkan dan membuka. Keadaannya disimpan di cookie `sidebar_state`.

## Judul halaman

```tsx
<JudulHalaman judul="Booking" deskripsi="Semua booking lapangan.">
    <Button>Tambah booking</Button>
</JudulHalaman>
```

Judul 20px, deskripsi abu tepat di bawahnya, aksi di kanan. Diletakkan lewat props `header` milik `AdminSidebarLayout`.

## Tabel

| Bagian | Ukuran |
| --- | --- |
| Tinggi baris | 49px |
| Padding sel | 8px kiri-kanan (`px-2`) |
| Kepala tabel | teks warna utama, ikon urut `ChevronsUpDown` |
| Kolom aksi | kepala kosong (teks hanya untuk pembaca layar), ikon `ghost` |
| Kolom cari | tinggi 32px, teks 14px |

## Aturan

- Halaman tidak membuat padding sendiri. `main` sudah menyediakannya.
- Kartu memakai `Card` bawaan (`rounded-lg`, garis `border`, `shadow-sm`).
- Periksa di lebar 390 dan 1440px, terang dan gelap, tanpa gulir ke samping.

## FAQ

**Halaman melebar keluar layar di 768px. Kenapa?**
Biasanya karena isi yang lebar (grafik, peta panas) mendorong lebar `SidebarInset`. Halaman Analisis memakai `[contain:inline-size]` di pembungkusnya untuk mencegah itu.

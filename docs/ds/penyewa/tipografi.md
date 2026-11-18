---
title: Tipografi
urutan: 3
---

# Tipografi

::: info Tentang halaman ini
- **Sumber di kode:** `resources/css/app.css` (`--font-sans` dan blok `@theme` kedua, "Skala tipografi"), `resources/js/lib/cn.ts`
- **Lihat juga:** [lib/cn.ts](/frontend/dasar/cn)
:::

## Font

Semua teks memakai **Geist Variable** (ketebalan 100 sampai 900), dimuat dari paket `@fontsource-variable/geist`.

```css
--font-sans: 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
```

## Skala bawaan Tailwind

Komponen shadcn memakai ukuran bawaan Tailwind, dan ukuran ini tidak ditimpa:

| Kelas | Ukuran | Dipakai untuk |
| --- | --- | --- |
| `text-xs` | 12px | Label kecil, badge |
| `text-sm` | 14px | Teks UI umum, tabel, tombol |
| `text-base` | 16px | Isian form (supaya Safari di iPhone tidak memperbesar halaman) |
| `text-lg`, `text-xl` | 18px, 20px | Judul bagian kecil |

## Skala tipografi Buddhi Sports

11 gaya dari kartu Typography di DS. Satu kelas sudah membawa ukuran, tinggi baris, jarak huruf, dan (untuk judul) ketebalan.

| Kelas | Ukuran / tinggi baris / jarak huruf | Tebal |
| --- | --- | --- |
| `text-large-title` | 48px / 110% / −0,8px | 600 |
| `text-title-1` | 40px / 115% / −0,4px | 600 |
| `text-title-2` | 36px / 120% / −0,4px | 600 |
| `text-title-3` | 32px / 125% / −0,3px | 600 |
| `text-headline` | 28px / 130% / 0,2px | 600 |
| `text-body` | 24px / 133% / −0,1px | biasa |
| `text-callout` | 20px / 140% | biasa |
| `text-subheadline` | 16px / 150% | biasa |
| `text-footnote` | 14px / 150% | biasa |
| `text-caption-1` | 12px / 145% / 0,1px | biasa |
| `text-caption-2` | 10px / 130% / 0,5px | biasa |

Dua hal yang sering terlewat:

- `text-body` adalah **24px**, bukan ukuran paragraf. Teks UI biasa memakai `text-footnote` (14px).
- Skala ini sejauh ini terutama dipakai di halaman penyewa. Panel pengelola memakai skala bawaan Tailwind.

## Menambah gaya baru

1. Tambahkan variabelnya di blok `@theme` kedua di `app.css`.
2. Tambahkan namanya juga ke daftar di `resources/js/lib/cn.ts`.

Langkah kedua wajib. Tanpa itu, `cn('text-nama-baru', 'text-muted-foreground')` menganggap `text-nama-baru` sebagai warna dan membuang ukurannya.

## Aturan

- Ukuran teks paling kecil untuk teks yang perlu dibaca adalah 12px. 10px (`text-caption-2`) hanya untuk label pendek.
- Judul memakai sentence case: hanya huruf pertama dan nama diri yang kapital.
- Angka yang dibandingkan dalam tabel memakai `tabular-nums`, supaya lebar setiap digit sama.

## FAQ

**Kenapa isian form 16px, padahal teks lain 14px?**
Safari di iPhone otomatis memperbesar halaman kalau isian yang disentuh berukuran di bawah 16px. Dengan 16px, halaman tetap diam saat penyewa mengetik.

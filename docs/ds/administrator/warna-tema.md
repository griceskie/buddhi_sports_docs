---
title: Warna dan tema
urutan: 2
---

# Warna dan tema

::: info Tentang halaman ini
- **Sumber di kode:** `resources/css/admin.css`, `Components/pengelola/tema.ts`, `Components/pengelola/TombolTema.tsx`
:::

## Ringkasan

Tema panel menimpa token lapis 2 milik `app.css` (`--background`, `--primary`, `--border`, dan seterusnya) di bawah selektor `html.tema-pengelola`. Nama token sama dengan sisi penyewa, jadi kelas seperti `bg-card` dan `text-muted-foreground` tetap dipakai. Nilainya saja yang berbeda.

Selektor diawali `html` supaya selalu menang atas `:root`, `.dark`, dan blok squircle di `app.css`, tanpa bergantung urutan impor.

## Token terang dan gelap

| Token | Terang | Gelap |
| --- | --- | --- |
| `background` | <span class="swatch" style="background:#fff"></span>`#ffffff` | <span class="swatch" style="background:oklch(0.145 0 0)"></span>`oklch(0.145 0 0)` |
| `canvas` | <span class="swatch" style="background:#fff"></span>`#ffffff` | <span class="swatch" style="background:oklch(0.145 0 0)"></span>`oklch(0.145 0 0)` |
| `card`, `popover` | <span class="swatch" style="background:#fff"></span>`#ffffff` | <span class="swatch" style="background:oklch(0.205 0 0)"></span>`oklch(0.205 0 0)` |
| `foreground` | <span class="swatch" style="background:hsl(222.2 84% 4.9%)"></span>`hsl(222.2 84% 4.9%)` | <span class="swatch" style="background:oklch(0.985 0 0)"></span>`oklch(0.985 0 0)` |
| `primary` | <span class="swatch" style="background:hsl(221.2 83.2% 53.3%)"></span>`hsl(221.2 83.2% 53.3%)` | <span class="swatch" style="background:oklch(0.623 0.214 259.815)"></span>`oklch(0.623 0.214 259.815)` |
| `secondary`, `muted`, `accent` | <span class="swatch" style="background:hsl(210 40% 96.1%)"></span>`hsl(210 40% 96.1%)` | <span class="swatch" style="background:oklch(0.269 0 0)"></span>`oklch(0.269 0 0)` |
| `muted-foreground` | <span class="swatch" style="background:hsl(215.4 16.3% 46.9%)"></span>`hsl(215.4 16.3% 46.9%)` | <span class="swatch" style="background:oklch(0.708 0 0)"></span>`oklch(0.708 0 0)` |
| `border`, `input` | <span class="swatch" style="background:oklch(0.922 0 0)"></span>`oklch(0.922 0 0)` | putih 10% dan 15% |
| `tabel-header` | <span class="swatch" style="background:oklch(0.97 0 0)"></span>`oklch(0.97 0 0)` | <span class="swatch" style="background:oklch(0.245 0 0)"></span>`oklch(0.245 0 0)` |
| `destructive` | <span class="swatch" style="background:hsl(0 84.2% 60.2%)"></span>`hsl(0 84.2% 60.2%)` | <span class="swatch" style="background:oklch(0.704 0.191 22.216)"></span>`oklch(0.704 0.191 22.216)` |
| `success` | <span class="swatch" style="background:#008932"></span>`#008932` | <span class="swatch" style="background:oklch(0.792 0.17 152)"></span>`oklch(0.792 0.17 152)` |
| `sidebar` | <span class="swatch" style="background:oklch(0.985 0 0)"></span>`oklch(0.985 0 0)` | <span class="swatch" style="background:oklch(0.205 0 0)"></span>`oklch(0.205 0 0)` |
| `--radius` | `0.5rem` | `0.5rem` |

`tabel-header` adalah satu-satunya token baru di panel (kelas `bg-tabel-header`), untuk latar kepala tabel.

Di tema panel, `canvas` sama putihnya dengan kartu. Untuk isian abu halus di dalam kartu (jalur, placeholder, kotak kosong), pakai `bg-muted`, bukan `bg-canvas`.

## Warna status

Warna status hanya dipakai untuk status, tidak pernah sebagai hiasan.

| Status | Token | Terang |
| --- | --- | --- |
| Dikonfirmasi, Terverifikasi, Tersedia | `accessible-green` | <span class="swatch" style="background:#008932"></span>`#008932` |
| Menunggu verifikasi, Perbaikan | `accessible-orange` | <span class="swatch" style="background:#c55300"></span>`#c55300` |
| Ditolak, Dibatalkan, bentrok, lewat batas | `accessible-red` | <span class="swatch" style="background:#e9152d"></span>`#e9152d` |
| Dipesan | `primary` | <span class="swatch" style="background:hsl(221.2 83.2% 53.3%)"></span>biru |
| Lainnya | `muted-foreground` | abu |

Di mode gelap, keempat warna status diganti versi yang lebih terang (`oklch`), supaya tetap terbaca di atas kartu gelap.

Panel dan blok status (misalnya blok jadwal) memakai campuran 10–14% warna status di atas kartu, dengan teks berwarna status penuh:

```css
background: color-mix(in oklab, var(--accessible-orange) 12%, var(--card));
color: var(--accessible-orange);
```

## Badge

Badge di panel berbentuk kapsul lembut: tinggi 20px, latar 12% warna status di atas kartu, teks berwarna status, tanpa garis.

Warnanya dibaca dari atribut, bukan dari kelas:

- `data-status`: dipasang otomatis oleh `PaymentStatusBadge`, `BookingStatusBadge`, dan `CourtStatusBadge`.
- `data-nada`: untuk badge buatan halaman (`hijau`, `oranye`, `merah`, `biru`). Tanpa nilai, badge berwarna abu.

```tsx
<Badge data-nada="oranye">Sementara</Badge>
```

Aturan ini ditulis di luar `@layer`, supaya menang atas kelas varian `Badge`, dan hanya berlaku di `.tema-pengelola`. Badge penyewa tetap solid.

Setiap badge status di tabel dibungkus `BadgeTip`, supaya punya tooltip yang menjelaskan statusnya.

## Mode gelap

- Mode gelap memakai kelas `.dark` di `<html>`, sama dengan `@custom-variant dark` di `app.css`.
- Pilihan disimpan per perangkat di cookie `tema_pengelola` (`gelap` atau `terang`). Tanpa cookie, tema mengikuti pengaturan sistem.
- Tombolnya ada di header panel, di menu akun, dan di halaman login pengelola (`TombolTema`).
- Tooltip di mode gelap memakai permukaan `popover` dengan garis tepi, karena tooltip bawaan berwarna terbalik dan menjadi putih menyala di mode gelap.

## Aturan

- Semua warna di komponen panel diambil dari token. Tidak ada nilai warna mentah di file `.tsx`.
- Teks `muted-foreground` minimal 14px.
- Jangan pakai `accessible-green` atau `accessible-orange` sebagai teks di bawah 14px di atas kartu.
- Periksa setiap halaman di mode terang dan gelap.

## FAQ

**Bagaimana mengubah warna biru panel tanpa mengubah biru penyewa?**
Ubah `--primary`, `--ring`, dan `--sidebar-primary` di `admin.css`. Token penyewa di `app.css` tidak terpengaruh.

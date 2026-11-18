---
title: Bentuk, jarak, dan gerak
urutan: 4
---

# Bentuk, jarak, dan gerak

::: info Tentang halaman ini
- **Sumber di kode:** `resources/css/app.css` (`--radius`, blok `@supports (corner-shape: squircle)`), `Components/ui/button.tsx`, `Components/ui/input.tsx`
:::

## Sudut

| Variabel | Nilai | Kelas |
| --- | --- | --- |
| `--radius` | `0.625rem` (10px), atau `0.75rem` di browser yang mendukung squircle | dasar untuk tiga di bawah |
| `--radius-lg` | sama dengan `--radius` | `rounded-lg`: tombol, isian, popup, kartu |
| `--radius-md` | `--radius` − 2px | `rounded-md`: item menu, item pilihan, checkbox |
| `--radius-sm` | `--radius` − 4px | `rounded-sm` |

`rounded-xl`, `rounded-2xl`, dan `rounded-full` memakai nilai tetap Tailwind, dan tidak ikut `--radius`.

### Squircle

Di browser yang mendukung `corner-shape`, semua sudut dibuat halus seperti ikon iPhone:

```css
@supports (corner-shape: squircle) {
  :root {
    --corner-smoothing: 1.5;
    --radius: 0.75rem;
  }
  /* corner-shape: superellipse(var(--corner-smoothing)) untuk semua elemen, kecuali .rounded-full */
}
```

- `--corner-smoothing`: `1` bulat biasa, `1.5` sedikit halus (dipakai sekarang), `2` mirip iOS.
- `--radius` dinaikkan ke 0,75rem karena squircle terlihat lebih kecil.
- Browser lain mengabaikan blok ini dan memakai sudut biasa.

Untuk mengubah besar sudut, ubah `--radius` di **dua** tempat: lapis 2 dan blok squircle.

## Jarak

Semua jarak kelipatan 4px (`--spacing` bawaan Tailwind). `p-4` = 16px, `gap-2` = 8px.

| Elemen | Ukuran |
| --- | --- |
| Isian, select, combobox | `h-10` (40px), teks 16px, `px-4` |
| Tombol | `h-8` (32px). `sm` = 28px, `lg` = 36px |
| Jarak antarfield di form | `space-y-4` |
| Lebar isi halaman penyewa | maksimal 1280px (`max-w-7xl`), jarak tepi 16, 24, lalu 32px |
| Kolom form tamu | 360px |
| Halaman Profile | 640px |

## Garis dan bayangan

- Garis selalu 1px dengan warna `border` atau `input`. Beberapa kartu penyewa memakai `border-[0.5px]` agar terlihat lebih halus.
- Permukaan diangkat dengan bayangan, bukan garis yang lebih tebal: `shadow-sm` untuk kartu, `shadow-lg` untuk popup dan menu, `shadow-xl` untuk sheet.

## Tombol `elevated`

Tombol utama penyewa. Bentuknya timbul tanpa bayangan jatuh:

- latar `primary`
- garis tipis 0,5px berwarna `primary`
- kilap putih 40% di tepi atas
- bayangan putih 24% di dalam.

Dipakai hanya untuk satu aksi utama per halaman: Booking sekarang (Home), Kirim bukti pembayaran (Bayar), Login (halaman tamu).

## Keadaan

| Keadaan | Tampilan |
| --- | --- |
| Disorot | Isian menggelap (`primary/80`) atau diberi latar `muted` |
| Ditekan | Tombol turun 1px (`translate-y-px`) |
| Nonaktif | Opasitas 50%, tidak bisa diklik |
| Galat | `aria-invalid` mengubah garis dan cincin menjadi `destructive` |
| Fokus keyboard | Cincin `ring` 3px dengan transparansi 50% |

## Gerak

Gerak dibuat kecil dan cepat:

- transisi warna dan opasitas
- popup dan dialog: memudar dan membesar 150–200 milidetik
- sheet: meluncur 300 milidetik
- popup pembayaran: naik 40px saat muncul, sheet dari bawah di HP
- animasi khusus halaman, seperti header Home yang meringkas dan penampil foto galeri.

Semua animasi besar dimatikan kalau perangkat memilih "kurangi gerakan" (`prefers-reduced-motion`), lewat `motion-safe:` dan `motion-reduce:`.

## FAQ

**Kenapa di browser saya sudutnya tidak terlihat halus?**
`corner-shape` baru didukung sebagian browser. Browser lain tetap menampilkan sudut bulat biasa, dan tampilannya tetap benar.

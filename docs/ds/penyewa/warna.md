---
title: Warna
urutan: 2
---

# Warna

::: info Tentang halaman ini
- **Sumber di kode:** `resources/css/app.css` (blok `@theme`, `:root`, `.dark`)
- **Panduan lengkap:** `panduan.md` bagian 1 dan 2 di repo aplikasi
:::

## Ringkasan

Warna disusun dalam tiga lapis. Komponen hanya memakai lapis 2 (nama shadcn seperti `bg-primary`). Nilai warnanya hanya diubah di lapis 1.

## Lapis 1: warna iOS

62 variabel warna dari Figma, namanya ditulis kebab-case: `Labels/Secondary` menjadi `labels-secondary`, `Backgrounds (Grouped)/Secondary` menjadi `backgrounds-grouped-secondary`. Transparansi disimpan sebagai hex 8 digit, misalnya `#3c3c4399` (60%).

Kelompoknya: Accents, Backgrounds, Backgrounds (Grouped), Fills, Grays, Labels, Overlays, Separators, dan Miscellaneous.

| Variabel | Terang | Gelap |
| --- | --- | --- |
| `accents-blue` | <span class="swatch" style="background:#0088ff"></span>`#0088ff` | <span class="swatch" style="background:#0091ff"></span>`#0091ff` |
| `accents-green` | <span class="swatch" style="background:#34c759"></span>`#34c759` | <span class="swatch" style="background:#30d158"></span>`#30d158` |
| `accents-red` | <span class="swatch" style="background:#ff383c"></span>`#ff383c` | <span class="swatch" style="background:#ff4245"></span>`#ff4245` |
| `accents-orange` | <span class="swatch" style="background:#ff8d28"></span>`#ff8d28` | <span class="swatch" style="background:#ff9230"></span>`#ff9230` |
| `labels-primary` | <span class="swatch" style="background:#000"></span>`#000000` | <span class="swatch" style="background:#fff"></span>`#ffffff` |
| `backgrounds-grouped-primary` | <span class="swatch" style="background:#f2f2f7"></span>`#f2f2f7` | <span class="swatch" style="background:#000"></span>`#000000` |
| `backgrounds-grouped-secondary` | <span class="swatch" style="background:#fff"></span>`#ffffff` | <span class="swatch" style="background:#1c1c1e"></span>`#1c1c1e` |
| `separators-opaque` | <span class="swatch" style="background:#c6c6c8"></span>`#c6c6c8` | <span class="swatch" style="background:#38383a"></span>`#38383a` |

### Warna `accessible-*`

Enam warna tambahan, bukan dari Figma, dari nilai Apple HIG *Increased contrast*:

| Variabel | Terang | Kenapa ada |
| --- | --- | --- |
| `accessible-blue` | <span class="swatch" style="background:#1e6ef4"></span>`#1e6ef4` | Teks putih di atas `accents-blue` hanya 3,5:1 |
| `accessible-green` | <span class="swatch" style="background:#008932"></span>`#008932` | `accents-green` hanya 2,2:1 |
| `accessible-red` | <span class="swatch" style="background:#e9152d"></span>`#e9152d` | `accents-red` hanya 3,6:1 |
| `accessible-orange` | <span class="swatch" style="background:#c55300"></span>`#c55300` | Untuk status Menunggu dan Perbaikan |
| `accessible-teal` | <span class="swatch" style="background:#008198"></span>`#008198` | Warna grafik ke-5 |
| `accessible-gray` | <span class="swatch" style="background:#6c6c70"></span>`#6c6c70` | `labels-secondary` hanya 3,4:1 |

Di mode gelap, `accessible-*` kembali ke warna Figma, kecuali `accessible-blue` yang tetap `#1e6ef4`.

Aturannya: `accessible-*` untuk teks atau latar yang berisi tulisan. `accents-*` hanya untuk hiasan tanpa tulisan, seperti titik status atau ikon besar.

## Lapis 2: peran (nama shadcn)

| Token | Diarahkan ke | Dipakai untuk |
| --- | --- | --- |
| `canvas` | `oklch(0.97 0 0)` (abu netral shadcn) | Latar halaman di belakang kartu |
| `background` | `backgrounds-primary` (putih) | Isian form, dialog, sheet, tombol outline |
| `card` | `backgrounds-grouped-secondary` | Kartu |
| `popover` | `backgrounds-grouped-secondary-elevated` | Dropdown, popover |
| `foreground` | `labels-primary` | Teks utama |
| `muted` | `fills-tertiary` | Latar abu tipis |
| `muted-foreground` | `accessible-gray` | Keterangan |
| `accent` | `fills-secondary` | Item menu yang disorot |
| `secondary` | `grays-gray-5` | Tombol atau badge sekunder |
| `border`, `input` | `separators-opaque` | Semua garis |
| `primary` | `accessible-blue` | Aksi utama, item terpilih |
| `destructive` | `accessible-red` | Hapus, galat, ditolak |
| `success` | `accessible-green` | Berhasil, terverifikasi |
| `chart-1` … `chart-5` | biru, hijau, oranye, indigo, teal | Grafik |
| `sidebar-*` | abu netral shadcn | Sidebar Admin dan Manager |

`canvas` sengaja memakai abu netral shadcn, bukan `backgrounds-grouped-primary` (`#f2f2f7`), karena abu iOS terasa kebiruan.

### Pasangan latar dan teks

Teks di atas latar berwarna memakai pasangan `-foreground`: `bg-primary` dengan `text-primary-foreground`, `bg-success` dengan `text-success-foreground`, dan seterusnya. Dengan pasangan ini, kontras tetap aman di kedua mode.

## Lapis 3: kelas Tailwind

Setiap token menjadi kelas Tailwind otomatis: `bg-primary`, `text-muted-foreground`, `border-input`. Warna iOS juga tersedia langsung (`text-labels-secondary`, `bg-accents-orange`), tetapi kode sebaiknya memakai nama peran.

Transparansi ditulis dengan garis miring: `bg-primary/15`, `bg-destructive/10`.

## Kontras

Semua pasangan teks lolos 4,5:1 di kedua mode, kecuali:

- `primary` sebagai teks di atas kartu gelap (3,7:1)
- `ring` sebagai teks di mode terang (3,5:1), sehingga hanya dipakai untuk cincin fokus
- `border` di bawah 3:1, sama dengan Figma.

## Jangan dipakai

- Kelas warna bawaan Tailwind seperti `bg-gray-100`, `text-indigo-600`, `bg-white`. Kelas ini tidak ikut berubah di mode gelap.
- Kode warna langsung seperti `bg-[#1e6ef4]`.
- `dark:` untuk mengganti warna, karena token sudah berganti sendiri.

## Menambah token baru

Contoh `warning`:

1. Lapis 2, di dekat `--success`:

   ```css
   --warning: var(--accessible-orange);
   --warning-foreground: var(--grays-white);
   ```

2. `@theme`, di dekat `--color-success`:

   ```css
   --color-warning: var(--warning);
   --color-warning-foreground: var(--warning-foreground);
   ```

3. Kelas `bg-warning`, `text-warning`, dan `text-warning-foreground` langsung bisa dipakai.

## FAQ

**Kenapa status "Menunggu" berwarna oranye, padahal tidak ada token `warning`?**
Belum ada token peringatan. Status Menunggu memakai `accessible-orange` secara langsung.

**Halaman penyewa tidak punya mode gelap. Kenapa tokennya punya nilai gelap?**
Nilai gelap disiapkan sesuai Figma, dan dipakai komponen yang tampil di kedua sisi. Halaman penyewa sendiri tidak memasang kelas `.dark`.

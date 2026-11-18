---
title: Ikhtisar
urutan: 1
---

# DS penyewa: ikhtisar

::: info Tentang halaman ini
- **Sumber di kode:** `resources/css/app.css` (token), `resources/js/Components/ui/` (komponen), `panduan.md` (panduan gaya, bahasa Indonesia)
- **Sumber rancangan:** artifact Design System **Buddhi Sports** (namespace `BuddhiSports`)
- **Berlaku untuk:** halaman penyewa (Home, Booking saya, Bayar, Profile) dan halaman tamu (Landing, Login, Register)
:::

## Ringkasan

DS penyewa adalah bahasa visual aplikasi yang dipakai penyewa. Dasarnya **palet iOS** dari file Figma "ada iPhone duo nya" › Colors, dipasang ke komponen gaya **shadcn/ui** (style `base-nova`, base color `neutral`) di atas Base UI. Hasilnya terasa seperti aplikasi iPhone: ramah, foto besar, sudut membulat, dan satu warna biru untuk aksi utama.

Panel Admin dan Manager memakai sistem lain, [DS administrator](/ds/administrator/ikhtisar). Keduanya satu produk, tetapi tokennya tidak boleh dicampur.

| | Penyewa | Pengelola |
| --- | --- | --- |
| Palet | iOS (terang dan gelap) | shadcn/ui netral dengan primary biru |
| Mode gelap | Token ada, tetapi halaman penyewa selalu terang | Ada, dipilih per perangkat |
| Nada | Ramah, foto besar, sudut membulat | Padat, banyak data, tabel |
| Ukuran teks dasar | 16px di isian form, 14px untuk teks UI | 14px |
| Sudut | 0,75rem dengan squircle | 0,5rem |

## Prinsip

1. **Satu aksi utama per layar.** Hanya satu tombol `elevated` (biru timbul) di setiap halaman: Booking sekarang di Home, Kirim bukti di Bayar. Aksi lain memakai `outline`, `ghost`, atau `link`.
2. **Status selalu punya kata.** Warna tidak pernah berdiri sendiri. Setiap status punya label, dan sebagian besar juga punya ikon.
3. **Kontras minimal 4,5:1.** Karena warna iOS bawaan Figma terlalu terang untuk teks, ada enam warna `accessible-*` untuk teks dan latar bertulisan.
4. **Ramah di layar kecil.** Isian form setinggi 40px dengan teks 16px, supaya Safari di iPhone tidak memperbesar halaman. Popup berubah menjadi sheet dari bawah di HP.
5. **Tidak ada informasi atau tombol yang berulang** di satu layar.

## Tiga lapis token

```text
kelas Tailwind        bg-primary
  → @theme            --color-primary: var(--primary)        (penghubung, jangan diubah)
  → lapis 2 (shadcn)  --primary: var(--accessible-blue)      (peran: tombol utama)
  → lapis 1 (iOS)     --accessible-blue: #1e6ef4              (nilai warna)
```

Penjelasan lengkap ada di [Warna](./warna).

## Di mana mengubah apa

| Ingin mengubah | Tempatnya |
| --- | --- |
| Nilai sebuah warna | Lapis 1 di `app.css`, blok `:root` dan `.dark` |
| Warna yang dipakai sebuah peran | Lapis 2 di `app.css` |
| Satu komponen saja | File komponennya di `Components/ui/` |
| Besar sudut | `--radius` di lapis 2 **dan** di blok squircle |
| Font | `--font-sans` dan impor font di awal `app.css` |

## Halaman di bagian ini

- [Warna](./warna): tiga lapis token, peran setiap warna, kontras.
- [Tipografi](./tipografi): Geist dan skala 11 gaya.
- [Bentuk, jarak, dan gerak](./bentuk-jarak): sudut squircle, ukuran kontrol, bayangan, animasi.
- [Komponen](./komponen): daftar komponen dan kapan memakainya.
- [Pola halaman](./pola-halaman): susunan halaman penyewa.
- [Menulis untuk penyewa](./menulis): bahasa, istilah, angka, dan jam.

## FAQ

**Kalau rancangan di artifact berbeda dengan kode, mana yang benar?**
Kode. Artifact DS mengikuti repo, bukan sebaliknya. Setelah ada perubahan tampilan di repo, artifact disinkronkan.

**Kenapa font-nya Geist, bukan SF Pro seperti iPhone?**
SF Pro hanya boleh dipakai di perangkat Apple. Geist dipakai di semua perangkat.

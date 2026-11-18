---
title: Ikhtisar
urutan: 1
---

# DS administrator: ikhtisar

::: info Tentang halaman ini
- **Sumber di kode:** `resources/css/admin.css` (token tema panel), `Components/pengelola/`, `Components/admin/`, `Layouts/AdminSidebarLayout.tsx`, `Layouts/PengelolaGuestLayout.tsx`
- **Sumber rancangan:** artifact Design System **Design System Administrator** dan kanvas "Redesign Dashboard Admin"
- **Berlaku untuk:** semua halaman Admin, Manager, dan login pengelola
:::

## Ringkasan

DS administrator adalah bahasa visual panel pengelola, tempat Admin dan Manager memverifikasi pembayaran, memantau jadwal, dan membuat laporan. Dasarnya **shadcn/ui netral**: abu tanpa warna dengan satu warna biru untuk `primary`, plus mode gelap.

Sistem ini terpisah dari [DS penyewa](/ds/penyewa/ikhtisar). Kalau sebuah pola dipakai di kedua sisi, salin polanya, jangan tokennya.

| | Penyewa | Pengelola (sistem ini) |
| --- | --- | --- |
| Palet | iOS | shadcn/ui netral, primary biru |
| Mode gelap | Tidak dipakai | Ada, dipilih per perangkat |
| Nada | Ramah, foto besar | Padat, banyak data, tabel |
| Ukuran teks dasar | 16px di isian | 14px |
| Sudut | 0,75rem dengan squircle | 0,5rem |

## Prinsip

1. **Jawab "apa tugas saya hari ini".** Layar dibuka dengan ringkasan satu kalimat, lalu angka hari ini, lalu daftar yang perlu ditindak. Data lama ada di Laporan dan Analisis, bukan di dashboard.
2. **Satu aksi utama per layar.** Hanya satu tombol `primary`. Sisanya `outline` atau `ghost`.
3. **Status punya bentuk, bukan hanya warna.** Setiap status punya ikon dan label, dan setiap badge punya tooltip.
4. **Angka bisa ditelusuri.** Setiap angka ringkasan punya keterangan asalnya, misalnya "9 dari 56 jam" atau "6 pembayaran".
5. **Antrean siapa cepat dia dapat.** Yang paling lama menunggu ada di atas.
6. **Server menghitung, React menampilkan.** Angka, persen, dan kalimat analitik disusun di PHP.

## Cara tema dipasang

```text
HandleInertiaRequests: temaPanel = true untuk Admin, Manager, dan /login-pengelola
  → app.blade.php memasang <html class="tema-pengelola"> (muatan pertama, tanpa berkedip)
  → app.tsx: sinkronTemaPanel() setiap pindah halaman
  → admin.css: html.tema-pengelola { --primary: ...; --border: ...; ... }
```

Karena token ditimpa di `<html>`, komponen `ui/` yang sama otomatis tampil dengan palet panel, termasuk dropdown, dialog, dan sheet yang muncul di luar halaman.

Panel Manager memakai tema ini sejak 14 November 2026. Acuannya `temaPanel` di `HandleInertiaRequests.php`.

## Halaman di bagian ini

- [Warna dan tema](./warna-tema): token terang dan gelap, warna status, badge.
- [Tipografi dan tata letak](./tata-letak): ukuran teks, sidebar, header, jarak.
- [Komponen](./komponen): komponen panel dan padanannya di kode.
- [Pola halaman](./pola-halaman): dashboard, halaman data, sheet, mode hanya lihat.
- [Menulis untuk pengelola](./menulis): bahasa, tombol, pesan galat.

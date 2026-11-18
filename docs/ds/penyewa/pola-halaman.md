---
title: Pola halaman
urutan: 6
---

# Pola halaman

::: info Tentang halaman ini
- **Sumber di kode:** `resources/js/Layouts/PenyewaLayout.tsx`, `GuestLayout.tsx`, halaman di `resources/js/Pages/`
- **Sumber rancangan:** kanvas "Canvas Design" (Home, Booking saya, Bayar), "Buddhi Sports — Login & Daftar", "Buddhi Sports — Profile penyewa", dan "Buddhi Sports — Home penyewa redesign"
:::

## Ringkasan

Halaman penyewa mengikuti beberapa pola yang sama. Halaman baru sebaiknya memakai pola yang sudah ada, bukan membuat susunan baru.

## Bingkai

```text
┌──────────────────────────────────────────┐
│ Navigasi (menempel di atas)              │  64px, 80px mulai lg
├──────────────────────────────────────────┤
│ bg-canvas                                │
│   ┌──────────────────────────────────┐   │
│   │ isi, maksimal 1280px di tengah   │   │
│   └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

- Latar halaman `bg-canvas`, isi di atas kartu putih (`bg-card`).
- Navigasi menempel di atas. Kolom lain yang ikut menempel butuh jarak atas, misalnya `lg:top-24`.
- Halaman tidak membuat kontainer sendiri. Layout sudah menyediakannya.

## Halaman tamu

- Tanpa kartu. Satu kolom 360px di tengah, dengan foto benda olahraga di sekelilingnya (`AuthScene`).
- Judul besar dengan emoji (satu-satunya tempat emoji dipakai), lalu form.
- Tombol utama `elevated`, selebar kolom.

## Dua kolom: isi dan ringkasan

Dipakai di Home dan Bayar.

- Mulai layar `lg`: isi di kiri, ringkasan di kanan yang menempel saat digulir.
- Di bawah `lg`: ringkasan diganti **bar bawah** yang menempel di bawah layar, berisi harga dan tombol utama.
- Bar bawah memakai `env(safe-area-inset-bottom)`, supaya tidak tertutup garis navigasi HP.

## Popup yang menjadi sheet

Dipakai untuk popup pembayaran, Ubah jadwal, dan Lihat bukti.

- Mulai 640px: dialog 720px di tengah layar, naik 40px saat muncul.
- Di bawah 640px: sheet dari bawah dengan sudut atas membulat.
- Tombol tutup bulat yang menempel saat isi digulir.

Kelasnya ada di `booking/popup.ts` (`kelasPopup`).

## Daftar yang dikelompokkan

Dipakai di Booking saya.

- Tab dengan angka (Mendatang, Riwayat) dan garis bawah yang bergeser.
- Kelompok per hari ("Hari ini · Kamis, 5 November") atau per bulan.
- Setiap kartu punya **satu** tombol aksi.

## Baris yang bisa dibuka

Dipakai di Profile.

- Kotak putih berisi baris yang dipisah garis.
- Setiap baris: label, nilai tersamar, tombol Ubah.
- Ubah membuka form di bawah baris itu seperti akordeon. Hanya satu baris yang terbuka, baris lain diredupkan.

## Keadaan kosong

`Empty` dengan gambar 3D, satu kalimat yang menjelaskan keadaan, dan satu tombol ke langkah berikutnya. Contoh: "Belum ada booking", lalu tombol Pesan lapangan.

## Peringatan

`Alert` dipakai untuk keadaan yang perlu diperhatikan, misalnya "GOR sudah tutup untuk hari ini" atau "Jangan transfer untuk jadwal ini". Warnanya hanya di garis tepi, latar tipis, dan ikon. Teksnya tetap warna teks biasa.

## Aturan

- Satu tombol `elevated` per halaman.
- Tidak ada informasi atau tombol yang berulang di satu layar.
- Halaman diperiksa di lebar 390, 768, 1024, dan 1440px, tanpa gulir ke samping.
- Halaman penyewa selalu mode terang.

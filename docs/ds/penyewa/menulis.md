---
title: Menulis untuk penyewa
urutan: 7
---

# Menulis untuk penyewa

::: info Tentang halaman ini
- **Berlaku untuk:** semua teks di halaman penyewa dan tamu, termasuk pesan galat yang ditulis di controller
- **Lihat juga:** [Menulis untuk pengelola](/ds/administrator/menulis)
:::

## Bahasa

- Halaman setelah login memakai **Bahasa Indonesia** dengan sapaan **"Anda"**.
- Halaman tamu (Login, Register, reset password) memakai **Bahasa Inggris**, sesuai pilihan pemilik proyek. Contohnya "Welcome back👋, mate!" dan "Create an account".
- Pesan galat bawaan Laravel memakai Bahasa Inggris (`APP_LOCALE=en`). Pesan yang ditulis sendiri di controller memakai Bahasa Indonesia.
- Kata serapan yang tetap dipakai: Login, Password, Email, Profile, Log Out, Booking.

## Istilah

| Pakai | Jangan pakai |
| --- | --- |
| pengelola | admin (di layar penyewa) |
| bukti bayar, bukti transfer | payment proof |
| lapangan | court |
| jam kosong | slot available |

Ke penyewa, Admin dan Manager selalu disebut **pengelola**. Penyewa tidak perlu tahu pembagian peran di dalam.

## Kata status

Kata status selalu sama di semua tempat:

| Status | Kata di layar |
| --- | --- |
| Booking belum dibayar | Belum dibayar |
| Bukti dikirim | Menunggu verifikasi |
| Bukti ditolak | Ditolak, dengan alasannya |
| Booking dikonfirmasi | Dikonfirmasi, atau Selesai kalau tanggalnya sudah lewat |
| Booking batal | Dibatalkan, dengan penyebab: Anda, otomatis, atau pengelola |
| Lapangan diperbaiki | Dalam perbaikan |

## Angka, uang, dan waktu

| Jenis | Cara menulis | Contoh |
| --- | --- | --- |
| Uang | `Rp` tanpa spasi, titik ribuan, lewat `formatRupiah` | Rp50.000 |
| Jam | dengan titik (EYD), lewat `formatJam` atau `jamTeks` | 16.00–18.00 |
| Hitung mundur | menit:detik | 12:07 |
| Tanggal | nama hari dan bulan Indonesia | Kamis, 26 Nov |
| Persen | koma desimal, tanpa spasi | 12,5% |

Nilai yang dikirim ke server tetap `HH:MM` (misalnya `16:00`). Titik hanya untuk tampilan.

## Kalimat

- Pendek, satu ide per kalimat.
- Tombol memakai kata kerja yang menyebut hasilnya: **Booking sekarang**, **Kirim bukti pembayaran**, **Simpan jadwal**, **Batalkan booking**.
- Pesan galat menyebut sebab dan jalan keluar: "Jam ini sudah diambil penyewa lain yang lebih dulu mengirim bukti bayar. Ubah jadwal atau batalkan booking ini."
- Konfirmasi menyebut akibatnya: "Batalkan booking ini? Jadwalnya dilepas untuk orang lain. Tidak ada biaya."
- Kalimat yang menenangkan di tempat yang membuat ragu: "Anda belum dikenakan biaya."
- Sentence case untuk judul dan tombol. Tanpa emoji, kecuali judul halaman tamu.

## FAQ

**Kenapa ada "Hubungi pengelola" sebagai tautan WhatsApp?**
Nomornya diatur di `.env` (`PENGELOLA_WA`). Kalau nomor tersedia, teks itu menjadi tautan `wa.me` dengan pesan pembuka. Kalau tidak, teks tampil tebal tanpa tautan. Semua tempat memakai komponen `HubungiPengelola`.

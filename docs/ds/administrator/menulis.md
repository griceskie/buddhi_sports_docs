---
title: Menulis untuk pengelola
urutan: 6
---

# Menulis untuk pengelola

::: info Tentang halaman ini
- **Berlaku untuk:** semua teks di panel Admin dan Manager, termasuk pesan galat dan notifikasi dari server
- **Lihat juga:** [Menulis untuk penyewa](/ds/penyewa/menulis)
:::

## Bahasa

- Bahasa Indonesia dengan sapaan **"Anda"**.
- Tanpa istilah teknis sistem. Tulis "bukti bayar", bukan "payload pembayaran". Tulis "log aktivitas", bukan "audit trail".
- Label menu dan judul memakai sentence case: "Laporan pembayaran", "Log aktivitas", "Analisis bisnis".

## Istilah

| Istilah | Artinya |
| --- | --- |
| penyewa | Orang yang menyewa lapangan |
| pengelola | Admin dan Manager |
| lapangan | Satu lapangan (Airlangga, Cendrawasih, Garuda, Merpati) |
| sesi | Satu booking yang dimainkan |
| bukti bayar | Foto bukti transfer dari penyewa |
| verifikasi | Memeriksa bukti bayar, lalu menerima atau menolak |
| laporan pembayaran | Laporan bulanan yang dibuat Admin dan diperiksa Manager |

## Tombol

Tombol memakai kata kerja yang menyebut akibatnya:

- **Terima pembayaran**, **Terima & berikutnya**, **Tolak**, **Tolak pembayaran**
- **Buat laporan**, **Buat ulang laporan**, **Tandai diperiksa**, **Minta revisi**
- **Tambah booking**, **Simpan**, **Batal**, **Hapus**

## Pesan galat

Pesan galat menyebut sebab dan jalan keluarnya:

- "Masih ada 2 bukti bayar Oktober 2026 yang menunggu verifikasi. Selesaikan dulu, lalu buat laporannya."
- "Laporan November 2026 baru bisa dibuat setelah bulannya selesai."
- "Admin tidak bisa dihapus karena masih tercatat di booking, pembayaran, atau laporan."

## Angka dan waktu

| Jenis | Contoh |
| --- | --- |
| Uang | Rp15.950.000, ringkas di grafik: Rp5 jt |
| Jam | 16.00–18.00 (titik, sesuai EYD) |
| Tanggal | Sel, 17 Nov 2026 |
| Persen | 12,5% |
| Perubahan | +8,1%, −2,4% |
| Lama | 1 jam 15 menit |

## Teks pendukung

- Setiap angka ringkasan punya keterangan asalnya: "9 dari 56 jam", "dari 6 pembayaran".
- Tombol nonaktif punya tooltip yang menjelaskan kenapa.
- Alasan penolakan bukti ditulis untuk penyewa, karena penyewa akan membacanya.

## FAQ

**Kenapa ke penyewa tertulis "pengelola", tetapi di panel tertulis "Admin"?**
Di panel, pembagian peran penting: Admin memverifikasi, Manager memeriksa laporan. Penyewa tidak perlu tahu pembagian itu, jadi ke penyewa keduanya disebut pengelola.

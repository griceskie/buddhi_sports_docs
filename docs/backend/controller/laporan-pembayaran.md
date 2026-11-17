---
title: LaporanPembayaranController.php
urutan: 9
---

# LaporanPembayaranController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/LaporanPembayaranController.php`
- **Jenis:** controller (PHP)
- **Dipakai oleh:** route di [web.php](/backend/route/web): `buat()` untuk Admin, `unduh()` untuk Admin dan Manager
- **Berhubungan dengan:** template PDF `resources/views/pdf/laporan-pembayaran.blade.php`, [LogAktivitas](/backend/support/log-aktivitas) (jangkar log), [DialogLaporan](/frontend/komponen/dialog-laporan), [MasterLaporanPembayaranController](./master-laporan-pembayaran)
:::

## Ringkasan

Controller ini membuat PDF laporan pembayaran bulanan dan membukanya kembali. Tombol Buat laporan di halaman Laporan pembayaran Admin membuka [DialogLaporan](/frontend/komponen/dialog-laporan). Admin memilih Manager tujuan, lalu tanda tangan. Setelah dikirim, `buat()` menyusun PDF dengan dompdf, menyimpannya di disk privat, dan mencatat laporannya sebagai sudah diserahkan.

| Route | Fungsi | Siapa |
| --- | --- | --- |
| `POST /laporanpembayaran/buat` | `buat()` | Admin |
| `GET /laporanpembayaran/{id}/pdf` | `unduh()` | Admin dan Manager |

## Isi file

### `namaLaporan()`

```php
return 'Laporan Pembayaran '.Carbon::create($tahun, $bulan, 1)->locale('id')->translatedFormat('F Y');
```

Contoh: `namaLaporan(10, 2026)` menghasilkan "Laporan Pembayaran Oktober 2026". Fungsi ini dipakai di banyak tempat (log, notifikasi, halaman), supaya nama laporan selalu sama.

### `alasanTidakBisaDibuat()`

Mengembalikan alasan kalau laporan bulan itu belum boleh dibuat, atau `null` kalau boleh. Ada tiga alasan:

1. Bulannya belum selesai (bulan ini atau bulan depan).
2. Bulannya sebelum data pertama.
3. Masih ada bukti bayar di bulan itu yang menunggu verifikasi.

Aturan ini sama dengan keadaan `berjalan`, `kosong`, dan `tertahan` di halaman Laporan, jadi tombol yang terlihat aktif di halaman memang akan diterima server.

### `buat()`

**Logikanya:**

1. **Validasi**:
   - bulan dan tahun
   - Manager tujuan
   - tanda tangan berupa teks yang diawali `data:image/jpeg;base64,` dan tidak lebih dari 400.000 karakter.
2. **Periksa isi tanda tangan.** Bagian setelah awalan diubah kembali dari base64. Hasilnya harus diawali tiga byte `FF D8 FF`, tanda pengenal file JPEG. Dengan begitu, teks yang hanya meniru awalan tetap ditolak.
3. **Tolak** kalau laporan bulan itu sudah diperiksa Manager, atau kalau `alasanTidakBisaDibuat()` mengembalikan alasan.
4. **Ambil pembayaran** `Terverifikasi` bulan itu, beserta booking, penyewa, dan lapangan, diurutkan menurut tanggal bayar.
5. **Susun PDF** dari template Blade `pdf.laporan-pembayaran`, ukuran A4. Isinya:
   - nama dan periode laporan, tanggal hari ini, nama Admin pembuat, nama Manager tujuan
   - baris pembayaran: kode booking, penyewa, lapangan, jadwal (jam dengan titik), tanggal bayar, jumlah
   - total, tanda tangan, dan jangkar log.
6. **Simpan file** ke disk `local` dengan nama berversi, misalnya `laporan/laporan-pembayaran-2026-10-20261103091512.pdf`. PDF lama tidak ditimpa dan tetap tersimpan sebagai arsip.
7. **Simpan baris laporan** di dalam transaksi. Kalau baris bulan itu sudah ada, baris itu diperbarui. Kalau belum, baris baru dibuat. `tglLaporan` selalu hari ini, dan permintaan revisi sebelumnya dikosongkan. Pembuatan laporan dicatat di log.
8. **Kalau penyimpanan baris gagal**, file PDF yang baru ditulis dihapus lagi, lalu galatnya diteruskan. File dan baris database selalu cocok.

#### Kenapa tanda tangan harus JPEG?

dompdf butuh ekstensi GD untuk membaca PNG, dan PHP di lingkungan proyek ini tidak punya GD. JPEG bisa dibaca tanpa GD. Karena itu, kanvas tanda tangan di browser mengirim JPEG.

#### Jangkar log

```php
'jangkarLog' => LogAktivitas::jangkar(),
```

PDF mencetak ID dan hash baris log terakhir pada saat laporan dibuat. PDF tersimpan di luar database, jadi kalau suatu saat isi tabel log diubah, jangkar di PDF lama tidak cocok lagi dengan isi tabel. Penjelasan lengkapnya ada di [LogAktivitas](/backend/support/log-aktivitas).

#### Subsetting font

```php
->setOption('isFontSubsettingEnabled', true);
```

Tanpa pilihan ini, seluruh font DejaVu (sekitar 800 KB) ikut tertanam di setiap PDF. Dengan pilihan ini, hanya huruf yang dipakai yang ikut, sehingga file jauh lebih kecil.

### `unduh()`

1. Ambil laporan. Kalau tidak ada, tidak punya PDF, atau filenya hilang dari disk, hasilnya 404.
2. Tanpa `?unduh=1`: PDF dibuka di tab browser (`response`).
3. Dengan `?unduh=1`: PDF langsung tersimpan sebagai file (`download`).

Nama file yang diterima pengguna adalah nama laporan, misalnya "Laporan Pembayaran Oktober 2026.pdf", bukan nama berversi di disk.

Route ini ada di grup `auth:admin,manager`, jadi penyewa tidak bisa membukanya.

## Aturan di file ini

- PDF laporan disimpan di disk `local` (privat), tidak pernah di disk `public`.
- Isi PDF hanya dari pembayaran `Terverifikasi` menurut tanggal bayar, sama dengan angka di halaman Laporan dan Analisis.
- Tanggal laporan diisi server. Admin tidak bisa memundurkannya.
- Membuat ulang laporan tidak menghapus PDF lama.

## FAQ

**Bagaimana membuat ulang laporan yang diminta revisi?**
Perbaiki data pembayarannya dulu (kunci bulan itu terbuka selama revisi), lalu tekan Buat laporan lagi. Baris laporan diperbarui, PDF baru dibuat, catatan revisi dikosongkan, dan kunci aktif lagi.

**Di mana file PDF lama?**
Masih di `storage/app/private/laporan/` di server. Aplikasi hanya menautkan PDF terbaru, tetapi file lama tidak dihapus.

**Kenapa nama bulan di PDF berbahasa Indonesia, padahal `APP_LOCALE` bernilai `en`?**
Setiap tanggal di file ini memakai `->locale('id')` secara langsung, jadi tidak bergantung pada pengaturan bahasa aplikasi.

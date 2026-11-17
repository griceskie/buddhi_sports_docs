---
title: MasterLaporanPembayaranController.php
urutan: 8
---

# MasterLaporanPembayaranController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/MasterLaporanPembayaranController.php`
- **Jenis:** controller master data (PHP)
- **Dipakai oleh:** route Admin di [web.php](/backend/route/web)
- **Berhubungan dengan:** [LaporanPembayaranController](./laporan-pembayaran) (membuat PDF), [AnalitikLaporan](/backend/support/analitik-laporan), [KunciLaporan](/backend/support/kunci-laporan), halaman [Master Laporan](/frontend/admin/master-laporan)
:::

## Ringkasan

Controller ini menyiapkan halaman Laporan pembayaran Admin dan menyediakan form Tambah, Edit, dan Hapus untuk baris laporan. Membuat PDF laporan tidak ada di sini, tetapi di [LaporanPembayaranController](./laporan-pembayaran) (tombol Buat laporan).

| Route | Fungsi |
| --- | --- |
| `GET /tampillaporanpembayaran?periode=YYYY-MM` | `tampilData()` |
| `POST /insertlaporanpembayaran` | `insertData()` |
| `POST /updatelaporanpembayaran` | `updateData()` |
| `DELETE /deletelaporanpembayaran/{idhapus}` | `deleteDataLaporanPembayaran()` |

## Isi file

### `BATAS_SERAH`

```php
public const BATAS_SERAH = 5;
```

Laporan sebuah bulan harus diserahkan paling lambat tanggal 5 bulan berikutnya. Laporan Oktober 2026 berbatas 5 November 2026. Konstanta ini juga dipakai [AnalitikBisnis](/backend/support/analitik-bisnis) untuk tab Kinerja Admin.

### `tampilData()`

**Logikanya:**

1. Baca bulan dari `?periode=`. Bawaannya bulan ini.
2. Cari laporan bulan itu, dan hitung bukti yang masih menunggu verifikasi di bulan itu.
3. Tentukan `keadaan` bulan itu.
4. Kirim `tinjauan` (semua data untuk bagian atas halaman), angka analitik bulan ini dan bulan lalu, serta data untuk tabel dan form.

#### Keadaan bulan

```php
$keadaan = match (true) {
    $mulaiCatat && $awal->lt(Carbon::parse($mulaiCatat)->startOfMonth()) => 'kosong',
    $awal->gt($kini) => 'depan',
    $awal->eq($kini) => 'berjalan',
    $laporan && $laporan->diperiksaPada => 'cek',
    $laporan && $laporan->revisiPada => 'revisi',
    $laporan && $laporan->filePdf => 'belum',
    $menunggu > 0 => 'tertahan',
    default => 'siap',
};
```

`match (true)` mengecek setiap syarat dari atas, lalu memakai syarat pertama yang benar. Urutannya penting.

| Keadaan | Artinya | Yang dilihat Admin |
| --- | --- | --- |
| `kosong` | Bulan sebelum data pertama | Belum ada data. |
| `depan` | Bulan yang belum tiba | Belum bisa dibuat. |
| `berjalan` | Bulan ini | Angka sementara, laporan dibuat setelah bulan selesai. |
| `cek` | Sudah diperiksa Manager | Laporan terkunci. |
| `revisi` | Manager meminta revisi | Catatan revisi dan tombol Buat ulang. |
| `belum` | PDF sudah dibuat, belum diperiksa | Menunggu Manager. |
| `tertahan` | Masih ada bukti yang menunggu | Selesaikan verifikasi dulu. |
| `siap` | Semua bukti sudah diproses | Tombol Buat laporan aktif. |

Daftar yang sama dijelaskan dari sisi bisnis di [Alur bisnis](/mulai/alur-bisnis).

#### Isi `tinjauan`

- `batasSerah` dan `hariTerlambat`: tanggal batas dan berapa hari sudah lewat. `max(0, ...)` membuat angkanya tidak pernah negatif.
- `ringkasan`: jumlah dan rupiah per status pembayaran bulan itu.
- `tahunTersedia`: tahun yang bisa dipilih, dari tahun ini mundur sampai tahun data pertama.
- `kini` dan `lalu`: hasil `AnalitikLaporan::untuk()` untuk bulan ini dan bulan sebelumnya, untuk kartu angka dan perbandingan naik atau turun.

### `insertData()`

1. Validasi Admin, Manager, bulan, tahun, tanggal laporan, dan (opsional) pembayaran.
2. Tolak kalau laporan bulan itu sudah ada. Satu bulan hanya punya satu baris laporan.
3. `totalPemasukan` tidak diambil dari form, tetapi dihitung dengan `totalPeriode()`.
4. Simpan dan catat di log.

### `updateData()`

1. Validasi.
2. Tolak kalau laporan sudah diperiksa Manager.
3. Ambil baris lama, 404 kalau tidak ada.
4. Bulan dan tahun tidak ikut diubah, walaupun form mengirimnya. Total dihitung ulang dari pembayaran bulan lama.
5. Simpan dan catat di log.

### `deleteDataLaporanPembayaran()`

Dua penolakan sebelum menghapus:

1. Laporan sudah diperiksa Manager.
2. Laporan sudah diserahkan (punya PDF) dan tidak sedang direvisi. Menghapusnya akan membuka kunci pembayaran bulan itu, jadi tidak boleh.

Kalau lolos, baris dihapus dan dicatat di log, lalu file PDF-nya dihapus dari disk `local`.

### `totalPeriode()`

```php
return (int) DB::table('pembayarans')->where('status', 'Terverifikasi')
    ->whereBetween('tglBayar', [...])->sum('jumlahBayar');
```

Total pemasukan satu bulan: jumlah pembayaran `Terverifikasi` dengan tanggal bayar di bulan itu. Cara hitungnya sama dengan isi PDF.

### `sudahDiperiksa()`

Benar kalau laporan punya `diperiksaPada`.

## Aturan di file ini

- `totalPemasukan` selalu dihitung server, tidak pernah diambil dari isi form.
- Periode sebuah laporan tidak bisa dipindah setelah dibuat.
- Laporan yang sudah diperiksa tidak bisa diubah atau dihapus. Laporan yang sudah diserahkan tidak bisa dihapus.
- Satu bulan, satu baris laporan.

## FAQ

**Apa bedanya form Tambah di sini dengan tombol Buat laporan?**
Form Tambah hanya membuat baris data tanpa PDF. Tombol Buat laporan menjalankan [LaporanPembayaranController](./laporan-pembayaran), yang membuat PDF dengan tanda tangan dan menandai laporan sebagai sudah diserahkan. Dalam pemakaian sehari-hari, Admin cukup memakai Buat laporan.

**Kenapa laporan bulan ini tidak bisa dibuat?**
Bulan ini masih berjalan, jadi angkanya masih bisa berubah. Laporan dibuat setelah bulan selesai, paling lambat tanggal 5 bulan berikutnya.

**Kenapa halaman menulis "Terlambat 3 hari"?**
Hari ini sudah lewat dari tanggal 5 bulan berikutnya, dan laporannya belum diserahkan. Angkanya dihitung dari `batasSerah` sampai hari ini.

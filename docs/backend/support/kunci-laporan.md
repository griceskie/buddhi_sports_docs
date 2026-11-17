---
title: KunciLaporan.php
urutan: 5
---

# KunciLaporan.php

::: info Tentang file ini
- **Lokasi:** `app/Support/KunciLaporan.php`
- **Jenis:** kelas pembantu (PHP)
- **Dipakai oleh:** [MasterPembayaranController](/backend/controller/master-pembayaran)
:::

## Ringkasan

Setelah Admin menyerahkan laporan pembayaran suatu bulan, data pembayaran di bulan itu dikunci. Admin tidak bisa lagi menambah, mengubah, atau menghapus pembayaran yang tanggal bayarnya jatuh di bulan itu. Tujuannya supaya PDF yang sudah diserahkan ke Manager tetap cocok dengan data di aplikasi.

Kunci terbuka lagi selama Manager meminta revisi. Setelah Admin membuat ulang laporannya, atau Manager menandainya diperiksa, kunci menutup lagi.

## Isi file

### `terkunci()`

```php
public static function terkunci(?string $tanggal): bool
{
    if (! $tanggal) {
        return false;
    }
    $t = Carbon::parse($tanggal);

    return DB::table('laporan_pembayarans')
        ->where('bulan', $t->month)->where('tahun', $t->year)
        ->whereNotNull('filePdf')->where('filePdf', '!=', '')
        ->whereNull('revisiPada')
        ->exists();
}
```

**Gunanya:** menjawab "apakah pembayaran dengan tanggal bayar ini terkunci?".

**Logikanya:** pembayaran terkunci kalau ada laporan untuk bulan dan tahun yang sama, dan laporan itu:

1. sudah punya file PDF (artinya sudah dibuat dan diserahkan), dan
2. tidak sedang diminta revisi (`revisiPada` kosong).

Tanggal kosong (`null`) dianggap tidak terkunci.

`Carbon::parse('2026-10-15')` mengubah teks tanggal menjadi objek tanggal, sehingga `->month` (10) dan `->year` (2026) bisa dibaca.

### `pesan()`

```php
public static function pesan(string $tanggal): string
{
    $t = Carbon::parse($tanggal);
    return LaporanPembayaranController::namaLaporan($t->month, $t->year).' sudah diserahkan, jadi pembayaran di bulan itu tidak bisa ditambah, diubah, atau dihapus.';
}
```

Menyusun pesan galat yang ditampilkan ke Admin. Contoh hasilnya: "Laporan Pembayaran Oktober 2026 sudah diserahkan, jadi pembayaran di bulan itu tidak bisa ditambah, diubah, atau dihapus." Nama laporannya dibuat oleh `LaporanPembayaranController::namaLaporan()`, supaya sama dengan nama di PDF.

## Aturan di file ini

- Pengecekan kunci dilakukan di server, di setiap aksi tambah, ubah, dan hapus pembayaran. Tombol yang disembunyikan di halaman hanya membantu tampilan, bukan pengaman.
- Saat pembayaran diubah, cek dua tanggal: tanggal bayar yang lama dan yang baru. Pembayaran tidak boleh dipindahkan keluar dari, atau masuk ke, bulan yang terkunci.
- Terima dan Tolak bukti dari panel verifikasi tidak dicek di sini. Bukti yang masih menunggu tidak mungkin ada di bulan yang laporannya sudah diserahkan, karena laporan tidak bisa dibuat selama masih ada bukti yang menunggu.

## FAQ

**Bagaimana kalau Admin benar-benar perlu memperbaiki pembayaran di bulan yang sudah diserahkan?**
Manager meminta revisi lewat halaman Laporan. Selama revisi terbuka, kunci terbuka. Admin memperbaiki data, lalu membuat ulang laporannya.

**Kenapa memakai tanggal bayar, bukan tanggal main?**
Laporan pembayaran menjumlahkan pemasukan menurut tanggal bayar (`tglBayar`). Kuncinya mengikuti aturan yang sama supaya isi PDF dan data tetap cocok.

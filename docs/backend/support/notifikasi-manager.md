---
title: NotifikasiManager.php
urutan: 8
---

# NotifikasiManager.php

::: info Tentang file ini
- **Lokasi:** `app/Support/NotifikasiManager.php`
- **Jenis:** kelas pembantu (PHP)
- **Dipakai oleh:** [HandleInertiaRequests](/backend/route/handle-inertia-requests) (props bersama `pengelola.notifikasi`)
- **Ditampilkan oleh:** lonceng di `Components/pengelola/NotifikasiHeader.tsx`
:::

## Ringkasan

Kelas ini menyusun isi lonceng notifikasi di header panel Manager. Isinya hanya hal yang bisa ditindaklanjuti Manager, paling banyak 5 baris:

1. Laporan pembayaran yang sudah diserahkan Admin dan menunggu diperiksa.
2. Laporan bulan lalu yang belum diserahkan padahal sudah lewat tanggal 5.

Versi Admin ada di [NotifikasiAdmin](./notifikasi-admin).

## Isi file

### `untuk()`

```php
public static function untuk(Manager $manager): array
{
    $dibaca = $manager->notifDibacaPada ? Carbon::parse($manager->notifDibacaPada) : null;
    // ...
    return [
        'daftar' => $daftar->take(self::BATAS)->values()->all(),
        'baru' => /* jumlah laporan yang lebih baru dari $dibaca */,
    ];
}
```

Hasilnya array dengan dua kunci:

- `daftar`: baris-baris notifikasi.
- `baru`: jumlah notifikasi yang belum dilihat. Angka ini menyalakan titik di lonceng.

#### Kapan sebuah notifikasi dianggap baru

`managers.notifDibacaPada` menyimpan kapan Manager terakhir membuka lonceng. Saat lonceng dibuka, halaman memanggil `POST /notifikasi/dibaca`, dan kolom itu diisi waktu sekarang. Notifikasi dengan waktu sesudah itu dianggap baru. Kalau kolomnya kosong (belum pernah membuka lonceng), semua dianggap baru.

#### Bagian 1: laporan menunggu diperiksa

```php
$menunggu = DB::table('laporan_pembayarans')
    ->whereNotNull('filePdf')->whereNull('diperiksaPada')->whereNull('revisiPada')
    ->orderByDesc('tglLaporan')->orderByDesc('idLaporan')
    ->limit(self::BATAS)
    ->get(['idLaporan', 'namaLaporan', 'tglLaporan']);
```

Laporan yang sudah punya PDF, belum diperiksa, dan tidak sedang diminta revisi. Laporan yang sedang direvisi tidak muncul, karena bolanya ada di Admin, bukan di Manager.

Setiap laporan menjadi satu baris notifikasi:

```php
[
    'id' => 'laporan-'.$r->idLaporan,
    'jenis' => 'laporan',
    'judul' => 'Laporan menunggu diperiksa',
    'ket' => $r->namaLaporan ?? 'Laporan pembayaran',
    'waktu' => /* tglLaporan dalam format ISO */,
    'href' => url('/manager/laporan'),
    'baru' => /* lebih baru dari $dibaca? */,
]
```

`id` dipakai React sebagai `key`. `jenis` menentukan ikon. `href` adalah halaman yang dibuka saat baris diklik.

#### Bagian 2: laporan bulan lalu terlambat

```php
$lalu = today()->subMonthNoOverflow()->startOfMonth();
$batas = $lalu->copy()->addMonthNoOverflow()->day(5);
$ada = DB::table('laporan_pembayarans')->where('bulan', $lalu->month)->where('tahun', $lalu->year)->whereNotNull('filePdf')->exists();
if (! $ada && today()->gt($batas)) {
    $daftar->push([ /* 'jenis' => 'terlambat', 'judul' => 'Laporan Oktober 2026 belum diserahkan', ... */ ]);
}
```

1. `$lalu` adalah tanggal 1 bulan lalu.
2. `$batas` adalah tanggal 5 bulan ini.
3. Kalau laporan bulan lalu belum ada dan hari ini sudah lewat tanggal 5, tambahkan satu baris peringatan.

`subMonthNoOverflow()` mundur satu bulan tanpa "meluber". Contohnya, 31 Maret mundur satu bulan menjadi 28 Februari, bukan 3 Maret.

Notifikasi terlambat tidak pernah ditandai baru (`'baru' => false`), karena sifatnya pengingat yang terus muncul sampai laporannya diserahkan.

## Aturan di file ini

- Notifikasi hanya untuk hal yang bisa ditindaklanjuti peran itu. Manager tidak diberi tahu soal bukti bayar, karena itu tugas Admin.
- Jumlah baris dibatasi `BATAS` (5). Daftar lengkap ada di halaman masing-masing.
- Alamat `href` dibuat dengan `url(...)`, supaya mengikuti alamat aplikasi yang sedang dibuka.

## FAQ

**Kenapa notifikasi tidak disimpan di tabel sendiri?**
Isinya selalu bisa dihitung dari data yang sudah ada, yaitu laporan dan tanggalnya. Menyimpannya di tabel lain hanya menambah data yang harus dijaga agar tetap sama.

**Bagaimana menguji notifikasi terlambat?**
Jalankan aplikasi setelah tanggal 5 tanpa membuat laporan bulan lalu. Dengan data contoh dari `DemoSeeder`, laporan bulan lalu memang belum dibuat, jadi notifikasi ini langsung muncul.

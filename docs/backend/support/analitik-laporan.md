---
title: AnalitikLaporan.php
urutan: 4
---

# AnalitikLaporan.php

::: info Tentang file ini
- **Lokasi:** `app/Support/AnalitikLaporan.php`
- **Jenis:** kelas pembantu untuk hitungan (PHP)
- **Dipakai oleh:** [MasterLaporanPembayaranController](/backend/controller/master-laporan-pembayaran)
- **Ditampilkan oleh:** [AnalitikLaporan.tsx](/frontend/komponen/analitik-laporan) di halaman Laporan pembayaran Admin
:::

## Ringkasan

Kelas ini menghitung semua angka di halaman Laporan pembayaran Admin untuk satu bulan: pemasukan, keterisian lapangan, grafik pemasukan per lapangan, peta jam tersibuk, dan corong booking (berapa booking masuk, berapa yang terkonfirmasi, berapa yang batal). Semua angka dihitung dari data asli, tanpa tabel tambahan.

Tiga jenis angka memakai sumber yang berbeda:

| Angka | Sumber | Dikelompokkan menurut |
| --- | --- | --- |
| Pemasukan dan grafik pemasukan | Pembayaran `Terverifikasi` | Tanggal bayar (sama dengan isi PDF laporan) |
| Keterisian dan jam tersibuk | Booking `Dikonfirmasi` | Tanggal main |
| Booking dan pembatalan | Semua booking | Tanggal main |

Perbedaan ini disengaja. Pemasukan mengikuti kapan uang diterima. Keterisian mengikuti kapan lapangan dipakai.

## Isi file

Kelas ini hanya punya satu fungsi, `untuk(Carbon $awal)`. Parameternya tanggal mana saja di bulan yang diinginkan. Fungsi ini mengembalikan satu array berisi semua angka.

### Persiapan

```php
$dari = $awal->copy()->startOfMonth();
$sampai = $dari->copy()->endOfMonth();
$hariBulan = $dari->daysInMonth;
$rentang = [$dari->toDateString(), $sampai->toDateString()];
$lapangan = DB::table('lapangans')->orderBy('idLapangan')->get(['idLapangan', 'namaLapangan']);
$jamBuka = Pemesanan::JAM_TUTUP - Pemesanan::JAM_BUKA;   // 14 jam
```

- `$rentang` adalah tanggal 1 sampai tanggal terakhir bulan itu, dipakai di `whereBetween`.
- `$jamBuka` adalah lama GOR buka dalam sehari, yaitu 22 dikurangi 8, sama dengan 14 jam.

### Pemasukan

```php
$bayar = DB::table('pembayarans')
    ->join('bookings', 'bookings.idBooking', '=', 'pembayarans.idBooking')
    ->where('pembayarans.status', 'Terverifikasi')
    ->whereBetween('pembayarans.tglBayar', $rentang)
    ->get(['pembayarans.tglBayar', 'pembayarans.jumlahBayar', 'bookings.idLapangan']);
```

Semua pembayaran terverifikasi bulan itu, beserta lapangannya (diambil lewat `join` ke booking). Dari sini dihitung:

- `pemasukan`: jumlah semua `jumlahBayar`.
- `booking`: banyaknya pembayaran.
- `harian`: pemasukan dan jumlah pembayaran per tanggal per lapangan, untuk grafik batang bertumpuk.

```php
foreach ($bayar as $p) {
    $d = (int) substr($p->tglBayar, 8, 2);   // '2026-10-15' -> 15
    $harian[$d][$p->idLapangan][0] = ($harian[$d][$p->idLapangan][0] ?? 0) + (int) $p->jumlahBayar;
    $harian[$d][$p->idLapangan][1] = ($harian[$d][$p->idLapangan][1] ?? 0) + 1;
}
```

`substr($teks, 8, 2)` mengambil 2 karakter mulai dari posisi ke-8 (dihitung dari 0), yaitu bagian tanggal. Bentuk hasilnya: `$harian[15][3] = [150000, 2]`, yang berarti tanggal 15, lapangan nomor 3, Rp150.000 dari 2 pembayaran.

### Keterisian

```php
$terkonfirmasi = DB::table('bookings')->where('status', 'Dikonfirmasi')->whereBetween('tanggal', $rentang)->get([...]);
$jam = fn ($b) => (int) substr($b->jamSelesai, 0, 2) - (int) substr($b->jamMulai, 0, 2);
$jamTerisi = (int) $terkonfirmasi->sum($jam);
$kapasitas = $hariBulan * $jamBuka * max(1, $lapangan->count());
```

- `$jam` adalah fungsi kecil yang menghitung lama satu booking dalam jam. Contoh: 16.00–18.00 menjadi 18 dikurangi 16, sama dengan 2.
- `$jamTerisi` adalah total jam terisi sebulan.
- `$kapasitas` adalah total jam yang mungkin terisi: jumlah hari dikali 14 jam dikali jumlah lapangan. Untuk 31 hari dan 4 lapangan: 31 × 14 × 4 = 1.736 jam.
- `max(1, ...)` mencegah kapasitas nol kalau belum ada lapangan, supaya tidak terjadi pembagian dengan nol di halaman.

Persentase keterisian (`jamTerisi` dibagi `kapasitas`) dihitung di halaman.

`perLapangan` berisi hitungan yang sama untuk setiap lapangan.

### Peta jam tersibuk

```php
$isi = array_fill(0, 7, array_fill(0, $jamBuka, 0));
foreach ($terkonfirmasi as $b) {
    $h = Carbon::parse($b->tanggal)->dayOfWeekIso - 1;      // Senin = 0, Minggu = 6
    for ($j = (int) substr($b->jamMulai, 0, 2); $j < (int) substr($b->jamSelesai, 0, 2); $j++) {
        if ($j >= Pemesanan::JAM_BUKA && $j < Pemesanan::JAM_TUTUP) {
            $isi[$h][$j - Pemesanan::JAM_BUKA]++;
        }
    }
}
```

1. Buat tabel 7 baris (hari) kali 14 kolom (jam), semua berisi 0.
2. Untuk setiap booking terkonfirmasi, tambahkan 1 di setiap kotak jam yang dipakainya. Booking 16.00–18.00 hari Sabtu menambah kotak Sabtu pukul 16 dan Sabtu pukul 17.

`tanggalPerHari` mencatat tanggal mana saja yang jatuh di setiap hari dalam seminggu. Contohnya Senin di Oktober 2026 adalah tanggal 5, 12, 19, dan 26. Halaman memakainya untuk menghitung rata-rata keterisian per kotak.

### Corong booking dan pembatalan

```php
$semua = DB::table('bookings')->whereBetween('tanggal', $rentang)->get(['idBooking', 'status', 'dibatalkanPenyewa', 'totalBayar']);
$otomatis = DB::table('log_aktivitas')->where('aksi', 'otomatis')->where('jenisObjek', 'Booking')->pluck('kodeObjek')->flip();
$sebab = fn ($b) => $b->dibatalkanPenyewa ? 'penyewa' : ($otomatis->has(Pemesanan::kode($b->idBooking)) ? 'otomatis' : 'pengelola');
```

Untuk setiap booking yang dibatalkan, penyebabnya ditentukan begini:

1. Kalau `dibatalkanPenyewa` bernilai benar, penyewa yang membatalkan.
2. Kalau ada baris log aksi `otomatis` untuk kode booking itu, sistem yang membatalkan.
3. Selain itu, pengelola yang membatalkan.

`pluck('kodeObjek')->flip()` membuat daftar kode booking yang dibatalkan otomatis, dengan kode sebagai kunci. Dengan begitu `->has('BK-0012')` bisa mengecek dengan cepat tanpa menelusuri daftar.

Corong (`funnel`) berisi:

| Kunci | Artinya |
| --- | --- |
| `masuk` | Terkonfirmasi + dibatalkan + bukti ditolak. |
| `terkonfirmasi` | Jumlah dan nilai booking terkonfirmasi. |
| `batal` | Jumlah dan nilai pembatalan per penyebab. |
| `tolak` | Booking yang masih `Dipesan` dan buktinya ditolak. |

## Aturan di file ini

- Pemasukan selalu dihitung dari pembayaran `Terverifikasi` menurut `tglBayar`, sama dengan PDF laporan. Jangan diganti menjadi `totalBayar` booking, karena angkanya bisa berbeda dari PDF.
- Semua hitungan ada di sini. Halaman React hanya membagi untuk persentase dan menggambar grafik.
- Hari dalam seminggu memakai `dayOfWeekIso - 1`, sehingga Senin = 0. Komponen grafik di React memakai urutan yang sama.

## FAQ

**Kenapa angka pemasukan dan jumlah booking terkonfirmasi bisa berbeda bulan?**
Pemasukan dihitung menurut tanggal bayar, booking menurut tanggal main. Booking untuk 2 November yang dibayar 30 Oktober masuk pemasukan Oktober, tetapi keterisian November.

**Apakah aturan penyebab pembatalan sudah final?**
Belum ditinjau ulang. Semua pembatalan yang bukan dari penyewa dan tidak tercatat otomatis dianggap dari pengelola. [AnalitikBisnis](./analitik-bisnis) memakai aturan yang sama.

**Kenapa ada query di dalam `filter()` untuk bukti ditolak?**
Untuk setiap booking `Dipesan`, kode ini mengecek apakah ada pembayaran yang ditolak. Cara ini lambat kalau datanya sangat banyak, tetapi jumlah booking sebulan di proyek ini kecil, jadi masih cukup cepat.

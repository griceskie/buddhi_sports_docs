---
title: Pemesanan.php
urutan: 1
---

# Pemesanan.php

::: info Tentang file ini
- **Lokasi:** `app/Support/Pemesanan.php`
- **Jenis:** kelas pembantu berisi aturan bisnis (PHP)
- **Dipakai oleh:** [BookingPenyewaController](/backend/controller/booking-penyewa), [AdminDashboardController](/backend/controller/admin-dashboard), [MasterBookingController](/backend/controller/master-booking), [routes/console.php](/backend/route/console), [AnalitikBisnis](./analitik-bisnis), dan banyak file lain untuk `kode()`
:::

## Ringkasan

`Pemesanan` adalah pusat aturan booking: jam buka dan tutup, berapa hari ke depan boleh memesan, status apa yang menahan jam, kapan batas bayar, cara membatalkan booking yang kedaluwarsa, dan bentuk kode booking (`BK-0012`).

Aturan ini ditaruh di satu kelas supaya semua controller memakai angka dan logika yang sama. Kalau GOR suatu hari buka pukul 07.00, cukup ubah satu konstanta di sini.

Semua fungsinya `static`, jadi dipanggil tanpa membuat objek: `Pemesanan::kode(12)`.

## Isi file

### Konstanta

```php
public const JAM_BUKA = 8;
public const JAM_TUTUP = 22;
public const HARI_KE_DEPAN = 30;
public const STATUS = ['Dipesan', 'Dikonfirmasi', 'Dibatalkan'];
public const STATUS_MENAHAN_JAM = ['Dikonfirmasi'];
```

| Konstanta | Artinya |
| --- | --- |
| `JAM_BUKA`, `JAM_TUTUP` | GOR buka pukul 08.00 dan tutup pukul 22.00. Jam mulai booking paling awal 8, jam selesai paling akhir 22. |
| `HARI_KE_DEPAN` | Penyewa bisa memesan sampai 30 hari ke depan, termasuk hari ini. |
| `STATUS` | Tiga status booking yang sah. Dipakai untuk validasi form Admin. |
| `STATUS_MENAHAN_JAM` | Status booking yang pasti menahan jam. Dipakai untuk hitungan keterisian dan pengecekan bentrok saat Admin menerima bukti. |

`const` berarti nilainya tetap dan tidak bisa diubah saat program berjalan. `public` berarti boleh dibaca dari kelas lain.

### `tahanJam()`: booking mana yang menahan jam

```php
public static function tahanJam(Builder $q): Builder
{
    return $q->where(fn ($w) => $w->whereIn('bookings.status', self::STATUS_MENAHAN_JAM)
        ->orWhere(fn ($x) => $x->where('bookings.status', 'Dipesan')->whereExists(fn ($e) => $e->select(DB::raw(1))
            ->from('pembayarans')
            ->whereColumn('pembayarans.idBooking', 'bookings.idBooking')
            ->where('pembayarans.status', 'Menunggu Verifikasi'))));
}
```

**Gunanya:** menyaring query tabel `bookings` supaya hanya berisi booking yang menahan jam di sisi penyewa.

**Logikanya:** sebuah booking menahan jam kalau salah satu syarat ini terpenuhi:

1. Statusnya `Dikonfirmasi`.
2. Statusnya `Dipesan`, dan booking itu punya pembayaran berstatus `Menunggu Verifikasi`. Artinya penyewa sudah mentransfer dan mengirim bukti.

Booking `Dipesan` yang belum mengirim bukti tidak menahan jam. Dengan begitu, orang tidak bisa mengunci jam tanpa membayar.

**Cara membaca kodenya:**

- Fungsi ini menerima query yang sudah dimulai (`Builder $q`), menambahkan syarat, lalu mengembalikannya. Pemanggil bisa menambah syarat lain sesudahnya.
- `whereExists(...)` berarti "ada minimal satu baris di tabel lain yang cocok". Isinya adalah query kecil ke tabel `pembayarans`.
- `whereColumn('pembayarans.idBooking', 'bookings.idBooking')` menghubungkan pembayaran dengan booking yang sedang dicek.
- `select(DB::raw(1))` hanya mengambil angka 1, karena yang penting ada atau tidaknya baris, bukan isinya.

**Contoh pemakaian:** `Pemesanan::tahanJam(DB::table('bookings'))->whereBetween('tanggal', [...])->get()`.

### `jamDiambil()`: apakah jam ini sudah diambil orang lain

```php
public static function jamDiambil(int $idLapangan, string $tanggal, string $jamMulai, string $jamSelesai, ?int $kecuali = null): bool
{
    return self::tahanJam(DB::table('bookings'))
        ->where('bookings.idLapangan', $idLapangan)
        ->where('bookings.tanggal', $tanggal)
        ->where('bookings.jamMulai', '<', $jamSelesai)
        ->where('bookings.jamSelesai', '>', $jamMulai)
        ->when($kecuali, fn ($q) => $q->where('bookings.idBooking', '!=', $kecuali))
        ->exists();
}
```

**Gunanya:** mengecek apakah jadwal (lapangan, tanggal, jam) bertabrakan dengan booking lain yang menahan jam.

**Logika tabrakan jam:** dua jadwal bertabrakan kalau jadwal lain *mulai sebelum* jadwal ini selesai, dan *selesai sesudah* jadwal ini mulai. Contoh:

- Jadwal ini 16.00–18.00. Booking lain 17.00–19.00 bertabrakan, karena 17.00 lebih awal dari 18.00 dan 19.00 lebih akhir dari 16.00.
- Booking lain 18.00–19.00 tidak bertabrakan, karena 18.00 tidak lebih awal dari 18.00. Jadwal yang bersambung boleh.

**Parameter `$kecuali`:** ID booking yang diabaikan. Dipakai saat penyewa mengirim bukti untuk booking-nya sendiri, supaya booking itu tidak dianggap bertabrakan dengan dirinya sendiri. `when($kecuali, ...)` hanya menambah syarat kalau `$kecuali` diisi.

**Dipakai di:** pengecekan saat menyimpan booking baru, saat mengubah jadwal, saat mengunggah bukti, dan untuk penanda `jamDiambil` di halaman bayar.

### `batasBayar()`: kapan batas waktu bayar

```php
public static function batasBayar(?string $createdAt): ?CarbonInterface
{
    return $createdAt
        ? Carbon::parse($createdAt)->addMinutes(config('pembayaran.batas_bayar_menit'))
        : null;
}
```

Batas bayar adalah waktu booking dibuat ditambah `BATAS_BAYAR_MENIT` (bawaan 60). Booking yang dibuat Admin tidak punya `created_at`, jadi tidak punya batas bayar (`null`).

`? ... : ...` adalah bentuk singkat "kalau ... maka ... selain itu ...". Tanda `?` di depan tipe (`?string`) berarti nilainya boleh `null`.

### `batalkanKedaluwarsa()`: batalkan booking yang lewat batas bayar

```php
public static function batalkanKedaluwarsa(): int
{
    $ids = DB::table('bookings')
        ->where('status', 'Dipesan')
        ->whereNotNull('created_at')
        ->where('created_at', '<=', now()->subMinutes(config('pembayaran.batas_bayar_menit')))
        ->whereNotExists(/* belum punya baris pembayaran */)
        ->pluck('idBooking');

    if ($ids->isEmpty()) {
        return 0;
    }

    return DB::transaction(function () use ($ids) {
        $jumlah = DB::table('bookings')->whereIn('idBooking', $ids)->where('status', 'Dipesan')->update(['status' => 'Dibatalkan']);
        foreach ($ids as $id) {
            LogAktivitas::catat('otomatis', 'Booking', self::kode((int) $id), [['Status', 'Dipesan', 'Dibatalkan']],
                'Bukti bayar tidak dikirim dalam '.config('pembayaran.batas_bayar_menit').' menit.', true);
        }
        return $jumlah;
    });
}
```

**Langkah-langkahnya:**

1. Cari booking yang:
   - berstatus `Dipesan`,
   - punya `created_at` (dibuat penyewa, bukan Admin),
   - dibuat lebih dari `BATAS_BAYAR_MENIT` menit yang lalu,
   - belum punya baris pembayaran sama sekali.
2. Kalau tidak ada, selesai dan kembalikan `0`.
3. Di dalam transaksi, ubah statusnya menjadi `Dibatalkan`.
4. Catat setiap pembatalan di log aktivitas atas nama "Sistem". Parameter terakhir `true` adalah `olehSistem`.
5. Kembalikan jumlah booking yang dibatalkan.

`now()->subMinutes(60)` berarti "60 menit yang lalu". Booking yang `created_at`-nya sama atau lebih awal dari itu sudah lewat batas.

Pembayaran yang ditolak tetap dihitung "punya baris pembayaran", jadi booking dengan bukti ditolak tidak pernah batal otomatis. Penyewa masih bisa mengirim bukti baru.

`where('status', 'Dipesan')` diulang di langkah 3. Ini menjaga agar booking yang statusnya berubah di antara langkah 1 dan 3 (misalnya baru saja dikonfirmasi) tidak ikut dibatalkan.

**Dipanggil di:** perintah terjadwal setiap menit, awal setiap halaman booking penyewa, dashboard Admin, dan tabel Booking Admin.

### `menitOperasional()`: lama menunggu, hanya di jam buka

```php
public static function menitOperasional(Carbon $dari, Carbon $sampai): int
{
    $menit = 0;
    for ($hari = $dari->copy()->startOfDay(); $hari->lte($sampai); $hari->addDay()) {
        $buka = $hari->copy()->setTime(self::JAM_BUKA, 0);
        $tutup = $hari->copy()->setTime(self::JAM_TUTUP, 0);
        $awal = $dari->gt($buka) ? $dari : $buka;
        $akhir = $sampai->lt($tutup) ? $sampai : $tutup;
        if ($akhir->gt($awal)) {
            $menit += (int) $awal->diffInMinutes($akhir);
        }
    }
    return $menit;
}
```

**Gunanya:** menghitung berapa menit sebuah bukti sudah menunggu diperiksa, tetapi hanya menghitung menit di dalam jam buka (08.00–22.00). Bukti yang dikirim pukul 21.50 lalu diperiksa pukul 08.10 keesokan harinya dihitung menunggu 20 menit, bukan 10 jam lebih.

**Logikanya:** untuk setiap hari dari `$dari` sampai `$sampai`:

1. Tentukan jam buka dan tutup hari itu.
2. Ambil yang lebih akhir antara `$dari` dan jam buka sebagai awal.
3. Ambil yang lebih awal antara `$sampai` dan jam tutup sebagai akhir.
4. Kalau akhir sesudah awal, tambahkan selisih menitnya.

`copy()` penting karena fungsi Carbon seperti `setTime` dan `addDay` mengubah objeknya sendiri. Tanpa `copy()`, nilai `$dari` ikut berubah.

**Dipakai di:** antrean verifikasi (tanda "Lewat 1 jam" di Pemantauan Manager) dan Kinerja Admin di Analisis bisnis.

### `kode()`: kode booking

```php
public static function kode(int $idBooking): string
{
    return 'BK-'.str_pad((string) $idBooking, 4, '0', STR_PAD_LEFT);
}
```

Mengubah ID booking menjadi kode yang dibaca manusia: `12` menjadi `BK-0012`. `str_pad` menambah angka 0 di kiri sampai panjangnya 4. ID di atas 9999 tetap utuh, misalnya `BK-12345`. Titik (`.`) di PHP menyambung teks.

## Aturan di file ini

- Angka jam buka, tutup, dan batas hari hanya ditulis di sini. Jangan menulis angka 8 atau 22 langsung di controller.
- Bedakan dua cara "menahan jam":
  - `tahanJam()` dan `jamDiambil()` untuk sisi penyewa (termasuk bukti yang menunggu).
  - `STATUS_MENAHAN_JAM` untuk hal yang harus pasti, seperti keterisian dan pengecekan saat Admin menerima bukti.
- Halaman React punya salinan jam buka dan tutup di `Components/booking/jadwal.ts`. Kalau angka di sini berubah, ubah juga di sana.
- `batalkanKedaluwarsa()` harus tetap aman dipanggil berkali-kali. Fungsi ini tidak boleh mengubah booking yang sudah punya pembayaran.

## FAQ

**Kenapa `tahanJam()` tidak dipakai di form Booking Admin?**
Form Admin lebih ketat. Semua booking yang belum dibatalkan, termasuk `Dipesan` tanpa bukti, dianggap menahan jam, supaya Admin tidak menimpa pesanan penyewa. Logikanya ada di `MasterBookingController`.

**Apa bedanya `whereExists` dan `join`?**
`join` menggabungkan baris dua tabel dan bisa menggandakan hasil. `whereExists` hanya mengecek ada atau tidaknya baris yang cocok, tanpa menggabungkan. Untuk pertanyaan "punya pembayaran atau tidak", `whereExists` lebih tepat.

**Kenapa pembatalan otomatis tidak memakai Eloquent event atau queue?**
Supaya sederhana dan tetap jalan walaupun scheduler belum dinyalakan. Fungsi ini cukup dipanggil di awal halaman yang relevan.

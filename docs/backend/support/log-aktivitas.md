---
title: LogAktivitas.php
urutan: 2
---

# LogAktivitas.php

::: info Tentang file ini
- **Lokasi:** `app/Support/LogAktivitas.php`
- **Jenis:** kelas pembantu (PHP)
- **Dipakai oleh:** semua controller yang mengubah data, [Pemesanan](./pemesanan), [routes/console.php](/backend/route/console), [LogAktivitasController](/backend/controller/log-aktivitas), [DemoSeeder](/backend/model/demo-seeder)
- **Tabel:** `log_aktivitas` (dibuat oleh migration `2026_11_13_100000_create_log_aktivitas_table.php`)
:::

## Ringkasan

Kelas ini adalah satu-satunya jalan untuk menulis log aktivitas. Setiap kali Admin, Manager, atau sistem mengubah data, controller memanggil `LogAktivitas::catat(...)`. Hasilnya satu baris di tabel `log_aktivitas` berisi siapa, kapan, melakukan apa, terhadap data apa, dan isian apa saja yang berubah.

Log ini dibuat supaya sulit dipalsukan, dengan dua lapis pengaman:

1. **Trigger database** menolak semua perintah `UPDATE` dan `DELETE` di tabel ini, dari aplikasi mana pun. Baris log hanya bisa ditambah.
2. **Rantai hash.** Setiap baris menyimpan sidik jari (hash SHA-256) dari isinya sendiri, ditambah hash baris sebelumnya. Kalau satu baris diubah atau dihapus di luar aplikasi, rantainya putus, dan fungsi `periksa()` menemukannya.

## Posisinya dalam alur

```text
Controller (mis. MasterBookingController::updateData)
  └─ DB::transaction
       ├─ ubah data di tabel bookings
       └─ LogAktivitas::catat('ubah', 'Booking', 'BK-0012', [...rincian...])
```

`catat()` dipanggil di dalam transaksi yang sama dengan perubahan datanya. Kalau penyimpanan data gagal, baris log ikut batal. Kalau penulisan log gagal, perubahan datanya juga batal.

## Isi file

### Konstanta

```php
public const AWAL = '0000...0000';   // 64 angka nol
public const KATA_KERJA = [
    'tambah' => 'menambah',
    'ubah' => 'mengubah',
    'terima' => 'menerima bukti bayar',
    'otomatis' => 'membatalkan otomatis',
    // ...
];
private const LABEL = [
    'Penyewa' => ['namaPenyewa' => 'Nama', 'noHp' => 'No HP', 'email' => 'Email', 'password' => 'Password'],
    'Booking' => ['idPenyewa' => 'Penyewa', 'tanggal' => 'Tanggal', /* ... */],
    // ...
];
```

- `AWAL` adalah "hash sebelumnya" untuk baris pertama, karena baris pertama tidak punya pendahulu.
- `KATA_KERJA` mengubah kode aksi menjadi kata kerja untuk kalimat ringkasan. Contoh: aksi `terima` menjadi "Budi menerima bukti bayar pembayaran BK-0012".
- `LABEL` menentukan kolom mana yang dicatat untuk setiap jenis data, beserta nama tampilannya. Kolom yang tidak ada di daftar ini tidak dicatat. `private` berarti konstanta ini hanya dipakai di dalam kelas ini.

### `catat()`: menulis satu baris log

```php
public static function catat(string $aksi, string $jenisObjek, string $kodeObjek, array $rincian = [],
    ?string $catatan = null, bool $olehSistem = false, ?string $guard = null): void
{
    $admin = $olehSistem || $guard === 'manager' ? null : Auth::guard('admin')->user();
    $manager = $olehSistem || $admin || $guard === 'admin' ? null : Auth::guard('manager')->user();
    $nama = $admin?->namaAdmin ?? $manager?->namaManager ?? 'Sistem';
    $peran = $admin ? 'admin' : ($manager ? 'manager' : 'sistem');

    $terakhir = DB::table('log_aktivitas')->orderByDesc('id')->lockForUpdate()->value('hash') ?? self::AWAL;

    $baris = [
        'waktu' => now()->format('Y-m-d H:i:s'),
        'idAdmin' => $admin?->idAdmin,
        'namaAdmin' => $nama,
        'aksi' => $aksi,
        'jenisObjek' => $jenisObjek,
        'kodeObjek' => $kodeObjek,
        'ringkasan' => $nama.' '.(self::KATA_KERJA[$aksi] ?? $aksi).' '.strtolower($jenisObjek).' '.$kodeObjek,
        'rincian' => json_encode(array_values($rincian), JSON_UNESCAPED_UNICODE),
        'catatan' => $catatan,
        'hashSebelumnya' => $terakhir,
        'peran' => $peran,
    ];
    $baris['hash'] = self::hash($baris);

    DB::table('log_aktivitas')->insert($baris);
}
```

**Parameter:**

| Parameter | Isinya | Contoh |
| --- | --- | --- |
| `$aksi` | Kode aksi, salah satu kunci `KATA_KERJA`. | `'ubah'` |
| `$jenisObjek` | Jenis data. | `'Booking'` |
| `$kodeObjek` | Penanda data yang diubah. | `'BK-0012'`, nama penyewa, username |
| `$rincian` | Daftar isian yang berubah: `[label, sebelum, sesudah]`. Biasanya dibuat oleh `selisih()`. | `[['Status', 'Dipesan', 'Dibatalkan']]` |
| `$catatan` | Keterangan tambahan. | Alasan pembatalan, alamat IP saat login |
| `$olehSistem` | `true` kalau aksi dilakukan sistem, bukan orang. | Pembatalan otomatis |
| `$guard` | Guard yang dipakai saat login. | `'admin'` |

**Langkah-langkahnya:**

1. **Tentukan pelakunya.** Cek apakah ada Admin yang login, kalau tidak ada cek Manager, kalau tidak ada juga berarti "Sistem".
   - Dengan `$olehSistem = true`, pelaku selalu "Sistem". Contohnya pembatalan otomatis yang terpicu saat penyewa membuka halaman, padahal di browser yang sama ada sesi Admin.
   - `$guard` dipakai saat login, supaya sesi peran lain di browser yang sama tidak ikut terbaca.
2. **Ambil hash baris terakhir dan kunci barisnya** dengan `lockForUpdate()`. Kalau dua aksi terjadi bersamaan, aksi kedua menunggu aksi pertama selesai. Tanpa kunci ini, keduanya bisa memakai hash sebelumnya yang sama, dan rantainya bercabang.
3. **Susun baris baru**, termasuk kalimat ringkasan dan rincian dalam bentuk JSON. `JSON_UNESCAPED_UNICODE` menjaga huruf seperti "—" tetap utuh.
4. **Hitung hash** baris itu dengan `hash()`, lalu simpan.

### `hash()`: sidik jari satu baris

```php
public static function hash(array $baris): string
{
    $isi = [];
    foreach (['waktu', 'idAdmin', 'namaAdmin', 'aksi', 'jenisObjek', 'kodeObjek', 'ringkasan', 'rincian', 'catatan', 'hashSebelumnya'] as $k) {
        $nilai = $baris[$k] ?? null;
        $isi[$k] = $nilai === null ? null : (string) $nilai;
    }
    $isi['waktu'] = Carbon::parse($isi['waktu'])->format('Y-m-d H:i:s');
    if (($baris['peran'] ?? null) !== null) {
        $isi['peran'] = (string) $baris['peran'];
    }
    return hash('sha256', json_encode($isi, JSON_UNESCAPED_UNICODE));
}
```

**Logikanya:**

1. Ambil kolom-kolom baris dengan urutan tetap. Urutan harus selalu sama, karena teks yang berbeda urutan menghasilkan hash yang berbeda.
2. Ubah semua nilai menjadi teks. Saat dibaca dari database, angka dan tanggal kadang kembali sebagai teks. Kalau tidak disamakan, hash saat menulis dan saat memeriksa bisa berbeda walaupun datanya sama.
3. Seragamkan format waktu.
4. Kolom `peran` baru ditambahkan belakangan (14 November 2026). Kolom ini ikut di-hash hanya kalau terisi, sehingga hash baris lama yang belum punya `peran` tetap cocok.
5. Ubah semuanya menjadi JSON, lalu hitung SHA-256.

Karena `hashSebelumnya` ikut di-hash, setiap baris "mengunci" baris sebelumnya. Mengubah satu baris lama berarti harus menghitung ulang hash semua baris sesudahnya.

### `periksa()`: menelusuri rantai

```php
public static function periksa(int $mulaiSetelah = 0, string $hashMulai = self::AWAL): array
{
    $sebelum = $hashMulai;
    // ...
    foreach (DB::table('log_aktivitas')->where('id', '>', $mulaiSetelah)->lazyById(500) as $r) {
        $jumlah++;
        $baris = (array) $r;
        if ($baris['hashSebelumnya'] !== $sebelum || self::hash($baris) !== $baris['hash']) {
            return ['utuh' => false, 'diperiksa' => $jumlah, /* ... */ 'rusakPada' => (int) $r->id];
        }
        $sebelum = $baris['hash'];
        $id = (int) $r->id;
    }
    return ['utuh' => true, 'diperiksa' => $jumlah, 'idTerakhir' => $id, 'hashTerakhir' => $sebelum, 'rusakPada' => null];
}
```

**Langkah-langkahnya:** untuk setiap baris, urut dari ID terkecil:

1. Cek `hashSebelumnya` sama dengan hash baris sebelumnya. Kalau tidak sama, ada baris yang hilang atau disisipkan.
2. Hitung ulang hash baris itu dan bandingkan dengan yang tersimpan. Kalau berbeda, isi barisnya diubah.
3. Kalau salah satu gagal, berhenti dan laporkan ID baris yang rusak.

`lazyById(500)` membaca tabel 500 baris sekali jalan, supaya memori tidak penuh walaupun lognya puluhan ribu baris.

Parameter `$mulaiSetelah` dan `$hashMulai` memungkinkan pemeriksaan dimulai dari titik terakhir yang lolos, bukan selalu dari awal.

### `titikMasihAda()` dan `jangkar()`

```php
public static function titikMasihAda(?array $titik): bool
{
    if (! $titik) {
        return true;
    }
    return DB::table('log_aktivitas')->where('id', $titik['id'])->value('hash') === $titik['hash'];
}

public static function jangkar(): ?array
{
    $r = DB::table('log_aktivitas')->orderByDesc('id')->first(['id', 'hash']);
    return $r ? ['id' => (int) $r->id, 'hash' => $r->hash] : null;
}
```

- `titikMasihAda()` menangkap kasus yang lolos dari `periksa()`. Di MySQL, perintah `TRUNCATE` mengosongkan tabel tanpa memicu trigger. Rantai baru yang ditulis sesudahnya bisa terlihat utuh, tetapi baris lama yang pernah lolos pemeriksaan sudah hilang atau hash-nya berbeda.
- `jangkar()` mengambil ID dan hash baris terakhir. Nilai ini dicetak di PDF laporan bulanan. PDF yang sudah ditandatangani ada di luar sistem, jadi kalau log ditulis ulang di kemudian hari, hash di PDF tidak akan cocok lagi.

### `selisih()`: isian apa yang berubah

```php
public static function selisih(string $jenis, ?array $lama, ?array $baru): array
```

**Gunanya:** membandingkan data lama dan baru, lalu menghasilkan daftar `[label, sebelum, sesudah]` dalam kata-kata yang mudah dibaca. Hasilnya diberikan ke `catat()` sebagai `$rincian`.

- `$lama = null` berarti data baru ditambah. Kolom "sebelum" diisi "—".
- `$baru = null` berarti data dihapus. Kolom "sesudah" diisi "—".

**Logikanya untuk setiap kolom di `LABEL[$jenis]`:**

1. Lewati kolom yang tidak ada di kedua data, atau tidak ikut dikirim saat mengubah data.
2. Lewati kolom yang nilainya sama.
3. Password tidak pernah dicatat isinya. Yang dicatat hanya "••••••" atau "diganti".
4. Nilai lain diubah menjadi bentuk tampilan oleh `tampil()`. Kalau bentuk tampilannya sama, kolom itu dilewati. Contohnya foto `null` dan `[]` sama-sama "0 foto".
5. Pengecualian untuk foto: kalau jumlahnya sama tetapi filenya diganti, tetap dicatat dengan tambahan "(diganti)".

### `tampil()`, `sensorHp()`, `sensorEmail()`

`tampil()` mengubah nilai mentah menjadi teks yang dibaca manusia. `match` memilih cara berdasarkan nama kolom:

| Kolom | Contoh hasil |
| --- | --- |
| `noHp` | `0812 **** 7890` |
| `email` | `r***@example.com` |
| Nominal uang | `Rp150.000` |
| `jamMulai`, `jamSelesai` | `16.00` |
| Tanggal | `18 Nov 2026` |
| ID penyewa, lapangan, admin, manager | Namanya, dicari di tabel masing-masing |
| `idBooking` | `BK-0012` |
| `buktiBayar`, `filePdf` | `ada` |
| `foto` | `3 foto` |

Nomor HP dan email disimpan tersensor karena log tidak bisa dihapus. Data pribadi yang lengkap tidak boleh tersimpan selamanya di tempat yang tidak bisa dihapus.

## Aturan di file ini

- Jangan menulis ke tabel `log_aktivitas` selain lewat `catat()`. Hash hanya benar kalau dihitung dengan cara yang sama.
- Panggil `catat()` di dalam `DB::transaction` yang sama dengan perubahan datanya.
- Jangan mengubah urutan kolom atau cara pengubahan nilai di `hash()`. Perubahan kecil saja membuat semua baris lama dianggap rusak.
- Kalau menambah kolom baru ke tabel log, ikutkan ke hash dengan cara yang sama seperti `peran`: hanya kalau terisi, supaya hash baris lama tetap cocok.
- Jangan pernah mencatat isi password. Data pribadi lain dicatat tersensor.
- Kalau menambah jenis data baru yang perlu dicatat, tambahkan labelnya di `LABEL`. Kalau menambah aksi baru, tambahkan kata kerjanya di `KATA_KERJA`.

## FAQ

**Kenapa kolomnya bernama `namaAdmin` walaupun pelakunya bisa Manager?**
Tabel ini awalnya hanya untuk Admin. Saat Manager ikut dicatat, kolom itu dipakai untuk nama pelaku apa pun, dan kolom `peran` ditambahkan untuk membedakannya. Nama kolom tidak diganti supaya hash baris lama tetap cocok.

**Bagaimana kalau migration dijalankan ulang dengan `migrate:fresh`?**
Tabel dan trigger dihapus lalu dibuat ulang, jadi semua log hilang. Ini wajar di komputer pengembangan. Di server sungguhan, jangan pernah menjalankan `migrate:fresh`.

**Bisakah aku menghapus log uji coba lewat phpMyAdmin?**
Tidak bisa. Trigger menolak `DELETE` dan `UPDATE`. Satu-satunya cara adalah mengosongkan tabel (`TRUNCATE`) atau menghapus tabelnya, dan pemeriksaan keaslian log akan menandainya sebagai tidak utuh.

**Kenapa tidak memakai foreign key ke tabel admins?**
Supaya menghapus data tidak mengubah riwayat. Nama pelaku disalin sebagai teks. Kalau akun Admin dihapus, lognya tetap menampilkan nama itu.

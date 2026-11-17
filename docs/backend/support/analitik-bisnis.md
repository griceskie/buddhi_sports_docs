---
title: AnalitikBisnis.php
urutan: 3
---

# AnalitikBisnis.php

::: info Tentang file ini
- **Lokasi:** `app/Support/AnalitikBisnis.php` (sekitar 990 baris, file PHP terbesar di proyek)
- **Jenis:** kelas hitungan (PHP)
- **Dipakai oleh:** `ManagerController::analisis()`
- **Ditampilkan oleh:** [halaman Analisis bisnis](/frontend/manager/analisis) dan komponen di `Components/manager/analisis/`
:::

## Ringkasan

Kelas ini menghitung semua angka, grafik, dan kalimat di halaman Analisis bisnis milik Manager. Aturan proyeknya jelas: **hitungan di PHP, React hanya menampilkan**. Karena itu, kelas ini tidak hanya mengirim angka mentah. Kelas ini juga mengirim teks yang sudah jadi, misalnya "Rp15.950.000", "+8,1%", dan "199 booking terverifikasi. Sebelumnya Rp14.750.000".

Halaman Analisis punya empat tab. Setiap tab memakai sumber data yang berbeda:

| Tab | Sumber data |
| --- | --- |
| Pendapatan | Pembayaran `Terverifikasi`, menurut tanggal bayar (sama dengan PDF laporan). |
| Penyewa | Penyewa dari pembayaran `Terverifikasi`. |
| Pola booking | Booking `Dikonfirmasi`, menurut tanggal main. |
| Kinerja Admin | Baris log `terima` dan `tolak`, ditambah waktu bukti dikirim. |

Data dimuat sekali per permintaan, lalu dijumlahkan dengan PHP, bukan dengan `SUM` dan `GROUP BY` di SQL. Alasannya: grafik, pembanding, dan angka tahun berjalan memakai satu sumber yang sama, dan query-nya bekerja sama di SQLite (tes) maupun MySQL. Untuk satu GOR, jumlah barisnya cukup kecil.

## Posisinya dalam alur

```text
GET /manager/analisis?jenis=bulan&th=2026&bl=10&tab=pendapatan
  └─ ManagerController::analisis()   (memvalidasi isi query string)
       └─ (new AnalitikBisnis)->halaman($q)
            └─ Inertia::render('Manager/Analisis', [...hasil...])
```

## Susunan kelas

Kelas ini dibagi menjadi enam bagian, ditandai komentar `// =====` di kode:

1. **Persiapan** (`__construct`): data yang dipakai semua tab.
2. **Periode**: membaca pilihan periode dan menentukan pembandingnya.
3. **Tab Pendapatan.**
4. **Tab Penyewa.**
5. **Tab Pola booking.**
6. **Tab Kinerja Admin.**
7. **Bantuan**: penyusun grafik, persentase perubahan, dan format angka.

## Konstanta

```php
public const TAB = ['pendapatan', 'penyewa', 'pola', 'admin'];
public const JENIS = ['bulan', 'kuartal', 'tahun', 'rentang'];
public const RENTANG = ['awal' => 'Sejak awal tahun', '6' => '6 bulan terakhir', '12' => '12 bulan terakhir'];
public const WARNA_LAPANGAN = ['var(--primary)', '#0891b2', '#7c3aed', '#f59e0b', '#16a34a', '#e11d48'];
private const MINGGU_PER_BULAN = 4.345;
```

- `TAB`, `JENIS`, `RENTANG`: nilai yang sah untuk query string. Controller juga memakai konstanta ini untuk validasi.
- `WARNA_LAPANGAN`: warna grafik per lapangan, urut ID. Urutannya sama dengan grafik Laporan pembayaran Admin, supaya lapangan yang sama selalu berwarna sama.
- `MINGGU_PER_BULAN`: rata-rata jumlah minggu dalam sebulan (365 ÷ 12 ÷ 7). Dipakai untuk mengubah angka per minggu menjadi per bulan.

## Bagian 1: persiapan

```php
public function __construct()
{
    $this->hariIni = today();
    $mulai = collect([DB::table('pembayarans')->min('tglBayar'), DB::table('bookings')->min('tanggal')])->filter()->min();
    $this->awalData = $mulai ? Carbon::parse($mulai)->startOfMonth() : $this->hariIni->copy()->startOfMonth();
    // ...
    $this->lapangan = /* semua lapangan + warnanya */;
    $this->jamBuka = Pemesanan::JAM_TUTUP - Pemesanan::JAM_BUKA;
    $this->laporan = DB::table('laporan_pembayarans')->get()->keyBy(fn ($l) => sprintf('%04d-%02d', $l->tahun, $l->bulan))->all();
}
```

`__construct` adalah fungsi yang otomatis berjalan saat kelas dibuat dengan `new AnalitikBisnis`. Isinya data yang dipakai berulang:

- `awalData`: bulan pertama yang punya data, dari tanggal bayar atau tanggal booking paling awal. Periode sebelum bulan ini dianggap "belum ada data".
- `lapangan`: semua lapangan, masing-masing diberi warna.
- `laporan`: semua laporan, disusun dengan kunci `'2026-10'`, supaya laporan bulan tertentu bisa dicari langsung.

## Bagian 2: periode

### `halaman()`: titik masuk

Fungsi publik satu-satunya selain format angka. Langkahnya:

1. `periode($q)` menentukan rentang tanggal dari query string.
2. Tab yang dipilih dicek. Kalau tidak sah, dipakai `pendapatan`.
3. `lalu($p)` menentukan periode pembanding.
4. Setiap bulan di periode dicek dengan `belumFinal()`. Bulan yang belum final dikumpulkan untuk catatan di atas halaman.
5. `titik($p)` menyiapkan batang-batang grafik.
6. Hanya tab yang dipilih yang dihitung (`match ($tab)`). Tab lain tidak dihitung sama sekali.

### `periode()`: dari query string ke rentang tanggal

| `jenis` | Rentangnya |
| --- | --- |
| `bulan` | Satu bulan (`th`, `bl`). Bawaannya bulan lalu, karena bulan lalu sudah lengkap. |
| `kuartal` | Tiga bulan (`th`, `q`). Q1 = Januari–Maret. |
| `tahun` | Satu tahun (`th`). |
| `rentang` | `awal` (sejak awal tahun), `6` atau `12` (bulan terakhir yang sudah selesai), atau `pilih` (tanggal `dari`–`sampai`). |

Setelah rentang ditentukan, ada dua pemotongan:

- Awal yang lebih tua dari `awalData` dipotong ke `awalData`. Halaman menulis "Data mulai Agu 2026".
- Akhir yang melewati hari ini dipotong ke hari ini. Halaman menulis "Sampai 17 Nov 2026".

Nilai `th` dan `bl` yang tidak masuk akal (misalnya bulan sebelum data ada) diganti dengan nilai terdekat yang tersedia, bukan ditolak.

### `lalu()`: periode pembanding

- Untuk bulan, kuartal, tahun, dan pilihan cepat rentang: periode digeser mundur sebanyak panjangnya. Oktober dibanding September, Q3 dibanding Q2.
- Bulan yang masih berjalan dibandingkan sampai tanggal yang sama. Contohnya, 1–17 November dibanding 1–17 Oktober.
- Rentang tanggal sendiri dibandingkan dengan jumlah hari yang sama tepat sebelumnya.
- Kalau periode pembanding dimulai sebelum `awalData`, pembanding tidak ada (`null`), dan halaman menulis "belum ada pembanding".

### `titik()`: batang-batang grafik

Grafik selalu menunjukkan konteks di sekitar periode yang dipilih:

| `jenis` | Batang grafik |
| --- | --- |
| `bulan` | 12 bulan di tahun itu (Jan–Des). |
| `kuartal` | 4 kuartal di tahun itu. |
| `tahun` | Setiap tahun sejak data pertama. |
| `rentang` | Setiap bulan di dalam rentang. |

Setiap batang membawa keterangan:

- `terpilih`: batang ini termasuk periode yang dipilih (disorot).
- `bergaris`: terpilih dan belum final (digambar bergaris).
- `tujuan`: isi query string kalau batang diklik. Mengklik batang Agustus di tampilan bulanan membuka Analisis Agustus.
- `depan`: periode ini belum tiba.

### `belumFinal()`: apakah angka bulan ini masih bisa berubah

Sebuah bulan dianggap final hanya setelah Manager memeriksa laporannya. Kalau belum, fungsi ini mengembalikan alasannya:

| Keadaan | Teks |
| --- | --- |
| Bulan ini | "Berjalan" |
| Laporan diminta revisi | "Perlu revisi" |
| Laporan sudah diserahkan | "Menunggu diperiksa" |
| Ada bukti yang masih menunggu verifikasi | "Belum bisa dibuat" |
| Belum ada laporan | "Belum dibuat" |

## Bagian 3: tab Pendapatan

### Tiga kartu angka (`metrik`)

1. **Pemasukan** periode ini, dengan perubahan dibanding periode lalu.
2. Kartu kedua tergantung jenis periode:
   - Bulan atau kuartal: **Pemasukan tahun berjalan** (dari Januari sampai akhir periode), dibanding periode yang sama tahun lalu.
   - Tahun atau rentang: **Rata-rata per bulan**. Bulan yang tidak penuh dihitung sebagian oleh `jumlahBulan()`.
3. **Rata-rata per booking**, dibulatkan ke ribuan, beserta rata-rata lama main.

### `bayarTerverifikasi()` dan `jumlahPendapatan()`

```php
private function bayarTerverifikasi(): Collection
{
    return $this->bayar ??= DB::table('pembayarans')
        ->join('bookings', /* ... */)
        ->where('pembayarans.status', 'Terverifikasi')
        ->get([/* ... */])
        ->map(/* tambah kolom jam = lama main */);
}
```

`??=` berarti "isi kalau masih kosong". Query hanya dijalankan sekali. Pemanggilan berikutnya memakai hasil yang sudah tersimpan di `$this->bayar`.

`jumlahPendapatan($bayar, $awal, $akhir)` menjumlahkan pembayaran yang tanggal bayarnya ada di rentang itu. Hasilnya: total rupiah, jumlah booking, jumlah jam, serta rupiah dan jam per lapangan. Fungsi ini dipanggil berkali-kali (untuk periode ini, pembanding, tahun berjalan, dan setiap batang grafik), tetapi semuanya memakai data yang sama.

Tanggal dibandingkan sebagai teks (`'2026-10-15' < '2026-11-01'`). Cara ini benar karena formatnya selalu tahun-bulan-tanggal dengan nol di depan.

### Grafik

Tinggi sumbu dibulatkan ke atas ke kelipatan Rp5 juta, minimal Rp5 juta. Setiap batang dibagi menjadi segmen per lapangan, dengan porsi dalam persen.

### `bocor()`: uang yang tidak masuk

Bagian "kebocoran" menunjukkan pemasukan yang hilang:

- Booking yang dibatalkan, dikelompokkan per penyebab (otomatis, penyewa, pengelola). Aturan penyebabnya sama dengan [AnalitikLaporan](./analitik-laporan).
- Bukti yang ditolak dan belum diganti, dengan tiga contoh teratas.

Rentangnya memakai `akhirPenuh`, jadi booking yang akan datang di bulan berjalan ikut dihitung.

## Bagian 4: tab Penyewa

1. **Pembayaran pertama per penyewa.** Data pembayaran sudah urut tanggal, jadi `$pertama[$id] ??= $r->tglBayar` menyimpan tanggal pertama saja.
2. **Penyewa yang membayar** di periode, dan berapa yang **baru** (pembayaran pertamanya jatuh di periode ini).
3. **Penyewa yang kembali** = total dikurangi yang baru.
4. **Booking per penyewa** = jumlah booking dibagi jumlah penyewa.
5. **Lima penyewa teratas** menurut rupiah. Kalau rupiahnya sama, diurutkan menurut nama. Operator `<=>` membandingkan dua nilai, dan `?:` memakai pembanding kedua kalau hasil pertama sama.
6. **Berhenti datang**: penyewa dengan minimal 3 booking terbayar sampai akhir periode, yang terakhir main lebih dari 60 hari sebelum akhir periode.

## Bagian 5: tab Pola booking

Tab ini memakai booking `Dikonfirmasi` menurut tanggal main.

### Keterisian

Jam terisi dibagi kapasitas, yaitu jumlah lapangan × 14 jam × jumlah hari. Juga dihitung per lapangan.

### Peta jam tersibuk

Untuk setiap hari dalam seminggu dan setiap jam, nilai sebuah kotak adalah rata-rata porsi lapangan yang terisi:

```text
nilai = jumlah jam terisi di kotak itu ÷ (berapa kali hari itu muncul di periode × jumlah lapangan)
```

Nilai itu dikelompokkan menjadi 5 tingkat warna: di bawah 5%, 5–20%, 20–40%, 40–60%, dan 60% ke atas. Setiap kotak juga punya kalimat tooltip, misalnya "Sabtu 19.00–20.00, rata-rata 2,5 dari 4 lapangan terisi".

### Blok 3 jam paling kosong dan paling ramai

1. Hari dibagi menjadi dua kelompok: Senin–Jumat dan Sabtu–Minggu.
2. Untuk setiap kelompok, setiap blok 3 jam berturut-turut (08–11, 09–12, dan seterusnya) diberi nilai rata-rata keterisian.
3. Semua blok diurutkan (paling kosong untuk daftar "kosong", paling ramai untuk daftar "ramai"). Diambil 4 blok yang tidak saling bertumpuk. Dua blok di kelompok yang sama harus berjarak minimal 3 jam.
4. Untuk setiap blok, dihitung per lapangan:
   - Blok ramai: perkiraan pemasukan per bulan dari blok itu.
   - Blok kosong: tambahan pemasukan per bulan kalau blok itu seramai rata-rata lapangan tersebut.

   Rumusnya: porsi × jumlah jam blok per minggu × tarif × `MINGGU_PER_BULAN`.

### Lama main dan jarak pesan

- **Lama main**: berapa booking 1 jam, 2 jam, dan 3 jam atau lebih.
- **Jarak pesan**: berapa hari sebelum main penyewa memesan, dari `created_at`. Booking dari Admin (tanpa `created_at`) tidak ikut.

`$ember(...)` adalah fungsi kecil yang menghitung satu kelompok: jumlahnya, persennya, dan panjang batangnya.

## Bagian 6: tab Kinerja Admin

### Keputusan bukti

```php
$keputusan = DB::table('log_aktivitas')->whereIn('aksi', ['terima', 'tolak'])->where('jenisObjek', 'Pembayaran')->orderBy('waktu')->get([...])
    ->map(function ($r) use ($dikirim) {
        $id = (int) substr($r->kodeObjek, 3);   // 'BK-0012' -> 12
        // ...
        $r->menit = $kirim && $kirim->lte($waktu) ? Pemesanan::menitOperasional($kirim, $waktu) : null;
        return $r;
    });
```

- Setiap baris log terima atau tolak adalah satu keputusan.
- ID booking diambil dari kode objek: `substr('BK-0012', 3)` menjadi `'0012'`, lalu `(int)` menjadi `12`.
- Lama periksa adalah menit dari bukti dikirim sampai keputusan, dihitung hanya di jam buka.

Dari situ dihitung: jumlah bukti, persen ditolak, rata-rata lama periksa, dan persen yang selesai dalam 1 jam. Ada juga sebaran lama periksa (di bawah 15 menit, 15–60 menit, 1–3 jam, dan di atas 3 jam) serta tabel per Admin.

Untuk lama periksa dan persen ditolak, angka yang turun berarti membaik. Karena itu `delta()` dipanggil dengan `$turunBaik = true`, dan warnanya hijau saat angkanya turun.

### Ketepatan laporan

Untuk setiap bulan di periode (kecuali bulan berjalan): batas penyerahan (tanggal 5 bulan berikutnya), tanggal laporan dibuat, tepat waktu atau terlambat berapa hari, dan status pemeriksaannya.

## Bagian 7: bantuan

### `grafik()`

Menyusun data satu grafik batang dari daftar titik dan nilai per titik. Fungsi ini menerima dua fungsi lain sebagai parameter:

- `$tinggi`: menghitung tinggi batang (0 sampai 1).
- `$isi`: menyusun teks dan segmen batang.

Dengan cara ini, keempat tab memakai satu penyusun grafik yang sama, walaupun isinya berbeda. Grafik juga membawa teks `aria`, yaitu ringkasan untuk pembaca layar.

### `delta()`

```php
private function delta(float|int $a, float|int|null $b, string $banding, bool $turunBaik = false): ?array
{
    if ($b === null || $b == 0) {
        return null;
    }
    $p = ($a - $b) / $b;
    return ['teks' => ($p >= 0 ? '+' : '−').self::desimal(abs($p) * 100).'%', 'naik' => $p >= 0, 'baik' => /* ... */, 'banding' => $banding];
}
```

Persentase perubahan: (sekarang − lalu) ÷ lalu. Kalau tidak ada pembanding atau pembandingnya nol, hasilnya `null`, dan halaman tidak menampilkan panah naik atau turun. Contoh: dari Rp14.750.000 ke Rp15.950.000 menjadi +8,1%.

### Format angka

| Fungsi | Contoh |
| --- | --- |
| `rp(15950000)` | `Rp15.950.000` |
| `persen(0.141)` | `14,1%` |
| `desimal(2.0)`, `desimal(2.46)` | `2`, `2,5` |
| `angka(1736)` | `1.736` |
| `juta(5000000)` | `Rp5 jt` |
| `lamaTeks(75)` | `1 jam 15 menit` |

Semua format mengikuti cara Indonesia: titik untuk ribuan, koma untuk desimal.

## Aturan di file ini

- Semua angka dan kalimat dihitung di sini. Halaman React tidak boleh menghitung ulang atau menyusun kalimat dari angka mentah.
- Sumber data setiap tab tidak boleh dicampur. Contohnya, pendapatan selalu dari pembayaran terverifikasi menurut tanggal bayar, supaya sama dengan PDF laporan.
- Query baru sebaiknya dimuat sekali lalu disaring di PHP, seperti `bayarTerverifikasi()`. Hindari query di dalam perulangan.
- Teks yang ditampilkan memakai Bahasa Indonesia, jam dengan titik (16.00), dan format angka Indonesia.

## FAQ

**Kenapa halaman Analisis membuka bulan lalu, bukan bulan ini?**
Bulan lalu sudah lengkap, sedangkan bulan ini masih berjalan. Ini sesuai rancangan di kanvas. Pilihan ini masih terbuka untuk diubah (lihat `CLAUDE.md`, bagian "Next session").

**Apakah keputusan bukti yang dibuat lewat form Edit Pembayaran ikut dihitung di Kinerja Admin?**
Tidak. Form Edit mencatat aksi `ubah`, bukan `terima` atau `tolak`. Kinerja Admin hanya membaca `terima` dan `tolak`. Ini juga masih keputusan terbuka.

**Halaman Analisis terasa lambat. Apakah perlu cache?**
Untuk data satu GOR, hitungannya masih cepat. Rasa lambat di komputer lokal biasanya datang dari server pengembangan (`php artisan serve` tanpa OPcache), bukan dari hitungan ini. Cache bisa ditambahkan nanti kalau datanya sudah bertahun-tahun.

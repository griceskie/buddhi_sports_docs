---
title: Dasar PHP dan Laravel
urutan: 3
---

# Dasar PHP dan Laravel

Halaman ini hanya membahas bagian PHP dan Laravel yang benar-benar dipakai di Buddhi Sports. Kalau kamu menemukan tulisan aneh di controller, kemungkinan besar penjelasannya ada di sini.

## Bentuk dasar file PHP

```php
<?php

namespace App\Http\Controllers;

use App\Support\Pemesanan;
use Illuminate\Support\Facades\DB;

class MasterBookingController extends Controller
{
    public function tampilData()
    {
        $varbooking = DB::table('bookings')->get();
        // ...
    }
}
```

- `<?php` menandai awal kode PHP.
- `namespace` adalah alamat kelas ini, mirip folder. `App\Http\Controllers` sama dengan folder `app/Http/Controllers/`.
- `use` mengimpor kelas lain supaya bisa dipanggil dengan nama pendek. Tanpa `use Illuminate\Support\Facades\DB;`, kamu harus menulis nama lengkapnya setiap kali.
- `class ... extends Controller` membuat kelas baru yang mewarisi kelas `Controller`.
- `public function tampilData()` adalah fungsi yang bisa dipanggil dari luar, misalnya dari rute.
- Nama variabel selalu diawali `$`, misalnya `$varbooking`.

## Tanda panah dan titik dua

- `$objek->metode()` memanggil fungsi milik sebuah objek. Contoh: `$request->validate(...)`.
- `Kelas::metode()` memanggil fungsi milik kelas tanpa membuat objek. Contoh: `DB::table('bookings')`, `Pemesanan::kode($id)`.
- `Kelas::KONSTANTA` membaca nilai tetap. Contoh: `Pemesanan::JAM_BUKA` bernilai `8`.
- `$objek->kolom` membaca isi kolom dari satu baris hasil query. Contoh: `$booking->tanggal`.

## Array dan fungsi pendek

```php
$data = ['idLapangan' => 3, 'tanggal' => '2026-11-18'];
$data['tanggal'];               // '2026-11-18'

fn ($b) => $b->status === 'Dikonfirmasi'   // fungsi pendek (arrow function)

function () use ($data) { /* ... */ }      // fungsi biasa yang memakai variabel dari luar
```

- Array PHP bisa berupa daftar (`[1, 2, 3]`) atau pasangan kunci dan nilai (`['kunci' => 'nilai']`).
- `fn (...) => ...` adalah fungsi satu baris. Fungsi ini otomatis bisa membaca variabel dari luar.
- Fungsi panjang yang perlu variabel dari luar memakai `use ($variabel)`.
- `===` berarti sama persis, termasuk jenis datanya. `'8' === 8` bernilai `false`.
- `??` mengambil nilai kanan kalau nilai kiri kosong (`null`). Contoh: `$titik['id'] ?? 0`.
- `?->` memanggil sesuatu hanya kalau objeknya tidak `null`. Contoh: `$p?->buktiBayar`.

## Rute

Semua alamat ada di `routes/web.php` dan `routes/auth.php`.

```php
Route::middleware(['auth:admin', 'auth.session'])->group(function () {
    Route::get('/tampilbooking', [MasterBookingController::class, 'tampilData']);
    Route::post('/insertbooking', [MasterBookingController::class, 'insertData']);
    Route::delete('/deletebooking/{idhapus}', [MasterBookingController::class, 'deleteDataBooking']);
});
```

- `Route::get` menangani pembukaan halaman, `post` untuk menyimpan, `patch` dan `put` untuk mengubah, `delete` untuk menghapus.
- `{idhapus}` adalah bagian alamat yang berubah-ubah. Nilainya diteruskan ke fungsi controller sebagai parameter.
- `->name('dashboard')` memberi nama rute, supaya bisa dipanggil dengan `route('dashboard')`.
- `->whereNumber('idBooking')` menolak alamat yang bagian itu bukan angka.
- `middleware(...)` memasang pemeriksaan sebelum controller dijalankan. Lihat tabel di bawah.

| Middleware | Artinya |
| --- | --- |
| `auth` | Harus login sebagai penyewa (guard `web`). |
| `auth:admin` | Harus login sebagai Admin. |
| `auth:manager` | Harus login sebagai Manager. |
| `auth:admin,manager` | Boleh Admin atau Manager. |
| `auth.session` | Sesi berakhir kalau password akun diganti dari tempat lain. |
| `guest` | Hanya untuk yang belum login, misalnya halaman login. |
| `throttle:30,1` | Paling banyak 30 permintaan per menit. |

## Mengecek isian (validasi)

```php
$request->validate([
    'txtnama'  => 'required|string|max:255',
    'txtemail' => ['required', 'email', Rule::unique('penyewas', 'email')],
], [
    'txtnama.required' => 'Nama wajib diisi.',
]);
```

- Parameter pertama berisi aturan untuk setiap isian. Aturannya bisa ditulis sebagai teks yang dipisah `|` atau sebagai daftar.
- Parameter kedua (boleh tidak ada) berisi pesan galat buatan sendiri.
- Kalau ada aturan yang dilanggar, Laravel berhenti di baris itu. Pengguna dikembalikan ke halaman sebelumnya beserta pesan galat. Kode di bawahnya tidak dijalankan.

Aturan yang sering muncul: `required` (wajib), `integer`, `string`, `max:255`, `in:A,B` (harus salah satu dari A atau B), `exists:tabel,kolom` (harus ada di tabel lain), `unique:tabel,kolom` (tidak boleh sama dengan yang sudah ada), `date_format:H:i`, `after:kolomLain`, `regex:/.../`.

Galat juga bisa dilempar sendiri di tengah kode:

```php
throw ValidationException::withMessages(['jamMulai' => 'Lapangan sudah terbooking pada jam tersebut.']);
```

## Membaca dan menyimpan data dengan `DB::table`

Proyek ini memakai *query builder* `DB::table(...)` untuk hampir semua data, bukan Eloquent. Alasannya dibahas di [Aturan kode](./aturan-kode).

```php
DB::table('bookings')
    ->where('idLapangan', 3)
    ->where('tanggal', '2026-11-18')
    ->whereIn('status', ['Dikonfirmasi'])
    ->orderBy('jamMulai')
    ->get();                         // semua baris yang cocok
```

| Metode | Hasilnya |
| --- | --- |
| `get()` | Kumpulan semua baris (Collection). |
| `first()` | Satu baris pertama, atau `null`. |
| `value('kolom')` | Isi satu kolom dari baris pertama. |
| `pluck('kolom')` | Daftar isi satu kolom dari semua baris. |
| `count()`, `sum('kolom')` | Jumlah baris, atau jumlah nilai kolom. |
| `exists()` | `true` kalau ada minimal satu baris. |
| `insert([...])` | Menambah baris. |
| `insertGetId([...], 'idBooking')` | Menambah baris lalu mengembalikan ID barunya. |
| `update([...])` | Mengubah baris yang cocok dengan `where`. |
| `delete()` | Menghapus baris yang cocok dengan `where`. |

`join` dan `leftJoin` menggabungkan tabel. Contoh: booking digabung dengan penyewa untuk mendapatkan nama penyewanya.

### Transaksi dan kunci baris

```php
DB::transaction(function () use ($data) {
    DB::table('lapangans')->where('idLapangan', $data['idLapangan'])->lockForUpdate()->first();
    // cek bentrok, lalu simpan
});
```

- `DB::transaction` menjalankan semua perintah di dalamnya sebagai satu paket. Kalau ada galat di tengah jalan, semua perubahan dibatalkan.
- `lockForUpdate()` mengunci baris itu sampai transaksi selesai. Permintaan lain yang ingin mengunci baris yang sama harus menunggu. Dengan cara ini, dua orang yang memesan jam yang sama pada detik yang sama tidak bisa sama-sama lolos.

## Mengirim jawaban

```php
return Inertia::render('Master/Booking/TampilData', ['databooking' => $varbooking]);
return redirect('/tampilbooking');
return back()->with('success', 'Booking disimpan.');
return back()->withErrors(['txtlapangan' => 'Lapangan sudah terbooking.']);
abort(404);
```

- `Inertia::render` menampilkan halaman React beserta datanya.
- `redirect('/alamat')` dan `redirect()->route('nama')` menyuruh browser membuka alamat lain.
- `back()` kembali ke halaman sebelumnya.
- `->with('success', '...')` menitipkan pesan sekali tampil. Pesan ini muncul sebagai toast hijau.
- `abort(404)` menghentikan permintaan dengan galat "tidak ditemukan". `abort(403)` berarti "tidak boleh".

## Waktu, pengaturan, dan file

- `now()` adalah tanggal dan jam sekarang. `today()` adalah hari ini pukul 00.00. Keduanya objek Carbon, yang punya fungsi seperti `->addDays(7)`, `->subMonth()`, `->startOfMonth()`, dan `->format('Y-m-d')`. Zona waktunya `Asia/Jakarta`.
- `config('pembayaran.batas_bayar_menit')` membaca nilai dari `config/pembayaran.php`. Nilai di file config sering diambil dari `.env` lewat `env('NAMA', bawaan)`.
- `Storage::disk('local')` menyimpan file privat di `storage/app/private/`, misalnya bukti transfer dan PDF laporan. `Storage::disk('public')` menyimpan file yang boleh dilihat siapa saja, misalnya foto lapangan.
- `Auth::id()` adalah ID akun yang sedang login. `Auth::guard('admin')->user()` adalah akun Admin yang sedang login.

## Perintah artisan yang sering dipakai

| Perintah | Gunanya |
| --- | --- |
| `php artisan serve` | Menyalakan server di `http://127.0.0.1:8000`. |
| `php artisan migrate` | Menjalankan migration yang belum dijalankan. |
| `php artisan migrate:fresh --seed` | Menghapus semua tabel, membuat ulang, lalu mengisi data awal. |
| `php artisan db:seed --class=DemoSeeder` | Mengisi data contoh. |
| `php artisan test` | Menjalankan tes otomatis. |
| `php artisan route:list` | Menampilkan semua rute. |
| `php artisan tinker` | Membuka konsol PHP untuk mencoba kode. |

## FAQ

**Kenapa nama kolom di proyek ini memakai huruf kapital di tengah, misalnya `idBooking`?**
Tabel di proyek ini memang dibuat dengan gaya penamaan itu (camelCase), dan kodenya mengikuti nama kolom apa adanya. Kalau menambah kolom baru, pakai gaya yang sama supaya seragam, misalnya `dikirimPada` dan `alasanTolak`.

**Apa bedanya `first()` dan `get()`?**
`first()` mengembalikan satu baris atau `null`. `get()` selalu mengembalikan kumpulan (bisa kosong). Pakai `first()` kalau kamu mencari satu data berdasarkan ID.

**Kenapa ada `(int)` di beberapa tempat?**
Hasil query dari MySQL kadang berupa teks, misalnya `'3'` alih-alih `3`. `(int)` mengubahnya menjadi angka sebelum dibandingkan atau dikirim ke React.

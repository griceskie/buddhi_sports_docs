---
title: Cara aplikasi bekerja
urutan: 2
---

# Cara aplikasi bekerja

Buddhi Sports memakai tiga alat yang bekerja bersama:

- **Laravel** (PHP) berjalan di server. Laravel menerima permintaan, mengecek isian, membaca dan menyimpan data di database, lalu memutuskan halaman mana yang ditampilkan.
- **React** (TypeScript dengan JSX, disingkat TSX) berjalan di browser. React menggambar tampilan dan menangani klik.
- **Inertia** menghubungkan keduanya. Controller Laravel tidak membuat HTML sendiri. Controller cukup menyebut nama halaman React dan data yang dibutuhkannya. Inertia lalu mengirim data itu ke halaman React sebagai *props*.

Karena ada Inertia, proyek ini tidak punya API terpisah. Setiap halaman mendapat datanya langsung dari controller yang membukanya.

## Contoh: penyewa membuka Home lalu menekan "Booking sekarang"

Contoh ini mengikuti satu alur nyata dari awal sampai akhir.

### Pertama, browser meminta halaman `/dashboard`

Laravel mencari alamat itu di `routes/web.php`:

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [BookingPenyewaController::class, 'home'])->name('dashboard');
    // ...
});
```

Baris ini berarti: permintaan `GET /dashboard` ditangani fungsi `home()` di `BookingPenyewaController`, dan rute ini diberi nama `dashboard`. Kata `middleware(['auth', ...])` berarti hanya penyewa yang sudah login boleh masuk. Tamu yang belum login diarahkan ke halaman login.

### Kedua, controller menyiapkan data

```php
public function home(): Response
{
    return Inertia::render('Dashboard', [
        'lapangan' => DB::table('lapangans')->get()->map(/* ... */),
        'terisi' => $this->terisi(),
    ]);
}
```

`Inertia::render('Dashboard', [...])` berarti: tampilkan file `resources/js/Pages/Dashboard.tsx`, dan kirim dua data, yaitu `lapangan` dan `terisi`. `DB::table('lapangans')->get()` mengambil semua baris tabel `lapangans`.

### Ketiga, middleware menambah data bersama

Sebelum dikirim, `app/Http/Middleware/HandleInertiaRequests.php` menambahkan data yang dibutuhkan semua halaman. Contohnya data akun yang sedang login (`auth.user`), jumlah booking yang perlu tindakan (`perluTindakan`), nomor WhatsApp pengelola (`waPengelola`), dan pesan sukses atau gagal (`flash`).

### Keempat, browser menampilkan halaman React

Pada kunjungan pertama, Laravel mengirim HTML dari `resources/views/app.blade.php`. Isinya hampir kosong: hanya wadah dan data halaman dalam bentuk JSON. File `resources/js/app.tsx` lalu menyalakan React dan memuat `Pages/Dashboard.tsx`.

Halaman itu menerima data dari controller sebagai parameter fungsi:

```tsx
export default function Dashboard({ lapangan, terisi }: Props) {
    // ...
}
```

### Kelima, penyewa memilih jam lalu menekan "Booking sekarang"

Tombol itu memanggil fungsi `book()` di `Dashboard.tsx`:

```tsx
router.post(route('booking.store'), {
    idLapangan: lapAktif.idLapangan,
    tanggal: isoTanggal(tanggal),
    jamMulai: jam(pilihan.start),
    jamSelesai: jam(pilihan.end),
});
```

- `router.post` dari Inertia mengirim permintaan `POST` tanpa memuat ulang seluruh halaman.
- `route('booking.store')` mengubah nama rute menjadi alamat, yaitu `/booking`. Fungsi `route()` ini berasal dari paket Ziggy, yang membaca daftar nama rute dari Laravel.

### Keenam, controller mengecek dan menyimpan

`BookingPenyewaController::store()` menjalankan pemeriksaan berikut:

1. Isian dicek: jam harus bulat, di antara 08.00 dan 22.00, tanggal paling jauh 30 hari ke depan, dan jam yang sudah lewat ditolak.
2. Di dalam *transaksi* database, baris lapangan dikunci supaya dua penyewa yang menekan tombol bersamaan tidak sama-sama lolos.
3. Controller mengecek apakah lapangan sedang diperbaiki atau jamnya sudah diambil orang lain.
4. Kalau semua aman, booking disimpan dengan status `Dipesan`, lalu penyewa diarahkan ke halaman bayar.

```php
return redirect()->route('booking.bayar', $idBooking);
```

### Ketujuh, kalau ada yang salah

Kalau ada isian yang salah, Laravel mengembalikan penyewa ke halaman sebelumnya beserta pesan galat. Inertia menyerahkan pesan itu ke fungsi `onError` di halaman React. Halaman lalu menampilkan pesan itu sebagai kotak peringatan merah di bagian atas isi halaman. Penyewa tidak kehilangan pilihannya, karena halamannya tidak dimuat ulang.

## Gambaran besarnya

```text
Browser (React, TSX)                Server (Laravel, PHP)
────────────────────                ─────────────────────
klik / buka alamat  ───────────────▶ routes/web.php
                                      │ middleware (login? peran?)
                                      ▼
                                    Controller
                                      │ cek isian, baca/simpan DB
                                      │ (aturan bersama di app/Support)
                                      ▼
halaman di Pages/ ◀── props ─────── Inertia::render('NamaHalaman', data)
                                    atau redirect + pesan flash
```

## Tiga jenis pengguna

Aplikasi ini punya tiga jenis akun. Setiap jenis punya *guard* sendiri, yaitu cara Laravel menandai siapa yang sedang login:

| Peran | Guard | Login di | Tabel |
| --- | --- | --- | --- |
| Penyewa | `web` | `/login` | `penyewas` |
| Admin | `admin` | `/login-pengelola`, tab Admin | `admins` |
| Manager | `manager` | `/login-pengelola`, tab Manager | `managers` |

Di `routes/web.php`, kelompok rute diberi middleware sesuai peran. Contohnya `auth` untuk penyewa, `auth:admin` untuk Admin, dan `auth:manager` untuk Manager. Penyewa yang mencoba membuka halaman Admin akan ditolak.

## FAQ

**Kenapa tidak ada file API atau `fetch()`?**
Karena Inertia mengirim data langsung dari controller ke halaman. Untuk menyimpan data, halaman memakai `router.post`, `router.patch`, atau `useForm().post` dari Inertia. Semuanya tetap masuk lewat `routes/web.php`.

**Apa bedanya `Inertia::render` dan `redirect()`?**
`Inertia::render` menampilkan halaman beserta datanya. `redirect()` menyuruh browser membuka alamat lain, biasanya setelah menyimpan data. Pola ini mencegah data terkirim dua kali kalau penyewa memuat ulang halaman.

**Bagaimana pesan "Bukti terkirim" muncul di bawah layar?**
Controller menulis `->with('success', 'Bukti terkirim...')`. Middleware mengirim pesan itu sebagai `flash.success`. `app.tsx` memanggil `toast.success()` setiap kali halaman selesai dimuat. Detailnya ada di halaman [app.tsx](/frontend/dasar/app).

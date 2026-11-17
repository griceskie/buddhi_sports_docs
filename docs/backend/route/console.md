---
title: routes/console.php
urutan: 3
---

# routes/console.php

::: info Tentang file ini
- **Lokasi:** `routes/console.php`
- **Jenis:** perintah artisan dan jadwal (PHP)
- **Berhubungan dengan:** [Pemesanan.php](/backend/support/pemesanan), [LogAktivitas.php](/backend/support/log-aktivitas), [FotoLapangan.php](/backend/support/foto-lapangan), [LogAktivitasController](/backend/controller/log-aktivitas)
:::

## Ringkasan

File ini berisi perintah yang dijalankan dari terminal dengan `php artisan ...`, dan jadwal perintah yang berjalan otomatis. Perintah milik proyek ini ada empat:

| Perintah | Gunanya |
| --- | --- |
| `booking:batalkan-kedaluwarsa` | Membatalkan booking yang lewat batas bayar tanpa bukti. |
| `log:periksa` | Memeriksa apakah log aktivitas masih utuh. |
| `manager:reset-password {username}` | Mengganti password Manager dari server. |
| `lapangan:foto-contoh` | Memasang foto contoh ke lapangan yang belum punya foto. |

## Posisinya dalam alur

Perintah di sini tidak dipanggil dari browser. Kamu menjalankannya sendiri dari terminal, atau Laravel menjalankannya otomatis lewat jadwal di bagian bawah file. Jadwal hanya berjalan kalau ada proses `php artisan schedule:work` (saat pengembangan) atau cron `php artisan schedule:run` (di server).

## Isi file

### `booking:batalkan-kedaluwarsa`

```php
Artisan::command('booking:batalkan-kedaluwarsa', function () {
    $this->info(Pemesanan::batalkanKedaluwarsa().' booking dibatalkan.');
})->purpose('...');
```

Perintah ini hanya memanggil `Pemesanan::batalkanKedaluwarsa()` lalu menulis jumlah booking yang dibatalkan. Logika lengkapnya ada di [Pemesanan.php](/backend/support/pemesanan).

`$this->info(...)` menulis teks hijau di terminal. `$this->error(...)` menulis teks merah.

### `log:periksa`

```php
Artisan::command('log:periksa {--penuh : ...}', function () {
    $titik = Cache::get(LogAktivitasController::CACHE_TITIK);
    $mulai = $this->option('penuh') ? null : $titik;
    $hasil = LogAktivitas::periksa($mulai['id'] ?? 0, $mulai['hash'] ?? LogAktivitas::AWAL);
    if ($hasil['utuh'] && ! LogAktivitas::titikMasihAda($titik)) {
        $hasil = [...$hasil, 'utuh' => false, 'rusakPada' => $titik['id']];
    }
    Cache::forever(LogAktivitasController::CACHE_PERIKSA, [...$hasil, 'waktu' => now()->toIso8601String()]);
    // ...
});
```

Langkah-langkahnya:

1. Ambil *titik terakhir yang lolos* dari cache. Titik ini berisi ID dan hash entri log terakhir yang pernah diperiksa dan dinyatakan utuh.
2. Tanpa `--penuh`, pemeriksaan dimulai dari titik itu, jadi hanya entri baru yang ditelusuri. Dengan `--penuh`, pemeriksaan dimulai dari entri pertama.
3. `LogAktivitas::periksa()` menelusuri rantai hash dan mengembalikan hasilnya.
4. `titikMasihAda()` mengecek apakah entri di titik lama masih ada dan hash-nya masih sama. Kalau tabel log dikosongkan atau ditulis ulang, pengecekan ini menangkapnya.
5. Hasilnya disimpan di cache (`CACHE_PERIKSA`) supaya bisa ditampilkan di halaman Log aktivitas.
6. Kalau utuh, titik terakhir diperbarui ke entri terbaru.

`{--penuh : ...}` adalah cara menulis opsi perintah. Teks setelah titik dua adalah penjelasannya, yang muncul di `php artisan help log:periksa`.

### `manager:reset-password`

```php
Artisan::command('manager:reset-password {username}', function (string $username) {
    $manager = DB::table('managers')->where('username', $username)->first(['idManager', 'namaManager']);
    // ... kalau tidak ada, berhenti
    $baru = (string) $this->secret('Password baru');
    $ulang = (string) $this->secret('Ulangi password baru');
    $cek = Validator::make([...], ['password' => ['required', 'confirmed', Password::defaults()]]);
    // ... kalau gagal, berhenti
    DB::transaction(function () use ($manager, $username, $baru) {
        DB::table('managers')->where('idManager', $manager->idManager)->update(['password' => Hash::make($baru)]);
        LogAktivitas::catat('reset', 'Akun', $username, [['Password', '••••••', 'diganti']], 'Lewat perintah artisan di server', olehSistem: true);
    });
});
```

Aplikasi tidak punya peran di atas Manager, jadi tidak ada orang yang bisa mereset password Manager dari halaman web. Perintah ini menjadi jalan keluarnya, khusus untuk orang yang punya akses ke server.

1. Cari Manager berdasarkan username. Kalau tidak ada, tampilkan galat dan berhenti (`return 1` berarti perintah gagal).
2. `$this->secret()` meminta password tanpa menampilkannya di layar. Password diminta dua kali.
3. `Validator::make` mengecek password sama persis dengan ulangannya dan memenuhi aturan bawaan (minimal 8 karakter).
4. Password disimpan dalam bentuk hash, dan kejadian ini dicatat di log atas nama "Sistem". Password-nya sendiri tidak pernah dicatat.
5. Sesi Manager yang sedang login berakhir pada permintaan berikutnya, karena rute Manager memakai middleware `auth.session`.

### `lapangan:foto-contoh`

```php
Artisan::command('lapangan:foto-contoh {--timpa : ...}', function () {
    if (app()->isProduction() && ! $this->confirm('...')) {
        return;
    }
    $awalan = ['Bulu Tangkis' => 'bulu-tangkis', 'Basket' => 'basket'];
    foreach (DB::table('lapangans')->orderBy('idLapangan')->get() as $l) {
        // lewati lapangan yang sudah punya foto, kecuali dengan --timpa
        // salin 5 foto dari database/foto-contoh/ ke disk public, urutannya bergeser per lapangan
    }
});
```

Perintah ini untuk pengembangan. Setiap lapangan tanpa foto diberi lima foto contoh dari `database/foto-contoh/` sesuai jenisnya. Lapangan sejenis memakai foto yang sama, tetapi urutannya digeser satu, supaya foto utama tiap lapangan berbeda.

- `--timpa` juga mengganti foto lapangan yang sudah ada, dan menghapus file lamanya.
- Di lingkungan production, perintah ini bertanya dulu sebelum berjalan.
- Foto disimpan dengan `putFile('lapangan', ...)`, sama seperti foto yang diunggah Admin. Jalankan `php artisan storage:link` sekali supaya foto bisa tampil.

### Jadwal otomatis

```php
Schedule::command('booking:batalkan-kedaluwarsa')->everyMinute();
Schedule::command('log:periksa')->dailyAt('02:00');
Schedule::command('log:periksa --penuh')->weeklyOn(0, '03:00');
```

- Pembatalan booking kedaluwarsa berjalan setiap menit.
- Pemeriksaan log berjalan setiap hari pukul 02.00, hanya untuk entri baru.
- Pemeriksaan log penuh berjalan setiap Minggu pukul 03.00 (`0` berarti Minggu). Pemeriksaan ini menangkap baris lama yang diubah di luar aplikasi, yang tidak terlihat oleh pemeriksaan harian.

## Aturan di file ini

- Perintah baru diberi awalan sesuai kelompoknya, misalnya `booking:`, `log:`, `lapangan:`.
- Tulis `->purpose(...)` dalam Bahasa Indonesia, supaya terbaca di `php artisan list`.
- Logika yang juga dipakai controller ditaruh di `app/Support/`. Perintah di sini cukup memanggilnya.
- Perubahan data penting dari perintah juga dicatat dengan `LogAktivitas::catat(..., olehSistem: true)`.

## FAQ

**Apakah booking tetap batal otomatis kalau `schedule:work` tidak berjalan?**
Ya. `Pemesanan::batalkanKedaluwarsa()` juga dipanggil setiap kali halaman penyewa, dashboard Admin, atau tabel Booking Admin dibuka. Jadwal hanya memastikan pembatalan terjadi walaupun tidak ada yang membuka halaman.

**Bagaimana menjalankan jadwal di komputer sendiri?**
Jalankan `php artisan schedule:work` di terminal terpisah. Perintah ini menjalankan jadwal setiap menit selama terminalnya terbuka.

**Apa itu perintah `inspire`?**
Bawaan Laravel yang menampilkan kutipan acak. Tidak dipakai aplikasi.

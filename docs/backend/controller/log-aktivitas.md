---
title: LogAktivitasController.php
urutan: 10
---

# LogAktivitasController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/LogAktivitasController.php`
- **Jenis:** controller (PHP)
- **Dipakai oleh:** route di [web.php](/backend/route/web), grup `auth:admin,manager`
- **Berhubungan dengan:** [LogAktivitas](/backend/support/log-aktivitas) (penulis log dan pemeriksa rantai), halaman [Log aktivitas](/frontend/admin/log-aktivitas), perintah `log:periksa` di [console.php](/backend/route/console)
:::

## Ringkasan

Controller ini menampilkan log aktivitas dan menjalankan tombol "Periksa keaslian log". Controller ini sengaja **hanya baca**: tidak ada fungsi untuk menambah, mengubah, atau menghapus log. Satu-satunya penulis log adalah `LogAktivitas::catat()`, yang dipanggil dari tindakan lain.

| Route | Fungsi |
| --- | --- |
| `GET /log-aktivitas` | `tampilData()` |
| `POST /log-aktivitas/periksa` | `periksa()` |

## Isi file

### Kunci cache

```php
public const CACHE_PERIKSA = 'log-aktivitas-periksa';
public const CACHE_TITIK = 'log-aktivitas-titik';
```

- `CACHE_PERIKSA` menyimpan hasil pemeriksaan terakhir. Halaman menampilkannya, misalnya "Terakhir diperiksa 10.15, utuh".
- `CACHE_TITIK` menyimpan ID dan hash baris terakhir yang lolos pemeriksaan. Pemeriksaan berikutnya mulai dari titik ini.

### `tampilData()`

**Logikanya:**

1. Validasi filter dari query string:
   - `q`: kata pencarian
   - `admin`: nama pelaku
   - `aksi`: hanya kode aksi yang dikenal di `LogAktivitas::KATA_KERJA`
   - `jenis`: jenis objek (Booking, Pembayaran, dan seterusnya)
   - `peran`: `semua`, `admin`, `manager`, atau `sistem`.
2. Kalau `peran` tidak dipilih: Admin melihat tindakan Admin saja, Manager melihat semua.
3. Susun query dengan filter yang terisi, urut dari yang terbaru, 25 baris per halaman.
4. Kirim log, filter yang sedang aktif, pilihan untuk menu filter, dan hasil pemeriksaan terakhir.

#### `when()`

```php
->when($filter['aksi'] ?? null, fn ($q, $v) => $q->where('aksi', $v))
```

`when($nilai, $fungsi)` menjalankan fungsi hanya kalau nilainya terisi. Nilai itu juga diteruskan sebagai parameter kedua (`$v`). Cara ini menghindari deretan `if` untuk setiap filter.

#### Halaman dan bentuk baris

```php
->paginate(25, [...kolom...])
->withQueryString()
->through(fn ($r) => [...(array) $r, 'peran' => ..., 'rincian' => json_decode($r->rincian, true) ?: []]);
```

- `paginate(25)` hanya mengambil 25 baris untuk halaman yang diminta (`?page=2`, dan seterusnya), beserta informasi jumlah halaman.
- `withQueryString()` menjaga filter tetap ada di tautan halaman berikutnya.
- `through(...)` membentuk ulang setiap baris:
  - mengisi `peran` untuk baris lama yang belum punya kolom itu
  - mengubah teks JSON `rincian` menjadi array.

`(object) $filter` dikirim sebagai objek. Array kosong di PHP akan terkirim sebagai `[]` ke JavaScript, sedangkan objek kosong terkirim sebagai `{}`. Halaman membaca filter sebagai objek.

### `saringPeran()`

Baris log lama tidak punya kolom `peran`. Fungsi ini menyaring kedua jenis baris sekaligus:

| Filter | Baris baru | Baris lama (`peran` kosong) |
| --- | --- | --- |
| `admin` | `peran = 'admin'` | `idAdmin` terisi |
| `sistem` | `peran = 'sistem'` | `idAdmin` kosong |
| `manager` | `peran = 'manager'` | tidak ada (Manager belum tercatat di masa itu) |

### `periksa()`

**Gunanya:** memeriksa apakah rantai hash log masih utuh.

**Logikanya:**

1. Ambil titik terakhir yang lolos dari cache. Kalau belum ada, mulai dari awal (`LogAktivitas::AWAL`).
2. Telusuri rantai dari titik itu sampai baris terakhir dengan `LogAktivitas::periksa()`.
3. Kalau rantainya utuh, cek juga bahwa baris di titik terakhir masih ada dengan hash yang sama (`titikMasihAda`). Kalau tabel dikosongkan atau baris lama ditulis ulang, cek ini yang menangkapnya.
4. Kalau utuh, simpan titik baru.
5. Simpan hasil dan waktunya, lalu tampilkan toast hijau (utuh) atau merah (rusak, dengan nomor baris tempat rantai putus).

Pemeriksaan dari titik terakhir tetap cepat walaupun log sudah besar. Pemeriksaan penuh dari baris pertama berjalan setiap Minggu pukul 03.00 lewat `php artisan log:periksa --penuh`.

`Cache::forever` menyimpan nilai tanpa batas waktu.

## Aturan di file ini

- Jangan menambah fungsi ubah atau hapus log. Trigger database juga menolak `UPDATE` dan `DELETE` di tabel `log_aktivitas`.
- Filter `aksi` dan `peran` hanya menerima nilai yang dikenal.
- Hasil pemeriksaan disimpan di cache, bukan di database, supaya tabel log tetap hanya berisi log.

## FAQ

**Apakah Admin bisa menyembunyikan tindakannya dari Manager?**
Tidak. Admin tidak punya cara untuk mengubah atau menghapus log dari aplikasi, dan database menolak perubahan langsung. Kalau seseorang mengubah tabel lewat cara lain, misalnya mematikan trigger, rantai hash akan putus dan pemeriksaan melaporkannya.

**Kenapa Admin hanya melihat tindakan Admin secara bawaan?**
Itu keputusan pemilik proyek. Admin tetap bisa memilih "Semua" di filter Peran.

**Pemeriksaan bilang log tidak utuh. Apa yang harus dilakukan?**
Catat nomor baris yang disebut, lalu periksa siapa yang punya akses langsung ke database. Log tidak bisa diperbaiki dari aplikasi. Bandingkan juga dengan jangkar log di PDF laporan yang dibuat sebelum waktu itu.

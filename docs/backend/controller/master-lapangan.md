---
title: MasterLapanganController.php
urutan: 5
---

# MasterLapanganController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/MasterLapanganController.php`
- **Jenis:** controller master data (PHP)
- **Dipakai oleh:** route Admin di [web.php](/backend/route/web) (grup `auth:admin`)
- **Berhubungan dengan:** [FotoLapangan](/backend/support/foto-lapangan), [LogAktivitas](/backend/support/log-aktivitas), halaman [Master Lapangan](/frontend/admin/master-lapangan)
:::

## Ringkasan

Controller ini dipakai Admin untuk mengelola data lapangan: nama, jenis olahraga, tarif per jam, status, dan foto (paling banyak 6). Polanya sama dengan [MasterPenyewaController](./master-penyewa). Bagian yang berbeda adalah pengelolaan foto.

| Route | Fungsi |
| --- | --- |
| `GET /tampillapangan` | `tampilData()` |
| `POST /insertlapangan` | `insertData()` |
| `POST /updatelapangan` | `updateData()` |
| `DELETE /deletelapangan/{idhapus}` | `deleteDataLapangan()` |

## Cara foto disimpan

- File foto ada di disk `public`, folder `lapangan/` (di server: `storage/app/public/lapangan/`).
- Database hanya menyimpan daftar path dalam bentuk teks JSON di kolom `lapangans.foto`, misalnya `["lapangan/a1.webp","lapangan/b2.webp"]`.
- Browser membuka foto lewat `/storage/lapangan/...`, yang tersedia setelah `php artisan storage:link`.

## Isi file

### `tampilData()`

Setiap foto dikirim dalam dua bentuk:

```php
['path' => 'lapangan/a1.webp', 'url' => '/storage/lapangan/a1.webp']
```

- `url` dipakai untuk menampilkan gambar.
- `path` dikirim balik saat Edit disimpan, untuk memberi tahu server foto mana yang dipertahankan.

`FotoLapangan::paths()` membaca teks JSON di kolom `foto` menjadi array path. `FotoLapangan::url()` membuat alamat relatif.

### `insertData()`

1. Validasi:
   - nama wajib
   - jenis hanya `Bulu Tangkis` atau `Basket`
   - tarif berupa angka bulat, minimal 0
   - status hanya `Tersedia` atau `Perbaikan`
   - foto mengikuti `aturanFoto()`.
2. Simpan foto baru dengan `simpanFoto($request, [])`.
3. Simpan lapangan, dengan `foto` berisi `json_encode($path)`, yaitu daftar path yang diubah menjadi teks JSON.
4. Catat di log.

`[...] + self::aturanFoto()` menggabungkan aturan field biasa dengan aturan foto.

### `updateData()`

Bagian foto adalah inti fungsi ini.

**Logikanya:**

1. Validasi field biasa. `fotoLama` adalah daftar path foto yang tidak dihapus Admin di form.
2. Pastikan lapangannya ada (404 kalau tidak).
3. Ambil daftar foto lama dari database.
4. Tentukan foto yang dipertahankan:

   ```php
   $tetap = array_values(array_intersect($lama, $request->input('fotoLama', [])));
   ```

   `array_intersect` hanya menyimpan path yang ada di kedua daftar. Kalau seseorang mengirim path milik lapangan lain, path itu dibuang. Foto lapangan lain tidak bisa "dipinjam" lewat form.
5. Simpan foto baru di belakang foto yang dipertahankan, lalu perbarui baris dan catat di log.
6. Setelah transaksi selesai, hapus file foto yang dibuang Admin:

   ```php
   Storage::disk('public')->delete(array_values(array_diff($lama, $tetap)));
   ```

   `array_diff` mengambil path yang ada di daftar lama tetapi tidak ada di daftar yang dipertahankan.

File dihapus setelah transaksi, bukan di dalamnya. Kalau database gagal menyimpan, foto lama masih ada di disk.

### `deleteDataLapangan()`

1. Ambil daftar foto lebih dulu.
2. Hapus lapangan dan catat di log, di dalam transaksi.
3. Kalau lapangan masih punya booking, foreign key menolak, dan Admin melihat pesan "Lapangan tidak bisa dihapus karena masih memiliki data booking." Fotonya tidak dihapus.
4. Kalau berhasil, hapus semua file fotonya.

### `aturanFoto()`

```php
'foto' => 'nullable|array|max:'.FotoLapangan::MAKS,
'foto.*' => 'file|mimes:jpg,jpeg,png,webp|max:2048',
```

- `foto` boleh kosong, berupa daftar, paling banyak 6 file.
- `foto.*` berlaku untuk setiap file di daftar: JPG, PNG, atau WebP, maksimal 2 MB.

### `simpanFoto()`

1. Jumlah foto lama yang dipertahankan ditambah foto baru tidak boleh lebih dari 6. Kalau lebih, tolak dengan galat di field `foto`.
2. Simpan setiap foto baru ke disk `public`, folder `lapangan/`. `store()` memberi nama acak.
3. Kembalikan daftar gabungan: foto lama dulu, lalu foto baru.

Aturan "maksimal 6" dicek dua kali. `aturanFoto()` hanya menghitung foto baru, sedangkan `simpanFoto()` menghitung foto lama ditambah foto baru.

## Aturan di file ini

- Jenis dan status lapangan hanya boleh berisi nilai di daftar `in:`. Jangan menambah nilai lain tanpa mengubah halaman penyewa, karena halaman itu mengelompokkan lapangan menurut jenisnya.
- Database hanya menyimpan path foto, tidak pernah isi gambarnya.
- Alamat foto selalu relatif (`/storage/...`), lewat `FotoLapangan::url()`.
- File dihapus dari disk hanya setelah perubahan database berhasil.

## FAQ

**Apa yang terjadi pada booking kalau lapangan diubah menjadi Perbaikan?**
Booking yang sudah ada tidak berubah. Penyewa tidak bisa membuat booking baru di lapangan itu, dan Admin juga tidak bisa memindahkan booking ke sana. Jadwal yang sudah terlanjur dipesan perlu diurus Admin sendiri.

**Kalau tarif diubah, apakah total booking lama ikut berubah?**
Tidak. Total disimpan di setiap booking saat dibuat (`bookings.totalBayar`). Tarif baru hanya berlaku untuk booking baru dan untuk booking yang jadwalnya diubah setelah itu.

**Bagaimana cara mengisi foto contoh saat pengembangan?**
Jalankan `php artisan lapangan:foto-contoh`. Perintah ini mengisi 5 foto untuk setiap lapangan yang belum punya foto (lihat [console.php](/backend/route/console)).

---
title: MasterPenyewaController.php
urutan: 4
---

# MasterPenyewaController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/MasterPenyewaController.php`
- **Jenis:** controller master data (PHP)
- **Dipakai oleh:** route Admin di [web.php](/backend/route/web) (grup `auth:admin`)
- **Berhubungan dengan:** model [Penyewa](/backend/model/penyewa) (aturan No HP), [LogAktivitas](/backend/support/log-aktivitas), halaman [Master Penyewa](/frontend/admin/master-penyewa)
:::

## Ringkasan

Controller ini dipakai Admin untuk melihat, menambah, mengubah, dan menghapus data penyewa. Bentuknya mengikuti pola master data proyek ini, jadi file ini cocok dibaca pertama kali sebelum controller master lain.

| Route | Fungsi |
| --- | --- |
| `GET /tampilpenyewa` | `tampilData()` |
| `POST /insertpenyewa` | `insertData()` |
| `POST /updatepenyewa` | `updateData()` |
| `DELETE /deletepenyewa/{idhapus}` | `deleteDataPenyewa()` |

## Pola master data

Lima controller master (Penyewa, Lapangan, Booking, Pembayaran, Laporan pembayaran) memakai pola yang sama:

1. **`tampilData()`** mengirim semua baris ke halaman `Master/{Model}/TampilData`. Pencarian, filter, dan halaman tabel diatur di browser oleh [DataTable](/frontend/komponen/data-table).
2. **Form Tambah dan Edit** muncul di sheet samping halaman itu ([FormSheet](/frontend/komponen/form-sheet)), bukan di halaman terpisah.
3. **Nama field form** diawali `txt` (`txtnama`, `txtemail`), dan ID baris yang diedit dikirim sebagai `txtid`. Nama ini warisan template awal proyek. Nama yang tampil di pesan galat diatur di `lang/en/validation.php`, bagian `attributes`.
4. **Query** memakai `DB::table(...)`, bukan model Eloquent.
5. **Setiap perubahan** dicatat dengan `LogAktivitas::catat(...)` di dalam transaksi yang sama.
6. **Hapus** memakai `Route::delete`. Kalau baris masih dirujuk tabel lain, database menolak, dan controller mengubahnya menjadi pesan galat.

## Isi file

### `tampilData()`

```php
$varpenyewa = DB::table('penyewas')
    ->select('idPenyewa', 'namaPenyewa', 'noHp', 'email')
    ->selectSub(DB::table('bookings')->selectRaw('count(*)')->whereColumn('bookings.idPenyewa', 'penyewas.idPenyewa'), 'jumlahBooking')
    ->get()
    ->map(function ($p) {
        $p->jumlahBooking = (int) $p->jumlahBooking;
        return $p;
    });
```

- `select(...)` hanya mengambil kolom yang tampil di tabel. Hash password tidak ikut, supaya tidak pernah sampai ke browser.
- `selectSub(...)` menambah kolom `jumlahBooking`, hasil query kecil yang menghitung booking milik setiap penyewa. `whereColumn` membandingkan dua kolom, bukan kolom dengan nilai tetap.
- `(int)` memastikan angkanya berupa angka. MySQL mengirim hasil `count` sebagai teks.

### `insertData()`

**Logikanya:**

1. Validasi:
   - nama wajib
   - No HP sesuai `Penyewa::ATURAN_NO_HP`, yaitu angka saja, diawali 08, 10 sampai 13 digit
   - email valid dan belum dipakai penyewa lain (`unique:penyewas,email`)
   - password minimal 8 karakter.
2. Susun data. Password disimpan sebagai hash dengan `Hash::make()`.
3. Di dalam transaksi: simpan, lalu catat di log. `LogAktivitas::selisih('Penyewa', null, $data)` membuat daftar perubahan dari kosong ke isi baru. No HP dan email disamarkan di log, dan password tidak pernah dicatat.
4. Kembali ke `/tampilpenyewa`.

Admin hanya mengetik password penyewa saat menambah penyewa baru. Setelah itu, password hanya bisa diganti penyewa sendiri.

### `updateData()`

**Logikanya:**

1. Validasi sama dengan Tambah, tetapi tanpa password. Aturan email unik mengecualikan penyewa yang sedang diedit:

   ```php
   Rule::unique('penyewas', 'email')->ignore($request->txtid, 'idPenyewa')
   ```

   Tanpa `ignore`, menyimpan penyewa dengan email yang tidak diubah akan ditolak, karena emailnya "sudah dipakai" oleh dirinya sendiri.
2. Ambil baris lama. Kalau tidak ada, 404 sebelum apa pun dicatat.
3. Di dalam transaksi: perbarui, lalu catat selisih baris lama dan baru di log.

Kalau form mengirim `txtpassword`, nilainya diabaikan. Password penyewa memang tidak bisa diubah Admin.

### `deleteDataPenyewa()`

1. Ambil baris lama, 404 kalau tidak ada.
2. Di dalam transaksi: hapus, lalu catat di log.
3. Kalau penyewa masih punya booking, foreign key menolak penghapusan. `QueryException` ditangkap dan diubah menjadi pesan "Penyewa tidak bisa dihapus karena masih memiliki data booking."

`'#'.$idhapus` dipakai sebagai nama di log kalau nama penyewa kosong, misalnya `#12`.

## Aturan di file ini

- Jangan kirim kolom `password` ke halaman. Pilih kolom dengan `select(...)`.
- Aturan No HP diambil dari model `Penyewa`, supaya sama dengan Register dan Profile.
- Setiap insert, update, dan delete dicatat di log di dalam transaksi yang sama.
- Pesan untuk Admin ditulis dalam Bahasa Indonesia.

## FAQ

**Kenapa `(array) DB::table(...)->first()`?**
`first()` mengembalikan objek. `LogAktivitas::selisih` membandingkan array, jadi objeknya diubah dulu menjadi array. Kalau barisnya tidak ada, hasilnya array kosong, dan `abort_if(! $lama, 404)` menghentikan proses.

**Bagaimana kalau penyewa minta dihapus, tetapi punya riwayat booking?**
Tidak bisa dihapus lewat aplikasi, karena riwayat booking dan pembayarannya harus tetap utuh untuk laporan. Fitur Hapus akun di Profile penyewa juga sedang dimatikan karena alasan yang sama.

---
title: Migration
urutan: 3
---

# Migration

::: info Tentang halaman ini
- **Lokasi:** `database/migrations/` (27 file)
- **Jenis:** file migration Laravel (PHP)
- **Dijalankan oleh:** `php artisan migrate`, atau `php artisan migrate:fresh --seed` untuk membuat ulang dari kosong
- **Lihat juga:** daftar tabel dan kolom di [Glosarium](/mulai/glosarium)
:::

## Ringkasan

Migration adalah file yang membuat atau mengubah tabel database. Setiap file punya dua fungsi:

- `up()`: perubahan yang dijalankan, misalnya membuat tabel atau menambah kolom
- `down()`: cara membatalkannya.

Laravel mencatat migration yang sudah dijalankan di tabel `migrations`. `php artisan migrate` hanya menjalankan yang belum. Urutan dijalankan mengikuti nama file, yang diawali tanggal.

## Daftar migration

### Bawaan Laravel

| File | Isinya |
| --- | --- |
| `0001_01_01_000000_create_users_table` | Tabel `users` (tidak dipakai aplikasi), `password_reset_tokens`, `sessions` |
| `0001_01_01_000001_create_cache_table` | Tabel cache |
| `0001_01_01_000002_create_jobs_table` | Tabel antrean pekerjaan |

### Tabel utama (18 Oktober 2026)

| File | Isinya |
| --- | --- |
| `create_managers_table`, `create_admins_table`, `create_penyewas_table` | Akun ketiga peran |
| `create_lapangans_table` | Lapangan |
| `create_bookings_table` | Booking, dengan foreign key ke penyewa, lapangan, dan Admin |
| `create_pembayarans_table` | Pembayaran, satu per booking |
| `create_laporan_pembayarans_table` | Laporan bulanan |
| `add_remember_token_to_penyewas_table` | Kolom "ingat saya" untuk login penyewa |

### Perubahan berikutnya

| Tanggal | File | Isinya |
| --- | --- | --- |
| 23 Okt | `add_created_at_to_bookings_table` | Waktu booking dibuat, untuk batas bayar |
| 23 Okt | `add_nama_dan_pdf_to_laporan_pembayarans_table` | `namaLaporan` dan `filePdf` |
| 23 Okt | `ubah_status_lapangan_ke_tersedia` | Mengubah status lama `Kosong` dan `Terbooking` menjadi `Tersedia` |
| 24 Okt | `pindahkan_bukti_bayar_ke_disk_privat` | Memindah file bukti dari disk publik ke disk privat |
| 24 Okt | `add_alasan_tolak_to_pembayarans_table` | Alasan penolakan bukti |
| 25 Okt | `ubah_status_dibayar_ke_dikonfirmasi` | Mengubah status booking lama `Dibayar` menjadi `Dikonfirmasi` |
| 25 Okt | `add_diperiksa_pada_to_laporan_pembayarans_table` | Waktu laporan diperiksa Manager |
| 30 Okt | `add_dibatalkan_penyewa_to_bookings_table` | Tanda booking dibatalkan penyewa sendiri |
| 1 Nov | `add_foto_to_lapangans_table` | Daftar path foto lapangan (JSON) |
| 5 Nov | `add_dikirim_pada_to_pembayarans_table` | Waktu bukti terakhir dikirim |
| 13 Nov | `add_notif_dibaca_pada_to_admins_table` | Waktu Admin terakhir membuka lonceng |
| 13 Nov | `create_log_aktivitas_table` | Tabel log aktivitas, beserta trigger penolak ubah dan hapus |
| 13 Nov | `add_diverifikasi_pada_to_pembayarans_table` | Waktu bukti diterima |
| 13 Nov | `add_revisi_to_laporan_pembayarans_table` | `catatanRevisi` dan `revisiPada` |
| 14 Nov | `add_notif_dibaca_pada_to_managers_table` | Waktu Manager terakhir membuka lonceng |
| 14 Nov | `add_peran_to_log_aktivitas_table` | Kolom `peran` di log |

## Migration yang mengubah data

Beberapa migration tidak hanya mengubah bentuk tabel, tetapi juga isinya, misalnya `ubah_status_lapangan_ke_tersedia`, `ubah_status_dibayar_ke_dikonfirmasi`, dan `pindahkan_bukti_bayar_ke_disk_privat`. Migration seperti ini menjaga data lama tetap sesuai aturan baru.

## Trigger log aktivitas

```php
DB::unprepared("CREATE TRIGGER log_aktivitas_tolak_ubah BEFORE UPDATE ON log_aktivitas FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '$pesan'");
```

Migration `create_log_aktivitas_table` membuat dua trigger yang menolak setiap `UPDATE` dan `DELETE` di tabel log. Perintahnya berbeda untuk MySQL atau MariaDB (`SIGNAL SQLSTATE`) dan SQLite (`RAISE(ABORT, ...)`), jadi migration memeriksa jenis database lebih dulu. Penjelasan lengkapnya ada di [LogAktivitas](/backend/support/log-aktivitas).

## Aturan

- Jangan mengubah migration yang sudah dijalankan di database orang lain. Buat migration baru untuk setiap perubahan.
- Nama file: tanggal, lalu deskripsi singkat, misalnya `2026_11_14_100000_add_peran_to_log_aktivitas_table.php`.
- Kolom baru memakai camelCase, mengikuti tabel yang ada (`dikirimPada`, `alasanTolak`).
- Setelah menarik perubahan dari repo, jalankan `php artisan migrate`.

## FAQ

**Apa bedanya `migrate` dan `migrate:fresh`?**
`migrate` hanya menjalankan migration baru, dan data tetap ada. `migrate:fresh` menghapus semua tabel lalu menjalankan semua migration dari awal, jadi semua data hilang.

**Kenapa tidak ada foreign key di tabel log?**
Disengaja. Log harus tetap utuh walaupun data yang dicatatnya dihapus. Nama dan kode disalin sebagai teks.

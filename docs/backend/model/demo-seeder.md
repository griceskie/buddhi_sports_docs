---
title: DemoSeeder.php
urutan: 3
---

# DemoSeeder.php

::: info Tentang file ini
- **Lokasi:** `database/seeders/DemoSeeder.php`
- **Jenis:** seeder (PHP)
- **Dijalankan oleh:** `php artisan db:seed --class=DemoSeeder`, setelah `php artisan migrate:fresh --seed`
- **Berhubungan dengan:** [DatabaseSeeder](./database-seeder), [LogAktivitas](/backend/support/log-aktivitas), file contoh `database/demo/bukti-transfer-contoh.jpg`
:::

## Ringkasan

Seeder ini mengisi database dengan data contoh yang terlihat seperti hasil pemakaian sungguhan, untuk pengujian prototipe. Isinya:

- 12 penyewa dengan password `Penyewa123` (misalnya `rina@example.com`)
- Admin kedua: Sari, username `Admin2`, supaya halaman Kinerja Admin punya pembanding
- booking dari awal bulan tiga bulan lalu sampai 7 hari ke depan, dengan berbagai akhir cerita
- pembayaran dan bukti transfer contoh
- baris log aktivitas yang rantai hash-nya tetap utuh
- beberapa keadaan khusus untuk diuji (antrean verifikasi, bukti ditolak).

Laporan bulanan sengaja tidak dibuat, karena membuat laporan termasuk hal yang diuji.

Semua tanggal dihitung dari hari seeder dijalankan, jadi selalu ada bulan lalu yang lengkap.

## Isi file

### `run()`

**Logikanya:**

1. **Tolak kalau sudah ada booking.** Seeder ini hanya untuk database kosong.
2. Jalankan [DatabaseSeeder](./database-seeder) dulu, supaya akun dan lapangan dasar ada.
3. `mt_srand(2026)`: angka acak dibuat tetap. Setiap kali seeder dijalankan di hari yang sama, hasilnya sama.
4. Tambah Admin `Admin2` dan 12 penyewa. No HP dibuat dari rumus supaya unik dan sesuai format (`0812` + 8 angka).
5. Salin file bukti contoh ke folder `bukti/` di disk privat.
6. Buat **skenario** khusus (lihat di bawah).
7. Untuk setiap hari dan setiap lapangan, buat 0 sampai 4 booking. Akhir pekan cenderung lebih ramai.
8. Tulis semua baris log, diurutkan menurut waktu.

### `skenario()`

Keadaan yang perlu ada saat pengujian dimulai:

| Skenario | Untuk menguji |
| --- | --- |
| Dua bukti menunggu verifikasi, untuk besok dan lusa | Antrean dan panel verifikasi Admin. |
| Rina: booking besok yang sudah dikonfirmasi | Booking saya, tampilan booking aktif. |
| Rina: booking lusa yang buktinya ditolak | Kirim ulang bukti. |

Bukti yang bisa dikirim ulang memakai salinan file sendiri (`salinBukti()`). Saat penyewa mengirim ulang, file lama dihapus. Kalau semua booking memakai file yang sama, menghapusnya akan merusak bukti booking lain.

### `booking()`

Membuat satu booking dengan akhir ceritanya. Kalau akhirnya tidak ditentukan, dipilih secara acak:

| Booking yang sudah lewat | Peluang |
| --- | --- |
| Dikonfirmasi | 82% |
| Dibatalkan penyewa | 7% |
| Batal otomatis | 7% |
| Bukti ditolak dan tidak dikirim ulang | 4% |

Booking yang akan datang: 90% dikonfirmasi, 10% dibatalkan penyewa.

Untuk booking yang dibayar:

- bukti dikirim 5 sampai 45 menit setelah booking dibuat
- Admin memutuskan 5 sampai 120 menit kemudian, digeser ke jam buka (`jamOperasional()`)
- Admin pertama memutuskan sekitar 65%, Admin kedua sisanya.

Kalau waktu keputusannya ternyata setelah "sekarang", buktinya dibiarkan menunggu verifikasi.

### Log aktivitas yang tetap utuh

Log tidak ditulis saat booking dibuat, tetapi dikumpulkan dulu di `$this->log` sebagai pasangan (waktu, fungsi penulis). Setelah semua data jadi:

```php
usort($this->log, fn ($a, $b) => $a[0] <=> $b[0]);
DB::transaction(function () {
    foreach ($this->log as [$waktu, $tulis]) {
        Carbon::setTestNow($waktu);
        $tulis();
    }
});
Carbon::setTestNow();
```

1. Urutkan menurut waktu.
2. Untuk setiap baris, "putar jam" ke waktu itu dengan `Carbon::setTestNow($waktu)`, lalu tulis lewat `LogAktivitas::catat()` seperti biasa.
3. Kembalikan jam ke waktu sebenarnya.

Dengan begitu, setiap baris log punya waktu yang masuk akal dan ID yang urut waktu, dan rantai hash-nya dibuat oleh penulis log yang sama dengan aplikasi. Pemeriksaan keaslian log akan lolos.

`Auth::guard('admin')->setUser($oleh)` membuat log mencatat Admin yang tepat sebagai pelaku, tanpa benar-benar login.

### Fungsi pembantu

| Fungsi | Gunanya |
| --- | --- |
| `simpanBooking()` | Menyimpan satu baris booking. |
| `waktuPesan()` | Kapan penyewa memesan: 0 sampai 10 hari sebelumnya (kebanyakan dekat hari main), di jam buka, dan tidak setelah sekarang. |
| `jamOperasional()` | Menggeser waktu malam ke pagi berikutnya. |
| `slotKosong()` | Memilih jam mulai (condong sore dan malam) dan lama main 1 atau 2 jam yang tidak bertabrakan. |
| `tandai()` | Mencatat jam yang sudah terpakai. |
| `salinBukti()` | Membuat salinan file bukti contoh. |
| `pilih()` | Memilih angka secara acak dengan bobot. |

## Aturan di file ini

- Jalankan hanya di database kosong, dan tidak di server produksi.
- Semua log ditulis lewat `LogAktivitas::catat()`, tidak langsung ke tabel.
- File bukti contoh ditandai sebagai contoh demo, bukan bukti transfer asli.

## FAQ

**Cara mengulang data demo dari awal?**
Jalankan `php artisan migrate:fresh --seed`, lalu `php artisan db:seed --class=DemoSeeder`. Perintah pertama menghapus semua data.

**Kenapa hasil demo berbeda kalau dijalankan besok?**
Angka acaknya tetap, tetapi tanggalnya dihitung dari hari seeder dijalankan. Rentang tanggal dan hari dalam seminggu ikut bergeser, jadi isi bookingnya juga berbeda.

**Login penyewa demo pakai apa?**
Email dari daftar, misalnya `rina@example.com`, dengan password `Penyewa123`. Rina punya booking dengan skenario khusus.

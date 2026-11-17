---
title: Alur bisnis dan status
urutan: 5
---

# Alur bisnis dan status

Hampir semua aturan di controller berputar di sekitar status booking, pembayaran, dan laporan. Pahami halaman ini dulu sebelum membaca controller.

## Aturan dasar penyewaan

- Gedung (GOR) buka pukul 08.00–22.00. Booking dihitung per jam bulat.
- Penyewa bisa memesan paling jauh 30 hari ke depan, dan tidak bisa memesan jam yang sudah dimulai.
- Tarif disimpan per lapangan di kolom `lapangans.tarifPerJam`. Data awal: bulu tangkis Rp50.000 per jam, basket Rp100.000 per jam.
- Lapangan berstatus `Tersedia` atau `Perbaikan`. Lapangan yang sedang perbaikan tidak bisa dipesan.

Angka-angka ini disimpan di `app/Support/Pemesanan.php` (`JAM_BUKA`, `JAM_TUTUP`, `HARI_KE_DEPAN`).

## Status booking

Kolom `bookings.status` hanya punya tiga nilai:

| Status | Artinya |
| --- | --- |
| `Dipesan` | Booking sudah dibuat, pembayarannya belum dikonfirmasi. |
| `Dikonfirmasi` | Admin sudah menerima bukti bayar. Jam ini pasti milik penyewa. |
| `Dibatalkan` | Dibatalkan penyewa, oleh sistem karena lewat batas bayar, atau oleh pengelola. |

Penyebab pembatalan dibedakan dengan kolom `bookings.dibatalkanPenyewa` dan log aktivitas:

- `dibatalkanPenyewa = true` berarti penyewa sendiri yang membatalkan.
- Kalau ada baris log dengan aksi `otomatis`, berarti sistem yang membatalkan.
- Selain itu dianggap dibatalkan pengelola.

## Status pembayaran

Setiap booking punya paling banyak satu baris di tabel `pembayarans`.

| Status | Artinya |
| --- | --- |
| `Menunggu Verifikasi` | Penyewa sudah mengirim bukti transfer, Admin belum memeriksa. |
| `Terverifikasi` | Admin menerima bukti. Booking ikut menjadi `Dikonfirmasi`. Status ini final. |
| `Ditolak` | Admin menolak bukti dengan alasan (`alasanTolak`). Penyewa bisa mengirim bukti baru di baris yang sama. |

`Terverifikasi` hanya bisa diberikan lewat tombol Terima di panel verifikasi Admin. Form Edit Pembayaran tidak menawarkan status itu. Alasannya, tombol Terima juga mengecek bentrok jam dan mengubah status booking.

## Perjalanan satu booking

Pertama, penyewa memilih lapangan, tanggal, dan jam di Home, lalu menekan "Booking sekarang". Booking tersimpan dengan status `Dipesan`, dan kolom `created_at` mencatat waktunya.

Kedua, penyewa punya waktu `BATAS_BAYAR_MENIT` (bawaan 60 menit) untuk mentransfer dan mengirim bukti. Selama belum ada bukti, penyewa boleh mengubah jadwal (lapangan tetap sama) atau membatalkan tanpa biaya.

Ketiga, kalau batas waktu lewat tanpa bukti, booking menjadi `Dibatalkan`. Pembatalan ini dijalankan oleh perintah terjadwal `booking:batalkan-kedaluwarsa` setiap menit, dan juga setiap kali halaman penyewa, dashboard Admin, atau tabel Booking Admin dibuka.

Keempat, setelah bukti dikirim, pembayaran berstatus `Menunggu Verifikasi`, dan booking tidak bisa batal otomatis lagi.

Kelima, Admin memeriksa bukti:

- Terima: pembayaran menjadi `Terverifikasi`, booking menjadi `Dikonfirmasi`.
- Tolak: pembayaran menjadi `Ditolak` dengan alasan, dan booking tetap `Dipesan`. Penyewa bisa mengirim bukti baru.

## Kapan sebuah jam dianggap terisi

Di sisi penyewa, sebuah jam dianggap terisi (tidak bisa dipesan orang lain) kalau ada booking yang:

- berstatus `Dikonfirmasi`, atau
- berstatus `Dipesan` dan bukti bayarnya sedang `Menunggu Verifikasi`.

Booking yang belum mengirim bukti tidak menahan jam. Jadi dua penyewa bisa memesan jam yang sama, dan yang lebih dulu mengirim bukti yang mendapat jamnya. Penyewa lain melihat peringatan "Jam ini sudah diambil penyewa lain" sebelum sempat mentransfer. Aturan ini ada di `Pemesanan::tahanJam()` dan `Pemesanan::jamDiambil()`.

Form Booking milik Admin lebih ketat: semua booking yang belum dibatalkan, termasuk `Dipesan`, dianggap menahan jam. Dengan begitu Admin tidak menimpa pesanan penyewa.

## Laporan pembayaran bulanan

Admin membuat satu laporan PDF per bulan, lalu Manager memeriksanya. Halaman Laporan Admin menampilkan salah satu keadaan berikut untuk bulan yang dipilih:

| Keadaan | Artinya |
| --- | --- |
| `depan` | Bulannya belum dimulai. |
| `berjalan` | Bulan ini masih berjalan. Laporan belum bisa dibuat. |
| `kosong` | Tidak ada data di bulan itu. |
| `tertahan` | Masih ada bukti yang menunggu verifikasi. Laporan belum bisa dibuat. |
| `siap` | Bulan selesai dan semua bukti sudah diputuskan. Laporan bisa dibuat. |
| `belum` | Laporan sudah dibuat dan diserahkan, menunggu Manager. |
| `revisi` | Manager meminta revisi dengan catatan. Admin membuat ulang laporannya. |
| `cek` | Manager sudah menandai laporan "diperiksa". Laporan terkunci. |

Batas penyerahan adalah tanggal 5 bulan berikutnya. Setelah laporan diserahkan, pembayaran di bulan itu terkunci: Admin tidak bisa menambah, mengubah, atau menghapusnya. Kunci terbuka lagi selama Manager meminta revisi. Aturan ini ada di `app/Support/KunciLaporan.php`.

## Log aktivitas

Setiap perubahan data oleh pengelola dan sistem dicatat di tabel `log_aktivitas`. Contohnya tambah, ubah, hapus, terima, tolak, batal otomatis, buat laporan, dan login. Log ini tidak bisa diubah atau dihapus: database menolak perintah `UPDATE` dan `DELETE` lewat trigger. Setiap baris juga menyimpan sidik jari (hash) dari baris sebelumnya, sehingga perubahan diam-diam di database bisa ketahuan lewat tombol "Periksa keaslian log". Penjelasan lengkapnya ada di halaman [LogAktivitas.php](/backend/support/log-aktivitas).

## FAQ

**Kenapa booking yang belum bayar tidak langsung menahan jam?**
Supaya orang tidak bisa mengunci jam tanpa membayar. Jam baru ditahan setelah ada bukti transfer, yaitu tanda bahwa penyewa serius.

**Bagaimana kalau Admin salah menerima bukti?**
Pembayaran `Terverifikasi` tidak bisa diubah lagi. Admin bisa mengubah booking menjadi `Dibatalkan` (wajib dengan alasan) supaya jamnya lepas. Pengembalian uang dilakukan di luar aplikasi.

**Kenapa data yang dimasukkan Admin tidak pernah batal otomatis?**
Booking yang dibuat Admin tidak punya `created_at`, sedangkan pembatalan otomatis hanya memeriksa booking yang punya `created_at`.

---
title: Glosarium
urutan: 7
---

# Glosarium

Istilah yang sering muncul di kode dan dokumentasi, diurutkan menurut abjad.

## Istilah teknis

| Istilah | Artinya |
| --- | --- |
| Artisan | Alat baris perintah Laravel, dijalankan dengan `php artisan ...`. |
| Base UI | Pustaka komponen React tanpa gaya (menu, dialog, popover) yang menangani keyboard dan aksesibilitas. |
| Blade | Bahasa templat HTML milik Laravel. Di proyek ini hanya dipakai untuk wadah halaman dan PDF laporan. |
| Carbon | Kelas PHP untuk tanggal dan jam. `now()` dan `today()` mengembalikan objek Carbon. |
| Collection | Kumpulan data hasil query Laravel, punya fungsi seperti `map`, `filter`, `sum`, `groupBy`. |
| Controller | Kelas PHP yang menangani permintaan dari satu atau beberapa rute. |
| CSRF | Token rahasia yang memastikan form dikirim dari aplikasi sendiri. Inertia mengurusnya otomatis. |
| Disk | Lokasi penyimpanan file di Laravel. `local` untuk file privat, `public` untuk file yang boleh dilihat siapa saja. |
| Eloquent | Cara Laravel membaca tabel lewat model (`Penyewa::find(1)`). Di proyek ini dipakai terbatas. |
| Factory | Pembuat data palsu untuk tes, misalnya `Penyewa::factory()->create()`. |
| Flash | Pesan sekali tampil yang dititipkan ke sesi, misalnya "Bukti terkirim". |
| Guard | Cara Laravel membedakan jenis akun yang login: `web` (penyewa), `admin`, dan `manager`. |
| Hash | Sidik jari teks. Password disimpan sebagai hash. Log aktivitas memakai hash untuk mendeteksi perubahan. |
| Hook | Fungsi React yang namanya diawali `use`, misalnya `useState` dan `useEffect`. |
| Inertia | Penghubung Laravel dan React. Controller memanggil `Inertia::render`, halaman React menerima datanya sebagai props. |
| JSX, TSX | Tag mirip HTML di dalam JavaScript (JSX) atau TypeScript (TSX). |
| Middleware | Kode yang berjalan sebelum controller, misalnya pengecekan login. |
| Migration | File PHP yang membuat atau mengubah tabel database. Dijalankan dengan `php artisan migrate`. |
| Partial reload | Meminta ulang sebagian props saja, misalnya `router.reload({ only: ['terisi'] })`. |
| Props | Data yang dikirim ke komponen React. Untuk halaman, props datang dari controller. |
| Query builder | Cara membaca tabel dengan `DB::table('nama')->where(...)->get()`. |
| Route | Pasangan alamat dan controller, ditulis di `routes/web.php`. |
| Seeder | Kelas PHP yang mengisi data awal atau data contoh. |
| shadcn | Kumpulan komponen siap salin yang membungkus Base UI dengan Tailwind. Hasilnya ada di `Components/ui/`. |
| Shared props | Props yang dikirim ke semua halaman, diatur di `HandleInertiaRequests.php`. |
| Sheet | Panel yang meluncur dari samping layar. Dipakai untuk form Tambah dan Edit. |
| State | Data milik komponen React yang bisa berubah, dibuat dengan `useState`. |
| Tailwind | Cara menata tampilan lewat kelas di `className`, misalnya `flex gap-2 p-4`. |
| Toast | Pesan kecil yang muncul sebentar di bawah layar. |
| Transaksi | Sekumpulan perintah database yang berhasil semua atau batal semua. |
| Trigger | Aturan di database yang berjalan otomatis. Dipakai untuk menolak `UPDATE` dan `DELETE` di tabel log. |
| Ziggy | Paket yang menyediakan fungsi `route('nama')` di React. |

## Istilah bisnis di kode

| Istilah | Artinya |
| --- | --- |
| Batas bayar | Waktu terakhir penyewa mengirim bukti: `created_at` ditambah `BATAS_BAYAR_MENIT`. |
| Bukti | Foto bukti transfer yang diunggah penyewa (`pembayarans.buktiBayar`). |
| GOR | Gedung olahraga, tempat lapangan berada. |
| Jam diambil | Jam yang sudah ditahan booking lain, sehingga penyewa tidak boleh mentransfer untuk jam itu. |
| Kode booking | `BK-` diikuti ID booking empat digit, misalnya `BK-0012`. Dibuat oleh `Pemesanan::kode()`. |
| Kunci laporan | Bulan yang laporannya sudah diserahkan. Pembayaran di bulan itu tidak bisa diubah. |
| Pengelola | Sebutan bersama untuk Admin dan Manager. |
| Perlu tindakan | Booking penyewa yang belum dibayar atau buktinya ditolak. Ditandai titik merah di menu akun. |
| Tahan jam | Booking yang membuat jamnya tidak bisa dipesan orang lain. |
| Terisi | Daftar jam yang sudah ditahan, dikirim ke Home dan Ubah jadwal. |

## Nama tabel dan kolom penting

| Tabel | Kolom penting |
| --- | --- |
| `penyewas` | `idPenyewa`, `namaPenyewa`, `noHp`, `email`, `password` |
| `admins`, `managers` | `idAdmin` / `idManager`, `namaAdmin` / `namaManager`, `username`, `password`, `notifDibacaPada` |
| `lapangans` | `idLapangan`, `namaLapangan`, `jenisLapangan`, `tarifPerJam`, `status`, `foto` |
| `bookings` | `idBooking`, `idPenyewa`, `idLapangan`, `idAdmin`, `tanggal`, `jamMulai`, `jamSelesai`, `totalBayar`, `status`, `dibatalkanPenyewa`, `created_at` |
| `pembayarans` | `idPembayaran`, `idBooking`, `idAdmin`, `tglBayar`, `jumlahBayar`, `buktiBayar`, `status`, `alasanTolak`, `dikirimPada`, `diverifikasiPada` |
| `laporan_pembayarans` | `idLaporan`, `idAdmin`, `idManager`, `bulan`, `tahun`, `totalPemasukan`, `tglLaporan`, `namaLaporan`, `filePdf`, `diperiksaPada`, `catatanRevisi`, `revisiPada` |
| `log_aktivitas` | `id`, `waktu`, `idAdmin`, `namaAdmin`, `peran`, `aksi`, `jenisObjek`, `kodeObjek`, `ringkasan`, `rincian`, `catatan`, `hashSebelumnya`, `hash` |

---
title: Pola halaman
urutan: 5
---

# Pola halaman

::: info Tentang halaman ini
- **Sumber di kode:** `resources/js/Pages/Dashboard/Admin.tsx`, `Pages/Master/*/TampilData.tsx`, `Pages/Manager/`
- **Sumber rancangan:** kanvas "Redesign Dashboard Admin" (artboard Admin dan Manager)
:::

## Dashboard: "apa tugas saya hari ini"

Urutannya selalu sama:

1. **Sapaan dan satu kalimat ringkasan**, misalnya "8 sesi hari ini · 2 bukti harus dicek sebelum 16.00".
2. **Angka hari ini** dalam satu kartu, dipisah garis tegak. Setiap angka punya keterangan asalnya.
3. **Jadwal** hari itu, bisa pindah hari.
4. **Perlu tindakan**: antrean terlama di atas, lalu Tugas lain yang benar-benar ada.
5. Kartu pendukung (Booking terbaru untuk Admin, Aktivitas hari ini untuk Manager).

Pemantauan Manager memakai halaman yang sama dalam mode hanya lihat.

## Halaman data (TampilData)

```text
JudulHalaman (judul, deskripsi, tombol Tambah atau pemilih periode)
[kartu status atau peringatan, kalau ada]
DataTable
  toolbar: cari · filter putus-putus · Tampilan · aksi kanan
  baris 49px · ikon Edit/Hapus di kanan
  halaman: baris per halaman · pindah halaman
FormSheet untuk Tambah dan Edit
```

- Tambah dan Edit di sheet samping, bukan halaman terpisah.
- Hapus selalu lewat konfirmasi (`DeleteButton`) dan metode `DELETE`.
- Kalau data terkunci (misalnya bulan yang laporannya sudah diserahkan), tombol diganti ikon gembok dan ada catatan di atas tabel.

## Kartu status sebagai filter

Dipakai di halaman Pembayaran. Kartu Semua, Menunggu verifikasi, Terverifikasi, dan Ditolak di atas tabel sekaligus menjadi filter. Kartu yang aktif punya garis `primary`.

## Panel samping untuk keputusan

Keputusan penting dibuat di sheet lebar, bukan di baris tabel:

- bukti di kiri, rincian di kanan
- peringatan di atas rincian (Perlu dicek atau Jam bentrok)
- tombol keputusan di bawah, dengan penunjuk antrean "3 dari 7"
- menolak selalu dua langkah: tulis alasan, lalu Tolak pembayaran.

## Halaman yang keadaannya berubah

Dipakai di Laporan pembayaran. Satu nilai `keadaan` dari server menentukan judul, badge, kalimat penjelas, peringatan, dan tombol mana yang aktif. Tombol yang belum bisa dipakai tetap tampil nonaktif, dengan penjelasan di tooltip.

## Mode hanya lihat (Manager)

- Halaman Manager yang menampilkan data operasional memakai komponen yang sama dengan Admin, tanpa tombol yang mengubah data.
- `DrawerVerifikasi hanyaLihat` menampilkan "Detail pembayaran" dengan satu tombol Tutup.
- Tombol yang tidak boleh ditekan Manager tidak ditampilkan sama sekali, bukan hanya dinonaktifkan.

## Analisis

- Periode dan tab disimpan di alamat halaman, supaya bisa dibagikan.
- Grafik batang bisa diklik untuk pindah periode.
- Periode yang belum final ditandai badge dan batang bergaris.

## Aturan

- Satu tombol `primary` per layar.
- Antrean selalu terlama di atas.
- Setiap angka punya keterangan asalnya.
- Data yang lebih lebar dari layar digulir di dalam kartunya.

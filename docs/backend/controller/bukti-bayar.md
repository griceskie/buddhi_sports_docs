---
title: BuktiBayarController.php
urutan: 11
---

# BuktiBayarController.php

::: info Tentang file ini
- **Lokasi:** `app/Http/Controllers/BuktiBayarController.php` (30 baris)
- **Jenis:** controller (PHP)
- **Dipakai oleh:** route `pembayaran.bukti` di [web.php](/backend/route/web)
- **Berhubungan dengan:** [BookingPenyewaController](./booking-penyewa) dan [AdminDashboardController](./admin-dashboard) (keduanya membuat alamat route ini)
:::

## Ringkasan

Bukti transfer disimpan di disk privat, jadi browser tidak bisa membukanya lewat alamat file biasa. Satu-satunya jalan adalah route `GET /pembayaran/{idPembayaran}/bukti`, yang ditangani controller ini. Controller ini mengecek dua hal sebelum mengirim gambar: filenya aman dibuka, dan orang yang meminta memang boleh melihatnya.

## Isi file

### `tampil()`

**Logikanya:**

1. **Ambil path bukti dan pemilik booking:**

   ```php
   $p = DB::table('pembayarans')
       ->join('bookings', ...)
       ->where('pembayarans.idPembayaran', $idPembayaran)
       ->first(['pembayarans.buktiBayar', 'bookings.idPenyewa']);
   ```

2. **Pastikan filenya aman:**

   ```php
   $aman = $p?->buktiBayar && str_starts_with($p->buktiBayar, 'bukti/') && ! str_contains($p->buktiBayar, '..');
   abort_if(! $aman || ! Storage::disk('local')->exists($p->buktiBayar), 404);
   ```

   - Path harus ada di folder `bukti/`. Disk yang sama juga menyimpan PDF laporan, dan route ini tidak boleh dipakai untuk membukanya.
   - Path tidak boleh berisi `..`, supaya tidak bisa keluar dari folder.
   - File harus benar-benar ada di disk.

   Kalau salah satu tidak terpenuhi, hasilnya 404. `?->` berarti "baca properti kalau objeknya ada". Kalau pembayaran tidak ditemukan, `$p` bernilai `null` dan seluruh syaratnya salah.

3. **Pastikan yang meminta boleh melihat:**

   ```php
   $boleh = Auth::guard('admin')->check()
       || Auth::guard('manager')->check()
       || Auth::guard('web')->id() === $p->idPenyewa;
   abort_unless($boleh, 403);
   ```

   Admin dan Manager boleh melihat semua bukti. Penyewa hanya boleh melihat bukti miliknya sendiri. Orang lain mendapat 403 (dilarang).

4. **Kirim file** dengan `Storage::disk('local')->response(...)`. Browser menampilkannya langsung, tidak mengunduhnya.

Middleware route `auth:web,admin,manager` sudah memastikan yang meminta sudah login dengan salah satu dari tiga peran. Pengecekan kepemilikan dilakukan di controller.

## Aturan di file ini

- Jangan pernah mengirim path file bukti ke browser. Selalu kirim alamat route ini, misalnya dengan `route('pembayaran.bukti', $idPembayaran)`.
- Cek path (folder `bukti/`, tanpa `..`) dilakukan di sini dan juga saat Admin menyimpan path di form Pembayaran. Kedua cek itu dipertahankan.

## FAQ

**Kenapa urutannya cek file dulu, baru cek izin?**
Pembayaran yang tidak ada atau file yang hilang menghasilkan 404 untuk siapa pun. Pembayaran yang ada tetapi milik orang lain menghasilkan 403. Keduanya tetap tidak menampilkan isi file.

**Alamat bukti tidak punya akhiran `.jpg`. Bagaimana halaman tahu jenisnya?**
Server mengirim jenis file di header respons. Untuk komponen yang perlu tahu sebelum memuat file, misalnya `ProofPreview`, data bukti membawa tanda `buktiPdf` yang menandai file PDF.

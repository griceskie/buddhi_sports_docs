---
title: Manager/Pembayaran.tsx
urutan: 3
---

# Manager/Pembayaran.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Manager/Pembayaran.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/manager/pembayaran?periode=YYYY-MM`, route `manager.pembayaran`
- **Server:** `ManagerController::pembayaran()` (lihat [ManagerController](/backend/controller/manager))
- **Komponen penting:** [DrawerVerifikasi](/frontend/komponen/drawer-verifikasi) dengan `hanyaLihat`, [DataTable](/frontend/komponen/data-table)
:::

## Ringkasan

Daftar pembayaran satu bulan untuk Manager. Manager hanya melihat. Keputusan menerima atau menolak tetap milik Admin. Susunannya mirip halaman [Pembayaran Admin](/frontend/admin/master-pembayaran):

- pemilih periode di samping judul
- empat kartu status yang menjadi filter, masing-masing dengan **jumlah dan total rupiah**
- tabel dengan kolom Kode, Penyewa, Lapangan, Jadwal main, Dikirim, Jumlah, dan Status
- klik baris (atau ikon mata) membuka panel bukti dalam mode hanya lihat.

Tidak ada tombol Tambah, Edit, atau Hapus.

## Isi file

### Tipe baris

```tsx
type Pembayaran = BuktiAntrean & { alasanTolak: string | null; diverifikasiPada: string | null };
```

Bentuk baris sama dengan bukti di antrean Admin (`BuktiAntrean`), ditambah dua isian. Karena bentuknya sama, panel verifikasi bisa dipakai tanpa diubah.

### Kartu status

```tsx
const TAB = [
    { id: 'semua', label: 'Semua', ringkasan: null },
    { id: 'Menunggu Verifikasi', label: 'Menunggu verifikasi', ringkasan: 'menunggu' },
    ...
] as const;
```

Setiap kartu tahu kunci ringkasannya di props `ringkasan` dari server. Untuk "Semua", jumlah dan totalnya dihitung dari daftar pembayaran.

`as const` membuat TypeScript mengingat nilai persisnya (`'menunggu'`, bukan sekadar teks), sehingga `ringkasan[t.ringkasan]` bisa diperiksa tipenya.

### Kolom Jumlah

Kalau jumlah yang dibayar kurang dari total booking, di bawah angkanya tampil "Kurang Rp..." berwarna merah. Manager bisa melihat transfer yang tidak sesuai tanpa membuka setiap bukti.

### Panel hanya lihat

```tsx
<DrawerVerifikasi hanyaLihat bukti={bukti} posisi={posisi} jumlah={daftar.length} ... />
```

- Judul panel menjadi "Detail pembayaran", dan satu-satunya tombol adalah Tutup.
- Tombol sebelumnya dan berikutnya berpindah di antara baris yang sedang tersaring (`daftar`), bukan di antara semua pembayaran.

## Aturan di file ini

- Halaman Manager tidak boleh punya tombol yang mengubah pembayaran.
- Bentuk baris diambil dari server lewat `AdminDashboardController::bukti()`, sama dengan Admin.

## FAQ

**Manager melihat bukti yang salah. Apa yang bisa dilakukan?**
Manager menghubungi Admin. Kalau sudah masuk laporan, Manager bisa meminta revisi laporan bulan itu.

**Kenapa ada kolom Dikirim selain tanggal bayar?**
Tanggal bayar menentukan bulan laporan. Waktu dikirim menunjukkan kapan bukti diunggah, dan dipakai untuk menghitung berapa lama Admin memeriksanya.

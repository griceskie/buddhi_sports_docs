---
title: Manager/LaporanPembayaran.tsx
urutan: 5
---

# Manager/LaporanPembayaran.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Manager/LaporanPembayaran.tsx` (43 baris)
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/manager/laporan`, route `manager.laporan`
- **Server:** `ManagerController::laporanPembayaran()`, `tandaiDiperiksa()`, dan `mintaRevisi()` (lihat [ManagerController](/backend/controller/manager))
- **Komponen penting:** `Components/manager/TabelLaporan.tsx` (`TabelLaporan`, `TandaiDiperiksa`, `MintaRevisi`)
:::

## Ringkasan

Tempat Manager memeriksa laporan bulanan dari Admin. Di atas ada kotak peringatan untuk laporan **terlama** yang menunggu diperiksa, dengan tiga tombol: **Buka PDF**, **Minta revisi**, dan **Tandai diperiksa**. Di bawahnya ada tabel semua laporan.

Tindakan hanya ada di kotak peringatan, satu laporan sekaligus. Tabel hanya untuk melihat.

## Isi file

```tsx
export default function LaporanPembayaran({ laporan, menunggu }: { laporan: Laporan[]; menunggu: number | null }) {
    const tunggu = laporan.find((l) => l.idLaporan === menunggu);
    ...
    {tunggu && (
        <div role="alert" ...>
            <span>{tunggu.namaLaporan} menunggu Anda periksa</span>
            <span>Dibuat {tunggu.namaAdmin} pada {formatTanggal(tunggu.tglLaporan, 'd MMM yyyy')}. Total pemasukan {formatRupiah(tunggu.totalPemasukan)}.</span>
            <a href={route('laporan.pdf', tunggu.idLaporan)} target="_blank">Buka PDF</a>
            <MintaRevisi laporan={tunggu} />
            <TandaiDiperiksa laporan={tunggu} />
        </div>
    )}
    <TabelLaporan laporan={laporan} />
```

- `menunggu` dari server adalah ID laporan terlama yang sudah diserahkan, belum diperiksa, dan tidak sedang direvisi. Kalau `null`, kotak peringatan tidak tampil.
- `role="alert"` membuat pembaca layar mengumumkan kotak ini saat halaman dibuka.

### `TandaiDiperiksa` dan `MintaRevisi`

Keduanya ada di `Components/manager/TabelLaporan.tsx`:

- **Tandai diperiksa** membuka dialog konfirmasi, lalu mengirim `POST /manager/laporan/{id}/diperiksa`. Setelah itu, laporan terkunci.
- **Minta revisi** membuka dialog dengan kolom catatan (wajib, maksimal 500 karakter), lalu mengirim `POST /manager/laporan/{id}/revisi`. Admin melihat catatannya di halaman Laporan dan di notifikasi.

### `TabelLaporan`

Kolom: Periode (dengan catatan revisi di bawahnya kalau ada), Total pemasukan, Dibuat, Status (badge dengan tooltip), Diperiksa, dan PDF.

## Aturan di file ini

- Manager memeriksa satu laporan sekaligus, dari yang terlama.
- Laporan yang sudah diperiksa tidak bisa diminta revisi lagi.

## FAQ

**Kenapa laporan yang sedang direvisi tidak muncul di kotak peringatan?**
Laporan itu sedang di tangan Admin. Kotak peringatan muncul lagi setelah Admin membuat ulang laporannya.

**Apakah Manager bisa membatalkan "Tandai diperiksa"?**
Tidak dari aplikasi. Laporan yang sudah diperiksa terkunci, termasuk pembayaran di bulan itu.

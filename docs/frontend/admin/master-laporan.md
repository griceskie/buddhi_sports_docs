---
title: Master/LaporanPembayaran/TampilData.tsx
urutan: 7
---

# Master/LaporanPembayaran/TampilData.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Master/LaporanPembayaran/TampilData.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/tampillaporanpembayaran?periode=YYYY-MM`
- **Server:** [MasterLaporanPembayaranController](/backend/controller/master-laporan-pembayaran) dan, untuk Buat laporan, [LaporanPembayaranController](/backend/controller/laporan-pembayaran)
- **Komponen penting:** [AnalitikLaporan](/frontend/komponen/analitik-laporan), [DialogLaporan](/frontend/komponen/dialog-laporan), [DataTable](/frontend/komponen/data-table)
:::

## Ringkasan

Halaman Laporan pembayaran milik Admin. Dari atas ke bawah:

1. **Judul** "Laporan {bulan} {tahun}" dengan badge keadaan, dan tanda "Terlambat n hari" kalau batas tanggal 5 sudah lewat. Di kanan ada pemilih periode, Buka PDF, dan Buat laporan.
2. **Peringatan**, kalau ada: catatan revisi dari Manager, atau bukti yang masih menunggu verifikasi.
3. **Analitik bulan itu** (pemasukan, keterisian, grafik, peta jam tersibuk, corong booking).
4. **Tabel semua laporan**.

Isi bagian atas sepenuhnya ditentukan oleh `tinjauan.keadaan`, yang dihitung server.

## Isi file

### Keadaan dan badge

```tsx
type Keadaan = 'kosong' | 'depan' | 'berjalan' | 'tertahan' | 'siap' | 'belum' | 'revisi' | 'cek';

const BADGE: Record<Keadaan, { teks: string; nada: 'abu' | 'biru' | 'oranye' | 'hijau' }> = {
    kosong: { teks: 'Tidak ada data', nada: 'abu' },
    berjalan: { teks: 'Berjalan', nada: 'biru' },
    ...
};
```

`Record<Keadaan, ...>` adalah objek yang harus punya kunci untuk setiap keadaan. Kalau ada keadaan baru di tipe tetapi lupa ditambahkan di sini, TypeScript menandainya.

`nada` dipasang sebagai `data-nada` di `Badge`. Warna badge diatur di `admin.css` berdasarkan atribut itu.

Arti setiap keadaan dijelaskan di [MasterLaporanPembayaranController](/backend/controller/master-laporan-pembayaran).

### Nilai turunan

| Nilai | Artinya |
| --- | --- |
| `adaData` | Bukan `kosong` dan bukan `depan`. Analitik hanya tampil kalau benar. |
| `terlambat` | Keadaan `siap` atau `tertahan`, dan `hariTerlambat` lebih dari 0. |
| `bisaBuat` | `siap`, `belum`, atau `revisi`. Tombol Buat laporan (atau Buat ulang laporan) aktif. |
| `mati` | `berjalan` atau `tertahan`. Tombol Buat laporan tampil tetapi nonaktif, dengan penjelasan saat disorot. |

### Kalimat penjelas

```tsx
const desk: Record<Keadaan, string> = {
    berjalan: `Periode masih berjalan. Laporan bisa dibuat mulai ${tgl(tinjauan.awalBerikut)}.`,
    siap: terlambat ? `... batas penyerahan ${tgl(tinjauan.batasSerah)} sudah lewat. Buat dan serahkan sekarang.` : `...`,
    ...
};
```

Setiap keadaan punya satu kalimat yang menjelaskan apa yang terjadi dan apa yang perlu dilakukan. Kalimat ini tampil di bawah judul.

### Peringatan

- Keadaan `revisi`: kotak berisi catatan revisi dari Manager.
- Keadaan `tertahan`: kotak "n pembayaran {bulan} menunggu verifikasi", dengan tombol "Buka pembayaran" ke halaman Pembayaran bulan itu.

### Analitik

```tsx
{adaData && <AnalitikLaporan kini={tinjauan.kini} lalu={tinjauan.lalu} bulan={periode.bulan} tahun={periode.tahun} sementara={keadaan === 'berjalan'} />}
```

Untuk bulan berjalan, analitik diberi tanda "Sementara" dan tidak menampilkan perbandingan naik atau turun, karena bulannya belum lengkap.

### Tabel laporan

- **Status per baris:** `statusBaris(l)` menghasilkan `cek` kalau sudah diperiksa, `revisi` kalau diminta revisi, atau `belum`. Badge-nya punya ikon dan tooltip (catatan revisi atau tanggal diperiksa).
- **Urutan status:** Perlu revisi, Menunggu, lalu Sudah diperiksa, supaya yang perlu ditindaklanjuti muncul lebih dulu saat diurutkan.
- **Aksi:** tombol kecil PDF kalau ada file. Laporan yang sudah diperiksa menampilkan ikon gembok. Laporan lain menampilkan Edit dan Hapus.

PDF dibuka di tab baru (`target="_blank"`). `rel="noreferrer"` mencegah tab baru mengakses tab asal.

### Dialog Buat laporan

```tsx
<DialogLaporan key={kodePeriode} buka={buat} onClose={() => setBuat(false)} periode={periode} ... />
```

`key={kodePeriode}` membuat dialog dibuat ulang setiap kali periode berganti, supaya isinya (Manager, tanda tangan) tidak terbawa dari bulan lain.

## Aturan di file ini

- Bagian atas halaman hanya membaca `keadaan` dari server. Jangan menghitung keadaan di halaman.
- Tombol yang tidak bisa dipakai tetap tampil dalam keadaan nonaktif, dengan penjelasan saat disorot.
- Laporan yang sudah diperiksa tidak punya tombol Edit atau Hapus.

## FAQ

**Kenapa halaman membuka bulan ini, bukan bulan lalu?**
Mengikuti halaman Pembayaran, yang juga membuka bulan ini. Untuk membuat laporan bulan lalu, pilih bulan itu di pemilih periode, atau tekan tugas "Laporan {bulan} siap dibuat" di dashboard.

**Tombol Buat laporan nonaktif. Bagaimana tahu alasannya?**
Arahkan kursor ke tombol. Penjelasannya tampil: bulan masih berjalan, atau masih ada pembayaran yang menunggu verifikasi.

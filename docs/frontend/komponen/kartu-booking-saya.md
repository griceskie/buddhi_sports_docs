---
title: booking/KartuBookingSaya.tsx
urutan: 7
---

# booking/KartuBookingSaya.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/KartuBookingSaya.tsx`
- **Jenis:** komponen React (TSX)
- **Dipakai oleh:** [Booking saya](/frontend/penyewa/booking)
- **Memakai:** [pembayaran.ts](./pembayaran-ts) (`keadaan`, `sebabBatal`, `useSisaWaktu`), `ui/popover`
:::

## Ringkasan

Satu kartu booking di halaman Booking saya. Isinya:

- ikon olahraga dan nama lapangan
- kode booking (`BK-0012`) yang bisa diklik untuk disalin
- **status** berwarna dengan ikon. Saat disorot atau diketuk, muncul penjelasan. Untuk booking yang belum dibayar, status menampilkan hitung mundur (`Belum dibayar · 12:07`)
- jam dan harga
- satu tombol aksi: **Bayar sekarang**, **Kirim ulang bukti**, atau **Lihat detail**.

Semua tombol aksi membuka popup pembayaran yang sama.

## Isi file

### Props

| Props | Gunanya |
| --- | --- |
| `booking` | Data booking. |
| `riwayat` | Kartu ada di tab Riwayat: tanggal ikut ditulis di jam, tanpa durasi, ikon dibuat pudar. |
| `habisLokal` | Batas bayar booking ini sudah habis selagi halaman terbuka. |
| `onBuka` | Membuka popup pembayaran. |
| `onHabis` | Dipanggil saat hitung mundur kartu ini mencapai nol. |

### Keadaan kartu

```tsx
const k0 = keadaan(booking);
const sisa = useSisaWaktu(k0 === 'belumBayar' && !habisLokal ? booking.batasBayar : null);
const habis = habisLokal || (k0 === 'belumBayar' && !!sisa?.habis);
const k = habis ? 'dibatalkan' : k0;
```

Sama dengan [PanelPembayaran](./panel-pembayaran): kalau hitung mundur habis, kartu langsung tampil sebagai "Dibatalkan otomatis", dan `onHabis` memberi tahu halaman.

### Status

```tsx
const status: StatusKartu = {
    belumBayar: { label: 'Belum dibayar', warna: genting ? 'text-destructive' : 'text-accessible-orange', Ikon: Clock, info: '...' },
    menungguVerifikasi: { ... },
    ditolak: { ..., info: `Alasan: ${booking.alasanTolak ?? 'bukti tidak sesuai.'} Kirim bukti yang baru.` },
    dikonfirmasi: lewat ? { label: 'Selesai', ... } : { label: 'Dikonfirmasi', ... },
    dibatalkan: { ... },
}[k];
```

Objek ini berisi tampilan untuk setiap keadaan, lalu `[k]` langsung mengambil yang sesuai. Cara ini lebih mudah dibaca daripada deretan `if`.

- Booking yang belum dibayar berubah merah saat sisa waktu kurang dari 10 menit.
- Booking dikonfirmasi yang tanggalnya sudah lewat ditulis **Selesai**.
- Penjelasan pembatalan berbeda menurut penyebabnya: oleh penyewa, otomatis, atau oleh pengelola.

### Penjelasan status

```tsx
<Popover>
    <PopoverTrigger openOnHover delay={100} ...>
        <status.Ikon /> {status.label} {k === 'belumBayar' && sisa && <span role="timer">· {sisa.sisa}</span>} <Info />
    </PopoverTrigger>
    <PopoverContent side={hp ? 'bottom' : 'top'} ...>{status.info}</PopoverContent>
</Popover>
```

- `openOnHover`: popup terbuka saat disorot di desktop, dan saat diketuk di HP.
- Di desktop popup muncul di atas, di HP di bawah.
- Popup berwarna gelap (latar warna teks, teks warna latar), sehingga tetap kontras di mode terang.
- `role="timer"` memberi tahu pembaca layar bahwa angka itu hitung mundur.

Status digambar dua kali: satu di atas kartu untuk HP, satu di kanan untuk desktop. Fungsi `badge(hp)` menggambar keduanya dengan arah popup yang berbeda.

### Salin kode

```tsx
const salin = () => {
    navigator.clipboard?.writeText(booking.kode).catch(() => {});
    setTersalin(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTersalin(false), 1600);
};
```

1. Salin kode ke clipboard. `?.` dan `.catch(() => {})` mencegah galat kalau browser tidak mengizinkan.
2. Tampilkan tanda centang selama 1,6 detik.
3. Penghitung waktu disimpan di `useRef`, dan dibersihkan saat kartu hilang.

### Label untuk pembaca layar

```tsx
<article aria-label={`${booking.namaLapangan}, ${formatTanggal(booking.tanggal, 'EEE, d MMM')} pukul ${rentang}, ${status.label}`}>
```

Seluruh kartu punya satu kalimat ringkas, misalnya "Airlangga, Sel, 17 Nov pukul 16.00–18.00, Belum dibayar".

## Aturan di file ini

- Satu kartu, satu tombol aksi.
- Teks status memakai "pengelola", bukan "admin".
- Hitung mundur memakai format `mm:ss`. Jam memakai titik.

## FAQ

**Kenapa status booking dikonfirmasi bisa tertulis "Selesai"?**
Status di database tetap `Dikonfirmasi`. Kartu hanya menulisnya sebagai "Selesai" kalau tanggal mainnya sudah lewat, supaya lebih mudah dipahami penyewa.

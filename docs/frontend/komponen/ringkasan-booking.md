---
title: booking/RingkasanBooking.tsx
urutan: 6
---

# booking/RingkasanBooking.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/RingkasanBooking.tsx`
- **Jenis:** komponen React (TSX), dengan dua komponen yang diekspor
- **Dipakai oleh:** [Home](/frontend/penyewa/dashboard)
- **Memakai:** `ui/popover`, `bookingTotal`, `formatRupiah`, `formatTanggal`, `jam` dan `jamTeks` dari [jadwal.ts](./jadwal-ts)
:::

## Ringkasan

Bagian yang menunjukkan harga dan tombol **Booking sekarang** di Home. Ada dua versi, dengan isi yang sama:

- **`RingkasanBooking`** (bawaan): kartu di kolom kanan, mulai layar `lg`. Isinya harga bergaris bawah ("Rp100.000 untuk 2 jam"), kotak berisi tanggal (IN), jam (JAM), dan lapangan (LAPANGAN), tombol Booking sekarang, lalu kalimat "Anda belum dikenakan biaya".
- **`BarBookingMobile`**: bar yang menempel di bawah layar, di bawah `lg`. Isinya harga, tanggal dan jam, serta tombol Booking sekarang.

Mengklik harga membuka popup **Rincian harga**: "2 jam x Rp50.000", lalu Total. Polanya meniru Airbnb.

## Isi file

### Props

```tsx
type Props = { lapangan: Lapangan | null; pilihan: Pilihan | null; tanggal: Date; onBook: () => void; memproses?: boolean };
```

Kedua komponen menerima props yang sama, jadi Home bisa memakai keduanya bersamaan. Yang tampil diatur oleh kelas `hidden lg:block` dan `lg:hidden`.

### `hitung()`

```tsx
const hitung = (lapangan, pilihan) =>
    lapangan && pilihan
        ? { durasi: pilihan.end - pilihan.start,
            total: bookingTotal(jam(pilihan.start), jam(pilihan.end), lapangan.tarifPerJam),
            rentang: `${jamTeks(pilihan.start)}–${jamTeks(pilihan.end)}` }
        : null;
```

- `durasi`: jumlah jam, misalnya 18 − 16 = 2.
- `total`: tarif × jumlah jam, lewat `bookingTotal` dari `ui/format.ts`. Rumus yang sama dipakai form booking Admin.
- `rentang`: "16.00–18.00", ditulis dengan titik.

Kalau belum ada pilihan, hasilnya `null`. Kartu lalu menampilkan "Pilih jam", dan tombolnya nonaktif.

### `HargaDenganRincian`

Harga dibuat sebagai tombol pembuka popup. `side` menentukan arah munculnya popup: ke bawah di kartu, ke atas di bar bawah, supaya tidak keluar layar. `collisionPadding={16}` menjaga popup minimal 16px dari tepi layar.

Popup dipegang dengan state `buka`, supaya tombol X di dalamnya bisa menutupnya.

### Kotak IN, JAM, LAPANGAN

```tsx
<dl className="grid grid-cols-2 ...">
    <div><dt>In</dt><dd>{formatTanggal(tanggal, 'EEE, d MMM')}</dd></div>
    ...
</dl>
```

`<dl>`, `<dt>`, dan `<dd>` adalah elemen HTML untuk pasangan label dan nilai. Pembaca layar membacanya sebagai pasangan.

### Tombol

```tsx
<Button variant="elevated" disabled={!h || memproses} onClick={onBook}>
    {memproses ? 'Menyimpan…' : 'Booking sekarang'}
</Button>
```

Tombol utama halaman (`elevated`). Nonaktif kalau belum ada jam yang dipilih, atau selama booking sedang dikirim.

### Bar bawah

`pb-[max(0.75rem,env(safe-area-inset-bottom))]` menambah jarak bawah di HP yang punya garis navigasi di layar (misalnya iPhone tanpa tombol Home), supaya tombol tidak tertutup.

## Aturan di file ini

- Harga selalu dihitung dengan `bookingTotal`, bukan dihitung manual.
- Server menghitung ulang total saat booking disimpan. Angka di sini hanya untuk ditampilkan.

## FAQ

**Kenapa ada kalimat "Anda belum dikenakan biaya"?**
Supaya penyewa tidak ragu menekan tombol. Menekan Booking sekarang hanya membuat booking. Pembayaran baru terjadi di halaman berikutnya.

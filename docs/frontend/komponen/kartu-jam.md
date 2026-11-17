---
title: booking/KartuJam.tsx
urutan: 4
---

# booking/KartuJam.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/KartuJam.tsx`
- **Jenis:** komponen React (TSX)
- **Dipakai oleh:** [Home](/frontend/penyewa/dashboard) dan [UbahJadwal](./ubah-jadwal)
- **Memakai:** `ui/slot-picker` (`SlotPicker` varian `compact`)
:::

## Ringkasan

Kartu tempat penyewa memilih jam di satu lapangan dan satu tanggal. Bagian-bagiannya:

- **Judul:** "2 Jam di Airlangga" kalau sudah ada pilihan, "Pilih jam di Airlangga" kalau belum, atau "Airlangga penuh". Di bawahnya rentang jam yang dipilih.
- **Tarif** per jam di kanan.
- **Kotak-kotak jam** 08–22, dari `SlotPicker`.
- **Petunjuk** singkat di bawah kotak jam.
- **Strip abu-abu** di bawah kartu: "n jam kosong" dan keterangan warna (Kosong, Dipilih, Terbooking).

Kalau lapangan sedang diperbaiki, kotak jam diganti kotak oranye "Lapangan ini sedang dalam perbaikan. Pilih lapangan lain."

## Isi file

### Props

| Props | Gunanya |
| --- | --- |
| `lapangan` | Lapangan yang ditampilkan. |
| `perbaikan` | Lapangan sedang diperbaiki. |
| `jamKosong` | Jumlah jam kosong, dihitung pemanggil dengan `jamKosong()` dari [jadwal.ts](./jadwal-ts). |
| `booked` | Rentang jam yang sudah ditahan, misalnya `[{ start: '16:00', end: '18:00' }]`. |
| `isPast` | Fungsi yang menjawab apakah sebuah jam sudah lewat. |
| `value`, `onValueChange` | Rentang yang dipilih, dan fungsi yang dipanggil saat pilihan berubah. |
| `kataAksi` | Kata kerja di petunjuk. Bawaannya "booking". Ubah jadwal memakai "simpan". |

Komponen ini tidak menyimpan pilihan sendiri. Pilihan dipegang pemanggil lewat `value` dan `onValueChange`. Pola ini disebut **komponen terkendali** (controlled component).

### Judul dan sub-judul

```tsx
const durasi = value ? Number(value.end.slice(0, 2)) - Number(value.start.slice(0, 2)) : 0;
const judul = perbaikan ? lapangan.namaLapangan
    : value ? `${durasi} Jam di ${lapangan.namaLapangan}`
    : jamKosong > 0 ? `Pilih jam di ${lapangan.namaLapangan}`
    : `${lapangan.namaLapangan} penuh`;
```

Rangkaian `? :` bertingkat memilih satu teks dari beberapa keadaan, dicek dari atas.

`value.end.slice(0, 2)` mengambil dua karakter pertama ("18" dari "18:00"), lalu `Number(...)` mengubahnya menjadi angka.

### `SlotPicker`

```tsx
<SlotPicker variant="compact" open={jam(JAM_BUKA)} close={jam(JAM_TUTUP)}
    booked={booked} isPast={isPast} value={value} onValueChange={onValueChange}
    gridClassName="grid-cols-3 sm:grid-cols-5 xl:grid-cols-7" />
```

Komponen dari sistem desain yang menggambar kotak-kotak jam. Cara pilihnya:

- klik satu jam untuk memilih jam itu
- klik jam lain setelahnya untuk memperpanjang rentang (ada pratinjau saat kursor disorot)
- kalau di antara keduanya ada jam terbooking, rentang baru dimulai dari jam yang diklik
- klik lagi satu-satunya jam yang dipilih untuk membatalkan pilihan.

Jam pertama dan terakhir rentang berwarna biru penuh, sedangkan jam di antaranya biru muda. Jam terbooking digambar dengan garis putus-putus dan tanpa isi.

`gridClassName` mengatur jumlah kolom: 3 di HP, 5 mulai 640px, 7 mulai 1280px.

### Warna latar

```tsx
<div className="rounded-[17px] border bg-[color-mix(in_oklab,var(--foreground)_6%,var(--canvas))]">
```

Strip bawah memakai campuran 6% warna teks dengan warna latar halaman, supaya sedikit lebih gelap dari latar, di mode terang maupun gelap.

## Aturan di file ini

- Kartu ini tidak menghitung jam kosong atau jam lewat sendiri. Semuanya dari pemanggil.
- Warna keterangan harus sama dengan warna kotak jam di `SlotPicker`.

## FAQ

**Kenapa ada `rounded-[17px]` di luar dan `rounded-2xl` (16px) di dalam?**
Kartu putih duduk di dalam pembungkus abu-abu dengan garis 1px. Sudut luar dibuat 1px lebih besar supaya kedua sudut terlihat sejajar.

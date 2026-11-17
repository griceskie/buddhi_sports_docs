---
title: admin/AnalitikLaporan.tsx
urutan: 14
---

# admin/AnalitikLaporan.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/admin/AnalitikLaporan.tsx` (sekitar 500 baris)
- **Jenis:** komponen React (TSX)
- **Dipakai oleh:** halaman [Laporan pembayaran Admin](/frontend/admin/master-laporan)
- **Data dari:** [AnalitikLaporan.php](/backend/support/analitik-laporan), untuk bulan ini (`kini`) dan bulan sebelumnya (`lalu`)
:::

## Ringkasan

Satu kartu besar berisi analitik satu bulan:

1. **Angka utama** (`AngkaUtama`): pemasukan, booking terverifikasi, dan keterisian, masing-masing dengan chip Naik atau Turun dibanding bulan lalu.
2. Kisi 2 × 2:
   - **Pemasukan per lapangan** (`GrafikPemasukan`): grafik batang bertumpuk per minggu atau per hari
   - **Jam tersibuk** (`PetaJam`): peta panas hari × jam
   - **Keterisian per lapangan** (`KeterisianLapangan`): batang mendatar per lapangan
   - **Booking dan pembatalan** (`BookingDanBatal`): corong dari booking masuk sampai terkonfirmasi, batal per penyebab, dan bukti ditolak.

Untuk bulan yang masih berjalan, kartu diberi badge **Sementara**, dan chip Naik atau Turun tidak ditampilkan.

## Isi file

### Tipe `Analitik`

Sama dengan array yang dikembalikan `AnalitikLaporan::untuk()` di server.

```tsx
harian: Record<string, Record<string, [number, number]>> | [];
```

Komentar di kode menjelaskan `| []`: array PHP yang kosong terkirim sebagai `[]`, sedangkan yang berisi terkirim sebagai objek. Tipe ini menerima keduanya.

### Komponen utama

```tsx
export default function AnalitikLaporan({ kini, lalu, bulan, tahun, sementara = false }) {
    return (
        <div ...>
            {sementara && <p><Badge data-nada="oranye">Sementara</Badge> Bulan ini masih berjalan, ...</p>}
            <AngkaUtama ... />
            <div className="grid gap-4 lg:grid-cols-2">
                <GrafikPemasukan key={`${tahun}-${bulan}`} ... />
                <PetaJam ... /> <KeterisianLapangan ... /> <BookingDanBatal ... />
            </div>
        </div>
    );
}
```

`GrafikPemasukan` diberi `key` dari bulan, supaya pilihan skala (minggu atau hari) dan animasinya mulai dari awal setiap kali bulan berganti.

### `GrafikPemasukan`

```tsx
const kelompok = useMemo(() => {
    const indeks = (d: number) => (skala === 'hari' ? d - 1 : Math.floor((d - 1 + data.geser) / 7));
    for (let d = 1; d <= data.hariBulan; d++) { ...jumlahkan rupiah dan jumlah bayar per lapangan ke kelompok... }
}, [data, skala, harian]);
```

Server mengirim pemasukan per tanggal. Grafik mengelompokkannya:

- **Hari**: setiap tanggal satu batang.
- **Minggu**: tanggal dikelompokkan per minggu Senin–Minggu. `data.geser` adalah hari pertama bulan itu (Senin = 0), supaya minggu pertama terpotong dengan benar. Kalau bulan dimulai hari Rabu (`geser = 2`), tanggal 1–5 masuk minggu pertama.

`useMemo` hanya menghitung ulang kalau data atau skala berubah.

#### Garis sumbu yang rapi

```tsx
const kasar = maks / 4;
const p10 = Math.pow(10, Math.floor(Math.log10(kasar)));
const langkah = ([1, 2, 2.5, 5, 10].find((x) => x * p10 >= kasar) ?? 10) * p10;
const puncak = Math.ceil(maks / langkah) * langkah;
```

Supaya angka di sumbu bulat (misalnya 0, 500 rb, 1 jt, 1,5 jt), jarak antargaris dipilih dari 1, 2, 2,5, 5, atau 10 dikali pangkat sepuluh yang sesuai. Contoh: kalau batang tertinggi Rp1.800.000, `kasar` = 450.000, `p10` = 100.000, `langkah` = 500.000, dan `puncak` = 2.000.000.

#### Ganti skala

Tombol Minggu dan Hari berbentuk segmented control dengan `role="tablist"`. Setiap pergantian menambah `animKe`, yang memutar ulang animasi batang naik (`naik-grafik` di `admin.css`).

### Komponen kecil lain

| Komponen | Gunanya |
| --- | --- |
| `Bagian` | Kerangka satu kotak di kisi: judul, keterangan, dan aksi di kanan. |
| `TipGelap` | Tooltip gelap tiga baris untuk batang grafik, kotak peta, dan corong. |
| `TipBaris` | Satu baris di tooltip grafik: warna lapangan, nama, jumlah, rupiah, persen. |
| `PetaJam` | Kotak 26px untuk setiap hari × jam. Warnanya makin pekat makin ramai, penuh di 80%. |
| `KeterisianLapangan` | Batang mendatar jam terisi dibanding kapasitas, per lapangan. |
| `BookingDanBatal` | Segmen corong dengan tooltip penyebab batal. |

### Warna dan format

- `WARNA_LAPANGAN` sama dengan konstanta di server ([AnalitikBisnis](/backend/support/analitik-bisnis)), supaya satu lapangan selalu berwarna sama di semua grafik.
- `persen` dan `angka` memakai `toLocaleString('id-ID')`, jadi tertulis 12,5% dan 1.736.

## Aturan di file ini

- Komponen ini boleh menyusun data untuk grafik (mengelompokkan per minggu, menghitung garis sumbu). Angka dasarnya dari server.
- Bulan berjalan tidak dibandingkan dengan bulan lalu.
- Status di peta dan corong selalu punya teks di tooltip, bukan hanya warna.

## FAQ

**Kenapa grafik pemasukan dan keterisian bisa terasa tidak cocok?**
Pemasukan dihitung menurut tanggal bayar, sedangkan keterisian menurut tanggal main. Lihat penjelasan di [AnalitikLaporan.php](/backend/support/analitik-laporan).

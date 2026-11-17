---
title: Dashboard.tsx (Home)
urutan: 4
---

# Dashboard.tsx (Home)

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Dashboard.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/dashboard`, route `dashboard`
- **Server:** `BookingPenyewaController::home()` (lihat [BookingPenyewaController](/backend/controller/booking-penyewa))
- **Komponen penting:** `HeaderBeranda`, `GaleriLapangan`, [DateStrip](/frontend/komponen/date-strip), [KartuJam](/frontend/komponen/kartu-jam), [RingkasanBooking](/frontend/komponen/ringkasan-booking), `IslandStatus`, dan fungsi dari [jadwal.ts](/frontend/komponen/jadwal-ts)
:::

## Ringkasan

Home penyewa, tempat penyewa memilih olahraga, lapangan, tanggal, dan jam, lalu menekan **Booking sekarang**. Namanya tetap `Dashboard.tsx` karena warisan Breeze, tetapi di aplikasi halaman ini disebut Home.

Halaman ini adalah pengatur. Ia menyimpan pilihan penyewa dan meneruskannya ke komponen-komponen di bawahnya. Hitungan jadwal (jam kosong, jam yang sudah lewat, dan sebagainya) ada di [jadwal.ts](/frontend/komponen/jadwal-ts).

## Posisinya dalam alur

```text
HeaderBeranda   → pilih jenis olahraga dan lapangan
GaleriLapangan  → foto lapangan, tombol "Pesan sekarang" menggulir ke kartu jam
DateStrip       → pilih tanggal (30 hari)
KartuJam        → pilih jam
RingkasanBooking / BarBookingMobile → harga dan tombol Booking sekarang
        └─ POST /booking → halaman Bayar
```

## Isi file

### Props

```tsx
export default function Dashboard({ lapangan, terisi = [] }: { lapangan: Lapangan[]; terisi?: Terisi[] }) {
```

- `lapangan`: semua lapangan, beserta URL fotonya.
- `terisi`: jam yang sudah ditahan booking lain, untuk 30 hari ke depan. `= []` adalah nilai bawaan kalau props ini tidak dikirim.

### State

State adalah nilai yang diingat komponen dan, kalau berubah, membuat tampilan digambar ulang. Di React, state dibuat dengan `useState`.

| State | Isinya |
| --- | --- |
| `jenis` | Jenis olahraga yang dipilih, misalnya "Bulu Tangkis". Awalnya jenis pertama. |
| `pilihanLapangan` | Lapangan terpilih **per jenis**, misalnya `{ 'Bulu Tangkis': 2, 'Basket': 4 }`. Pindah tab bolak-balik tidak menghapus pilihan. |
| `tanggal` | Tanggal terpilih. Awalnya hari ini, atau besok kalau hari ini sudah habis. |
| `jamPilihan` | `'auto'`, jam pilihan penyewa (`{ start, end }`), atau `null`. |
| `galat` | Pesan galat dari server. |
| `memproses` | Benar selama booking sedang dikirim. |
| `mintaIsland` | Penghitung. Setiap kali bertambah, island jam buka muncul. |

```tsx
const [tanggal, setTanggal] = useState(() => tambahHari(hariIni, akhirHari ? 1 : 0));
```

`useState(() => ...)` memakai fungsi supaya nilai awal hanya dihitung sekali, saat komponen pertama kali tampil.

### Nilai turunan

Nilai berikut tidak disimpan sebagai state, tetapi dihitung ulang setiap kali halaman digambar:

- `tampil`: lapangan dengan jenis yang dipilih.
- `lapAktif`: lapangan yang ditampilkan. Urutannya: pilihan penyewa untuk jenis ini, lalu lapangan pertama yang tidak sedang diperbaiki, lalu lapangan pertama apa saja, lalu `null` kalau tidak ada lapangan.
- `kosong`: jumlah jam kosong lapangan itu di tanggal itu.
- `pilihan`: lapangan dan jam yang akan dipesan.
- `hari`: 30 hari untuk `DateStrip`, masing-masing dengan jumlah jam kosong dan label `Tutup` atau `Lewat` untuk hari ini kalau sudah habis.

`??` dipakai berulang untuk "kalau tidak ada, coba yang berikutnya":

```tsx
const lapAktif =
    tampil.find((l) => l.idLapangan === pilihanLapangan[jenis]) ??
    tampil.find((l) => !sedangPerbaikan(l)) ??
    tampil[0] ??
    null;
```

### Jam terpilih otomatis

```tsx
if (jamPilihan === 'auto') {
    const h = lapAktif ? jamKosongPertama(terisi, lapAktif, tanggal, sekarang) : null;
    jamTerpilih = h === null ? null : { start: h, end: h + 1 };
}
```

Kalau penyewa belum memilih jam, halaman langsung memilih satu jam kosong pertama. Untuk hari ini, itu jam kosong pertama setelah jam yang sedang berjalan. Dengan begitu, ringkasan harga langsung terisi, dan penyewa bisa langsung menekan Booking sekarang.

Setiap kali jenis, lapangan, atau tanggal diganti, `mulaiUlang()` mengembalikan pilihan ke `'auto'` dan menghapus galat.

### `ubahJam()`

```tsx
setJamPilihan(r ? { start: toMinutes(r.start) / 60, end: toMinutes(r.end) / 60 } : null);
```

`KartuJam` mengirim jam sebagai teks (`'16:00'`). Halaman menyimpannya sebagai angka jam (16). `toMinutes('16:00')` menjadi 960, lalu dibagi 60 menjadi 16.

### `book()`

```tsx
router.post(route('booking.store'), { idLapangan, tanggal: isoTanggal(tanggal), jamMulai: jam(pilihan.start), jamSelesai: jam(pilihan.end) }, {
    preserveScroll: true,
    onStart: () => { setMemproses(true); setGalat(null); },
    onFinish: () => setMemproses(false),
    onError: (e) => setGalat(Object.values(e)[0] ?? 'Booking gagal disimpan.'),
});
```

1. Kirim ke `POST /booking` dengan tanggal `YYYY-MM-DD` dan jam `HH:00`.
2. Selama dikirim, tombol menampilkan status memproses.
3. Kalau server menolak (misalnya jamnya baru saja diambil orang), pesan galat pertama ditampilkan di kotak merah di atas halaman.
4. Kalau berhasil, server mengarahkan ke halaman Bayar.

Halaman ini memakai `router.post`, bukan `useForm`, karena isi yang dikirim berasal dari state, bukan dari kolom form.

`Object.values(e)[0]` mengambil pesan galat pertama, apa pun nama field-nya.

### `keKartuJam()`

Dipanggil dari tombol "Pesan sekarang" di galeri. Halaman digulir ke kartu jam dengan jarak dari atas yang berbeda: 104px mulai 640px (karena header menempel) dan 16px di HP (header tidak menempel).

### Tampilan

- Kalau tidak ada lapangan sama sekali, tampil keadaan kosong "Belum ada lapangan".
- Kalau ada, urutannya: nama lapangan (`h1`), galeri, `DateStrip`, peringatan kalau hari ini sudah habis, lalu dua kolom: `KartuJam` di kiri dan `RingkasanBooking` di kanan mulai layar `lg`.
- Di bawah `lg`, ringkasan diganti `BarBookingMobile`, bar yang menempel di bawah layar.

```tsx
<KartuJam key={`${lapAktif.idLapangan}-${isoTanggal(tanggal)}`} ... />
```

`key` yang berubah membuat React membuang komponen lama dan membuat yang baru. Pilihan jam di dalam `KartuJam` jadi bersih setiap kali lapangan atau tanggal diganti.

`grid-cols-[minmax(0,1fr)]` di pembungkus utama mencegah strip tanggal yang bisa digeser mendorong halaman melebar keluar layar.

### Konstanta `BATAS_TERBATAS`

```tsx
const BATAS_TERBATAS = 3;
```

Tanggal ditandai "Terbatas" di `DateStrip` kalau jam kosongnya tinggal 3 atau kurang.

## Aturan di file ini

- Hitungan jadwal ditaruh di `jadwal.ts`, bukan di halaman.
- Server tetap memeriksa ulang semuanya. Pemeriksaan di halaman hanya untuk kenyamanan.
- Satu tombol utama (`elevated`) per halaman, yaitu Booking sekarang.

## FAQ

**Kenapa halaman ini memakai jam perangkat, bukan jam server?**
Untuk menandai jam yang sudah lewat dan status buka atau tutup, halaman memakai jam perangkat supaya bisa berubah tanpa memuat ulang. Saat booking dikirim, server memeriksa ulang dengan jamnya sendiri.

**Penyewa memilih jam, lalu orang lain mengambil jam yang sama lebih dulu. Apa yang terjadi?**
Booking tetap dibuat, karena booking tanpa bukti tidak menahan jam. Yang lebih dulu mengirim bukti yang mendapat jamnya. Kalau jam itu sudah ditahan bukti orang lain saat penyewa menekan Booking sekarang, server menolak dan pesannya muncul di kotak merah.

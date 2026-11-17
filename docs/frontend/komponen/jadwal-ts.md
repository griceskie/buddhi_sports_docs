---
title: booking/jadwal.ts
urutan: 1
---

# booking/jadwal.ts

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/jadwal.ts`
- **Jenis:** kumpulan fungsi dan konstanta (TypeScript), tanpa tampilan
- **Dipakai oleh:** [Home](/frontend/penyewa/dashboard), [DateStrip](./date-strip), [KartuJam](./kartu-jam), [UbahJadwal](./ubah-jadwal), `HeaderBeranda`, `StatusBuka`, `IslandStatus`, form [Master Booking](/frontend/admin/master-booking), dan lainnya
- **Pasangannya di server:** [Pemesanan](/backend/support/pemesanan)
:::

## Ringkasan

Semua aturan jadwal di sisi browser ada di sini: jam buka, berapa hari ke depan bisa dipesan, jam mana yang kosong, dan apakah GOR sedang buka. Halaman dan komponen tidak menghitung sendiri, tetapi memanggil fungsi di file ini.

Fungsi-fungsinya **murni**: hasilnya hanya bergantung pada parameternya, tanpa membaca atau mengubah apa pun di luar. Karena itu, fungsi-fungsi ini mudah diuji dan dipakai di mana saja.

## Konstanta

| Konstanta | Nilai | Artinya |
| --- | --- | --- |
| `JAM_BUKA` | 8 | GOR buka pukul 08.00. |
| `JAM_TUTUP` | 22 | GOR tutup pukul 22.00. Jam terakhir yang bisa dipesan adalah 21.00–22.00. |
| `HARI_KE_DEPAN` | 30 | Bisa memesan sampai 30 hari, termasuk hari ini. |
| `HAMPIR_PENUH` | 12 | Batas lama untuk tanda hampir penuh. |
| `BLOKIR_JAM_LEWAT` | `true` | Jam hari ini yang sudah dimulai tidak bisa dipilih. Bisa diubah ke `false` untuk mengisi data uji, tetapi server tetap menolak jam yang sudah lewat. |
| `IKON_JENIS` | path gambar | Ikon kok dan bola basket per jenis lapangan. |
| `IKON_LAPANGAN` | path gambar | Ikon lapangan 3D per jenis, untuk pilihan lapangan di Home. |

`JAM_BUKA`, `JAM_TUTUP`, dan `HARI_KE_DEPAN` harus sama dengan konstanta di `App\Support\Pemesanan`.

## Tipe

- `Lapangan`: satu lapangan seperti dikirim server, dengan `foto` berupa daftar URL.
- `Terisi`: satu rentang jam yang sudah ditahan di lapangan dan tanggal tertentu.
- `Pilihan`: lapangan dan jam yang dipilih penyewa, dalam angka jam (`start: 16, end: 18`).
- `StatusJam`: `'free'` (kosong), `'taken'` (ditahan), atau `'past'` (sudah lewat).

## Fungsi

### Menulis jam

```ts
export const jam = (h: number) => `${pad(h)}:00`;     // 8 → "08:00", untuk dikirim ke server
export const jamTeks = (h: number) => formatJam(h);   // 8 → "08.00", untuk ditampilkan
```

Ada dua bentuk dengan sengaja. Server menerima `HH:MM`. Layar menulis jam dengan titik, sesuai EYD.

### `statusGor(sekarang)`

Mengembalikan `{ buka, bukaLagi }`. `buka` benar antara 08.00 dan 22.00. `bukaLagi` berisi "buka pukul 08.00" (kalau sekarang sebelum jam 8) atau "buka besok 08.00" (kalau sudah lewat jam 22).

### `sisaHariIni(sekarang)`

Apakah hari ini masih punya jam yang bisa dipesan:

- `'tutup'`: sudah pukul 22.00 atau lebih
- `'lewat'`: pukul 21.00 sampai 21.59, jam terakhir sudah dimulai
- `null`: masih ada jam, atau `BLOKIR_JAM_LEWAT` dimatikan.

Home memakainya untuk memulai dari besok dan menampilkan peringatan.

### Tanggal

```ts
export const isoTanggal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const tambahHari = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const awalHari = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
```

- `isoTanggal` menulis tanggal sebagai `2026-11-17`, sama dengan format di server. `getMonth()` dimulai dari 0, jadi ditambah 1.
- `tambahHari` membuat tanggal baru n hari kemudian. JavaScript otomatis melompat bulan: 31 Oktober + 1 menjadi 1 November.
- `awalHari` membuang jam dan menit, supaya dua tanggal bisa dibandingkan.

Semua memakai zona waktu perangkat, bukan UTC. `toISOString()` sengaja tidak dipakai, karena memakai UTC dan bisa menggeser tanggal di Indonesia.

### `sedangPerbaikan(l)`

Benar kalau status lapangan `Perbaikan`. Huruf besar dan kecil diabaikan.

### `jamSudahLewat(h, tanggal, sekarang)`

Benar kalau tanggalnya hari ini dan jam `h` sudah dimulai. Pukul 15.20, jam 15 dianggap lewat.

### `statusJam(terisi, idLapangan, h, tanggal, sekarang)`

Status satu kotak jam:

1. Kalau ada rentang `terisi` di lapangan dan tanggal yang sama yang bertumpuk dengan jam `h` sampai `h+1`, hasilnya `'taken'`.
2. Kalau jamnya sudah lewat, hasilnya `'past'`.
3. Selain itu, `'free'`.

Syarat bertumpuk sama dengan di server: mulai sebelum yang lain selesai, dan selesai setelah yang lain mulai. Jam diubah ke menit dulu dengan `toMinutes`.

### `jamKosong(terisi, l, tanggal, sekarang)`

Jumlah jam `'free'` dari 08 sampai 21 untuk satu lapangan di satu tanggal. Lapangan yang sedang diperbaiki selalu 0. Angka ini tampil di strip tanggal ("Tersedia", "Terbatas", "Penuh") dan di kartu jam ("n jam kosong").

### `jamKosongPertama(terisi, l, tanggal, sekarang)`

Jam kosong pertama, atau `null` kalau penuh. Home memakainya untuk memilih satu jam secara otomatis.

## Aturan di file ini

- Fungsi di sini tidak membaca props, state, atau waktu sendiri. `sekarang` selalu dikirim pemanggil, supaya satu halaman memakai satu waktu yang sama.
- Kalau aturan jadwal di server berubah, ubah juga di sini.
- Jangan menaruh tampilan (JSX) di file ini.

## FAQ

**Kenapa ada aturan yang sama di browser dan di server?**
Browser memakainya supaya penyewa langsung melihat jam mana yang bisa dipilih, tanpa menunggu server. Server memakainya untuk keputusan akhir, karena isi browser bisa diubah siapa saja.

**Kenapa ada properti `milikSaya` di tipe `Terisi`?**
Properti ini opsional, untuk menandai jam milik penyewa sendiri. Server saat ini tidak mengirimnya.

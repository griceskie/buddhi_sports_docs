---
title: Dashboard/Admin.tsx
urutan: 2
---

# Dashboard/Admin.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Dashboard/Admin.tsx` (sekitar 670 baris)
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/dashboard-admin`, route `dashboard.admin`. Juga dipakai halaman [Pemantauan](/frontend/manager/pemantauan) Manager.
- **Server:** `AdminDashboardController::index()` (lihat [AdminDashboardController](/backend/controller/admin-dashboard))
- **Komponen penting:** [JadwalGeser](/frontend/komponen/jadwal-geser), [DrawerVerifikasi](/frontend/komponen/drawer-verifikasi), `DatePicker`
:::

## Ringkasan

Dashboard Admin, halaman pertama setelah Admin login. Dari atas ke bawah:

1. **Sapaan** dan satu kalimat ringkasan hari ini, misalnya "8 sesi hari ini · 2 bukti harus dicek sebelum 16.00". Ada juga tombol **Tambah booking**.
2. **Empat angka hari ini:** sesi (berjalan dan berikutnya), keterisian, booking masuk hari ini, dan bukti terverifikasi hari ini.
3. **Jadwal**: lini waktu per lapangan yang bisa digeser, dengan tombol hari sebelumnya, hari berikutnya, pemilih tanggal, dan Hari ini.
4. **Perlu tindakan**: antrean bukti bayar (yang paling lama dikirim di atas), lalu "Tugas lain".
5. **Booking terbaru** dengan tab status, kolom pembayaran, tombol Tinjau, dan Chat WA.

File yang sama dipakai halaman Pemantauan Manager dengan props `pemantauan`. Dalam mode itu, semua tombol tindakan hilang, kartu Booking terbaru diganti kartu "Aktivitas hari ini", dan halaman memperbarui diri setiap 30 detik.

## Isi file

### Props

| Props | Isinya |
| --- | --- |
| `stat` | Angka hari ini dari server. |
| `lapangan` | Daftar lapangan untuk baris jadwal. |
| `tanggalJadwal`, `jadwalDari`, `jadwalSampai`, `jadwal` | Tanggal yang dibuka di kartu Jadwal, dan booking dari 7 hari sebelum sampai 30 hari sesudahnya. |
| `jadwalHariIni` | Booking hari ini, untuk angka. |
| `antrean` | Bukti yang menunggu verifikasi. |
| `tugas` | Tugas lain (laporan perlu revisi, laporan bulan lalu, bukti ditolak). |
| `terbaru` | 16 booking terakhir. Hanya Admin. |
| `pemantauan` | Hanya ada di halaman Manager: `{ aktivitas }`. |

### Pembaruan otomatis (Pemantauan saja)

```tsx
const propsPantau = ['stat', 'jadwal', 'jadwalHariIni', 'antrean', 'tugas', 'aktivitas', 'pengelola'];
const { start: mulaiPantau, stop: hentiPantau } = usePoll(30_000, { only: propsPantau }, { autoStart: !!pemantauan });
```

`usePoll` dari Inertia meminta ulang props tertentu setiap 30 detik. Untuk Admin, `autoStart` bernilai `false`, jadi tidak ada polling.

Polling berhenti setelah 30 menit tanpa sentuhan (klik, ketik, gulir, sentuh layar), supaya sesi Manager yang ditinggal terbuka tetap bisa habis. Begitu ada sentuhan lagi, data dimuat ulang dan polling berjalan lagi.

Aktivitas yang baru muncul sejak pembaruan sebelumnya disorot sebentar. Halaman mengingat ID aktivitas yang sudah tampil dengan `useRef`.

### Jam yang berjalan

```tsx
const [sekarang, setSekarang] = useState(() => new Date());
useEffect(() => {
    const t = setInterval(() => setSekarang(new Date()), 60_000);
    return () => clearInterval(t);
}, []);
```

Setiap menit, `sekarang` diperbarui, sehingga garis "sekarang" di jadwal, angka sesi berjalan, dan chip "Main hari ini" ikut bergerak. Fungsi yang dikembalikan `useEffect` menghentikan penghitung waktu saat halaman ditinggalkan.

### Panel verifikasi

```tsx
const [ditinjau, setDitinjau] = useState<number | null>(() => {
    const id = Number(new URLSearchParams(window.location.search).get('bukti'));
    return id || null;
});
```

Kalau alamatnya `/dashboard-admin?bukti=12`, panel verifikasi langsung terbuka untuk bukti 12. Notifikasi bukti di lonceng header memakai alamat ini.

`putuskan()` sama dengan di halaman [Pembayaran](./master-pembayaran): kirim Terima atau Tolak, lalu langsung buka bukti berikutnya di antrean.

### Jadwal tanpa menunggu server

```tsx
const lihatTanggal = (d: Date) => {
    const iso = isoTanggal(d);
    if (iso >= jadwalDari && iso <= jadwalSampai) return setTampil(iso);
    router.get(route(...), { tanggal: iso }, { only: ['jadwal', 'tanggalJadwal', 'jadwalDari', 'jadwalSampai'], ... });
};
```

Server mengirim jadwal beberapa minggu sekaligus. Pindah ke tanggal di dalam rentang itu hanya mengganti state `tampil`, tanpa permintaan ke server (sekitar 30 milidetik, dibanding sekitar 500 milidetik lewat server di lingkungan pengembangan). Kalau tanggalnya di luar rentang, halaman meminta data jadwal baru saja (`only`).

`adaBentrok` memeriksa apakah ada bukti menunggu yang jamnya bertumpuk dengan booking terkonfirmasi di tanggal itu. Kalau ada, kartu Jadwal menampilkan peringatan.

### Angka hari ini

- **Sesi:** jumlah booking hari ini, berapa yang sedang berjalan, dan sesi berikutnya beserta lapangannya.
- **Keterisian:** `jamTerisi / jamTotal` dalam persen, dan berapa jam kosong yang tersisa hari ini (`sisaKosong`, dihitung per lapangan per jam dari jam sekarang sampai tutup).
- **Booking masuk** dan **terverifikasi** diambil langsung dari `stat`.

Setiap angka punya keterangan asalnya di bawahnya, supaya Admin tahu angka itu dihitung dari apa.

### Kalimat ringkasan

Untuk Admin: jumlah sesi hari ini, dan berapa bukti untuk sesi hari ini yang harus dicek sebelum jam main paling awal. Untuk Manager: jumlah sesi, bukti yang menunggu Admin, dan laporan yang menunggu diperiksa Manager.

### Chip di antrean

- `chipMain`: kapan bukti itu dipakai main, misalnya "Main hari ini 16.00" (oranye), "Main besok 19.00" (biru), atau "sudah lewat".
- `chipTunggu` (Admin): kapan bukti dikirim, atau "Menunggu n hari" (merah) kalau sudah lebih dari sehari.
- `chipLama` (Manager): lama menunggu di jam buka, merah kalau lewat 1 jam. Angkanya dihitung server (`menitTunggu`).
- "Jam bentrok" (merah) kalau bukti itu bentrok dengan booking terkonfirmasi lain.

### Booking terbaru

Tab Semua, Dipesan, Dikonfirmasi, dan Dibatalkan disaring di browser dari 16 booking yang dikirim server, lalu ditampilkan paling banyak 6. Tombol Chat WA membuka `wa.me` dengan nomor penyewa yang diubah ke format 62 (`nomorWa`).

## Aturan di file ini

- Mode Pemantauan hanya mengurangi. Semua tombol yang mengubah data dibungkus `{!pemantauan && (...)}`.
- Angka hari ini selalu untuk hari ini, berapa pun tanggal yang dibuka di kartu Jadwal.
- Jam ditulis dengan titik lewat `formatJam`.

## FAQ

**Kenapa satu file untuk dua halaman?**
Isinya hampir sama. Dengan satu file, angka dan tampilan Admin dan Manager tidak bisa berbeda. Halaman `Manager/Pemantauan.tsx` hanya meneruskan props dan menambahkan `pemantauan`.

**Bukti di antrean urut dari mana?**
Dari yang paling lama dikirim (siapa cepat dia dapat). Bukti tanpa waktu kirim, dari data lama, ditaruh paling bawah.

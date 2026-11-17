---
title: Admin/LogAktivitas/TampilData.tsx
urutan: 8
---

# Admin/LogAktivitas/TampilData.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Admin/LogAktivitas/TampilData.tsx`
- **Jenis:** halaman Inertia (TSX), dipakai Admin dan Manager
- **Dibuka di:** `/log-aktivitas`, route `log.aktivitas`
- **Server:** [LogAktivitasController](/backend/controller/log-aktivitas)
:::

## Ringkasan

Halaman yang menampilkan catatan semua tindakan Admin, Manager, dan sistem. Setiap baris menjawab empat pertanyaan: **siapa**, **kapan**, **apa** (aksi), dan **apa yang terjadi** (perubahan dari dan ke). Mengklik baris membuka sheet berisi semua perubahan di tindakan itu.

Di kanan atas ada tombol **Periksa keaslian log**, beserta hasil pemeriksaan terakhir.

Berbeda dari halaman master, halaman ini **tidak** memakai `DataTable`. Penyaringan dan pembagian halaman dilakukan server, karena log bisa sangat panjang.

## Isi file

### Daftar aksi

```tsx
const AKSI = {
    tambah: { label: 'Menambah', ikon: Plus, warna: 'text-accessible-green' },
    terima: { label: 'Menerima bukti', ikon: Check, warna: 'text-accessible-green' },
    gagal: { label: 'Login gagal', ikon: ShieldAlert, warna: 'text-accessible-red' },
    ...
} satisfies Record<string, { label: string; ikon: LucideIcon; warna: string }>;
```

Setiap kode aksi dari server punya label, ikon, dan warna. `satisfies` memeriksa bahwa setiap isian punya bentuk yang benar, tetapi tetap membiarkan TypeScript mengingat daftar kunci yang sebenarnya (`tambah`, `ubah`, dan seterusnya). Karena itu, `keyof typeof AKSI` bisa dipakai sebagai tipe kode aksi.

`IKON_JENIS` memberi ikon untuk setiap jenis data: Booking, Pembayaran, Penyewa, Lapangan, Laporan, Admin, Profil, Akun.

### Waktu

```tsx
const kapan = (w: string) => format(new Date(w.replace(' ', 'T')), 'EEE, d MMM yyyy, HH.mm', { locale: id });
```

Database mengirim waktu seperti `2026-11-17 14:05:00`. `replace(' ', 'T')` mengubahnya menjadi `2026-11-17T14:05:00`, bentuk yang pasti dibaca benar oleh semua browser. `format` dari `date-fns` dengan `locale: id` menulis "Sel, 17 Nov 2026, 14.05".

### Kolom "Apa yang terjadi"

`ApaYangTerjadi` meringkas satu baris log:

- Untuk ubah, terima, tolak, dan otomatis: perubahan pertama dalam bentuk `isian [lama] → [baru]`, lalu catatan atau "· n isian lain".
- Untuk hapus: "dihapus".
- Untuk yang lain: jumlah isian.

`rincian` dari server berbentuk daftar `[nama isian, lama, baru]`, misalnya `['Status booking', 'Dipesan', 'Dikonfirmasi']`.

### Menyaring

```tsx
const saring = (ubah: Filter) =>
    router.get(route('log.aktivitas'), { ...filter, ...ubah }, { preserveState: true, preserveScroll: true, replace: true });
```

Setiap perubahan filter meminta halaman ke server dengan filter baru. `{ ...filter, ...ubah }` menggabungkan filter lama dengan perubahan. Isi `ubah` menimpa nilai lama dengan kunci yang sama.

Filter yang tersedia: kata pencarian, Peran, Siapa, Aksi, dan Data. Mengganti Peran juga mengosongkan Siapa, karena orangnya mungkin tidak ada di peran baru.

### Pencarian yang ditunda

```tsx
onValueChange={(q) => {
    clearTimeout(tunda.current);
    tunda.current = setTimeout(() => saring({ q: q || undefined }), 300);
}}
```

Kalau setiap huruf langsung dikirim, server menerima satu permintaan per ketukan. Kode ini menunggu 300 milidetik setelah ketukan terakhir. Setiap ketukan baru membatalkan tunggu sebelumnya (`clearTimeout`). `useRef` menyimpan penanda waktu tunggu tanpa menggambar ulang halaman.

`q || undefined`: kolom kosong dikirim sebagai "tidak ada", supaya `?q=` tidak muncul di alamat.

### Baris yang bisa dipilih dengan keyboard

```tsx
<TableRow tabIndex={0} onClick={() => setDetail(e)}
    onKeyDown={(k) => (k.key === 'Enter' || k.key === ' ') && (k.preventDefault(), setDetail(e))}>
```

- `tabIndex={0}`: baris bisa dicapai dengan tombol Tab.
- Enter atau Spasi membuka detail, sama dengan klik.

### Periksa keaslian

```tsx
const periksa = () => router.post(route('log.aktivitas.periksa'), {}, { onStart: ..., onFinish: ... });
```

Hasilnya tampil sebagai toast, dan juga di bawah tombol: "Utuh · diperiksa 17 Nov 2026, 10.15" atau "Rantai putus di #123".

### Pembagian halaman

`log` dari server berisi `data` (25 baris), `links` (tautan halaman), `total`, `from`, dan `to`. `LaravelPagination` menggambar tautan halaman itu.

## Aturan di file ini

- Halaman ini hanya membaca. Tidak ada tombol ubah atau hapus log.
- Filter dan halaman dikerjakan server, bukan di browser.
- Kode aksi baru di server harus ditambahkan juga ke `AKSI` supaya punya label dan ikon. Kalau belum ada, baris itu memakai tampilan "Mengubah".

## FAQ

**Kenapa nama orang dan peran ditampilkan, padahal ID-nya ada?**
Log menyimpan nama sebagai teks saat tindakan terjadi. Kalau akun dihapus atau namanya diganti nanti, log tetap menunjukkan nama pada saat itu.

**Data di detail menunjukkan No HP seperti `0812****7890`. Kenapa tidak lengkap?**
No HP dan email disamarkan sejak dicatat di log. Log bisa dibaca semua pengelola, jadi data pribadi lengkap tidak disimpan di sana.

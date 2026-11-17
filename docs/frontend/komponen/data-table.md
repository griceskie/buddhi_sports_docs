---
title: pengelola/DataTable.tsx
urutan: 15
---

# pengelola/DataTable.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/pengelola/DataTable.tsx` (sekitar 470 baris)
- **Jenis:** komponen React (TSX), generik
- **Dipakai oleh:** halaman master Admin ([Penyewa](/frontend/admin/master-penyewa), [Lapangan](/frontend/admin/master-lapangan), [Booking](/frontend/admin/master-booking), [Pembayaran](/frontend/admin/master-pembayaran), [Laporan](/frontend/admin/master-laporan)) dan [Pembayaran Manager](/frontend/manager/pembayaran)
:::

## Ringkasan

Tabel data untuk panel pengelola, mengikuti pola DataTable dari shadcn. Fiturnya:

- **pencarian** teks
- **filter** per kolom (tombol bergaris putus-putus), dengan jumlah baris untuk setiap pilihan
- menu **Tampilan** untuk menyembunyikan kolom
- **urut** lewat menu di judul kolom
- **kotak centang** per baris
- **halaman**, dengan pilihan 5, 10, atau 20 baris per halaman
- klik baris (opsional).

Semua berjalan di browser. Server sudah mengirim semua baris, jadi tidak perlu meminta ulang setiap kali mencari atau berpindah halaman.

## Isi file

### Komponen generik

```tsx
export default function DataTable<T>({ baris, kunci, kolom, ... }: Props<T>) {
```

`<T>` berarti komponen ini bisa dipakai untuk jenis baris apa pun: penyewa, lapangan, booking, dan seterusnya. TypeScript memastikan fungsi `render`, `urut`, dan `cari` menerima jenis baris yang sama dengan `baris`.

### Mendefinisikan kolom dan filter

```tsx
export type KolomTabel<T> = {
    id: string;
    label: string;
    render: (baris: T) => ReactNode;
    urut?: (baris: T) => string | number;
    className?: string;
    tetap?: boolean;
};

export type FilterTabel<T> = {
    id: string;
    label: string;
    nilai: (baris: T) => string;
    opsi: { id: string; label: string }[];
    tersembunyi?: boolean;
};
```

- `render`: isi sel.
- `urut`: nilai untuk mengurutkan. Kolom tanpa `urut` tidak bisa diurutkan.
- `tetap`: kolom tidak bisa disembunyikan lewat menu Tampilan.
- `nilai` di filter: nilai baris yang dicocokkan dengan pilihan filter.
- `tersembunyi`: filter tidak punya tombol di toolbar, dan diatur dari luar. Halaman Pembayaran memakainya untuk kartu status.

### Props utama

| Props | Gunanya |
| --- | --- |
| `baris`, `kunci` | Data dan fungsi ID unik per baris. |
| `kolom`, `filter` | Definisi kolom dan filter. |
| `cari`, `placeholderCari` | Teks yang dicari dari satu baris, dan teks petunjuk kolom cari. |
| `satuan` | Nama satuan, misalnya "penyewa", untuk teks "10 penyewa". |
| `aksi` | Isi kolom aksi di kanan, misalnya Edit dan Hapus. |
| `toolbarKanan` | Tombol di kanan toolbar, misalnya Tambah. |
| `nilaiFilter`, `onNilaiFilter` | Filter dikendalikan dari luar. Tanpa ini, filter disimpan di dalam tabel. |
| `bukaBaris` | Dipanggil saat baris diklik. |
| `perHalaman`, `bisaPilih`, `kosong` | Jumlah baris awal per halaman, kotak centang aktif, dan isi saat tabel kosong. |

### State

```tsx
const [q, setQ] = useState('');
const [filterDalam, setFilterDalam] = useState<NilaiFilter>({});
const [sembunyi, setSembunyi] = useState<Record<string, boolean>>({});
const [urutan, setUrutan] = useState<Urutan>(null);
const [hal, setHal] = useState(1);
const [per, setPer] = useState(perHalaman);
const [dipilih, setDipilih] = useState<Set<string | number>>(new Set());
const nilai = nilaiFilter ?? filterDalam;
```

`nilai = nilaiFilter ?? filterDalam`: kalau halaman mengirim filter, pakai itu. Kalau tidak, pakai filter milik tabel sendiri. Pola ini membuat filter bisa dikendalikan dari luar atau dari dalam.

Setiap kali filter berubah, tabel kembali ke halaman 1.

### Menyaring

```tsx
const lolos = (b: T, kecuali?: string) =>
    (!q.trim() || cari(b).toLowerCase().includes(q.trim().toLowerCase())) &&
    filter.every((f) => f.id === kecuali || !(nilai[f.id]?.length) || nilai[f.id].includes(f.nilai(b)));
```

Sebuah baris lolos kalau:

1. kolom cari kosong, atau teksnya mengandung kata yang dicari (tanpa membedakan huruf besar dan kecil), **dan**
2. untuk setiap filter: filternya kosong, atau nilai baris termasuk pilihan filter.

Parameter `kecuali` dipakai saat menghitung angka di menu filter. Angka untuk filter Status dihitung dengan filter lain tetap aktif, tetapi tanpa filter Status itu sendiri. Dengan begitu, angka di setiap pilihan menunjukkan berapa baris yang akan muncul kalau pilihan itu dicentang.

### Urut dan halaman

Baris yang lolos diurutkan menurut `urut` kolom yang dipilih, naik atau turun, lalu dipotong sesuai halaman: `(hal - 1) * per` sampai `hal * per`.

## Aturan di file ini

- Komponen ini untuk data yang sudah dikirim utuh oleh server. Untuk data yang sangat banyak, seperti Log aktivitas, gunakan pembagian halaman dari server.
- Gunakan untuk tabel panel pengelola, bukan halaman penyewa.
- Teks di tabel memakai ukuran minimal 14px untuk teks abu-abu, sesuai aturan panel Admin.

## FAQ

**Bagaimana menambah filter baru di sebuah halaman?**
Tambahkan objek ke props `filter` dengan `id`, `label`, `nilai`, dan `opsi`. Tombol filter dan angka di setiap pilihan muncul otomatis.

**Apakah centang baris dipakai untuk aksi massal?**
Belum. Kotak centang sudah ada sesuai rancangan, tetapi belum ada aksi yang memakainya.

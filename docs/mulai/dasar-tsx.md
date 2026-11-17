---
title: Dasar TSX dan React
urutan: 4
---

# Dasar TSX dan React

TSX adalah TypeScript yang boleh berisi tag mirip HTML. File `.tsx` di proyek ini berisi komponen React, yaitu fungsi yang mengembalikan tampilan. File `.ts` berisi kode TypeScript biasa tanpa tampilan, misalnya fungsi hitungan jadwal.

## Komponen paling sederhana

```tsx
export default function Wordmark({ className }: { className?: string }) {
    return <span className={className}>Buddhi Sports</span>;
}
```

- Komponen adalah fungsi yang namanya diawali huruf kapital.
- Parameternya disebut *props*, yaitu data yang dikirim dari luar. Di sini props-nya hanya `className`.
- `{ className?: string }` adalah tipe TypeScript. Artinya props ini berisi `className` bertipe teks, dan tanda `?` berarti boleh tidak diisi.
- Fungsi mengembalikan JSX, yaitu tag mirip HTML. Di JSX, atribut `class` ditulis `className`.
- `export default` berarti komponen ini bisa di-import dari file lain.

Komponen dipakai seperti tag HTML:

```tsx
<Wordmark className="text-callout" />
```

## Kurung kurawal di dalam JSX

Di dalam JSX, `{ ... }` berarti "jalankan kode JavaScript di sini".

```tsx
<p>{formatRupiah(booking.totalBayar)}</p>          {/* menampilkan hasil fungsi */}
{galat && <Alert>{galat}</Alert>}                     {/* tampil hanya kalau galat ada */}
{belum ? <TombolBayar /> : <LihatDetail />}           {/* pilih salah satu */}
{lapangan.map((l) => <Kartu key={l.idLapangan} lapangan={l} />)}   {/* ulang untuk setiap item */}
```

- `kondisi && <X />` menampilkan `X` hanya kalau kondisinya benar.
- `kondisi ? <A /> : <B />` menampilkan `A` atau `B`.
- `.map(...)` membuat satu elemen untuk setiap item. Setiap elemen hasil `.map` wajib punya `key` yang unik, supaya React tahu elemen mana yang berubah.

## Tipe data di TypeScript

```ts
type BookingPenyewa = {
    idBooking: number;
    tanggal: string;
    statusPembayaran: string | null;   // teks atau kosong
    jamDiambil: boolean;
};
```

- `type` membuat nama untuk bentuk data. TypeScript memakainya untuk memeriksa kode sebelum dijalankan. Kalau kamu salah menulis nama kolom, `npx tsc --noEmit` akan menunjukkan galatnya.
- `string | null` berarti "teks atau `null`".
- `Props` adalah nama yang biasa dipakai untuk tipe props sebuah komponen atau halaman.

## State: data yang bisa berubah di layar

```tsx
const [tanggal, setTanggal] = useState(() => new Date());
// ...
<DateStrip value={tanggal} onChange={setTanggal} />
```

- `useState` menyimpan data milik komponen yang bisa berubah, misalnya tanggal yang dipilih.
- Hasilnya dua hal: nilai sekarang (`tanggal`) dan fungsi untuk mengubahnya (`setTanggal`).
- Setiap kali `setTanggal` dipanggil, React menggambar ulang komponen dengan nilai baru.

## Efek: kode yang berjalan setelah tampil

```tsx
useEffect(() => {
    const id = setInterval(() => setSekarang(new Date()), 60_000);
    return () => clearInterval(id);   // dibersihkan saat komponen hilang
}, []);
```

- `useEffect` menjalankan kode setelah komponen tampil, misalnya memasang timer atau mendengarkan gulir layar.
- Daftar di akhir (`[]`) menentukan kapan efek dijalankan ulang. `[]` berarti hanya sekali saat komponen muncul. `[tanggal]` berarti setiap kali `tanggal` berubah.
- Fungsi yang dikembalikan (`return () => ...`) dijalankan saat komponen hilang, supaya timer tidak terus berjalan.

Hook lain yang kadang muncul:

- `useMemo(() => hitung(), [a, b])` menyimpan hasil hitungan dan hanya menghitung ulang kalau `a` atau `b` berubah.
- `useRef()` menyimpan nilai yang tidak memicu gambar ulang, atau menunjuk ke elemen HTML.

## Alat dari Inertia

| Alat | Gunanya |
| --- | --- |
| `usePage().props` | Membaca data bersama, misalnya `auth.user`, `perluTindakan`, `flash`. |
| `useForm({...})` | Menyimpan isian form, mengirimnya, dan menerima pesan galat per isian. |
| `router.post(...)`, `router.patch(...)`, `router.delete(...)` | Mengirim permintaan tanpa memuat ulang halaman. |
| `router.reload({ only: ['terisi'] })` | Meminta ulang sebagian data dari controller yang sama. |
| `<Link href="...">` | Tautan yang membuka halaman lain tanpa memuat ulang seluruh halaman. |
| `<Head title="..." />` | Mengatur judul tab browser. |
| `route('nama.rute')` | Mengubah nama rute Laravel menjadi alamat. Fungsi ini dari paket Ziggy. |

Contoh `useForm` di form Tambah penyewa:

```tsx
const { data, setData, post, processing, errors } = useForm({ txtnama: '', txtnohp: '' });

<Input value={data.txtnama} onChange={(e) => setData('txtnama', e.target.value)} />
<InputError message={errors.txtnama} />
<Button disabled={processing} onClick={() => post('/insertpenyewa')}>Simpan</Button>
```

- `data` berisi isian sekarang. `setData` mengubah satu isian.
- `post('/alamat')` mengirim semua isian ke server.
- `errors.txtnama` berisi pesan galat dari validasi Laravel untuk isian itu.
- `processing` bernilai `true` selama form sedang dikirim. Tombol dimatikan supaya tidak terkirim dua kali.

## Gaya tampilan dengan Tailwind

Tampilan diatur lewat kelas Tailwind di `className`, bukan file CSS per komponen.

```tsx
<div className="flex items-center gap-2 rounded-xl border bg-card p-4 text-footnote text-muted-foreground">
```

- `flex items-center gap-2` menyusun isi menyamping, rata tengah secara vertikal, dengan jarak 8px.
- `rounded-xl border bg-card p-4` memberi sudut bulat, garis tepi, warna latar kartu, dan jarak dalam 16px.
- `text-footnote` adalah ukuran huruf 14px dari skala tipografi proyek. `text-muted-foreground` adalah warna teks abu-abu.
- Awalan seperti `sm:`, `lg:`, `xl:` berarti "mulai lebar layar tertentu". Contoh: `lg:grid-cols-2` berarti dua kolom mulai lebar 1024px.
- Awalan `dark:` berlaku saat mode gelap.

Untuk menggabungkan kelas dengan syarat, proyek ini memakai fungsi `cn()`:

```tsx
<p className={cn('text-footnote', genting && 'text-destructive')}>
```

## Import dengan `@/`

`@/` adalah singkatan untuk folder `resources/js/`. Jadi `import { Button } from '@/Components/ui/button'` mengambil file `resources/js/Components/ui/button.tsx`.

## FAQ

**Kenapa ada komponen yang memakai `React.forwardRef`?**
Beberapa komponen perlu meneruskan `ref` ke elemen HTML di dalamnya, misalnya input atau tombol pemicu menu. Proyek ini memakai React 18, dan di versi itu `ref` hanya bisa diteruskan lewat `forwardRef`. Tanpa itu, popup dari Base UI tidak tahu posisinya dan muncul di pojok kiri atas.

**Apa itu Base UI dan shadcn?**
Base UI adalah pustaka komponen tanpa gaya: menu, dialog, dan popover yang sudah menangani keyboard dan aksesibilitas. shadcn adalah kumpulan contoh kode yang membungkus Base UI dengan kelas Tailwind. Hasilnya disalin ke `resources/js/Components/ui/` dan boleh diubah.

**Bagaimana mengecek apakah kode TSX-ku benar?**
Jalankan `npx tsc --noEmit` untuk memeriksa tipe, lalu `npm run build` untuk memastikan semuanya bisa dirakit.

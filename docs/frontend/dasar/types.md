---
title: types/index.d.ts
urutan: 2
---

# types/index.d.ts

::: info Tentang file ini
- **Lokasi:** `resources/js/types/index.d.ts` (dan `global.d.ts` di folder yang sama)
- **Jenis:** deklarasi tipe TypeScript
- **Dipakai oleh:** hampir semua halaman dan layout, lewat `PageProps` dan `usePage()`
- **Pasangannya di server:** [HandleInertiaRequests](/backend/route/handle-inertia-requests)
:::

## Ringkasan

File `.d.ts` hanya berisi **tipe**, tidak berisi kode yang dijalankan. Tipe memberi tahu TypeScript bentuk data, supaya kesalahan seperti salah ketik nama field ketahuan saat `npx tsc --noEmit`, bukan saat aplikasi dipakai.

File ini mendefinisikan bentuk **props bersama**, yaitu data yang dikirim server ke setiap halaman.

## Isi file

### `User`

```ts
export interface User {
    idPenyewa: number;
    namaPenyewa: string;
    noHp: string;
    email: string;
}
```

Bentuk `auth.user`, yaitu penyewa yang sedang login. Namanya tetap `User` (warisan Breeze), tetapi isinya kolom tabel `penyewas`.

### `Pengelola`

Bentuk `pengelola`, yaitu Admin atau Manager yang sedang login.

| Field | Isinya |
| --- | --- |
| `role` | `'admin'` atau `'manager'`. Menentukan menu sidebar. |
| `nama`, `username` | Untuk menu akun dan inisial avatar. |
| `menungguVerifikasi?` | Admin saja: jumlah bukti menunggu, untuk badge sidebar. |
| `notifikasi?` | Isi lonceng: `{ daftar, baru }`. |
| `laporanBelumDiperiksa?` | Manager saja: untuk badge sidebar. |

Tanda `?` setelah nama field berarti field itu boleh tidak ada.

`'admin' | 'manager'` adalah tipe gabungan: nilainya hanya boleh salah satu dari dua teks itu. Kalau kode menulis `role === 'admn'`, TypeScript langsung menandainya salah.

### `NotifikasiPengelola`

Bentuk satu baris lonceng. Sama persis dengan yang disusun [NotifikasiAdmin](/backend/support/notifikasi-admin) dan [NotifikasiManager](/backend/support/notifikasi-manager).

### `PageProps`

```ts
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: { user: User };
    pengelola: Pengelola | null;
    perluTindakan: number;
    waPengelola: string | null;
    temaPanel: boolean;
    flash: { error?: string; success?: string };
};
```

`PageProps<T>` adalah tipe dengan parameter. `T` berisi props khusus halaman, lalu `&` menggabungkannya dengan props bersama.

Contoh pemakaian di halaman:

```tsx
export default function Booking({ bookings }: PageProps<{ bookings: BookingSaya[] }>) { ... }
```

Tipe ini berarti: halaman menerima `bookings`, ditambah semua props bersama.

| Props bersama | Isinya |
| --- | --- |
| `auth.user` | Penyewa yang login. Untuk Admin dan Manager, field ini kosong. |
| `pengelola` | Admin atau Manager yang login, atau `null`. |
| `perluTindakan` | Penyewa: jumlah booking yang perlu dibayar atau dikirim ulang buktinya. |
| `waPengelola` | Penyewa: nomor WhatsApp pengelola, atau `null`. |
| `temaPanel` | Halaman memakai tema panel pengelola. |
| `flash` | Pesan sukses atau galat dari server. |

### `global.d.ts`

```ts
declare global {
    interface Window { axios: AxiosInstance; }
    var route: typeof ziggyRoute;
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}
```

- `route` dinyatakan sebagai fungsi global. Fungsi ini dari Ziggy, dan membuat alamat dari nama route Laravel, misalnya `route('booking.bayar', 12)` menjadi `/booking/12/bayar`.
- Blok `declare module` menggabungkan `PageProps` milik proyek ke tipe bawaan Inertia. Hasilnya, `usePage().props` langsung punya tipe yang benar di komponen mana pun.

## Aturan di file ini

- Setiap props bersama baru di `HandleInertiaRequests` harus ditambahkan juga ke `PageProps`.
- Tulis komentar singkat di atas field yang artinya tidak jelas dari namanya.
- Props khusus satu halaman ditulis di halaman itu sendiri, bukan di sini.

## FAQ

**Kalau tipe di sini salah, apakah aplikasi rusak?**
Tidak langsung. Tipe hanya diperiksa saat `npx tsc --noEmit`, dan tidak ikut dijalankan di browser. Tetapi tipe yang salah membuat pemeriksaan itu tidak bisa dipercaya, jadi perlu dijaga sama dengan isi server.

**Bagaimana komponen yang bukan halaman membaca props bersama?**
Dengan `usePage()`:

```tsx
const { pengelola } = usePage().props;
```

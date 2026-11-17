---
title: PenyewaLayout.tsx
urutan: 1
---

# PenyewaLayout.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Layouts/PenyewaLayout.tsx`
- **Jenis:** layout React (TSX)
- **Dipakai oleh:** halaman penyewa yang sudah login: [Home](/frontend/penyewa/dashboard), [Booking saya](/frontend/penyewa/booking), [Bayar](/frontend/penyewa/bayar), [Profile](/frontend/penyewa/profile-edit)
- **Berhubungan dengan:** `Components/MenuAkun.tsx`, `Components/booking/NavPenyewa.tsx`, `Components/booking/HeaderBeranda.tsx`, `Components/Wordmark.tsx`
:::

## Ringkasan

Layout adalah komponen pembungkus yang memberi bingkai sama untuk beberapa halaman: latar, navigasi, dan lebar isi. Halaman cukup menaruh isinya di dalam layout.

`PenyewaLayout` memberi bingkai untuk halaman penyewa: latar abu-abu muda (`bg-canvas`), navigasi di atas yang menempel saat digulir, lalu isi halaman dengan lebar maksimal 1280px di tengah.

## Isi file

### Props

| Props | Gunanya |
| --- | --- |
| `children` | Isi halaman. |
| `nav` | Pengganti seluruh navigasi. Home mengirim `HeaderBeranda`, sedangkan Booking saya dan Profile mengirim `NavPenyewa`. |
| `navTengah` | Isi di tengah navigasi bawaan. Halaman Bayar menaruh status buka atau tutup GOR di sini. |
| `header` | Blok putih di bawah navigasi. Saat ini tidak ada halaman yang memakainya. |

```tsx
PropsWithChildren<{ header?: ReactNode; nav?: ReactNode; navTengah?: ReactNode }>
```

`PropsWithChildren<...>` menambah props `children` ke tipe. `ReactNode` berarti "apa saja yang bisa ditampilkan React": elemen, teks, atau kosong.

### Navigasi bawaan

```tsx
{nav ?? (
    <nav className="sticky top-0 z-30 border-b bg-background">
        ...
        <Link href={route('dashboard')}><Wordmark /></Link>
        {navTengah && <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2">{navTengah}</div>}
        <MenuAkun />
    </nav>
)}
```

- `nav ?? (...)`: kalau halaman mengirim `nav`, pakai itu. Kalau tidak, pakai navigasi bawaan.
- `sticky top-0`: navigasi menempel di atas layar saat halaman digulir.
- `z-30`: navigasi berada di atas isi halaman saat bertumpuk.
- `navTengah` diletakkan tepat di tengah dengan `left-1/2` dan `-translate-x-1/2` (geser setengah lebarnya sendiri ke kiri), mulai dari layar `sm` (640px).
- `MenuAkun` adalah tombol akun dengan menu Booking saya, Profile, dan Log Out. Titik merah dan angka di menu menunjukkan `perluTindakan`.

Saat ini hanya halaman Bayar yang memakai navigasi bawaan. Halaman lain mengirim `nav` sendiri.

### Isi halaman

```tsx
<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
```

`mx-auto max-w-7xl` membuat isi berada di tengah dengan lebar maksimal 1280px. Jarak tepi bertambah di layar yang lebih lebar.

## Aturan di file ini

- Halaman penyewa tidak membuat latar dan kontainer sendiri. Layout sudah menyediakannya.
- Karena navigasi menempel di atas, kolom lain yang juga menempel (misalnya ringkasan di samping) perlu jarak atas, misalnya `lg:top-24`, supaya tidak tertutup navigasi.
- Di layar penyewa, sebut "pengelola", bukan "admin".
- Halaman penyewa tidak punya mode gelap.

## FAQ

**Kenapa ada dua jenis navigasi penyewa?**
Home punya header khusus dengan kategori olahraga, pilihan lapangan, dan animasi saat digulir (`HeaderBeranda`). Booking saya dan Profile memakai baris atas yang sama, tanpa kategori (`NavPenyewa`). Navigasi bawaan dengan nama dan panah hanya tersisa di halaman Bayar.

**Bagaimana halaman memakai layout ini?**

```tsx
export default function Booking() {
    return (
        <PenyewaLayout nav={<NavPenyewa />}>
            <Head title="Booking saya" />
            ...isi halaman...
        </PenyewaLayout>
    );
}
```

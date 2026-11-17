---
title: Landing.tsx
urutan: 1
---

# Landing.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Landing.tsx` (24 baris)
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/` (route di [web.php](/backend/route/web))
- **Layout:** [GuestLayout](/frontend/layout/guest-layout)
:::

## Ringkasan

Halaman depan sementara. Isinya satu kalimat jenaka, satu kalimat penjelas, dan tombol Login. Landing page yang sebenarnya akan dibuat nanti, jadi file ini sengaja dibuat sederhana. File ini juga contoh paling pendek dari sebuah halaman Inertia, jadi cocok dibaca pertama kali.

## Isi file

```tsx
export default function Landing() {
    return (
        <GuestLayout kolomClassName="max-w-[520px] text-center">
            <Head title="Buddhi Sports" />
            <h1 className="... text-balance ...">Halaman depan ini ternyata lebih lama dirancang daripada seluruh aplikasinya.</h1>
            <p className="... text-balance text-muted-foreground">Jadi kamu bisa langsung masuk aja dengan tombol di bawah ini.</p>
            <Link href={route('login')} className={cn(buttonVariants({ variant: 'elevated', size: 'lg' }), 'mt-10 min-w-40 px-8')}>
                Login
            </Link>
        </GuestLayout>
    );
}
```

### Baris per baris

| Bagian | Artinya |
| --- | --- |
| `export default function Landing()` | Komponen utama file. Inertia memanggilnya saat controller me-render `'Landing'`. |
| `kolomClassName="max-w-[520px] text-center"` | Kolom lebih lebar dari 360px bawaan, dan semua teks rata tengah. |
| `<Head title="Buddhi Sports" />` | Judul tab browser. |
| `text-balance` | Browser membagi baris supaya panjangnya seimbang, tanpa satu kata menggantung di baris terakhir. |
| `text-muted-foreground` | Warna teks abu-abu dari token desain. |
| `<Link href={route('login')}>` | Tautan Inertia ke halaman Login. Pindah halaman tanpa memuat ulang seluruh browser. |
| `buttonVariants({ variant: 'elevated', size: 'lg' })` | Kelas tombol utama yang timbul. Dipasang di `Link` supaya tautan terlihat seperti tombol. |
| `cn(..., 'mt-10 min-w-40 px-8')` | Menggabungkan kelas tombol dengan jarak dan lebar tambahan. |

### Kenapa `Link`, bukan `<Button>`?

Elemen yang membawa pengguna ke halaman lain sebaiknya berupa tautan, bukan tombol. Pembaca layar dan browser memperlakukannya sebagai tautan, misalnya bisa dibuka di tab baru. `buttonVariants` membuat tampilannya tetap seperti tombol.

## Aturan di file ini

- Teksnya Bahasa Indonesia dengan sapaan "kamu", berbeda dari Login dan Register yang memakai Bahasa Inggris.
- `variant="elevated"` hanya dipakai untuk satu aksi utama di setiap halaman.

## FAQ

**Bagaimana kalau ingin menambah dua elemen dalam satu ekspresi `{kondisi && ...}`?**
Satu ekspresi JSX hanya boleh menghasilkan satu elemen induk. Bungkus beberapa elemen dengan `<>...</>`:

```tsx
{tampil && (
    <>
        <h2>Judul</h2>
        <p>Isi</p>
    </>
)}
```

**Penyewa yang sudah login membuka `/`. Apa yang terjadi?**
Halaman ini tetap tampil. Tombol Login membuka halaman Login, yang akan mengarahkan penyewa yang sudah login ke Home.

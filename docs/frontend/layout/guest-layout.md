---
title: GuestLayout.tsx
urutan: 2
---

# GuestLayout.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Layouts/GuestLayout.tsx`
- **Jenis:** layout React (TSX)
- **Dipakai oleh:** halaman tamu penyewa: [Landing](/frontend/penyewa/landing), [Login](/frontend/penyewa/login), [Register](/frontend/penyewa/register), lupa dan reset password
- **Berhubungan dengan:** `Components/auth/AuthScene.tsx` (gambar di sekeliling form), gambar di `public/images/auth/`
:::

## Ringkasan

Bingkai untuk halaman sebelum login. Tidak ada kartu. Isinya satu kolom selebar 360px di tengah latar abu-abu muda, dengan foto benda olahraga (raket, kok, bola basket, handuk, sepatu, botol) di sekelilingnya.

Login Admin dan Manager tidak memakai layout ini, tetapi [PengelolaGuestLayout](./pengelola-guest-layout).

## Isi file

### Props

| Props | Gunanya |
| --- | --- |
| `title` | Judul besar di atas form. |
| `description` | Kalimat penjelas di bawah judul. |
| `kolomClassName` | Kelas tambahan untuk kolom. Landing memakainya untuk kolom yang lebih lebar. |
| `children` | Form atau isi halaman. |

Komentar di atas fungsi ditulis dalam Bahasa Inggris, mengikuti teks halaman Login dan Register yang memang berbahasa Inggris atas pilihan pemilik proyek.

### Bingkai

```tsx
<div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas px-5 pt-28 pb-40 ... min-[1100px]:py-12">
    <AuthScene />
    <main className={cn('relative z-10 my-auto w-full max-w-[360px] self-center', kolomClassName)}>
        ...judul, deskripsi, children...
    </main>
</div>
```

- `overflow-hidden`: gambar yang keluar dari layar dipotong, sehingga tidak muncul scroll ke samping.
- `pt-28 pb-40` di layar kecil: jarak atas dan bawah supaya form tidak tertutup gambar di pojok. Mulai 1100px, gambar ditempatkan di samping form, jadi jaraknya mengecil (`py-12`).
- `relative z-10` di `main`: form selalu berada di atas gambar.
- `my-auto` dan `self-center`: kolom berada di tengah, baik tegak maupun mendatar.
- `cn(...)` menggabungkan kelas bawaan dengan `kolomClassName`. Kalau `kolomClassName` berisi `max-w-[560px]`, kelas itu menggantikan `max-w-[360px]`.

### `AuthScene`

Komponen terpisah yang menggambar benda-benda olahraga. Cara kerjanya secara singkat:

- **Mulai 1100px:** delapan gambar (enam benda dan dua bayangan lembut) ditempatkan relatif terhadap titik tengah layar, dengan jarak dari rancangan berukuran 1280 × 800. Di layar yang lebih lebar, jaraknya bertambah dengan `clamp()` sampai 1,5 kali.
- **Di bawah 1100px:** hanya empat benda di pojok, lebih kecil.
- **Animasi masuk:** saat halaman pertama dibuka, setiap benda bergeser 32px dari arah tengah sambil muncul perlahan, berurutan. Animasinya hanya sekali per pemuatan, dan tidak berjalan kalau pengguna memilih "kurangi gerakan" di perangkatnya.

Bayangan setiap benda sudah ada di gambarnya, dengan cahaya dari kiri. Karena itu, gambar tidak boleh diputar atau dibalik.

## Aturan di file ini

- Jangan tambahkan kartu atau logo. Rancangannya memang tanpa keduanya.
- Halaman tamu baru cukup mengisi `title`, `description`, dan form.
- Gambar produk di `public/images/auth/` masih memuat merek (Yonex, Veja). Itu boleh untuk tugas kuliah, tetapi harus diganti sebelum aplikasi dibuka untuk umum.

## FAQ

**Teks judul ingin rata tengah. Bagaimana caranya?**
Tambahkan `text-center` lewat isi `title` atau `description`, atau beri `kolomClassName="text-center"` supaya seluruh kolom rata tengah. Ingat, satu ekspresi JSX hanya boleh menghasilkan satu elemen induk. Kalau perlu dua elemen, bungkus dengan `<>...</>`.

**Kenapa gambar terpotong di laptop kecil?**
Disengaja. Gambar ditempatkan dari tengah layar dengan jarak tetap, jadi di layar pendek atau sempit gambar terpotong di tepi, bukan menabrak form.

---
title: booking/GaleriLapangan.tsx
urutan: 10
---

# booking/GaleriLapangan.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/GaleriLapangan.tsx`
- **Jenis:** komponen React (TSX)
- **Dipakai oleh:** [Home](/frontend/penyewa/dashboard)
- **Data foto:** `lapangan.foto`, berisi URL relatif dari [FotoLapangan](/backend/support/foto-lapangan)
:::

## Ringkasan

Foto lapangan di Home, ditambah penampil foto layar penuh.

**Di halaman**, susunan foto mengikuti lebar layar:

- HP: satu foto
- mulai 640px: satu foto besar dan dua kecil
- mulai 1024px: satu foto besar dan empat kecil.

Kalau lapangan belum punya foto, kotaknya diisi warna abu-abu polos.

**Penampil foto** terbuka saat kotak mana pun diklik:

- foto bergerak dari kotaknya ke bingkai di tengah layar (16:9, atau 4:3 di HP), dengan latar gelap yang diburamkan
- pindah foto dengan transisi bertumpuk: maju membuat foto depan jatuh dan memudar, mundur kebalikannya
- deretan thumbnail di bawah membesar seperti Dock macOS saat disorot (tidak di layar sentuh)
- di HP, foto bisa digeser dengan jari
- tombol **Esc** menutup, panah kiri dan kanan pindah foto
- tombol **Pesan sekarang** menutup penampil lalu menggulir halaman ke kartu jam.

## Isi file

### Props

```tsx
export default function GaleriLapangan({ lapangan, onPesan }: { lapangan: Lapangan; onPesan: () => void })
```

`onPesan` dipanggil setelah penampil tertutup, dari tombol Pesan sekarang.

### State dan ref

| Nama | Isinya |
| --- | --- |
| `galeri` | `null` kalau penampil tertutup. Kalau terbuka, berisi fase animasi (`awal`, `buka`, `tutup`), posisi kotak asal, dan posisi bingkai akhir. |
| `idx` | Foto yang sedang dilihat. |
| `hov` | Thumbnail yang sedang disorot, untuk efek Dock. |
| `kotakRef`, `thumbRef` | Daftar elemen kotak foto dan thumbnail, untuk mengukur posisi dan memindah fokus. |
| `sentuhX` | Posisi jari saat mulai menggeser. |

`useRef` dipakai untuk nilai yang perlu diingat tetapi tidak perlu menggambar ulang tampilan saat berubah.

### Membuka: animasi dari kotak ke tengah

```tsx
const buka = (i: number) => {
    const k = kotakFoto(i);
    ...hitung lebar dan tinggi bingkai akhir dari ukuran layar...
    document.documentElement.style.overflow = 'hidden';
    setGaleri({ fase: 'awal', sumber: k.i, asal: kotakDari(k.r), akhir: { l, t, w, h }, ... });
    requestAnimationFrame(() =>
        requestAnimationFrame(() => setGaleri((g) => (g && g.fase === 'awal' ? { ...g, fase: 'buka' } : g))),
    );
};
```

1. Ukur posisi kotak foto di layar dengan `getBoundingClientRect()`.
2. Hitung bingkai akhir: lebar mengikuti layar (paling lebar 1040px), dan tinggi mengikuti rasio.
3. Matikan gulir halaman (`overflow: hidden` di `<html>`).
4. Gambar foto tepat di atas kotak asalnya (fase `awal`).
5. Dua `requestAnimationFrame` menunggu browser benar-benar menggambar posisi awal itu. Baru setelah itu fase diganti ke `buka`, dan transisi CSS menggerakkan foto ke bingkai akhir.

Tanpa jeda dua bingkai ini, browser bisa langsung menggambar posisi akhir tanpa animasi.

`kotakFoto(i)` mengembalikan kotak foto ke-i. Kalau kotak itu tersembunyi di lebar layar sekarang (misalnya foto ke-4 di HP), dipakai kotak foto besar.

### Menutup

`tutup()` menggerakkan foto kembali ke kotak foto yang sedang dilihat, lalu setelah 500 milidetik:

- menghapus penampil
- menyalakan lagi gulir halaman
- mengembalikan fokus keyboard ke kotak foto itu
- menjalankan fungsi lanjutan, misalnya `onPesan`.

### Keyboard dan fokus

```tsx
useEffect(() => {
    if (!galeri) return;
    const tombol = (e: KeyboardEvent) => {
        if (e.key === 'Escape') tutup();
        else if (e.key === 'ArrowRight') pilih(idx + 1);
        else if (e.key === 'ArrowLeft') pilih(idx - 1);
    };
    window.addEventListener('keydown', tombol);
    return () => window.removeEventListener('keydown', tombol);
}, [galeri, idx, pilih, tutup]);
```

Setelah terbuka, fokus dipindah ke tombol tutup. Setelah tertutup, fokus kembali ke kotak foto. Pengguna keyboard tidak kehilangan posisinya.

### Membersihkan

```tsx
useEffect(() => () => {
    clearTimeout(timer.current);
    document.documentElement.style.overflow = '';
}, []);
```

Kalau penyewa pindah lapangan atau meninggalkan halaman saat penampil terbuka, gulir halaman dinyalakan lagi.

### Portal

Penampil digambar dengan `createPortal` langsung di `document.body`, di luar susunan halaman, supaya bisa menutupi seluruh layar tanpa terpotong elemen induknya.

## Aturan di file ini

- Hanya transform dan opacity yang dianimasikan, supaya gerakannya halus.
- Efek Dock hanya untuk perangkat yang punya kursor (`(hover: hover)`).
- Foto contoh untuk pengembangan bisa diisi dengan `php artisan lapangan:foto-contoh`.

## FAQ

**Kenapa penampil tidak memakai komponen Dialog?**
Animasinya bergerak dari posisi kotak foto di halaman. Dialog bawaan muncul di tengah dengan animasinya sendiri, jadi penampil dibuat sendiri dengan portal.

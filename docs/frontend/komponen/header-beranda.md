---
title: booking/HeaderBeranda.tsx
urutan: 9
---

# booking/HeaderBeranda.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/HeaderBeranda.tsx`
- **Jenis:** komponen React (TSX)
- **Dipakai oleh:** [Home](/frontend/penyewa/dashboard), dikirim sebagai props `nav` ke [PenyewaLayout](/frontend/layout/penyewa-layout)
- **Memakai:** `LogoStatus` (dari `NavPenyewa`), `MenuAkun`, `PillLapangan`, `PilihLapangan`, `ui/tabs`, dan aturan `.kepala-beranda` di `resources/css/app.css`
:::

## Ringkasan

Header Home, dengan pola seperti Airbnb. Isinya:

1. **Baris atas:** logo dengan titik status buka atau tutup, tab **jenis olahraga** (Bulu Tangkis, Basket) dengan garis bawah yang bergeser, dan menu akun berupa avatar.
2. **Baris bawah:** pilihan lapangan. Mulai 640px berbentuk pil bersegmen (`PillLapangan`). Di HP berbentuk kartu-kartu yang bisa digeser (`PilihLapangan`).

Mulai 640px, header menempel di atas layar. Setelah digulir 48px, header **meringkas**: tab olahraga memudar ke atas, dan pil lapangan naik ke baris atas sambil mengecil. Di HP, header ikut tergulir tanpa animasi.

## Isi file

### Props

| Props | Gunanya |
| --- | --- |
| `jenisList`, `jenis`, `onJenis` | Daftar jenis olahraga, yang dipilih, dan fungsi saat berganti. |
| `lapangan`, `value`, `onLapangan` | Lapangan jenis terpilih, yang dipilih, dan fungsi saat berganti. |
| `jamKosong` | Fungsi yang menghitung jam kosong satu lapangan, untuk ditampilkan di pilihan lapangan. |
| `buka`, `onStatus` | GOR sedang buka, dan fungsi saat titik status diklik (memunculkan island jam buka). |

Tab olahraga hanya tampil kalau ada lebih dari satu jenis (`jenisList.length > 1`).

### `useRingkas()`

```tsx
function useRingkas() {
    const [ringkas, setRingkas] = useState(false);
    useEffect(() => {
        const sm = window.matchMedia('(min-width: 640px)');
        const cek = () => {
            const y = window.scrollY;
            setRingkas((r) => (!sm.matches ? false : !r && y > 48 ? true : r && y < 8 ? false : r));
        };
        cek();
        window.addEventListener('scroll', cek, { passive: true });
        sm.addEventListener('change', cek);
        return () => { ... };
    }, []);
    return ringkas;
}
```

- Di HP, selalu `false`.
- Belum ringkas, dan sudah digulir lebih dari 48px: menjadi ringkas.
- Sudah ringkas, dan kembali ke 8px dari atas: tidak ringkas lagi.
- Selain itu, tetap seperti semula.

Ada jeda antara 48 dan 8 supaya header tidak berkedip bolak-balik kalau pengguna berhenti menggulir tepat di sekitar satu angka.

`{ passive: true }` memberi tahu browser bahwa pendengar ini tidak membatalkan gulir, sehingga gulir tetap lancar.

### Animasi lewat CSS

```tsx
<div className={cn('kepala-beranda', ringkas && 'ringkas')}>
```

React hanya memasang atau melepas kelas `ringkas`. Gerakannya ditulis di `app.css`, di bagian `.kepala-beranda`:

- `.ringkas .bawah-beranda`: baris bawah naik (`translateY(var(--naik))`).
- `.ringkas .baris-pill`: pil turun sedikit dan mengecil (`--pill-y`, `--pill-s`), sehingga tepat berada di baris atas.
- `.ringkas .kategori-beranda`: tab olahraga memudar dan naik 16px.
- Latar putih header menyusut ke tinggi baris atas (`background-size`).

Ukuran dan geseran diatur variabel CSS yang berbeda per lebar layar (misalnya skala pil 0,82 mulai 1280px, 0,72 di bawahnya, dan 0,9 di bawah `lg`).

Aturan ini ada di `@layer components`, sehingga kelas Tailwind di komponen tetap bisa menimpanya.

`pointer-events: none` di pembungkus, lalu `auto` di nav dan pil: area kosong header tidak menghalangi klik pada isi halaman di bawahnya.

## Aturan di file ini

- Perubahan posisi atau ukuran animasi dibuat di `app.css`, bukan di komponen.
- Kalau tinggi nav berubah (80px mulai `lg`, 120px di bawahnya), variabel `--naik`, `--pill-y`, dan `--tinggi-nav` harus ikut diubah.

## FAQ

**Kenapa di HP tidak ada animasi?**
Layar HP pendek. Header yang menempel akan memakan banyak ruang, jadi header ikut tergulir seperti isi halaman biasa.

**Kenapa pilihan lapangan di HP berbeda bentuk?**
Pil bersegmen tidak muat untuk tiga lapangan di layar sempit. Kartu yang bisa digeser lebih mudah disentuh.

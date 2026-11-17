---
title: Manager/Lapangan.tsx
urutan: 4
---

# Manager/Lapangan.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Manager/Lapangan.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/manager/lapangan`, route `manager.lapangan`
- **Server:** `ManagerController::lapangan()` (lihat [ManagerController](/backend/controller/manager))
:::

## Ringkasan

Pemakaian dan pemasukan setiap lapangan, untuk Manager. Hanya dilihat. Admin yang mengubah tarif, status, dan foto.

Ada dua tampilan yang bisa dipilih di samping judul: **Kartu** (bawaan) dan **Tabel**. Setiap lapangan menampilkan:

- pemasukan dan persen keterisian bulan lalu
- booking hari ini (jumlah dan jam), atau "Kosong"
- booking dalam 30 hari ke depan, atau "Belum ada".

Setiap kartu punya tautan ke halaman Analisis bisnis.

## Isi file

### Pilihan tampilan

```tsx
const [tampilan, setTampilan] = useState<'kartu' | 'tabel'>('kartu');

<div role="group" aria-label="Tampilan lapangan">
    <button aria-pressed={tampilan === k} onClick={() => setTampilan(k)}>...</button>
</div>
```

Dua tombol yang berperilaku seperti saklar. `aria-pressed` memberi tahu pembaca layar tombol mana yang sedang aktif.

### Kartu dan tabel bertumpuk

```tsx
const lapis = (aktif: boolean) => cn(
    'transition-[opacity,translate,scale] duration-300 ease-out motion-reduce:transition-none',
    !aktif && 'pointer-events-none invisible absolute inset-x-0 top-0 translate-y-2 scale-[.985] opacity-0',
);
```

Kedua tampilan selalu ada di halaman, ditumpuk di tempat yang sama. Yang tidak aktif:

- dibuat transparan, sedikit turun, dan sedikit mengecil
- tidak bisa diklik (`pointer-events-none`) dan tidak terlihat (`invisible`)
- diletakkan `absolute`, supaya tidak memakan tempat.

Saat berganti, keduanya bergerak bersamaan, sehingga terlihat seperti saling berganti dengan halus.

```tsx
const masuk = (aktif: boolean, i: number) =>
    aktif ? { className: 'motion-safe:animate-[lp-masuk_.38s_cubic-bezier(.2,.7,.2,1)_both]', style: { animationDelay: `${i * 50}ms` } } : {};
```

Setiap kartu atau baris yang muncul masuk satu per satu, dengan jeda 50 milidetik. Animasi `lp-masuk` ditulis di `admin.css`. `motion-safe:` dan `motion-reduce:` mematikan animasi untuk pengguna yang memilih "kurangi gerakan".

Elemen di tampilan yang tidak aktif diberi `aria-hidden` dan `tabIndex={-1}`, supaya tidak terbaca pembaca layar dan tidak bisa dicapai dengan tombol Tab.

### Teks kecil

```tsx
const persen = (x: number) => `${x.toLocaleString('id-ID')}%`;
const hariIni = (l: Lapangan) => (l.hariIni.booking ? `${l.hariIni.booking} booking · ${l.hariIni.jam} jam` : 'Kosong');
```

`toLocaleString('id-ID')` menulis angka dengan koma desimal, misalnya 12,5%.

## Aturan di file ini

- Hanya tampilan. Tidak ada form atau tombol ubah.
- Angka dihitung server, dari bulan terakhir yang sudah selesai.

## FAQ

**Kenapa pemasukan memakai bulan lalu, bukan bulan ini?**
Bulan lalu sudah selesai, jadi angkanya tidak berubah lagi. Untuk bulan ini atau periode lain, gunakan Analisis bisnis.

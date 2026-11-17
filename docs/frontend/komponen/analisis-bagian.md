---
title: manager/analisis/bagian.tsx
urutan: 21
---

# manager/analisis/bagian.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/manager/analisis/bagian.tsx`
- **Jenis:** kumpulan komponen kecil dan tipe (TSX)
- **Dipakai oleh:** `TabPendapatan`, `TabPenyewa`, `TabPola`, `TabAdmin` di folder yang sama, dan halaman [Analisis bisnis](/frontend/manager/analisis)
- **Data dari:** [AnalitikBisnis](/backend/support/analitik-bisnis)
:::

## Ringkasan

Bagian-bagian yang dipakai bersama oleh keempat tab Analisis bisnis. Semua komponen di sini hanya menampilkan teks dan angka yang sudah disiapkan server. Tidak ada hitungan.

| Komponen | Gunanya |
| --- | --- |
| `Kartu` | Kotak satu bagian analisis: judul, keterangan abu-abu, isi. |
| `Sub` | Judul kecil di dalam kartu. |
| `ChipDelta` | Chip perubahan, misalnya "+8,1%" dengan panah, hijau kalau membaik dan merah kalau memburuk. Tooltip-nya berisi pembandingnya. |
| `DeretMetrik` | Deretan kartu angka utama (`Metrik`). |
| `DaftarBatang` | Daftar batang mendatar: judul, jumlah, persen, dan panjang batang. |
| `Legenda` | Keterangan warna grafik. |
| `GrafikBatang` | Grafik batang tegak yang bisa diklik untuk berpindah periode. |

## Tipe

```tsx
export type Delta = { teks: string; naik: boolean; baik: boolean; banding: string } | null;
export type Metrik = { judul: string; nilai: string; ket: string; delta: Delta };
export type Tujuan = Record<string, string | number>;
```

- `Delta` sama dengan keluaran `delta()` di server. `naik` menentukan arah panah. `baik` menentukan warna. Untuk lama periksa, angka turun berarti baik.
- `Tujuan` adalah isian query string yang dibawa batang grafik, misalnya `{ bl: 8, q: 3 }`.

`Titik` dan `Grafik` adalah bentuk satu batang dan satu grafik, sama dengan keluaran `grafik()` di server.

## `GrafikBatang`

```tsx
export function GrafikBatang({ grafik, onPilih, tinggi = 220 }: { grafik: Grafik; onPilih: (t: Tujuan) => void; tinggi?: number }) {
```

### Susunan

Grafik digambar dengan CSS grid, tanpa pustaka grafik:

```tsx
<div role="group" aria-label={grafik.aria} className="grid min-w-[560px]"
     style={{ gridTemplateRows: `${tinggi}px 28px`, gridTemplateColumns: `${sumbu}px minmax(0, 1fr)` }}>
```

- Kolom kiri: label sumbu (misalnya "Rp5 jt"), diletakkan dengan `bottom: pos%`.
- Kolom kanan: garis bantu, garis batas opsional (merah putus-putus, misalnya "Batas 1 jam" di tab Kinerja Admin), lalu batang-batang.
- Baris bawah: label setiap batang (Jan, Feb, ...).
- `min-w-[560px]` dan pembungkus `overflow-x-auto`: di layar sempit, grafik bisa digeser, bukan dipadatkan.

`aria-label={grafik.aria}` berisi ringkasan seluruh grafik dalam satu kalimat dari server, untuk pembaca layar.

### Satu batang

```tsx
<button aria-pressed={t.terpilih} aria-disabled={t.mati} aria-label={`${t.judul}: ${t.nilai}`}
        onClick={() => !t.mati && onPilih(t.tujuan)}>
    <div style={{ height: `${t.tinggi}%`, opacity: t.terpilih ? 1 : 0.35, animationDelay: `${i * 30}ms` }}>
        {t.segmen.map((s, k) => <div key={k} style={{ height: `${s.porsi}%`, background: s.warna }} />)}
        {t.bergaris && <div style={{ background: 'repeating-linear-gradient(135deg, ...)' }} />}
    </div>
    <div role="tooltip" className="hidden group-hover:grid group-focus-visible:grid">...</div>
</button>
```

- Setiap batang adalah tombol. Mengkliknya memanggil `onPilih(t.tujuan)`, dan halaman berpindah ke periode itu.
- Batang yang tidak dipilih dibuat pudar (35%).
- Batang `mati` (tidak ada data, atau periode belum tiba) tidak bisa diklik.
- **Segmen**: batang bertumpuk, misalnya per lapangan. Tinggi setiap segmen adalah porsinya dalam persen.
- **Bergaris**: pola garis miring untuk periode yang belum final.
- **Animasi**: batang naik dari bawah (`naik-grafik`), berurutan dengan jeda 30 milidetik.
- **Tooltip**: muncul saat batang disorot atau difokuskan dengan keyboard. Berisi judul, nilai, keterangan, dan rincian per segmen. `t.kiri` menentukan apakah tooltip menempel ke kiri atau kanan, supaya tidak keluar dari grafik.

## Aturan di file ini

- Tidak ada hitungan. Kalau perlu angka atau kalimat baru, tambahkan di `AnalitikBisnis` di server.
- Warna batang dan segmen datang dari server, supaya sama dengan grafik lain.
- Setiap batang harus bisa dicapai dan dibaca dengan keyboard.

## FAQ

**Kenapa tidak memakai pustaka grafik seperti Recharts?**
Grafiknya sederhana (batang tegak bertumpuk), dan setiap batang harus menjadi tombol dengan tooltip yang isinya dari server. CSS grid cukup untuk itu, dan hasilnya mengikuti token warna panel, termasuk mode gelap.

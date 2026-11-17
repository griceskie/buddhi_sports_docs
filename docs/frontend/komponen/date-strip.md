---
title: booking/DateStrip.tsx
urutan: 5
---

# booking/DateStrip.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/DateStrip.tsx`
- **Jenis:** komponen React (TSX)
- **Dipakai oleh:** [Home](/frontend/penyewa/dashboard) dan [UbahJadwal](./ubah-jadwal)
- **Memakai:** `ui/date-picker`, `formatTanggal`, `isoTanggal` dari [jadwal.ts](./jadwal-ts)
:::

## Ringkasan

Kotak putih untuk memilih tanggal. Di atas ada tanggal terpilih sebagai judul ("Selasa, 17 November 2026"), tombol halaman sebelumnya dan berikutnya, serta tombol kalender. Di bawahnya ada deretan tanggal. Setiap tanggal menampilkan:

- nama hari ("Hari ini", "Besok", atau "Sen", "Sel", dan seterusnya)
- angka tanggal, dicoret kalau penuh
- status: kosong, **Terbatas** (oranye), **Penuh**, atau label khusus seperti **Tutup** dan **Lewat** untuk hari ini.

Tanggal terpilih ditandai kotak abu-abu yang bergeser halus saat pilihan berganti.

## Isi file

### Props

| Props | Gunanya |
| --- | --- |
| `hari` | 30 hari yang bisa dipesan: `{ tanggal, kosong, tutup? }`. |
| `terpilih` | Tanggal yang sedang dipilih. |
| `batasTerbatas` | Jam kosong sebanyak ini atau kurang (tetapi lebih dari 0) ditandai Terbatas. Home mengirim 3. |
| `onSelect` | Dipanggil saat tanggal dipilih. |

### Berapa tanggal terlihat

```tsx
const LEBAR: [string, number][] = [
    ['(min-width: 1280px)', 14],
    ['(min-width: 1024px)', 10],
    ['(min-width: 640px)', 7],
];
```

5 tanggal di HP, 7 mulai 640px, 10 mulai 1024px, dan 14 mulai 1280px.

`useJumlahTerlihat()` membaca ukuran layar dengan `window.matchMedia`, lalu mendengarkan perubahan ukuran. Saat layar diputar atau jendela diubah ukurannya, jumlah tanggal ikut berubah. Pendengar dilepas saat komponen hilang.

### Halaman tanggal

```tsx
const [awal, setAwal] = useState(0);
const maksAwal = Math.max(0, hari.length - n);
```

`awal` adalah indeks tanggal pertama yang terlihat. Tombol panah menggeser `awal` sebanyak `n`, yaitu satu halaman penuh.

```tsx
useEffect(() => {
    setAwal((a) => {
        const batas = Math.min(a, maksAwal);
        return iTerpilih < batas || iTerpilih >= batas + n
            ? Math.min(Math.floor(iTerpilih / n) * n, maksAwal)
            : batas;
    });
}, [iTerpilih, n, maksAwal]);
```

Kalau tanggal terpilih tidak terlihat (misalnya dipilih dari kalender), deretan melompat ke halaman yang memuatnya. `Math.floor(iTerpilih / n) * n` menghitung awal halaman itu. Untuk `n = 7` dan tanggal ke-17, hasilnya 14.

### Penanda yang bergeser

```tsx
<span className="absolute ... transition-transform duration-300"
    style={{
        width: `calc((100% - ${(n - 1) * GAP}px) / ${n})`,
        transform: `translateX(calc(${k} * (100% + ${GAP}px)))`,
    }} />
```

Satu kotak abu-abu selebar satu tanggal, digeser ke posisi tanggal terpilih (`k`). Karena hanya `transform` yang berubah, browser bisa menganimasikannya dengan halus.

### Status per tanggal

```tsx
const status = h.tutup ?? (h.kosong === 0 ? 'Penuh' : h.kosong <= batasTerbatas ? 'Terbatas' : '');
```

Label `tutup` (misalnya "Tutup" atau "Lewat") didahulukan. Kalau tidak ada, status dihitung dari jumlah jam kosong.

Angka tanggal yang penuh dicoret, tidak hanya dibuat abu-abu, supaya tetap terbaca bagi pengguna yang sulit membedakan warna.

### Kalender

`DatePicker` hanya mengizinkan tanggal dari hari pertama sampai hari terakhir di `hari`. Tanggal penuh dicoret lewat `modifiers`. Di bawah kalender ada keterangan "Tanggal penuh dicoret" dan tombol **Hari ini**.

### Aksesibilitas

- Setiap tombol tanggal punya `aria-label` lengkap, misalnya "Selasa, 17 November 2026, terbatas".
- `aria-pressed` menandai tanggal terpilih.
- Deretan dibungkus `role="group"` dengan `aria-label="Tanggal"`.

## Aturan di file ini

- Komponen ini tidak menghitung jam kosong. Angkanya dikirim pemanggil di `hari`.
- Status selalu ditulis dengan kata, bukan hanya warna.

## FAQ

**Kenapa deretan tanggal tidak bisa digeser dengan jari?**
Rancangannya memakai halaman dengan tombol panah dan kotak penanda yang bergeser. Dengan halaman, penanda selalu terlihat dan jumlah tanggal tetap sama.

---
title: admin/JadwalGeser.tsx
urutan: 13
---

# admin/JadwalGeser.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/admin/JadwalGeser.tsx`
- **Jenis:** komponen React (TSX)
- **Dipakai oleh:** [Dashboard Admin](/frontend/admin/dashboard-admin) dan Pemantauan Manager
:::

## Ringkasan

Lini waktu jadwal satu tanggal. Setiap lapangan adalah satu baris. Setiap jam selebar 100px, jadi 08.00–22.00 selebar 1.400px, lebih lebar dari layar, dan isinya bisa digeser. Kolom nama lapangan (200px) tetap di kiri.

Yang ditampilkan:

- booking **Dikonfirmasi**: blok penuh berisi nama penyewa dan jam
- booking yang **menunggu verifikasi**: blok bergaris. Untuk Admin, blok ini bisa diklik untuk membuka panel verifikasi
- blok yang **bentrok** dengan booking terkonfirmasi ditandai merah
- **garis "Sekarang"** kalau tanggal yang dibuka adalah hari ini.

Cara menggeser: seret jalur dengan mouse, seret atau klik penggeser di bawah, usap mendatar di trackpad, tombol panah satu jam, atau tombol panah keyboard saat penggeser difokuskan.

## Isi file

### Konstanta ukuran

```tsx
const PX_JAM = 100;
const LEBAR = (JAM_TUTUP - JAM_BUKA) * PX_JAM;   // 1.400px
const KOLOM_NAMA = 200;
const posisi = (hhmm: string) => ((toMinutes(hhmm) - JAM_BUKA * 60) / 60) * PX_JAM;
```

`posisi('16:30')` menghitung jarak dari kiri: (990 − 480) ÷ 60 × 100 = 850px.

### `susunLajur()`: booking yang bertumpuk

```tsx
function susunLajur(daftar) {
    const urut = [...daftar].sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
    const akhirLajur: string[] = [];
    const blok = urut.map((b) => {
        let l = akhirLajur.findIndex((akhir) => akhir <= b.jamMulai);
        if (l === -1) l = akhirLajur.push('') - 1;
        akhirLajur[l] = b.jamSelesai;
        ...
        return { ...b, menunggu, bentrok, lajur: l };
    });
    return { blok, lajur: Math.max(1, akhirLajur.length) };
}
```

Kalau dua booking di satu lapangan jamnya bertumpuk (misalnya satu terkonfirmasi dan satu menunggu verifikasi), keduanya tidak boleh saling menutupi. Caranya:

1. Urutkan booking menurut jam mulai.
2. Untuk setiap booking, cari lajur pertama yang sudah kosong pada jam mulainya (`akhir <= jamMulai`).
3. Kalau tidak ada, buat lajur baru.
4. Catat jam selesai booking itu sebagai akhir lajur.

Baris lapangan yang punya dua lajur atau lebih digambar lebih tinggi.

Setiap blok juga diberi tanda `menunggu` (bukan `Dikonfirmasi`) dan `bentrok` (menunggu dan bertumpuk dengan booking terkonfirmasi lain).

### Mengukur lebar

```tsx
useLayoutEffect(() => {
    ukur();
    const ro = new ResizeObserver(ukur);
    if (area.current) ro.observe(area.current);
    return () => ro.disconnect();
}, [ukur]);
```

`ResizeObserver` memberi tahu setiap kali ukuran area berubah, misalnya saat sidebar diciutkan. Lebar yang terlihat dan ukuran penggeser lalu dihitung ulang.

`useLayoutEffect` berjalan sebelum browser menggambar, sehingga ukuran sudah benar pada gambar pertama.

### Posisi awal

```tsx
const kunciAwal = `${booking[0]?.tanggal ?? ''}|${adaSekarang}`;
useEffect(() => {
    el.scrollLeft = adaSekarang ? xSekarang - 2 * PX_JAM : pertama - PX_JAM;
}, [kunciAwal]);
```

Saat tanggal berganti, jadwal langsung digeser ke bagian yang menarik: dua jam sebelum sekarang (untuk hari ini), atau satu jam sebelum booking pertama (untuk hari lain).

### Menyeret dengan mouse

```tsx
const seretMulai = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
    seret.current = { x: e.clientX, awal: area.current!.scrollLeft };
    e.currentTarget.setPointerCapture(e.pointerId);
};
```

- Hanya mouse dengan tombol kiri. Layar sentuh sudah bisa menggeser dengan jari secara bawaan.
- Seret tidak dimulai kalau yang diklik adalah tombol blok, supaya klik pada blok tetap membuka panel.
- `setPointerCapture` membuat gerakan mouse tetap tercatat walaupun kursor keluar dari area.

### Blok yang bisa diklik

Kalau `onTinjau` ada (Admin), blok menunggu verifikasi berupa tombol yang memanggil `onTinjau(idPembayaran)`. Kalau tidak ada (Manager), blok hanya tampilan.

## Aturan di file ini

- Jam buka dan tutup diambil dari [jadwal.ts](./jadwal-ts).
- Komponen ini hanya menampilkan. Data jadwal disaring per tanggal oleh halaman.

## FAQ

**Kenapa booking yang belum dibayar tidak tampil?**
Booking tanpa bukti tidak menahan jam, dan bisa ada banyak di jam yang sama. Menampilkannya akan membuat jadwal penuh dengan booking yang belum tentu jadi.

**Kenapa satu jam 100px, tidak menyesuaikan lebar layar?**
Supaya nama penyewa dan jam di dalam blok satu jam tetap terbaca. Kalau dipadatkan ke lebar layar, blok satu jam terlalu sempit di laptop.

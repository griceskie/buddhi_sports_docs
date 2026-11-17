---
title: Booking.tsx (Booking saya)
urutan: 5
---

# Booking.tsx (Booking saya)

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Booking.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/booking`, route `booking`
- **Server:** `BookingPenyewaController::daftar()` (lihat [BookingPenyewaController](/backend/controller/booking-penyewa))
- **Komponen penting:** [KartuBookingSaya](/frontend/komponen/kartu-booking-saya), [PanelPembayaran](/frontend/komponen/panel-pembayaran), `KonfirmasiBatal`, [pembayaran.ts](/frontend/komponen/pembayaran-ts)
:::

## Ringkasan

Daftar booking milik penyewa, dibagi dua tab:

- **Mendatang:** booking hari ini dan sesudahnya yang tidak batal, dikelompokkan per hari ("Hari ini", "Besok", atau nama hari dan tanggal).
- **Riwayat:** booking yang sudah lewat atau dibatalkan, dikelompokkan per bulan.

Setiap kartu punya satu tombol aksi (Bayar sekarang, Kirim ulang bukti, atau Lihat detail). Semua tombol itu membuka popup pembayaran yang sama.

## Isi file

### Props

```tsx
type Props = { bookings: BookingPenyewa[]; rekening: Rekening; terisi?: Terisi[] };
```

- `bookings`: semua booking penyewa, bentuknya dari `detail()` di server.
- `rekening`: data rekening tujuan transfer.
- `terisi`: jam yang ditahan. Tidak dikirim saat halaman dibuka, dan baru dimuat saat penyewa membuka Ubah jadwal.

### State

| State | Isinya |
| --- | --- |
| `tab` | `'mendatang'` atau `'riwayat'`. |
| `habis` | ID booking yang batas bayarnya habis selagi halaman terbuka. |
| `popup` | Booking yang popup-nya terbuka, dan apakah popup sedang terbuka. |
| `konfirmasi` | Dialog "Batalkan booking ini?" sedang terbuka. |

`popup` menyimpan `{ id, buka }`, bukan hanya `id`. Saat popup ditutup, `buka` menjadi `false`, tetapi `id` tetap ada, supaya isi popup masih terlihat selama animasi menutup.

### Memisahkan Mendatang dan Riwayat

```tsx
const mendatang = (b) => habis.has(b.idBooking) || (b.tanggal >= hariIni && keadaan(b) !== 'dibatalkan');
```

Sebuah booking masuk Mendatang kalau tanggalnya hari ini atau nanti dan tidak batal. Pengecualiannya: booking yang baru saja kedaluwarsa selagi halaman terbuka tetap di Mendatang sampai halaman dimuat ulang, supaya kartu tidak tiba-tiba melompat ke tab lain di depan mata penyewa.

`keadaan(b)` dari [pembayaran.ts](/frontend/komponen/pembayaran-ts) menggabungkan status booking dan status pembayaran menjadi satu keadaan tampilan.

Tanggal dibandingkan sebagai teks `YYYY-MM-DD`. Cara ini benar karena urutan teksnya sama dengan urutan tanggal.

Urutan: Mendatang dari yang terdekat, Riwayat dari yang terbaru.

### Mengelompokkan

```tsx
for (const b of tampil) {
    const kunci = tab === 'mendatang' ? b.tanggal : b.tanggal.slice(0, 7);
    let g = grup.find((x) => x.kunci === kunci);
    if (!g) { g = { kunci, judul: ..., item: [] }; grup.push(g); }
    g.item.push(b);
}
```

- Mendatang dikelompokkan per tanggal (`2026-11-17`).
- Riwayat dikelompokkan per bulan (`2026-11`, hasil `slice(0, 7)`).

Judul kelompok: "Hari ini" atau "Besok" dengan tanggal lengkap di sampingnya, nama hari dan tanggal, atau nama bulan dan tahun untuk Riwayat.

### Saat batas bayar habis

```tsx
const tandaiHabis = useCallback((id: number) => {
    setHabis((s) => (s.has(id) ? s : new Set(s).add(id)));
    router.reload({ only: ['bookings', 'perluTindakan'] });
}, []);
```

Kartu menghitung mundur batas bayar setiap detik. Saat mencapai nol, kartu memanggil `onHabis`:

1. ID booking ditambahkan ke `habis`, supaya kartunya tetap di Mendatang.
2. `router.reload({ only: [...] })` meminta ulang dua props saja. Server membatalkan booking yang kedaluwarsa, lalu mengirim data terbaru. Angka di menu akun ikut turun.

`useCallback` menyimpan fungsi yang sama di antara penggambaran ulang, supaya komponen anak tidak menganggapnya fungsi baru setiap kali.

`new Set(s).add(id)` membuat himpunan baru. State React harus diganti dengan nilai baru, bukan diubah isinya, supaya React tahu ada perubahan.

### Popup pembayaran

```tsx
<Dialog open={!!popup?.buka} onOpenChange={(o) => !o && tutup()}>
    <DialogContent className={cn(kelasPopup, ..., konfirmasi && 'sm:scale-[.94] max-sm:translate-y-full')}>
        <PanelPembayaran key={dipilih.idBooking} tampilan="dialog" ... />
        <KonfirmasiBatal booking={dipilih} open={konfirmasi} onOpenChange={setKonfirmasi} />
    </DialogContent>
</Dialog>
```

- `kelasPopup` (dari `booking/popup.ts`) membuat dialog selebar 720px di tengah layar, dan menjadi sheet dari bawah di HP.
- Popup naik 40px saat muncul, sesuai rancangan.
- Saat konfirmasi batal terbuka, popup mengecil sedikit di desktop dan turun keluar layar di HP.
- `key={dipilih.idBooking}` membuat panel baru untuk setiap booking, supaya langkah dan lipatan di dalamnya mulai dari awal.

Isi popup sama dengan halaman Bayar, karena keduanya memakai [PanelPembayaran](/frontend/komponen/panel-pembayaran).

### Keadaan kosong

Kalau tab kosong, tampil gambar kalender, kalimat sesuai tab, dan tombol "Pesan lapangan" ke Home.

Di bawah daftar ada catatan "Jam Anda ditahan begitu bukti bayar terkirim. Ada kendala? Hubungi pengelola." Teks "Hubungi pengelola" adalah tautan WhatsApp kalau nomornya tersedia.

## Aturan di file ini

- Logika status ada di `pembayaran.ts`. Halaman tidak membandingkan `status` dan `statusPembayaran` sendiri.
- Popup dan halaman Bayar memakai satu komponen panel yang sama, jadi perubahan cukup dibuat di satu tempat.
- Di layar penyewa, sapaan memakai "Anda".

## FAQ

**Kenapa booking yang dibatalkan tidak muncul di Mendatang, walaupun tanggalnya masih nanti?**
Booking batal tidak akan dimainkan, jadi masuk Riwayat. Pengecualiannya hanya booking yang kedaluwarsa selagi halaman terbuka, seperti dijelaskan di atas.

**Bagaimana angka di tab dihitung?**
Dari jumlah booking di masing-masing daftar setelah disaring, jadi angka dan isi tab selalu sama.

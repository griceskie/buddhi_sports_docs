---
title: Booking/Bayar.tsx
urutan: 6
---

# Booking/Bayar.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Booking/Bayar.tsx` (40 baris)
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/booking/{id}/bayar`, route `booking.bayar`
- **Server:** `BookingPenyewaController::bayar()` (lihat [BookingPenyewaController](/backend/controller/booking-penyewa))
- **Komponen penting:** [PanelPembayaran](/frontend/komponen/panel-pembayaran), `KonfirmasiBatal`, `StatusBuka`
:::

## Ringkasan

Halaman "Konfirmasi dan bayar", yang terbuka tepat setelah penyewa menekan Booking sekarang. Isinya ringkasan booking, hitung mundur batas bayar, cara transfer, dan unggah bukti.

File ini pendek, karena semua isinya ada di [PanelPembayaran](/frontend/komponen/panel-pembayaran). Popup di halaman [Booking saya](./booking) memakai panel yang sama dengan `tampilan="dialog"`.

## Isi file

```tsx
export default function Bayar({ booking, rekening, terisi }: { booking: BookingPenyewa; rekening: Rekening; terisi?: Terisi[] }) {
    const [konfirmasi, setKonfirmasi] = useState(false);
    const habis = useCallback(() => {
        setKonfirmasi(false);
        router.reload({ only: ['booking'] });
    }, []);

    return (
        <PenyewaLayout navTengah={<StatusBuka />}>
            <Head title="Konfirmasi dan bayar" />
            <PanelPembayaran booking={booking} rekening={rekening} terisi={terisi} tampilan="halaman"
                onMintaBatal={() => setKonfirmasi(true)} onHabis={habis} />
            <KonfirmasiBatal booking={booking} open={konfirmasi} onOpenChange={setKonfirmasi} />
        </PenyewaLayout>
    );
}
```

| Bagian | Gunanya |
| --- | --- |
| `navTengah={<StatusBuka />}` | Menaruh status "Buka 08.00–22.00" atau "Tutup" di tengah navigasi. |
| `tampilan="halaman"` | Panel tampil sebagai halaman penuh: tombol kembali bulat, kolom ringkasan di kanan mulai layar `lg`, dan bar bawah yang menempel di HP. |
| `onMintaBatal` | Dipanggil saat penyewa menekan "Batalkan booking". Membuka dialog konfirmasi. |
| `onHabis` | Dipanggil saat hitung mundur mencapai nol. |
| `KonfirmasiBatal` | Dialog "Batalkan booking ini?". Saat dikonfirmasi, dialog mengirim `POST /booking/{id}/batal`. |

### Saat batas bayar habis

```tsx
router.reload({ only: ['booking'] });
```

Halaman meminta ulang props `booking` saja. Server membatalkan booking yang kedaluwarsa lebih dulu, jadi data yang datang sudah berstatus "Dibatalkan otomatis", dan panel langsung menampilkannya tanpa memuat ulang seluruh halaman.

### Props `terisi`

Server mengirim `terisi` dengan `Inertia::optional`, jadi props ini kosong saat halaman dibuka. Saat penyewa membuka Ubah jadwal, panel memintanya lewat partial reload. Membuka halaman Bayar tetap ringan.

## Aturan di file ini

- Perubahan tampilan pembayaran dibuat di `PanelPembayaran`, bukan di sini, supaya halaman dan popup tetap sama.
- Halaman ini memakai navigasi bawaan `PenyewaLayout`. Kolom yang menempel di dalamnya memakai `lg:top-24` supaya tidak tertutup navigasi.

## FAQ

**Penyewa menutup halaman sebelum membayar. Bagaimana kembali ke sini?**
Lewat Booking saya. Kartu booking itu menampilkan tombol "Bayar sekarang", yang membuka panel yang sama dalam bentuk popup. Halaman ini juga bisa dibuka langsung di `/booking/{id}/bayar`.

**Booking milik penyewa lain bisa dibuka lewat alamat ini?**
Tidak. Server hanya mencari booking milik penyewa yang login, dan menjawab 404 untuk yang lain.

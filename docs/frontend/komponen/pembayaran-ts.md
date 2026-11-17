---
title: booking/pembayaran.ts
urutan: 2
---

# booking/pembayaran.ts

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/pembayaran.ts`
- **Jenis:** tipe, fungsi, dan hook (TypeScript), tanpa tampilan
- **Dipakai oleh:** [Booking saya](/frontend/penyewa/booking), [Bayar](/frontend/penyewa/bayar), [PanelPembayaran](./panel-pembayaran), [KartuBookingSaya](./kartu-booking-saya), `KonfirmasiBatal`, `DialogBukti`
:::

## Ringkasan

Bentuk data booking penyewa dan tiga alat untuk membacanya:

- `keadaan()`: menggabungkan status booking dan status pembayaran menjadi satu keadaan tampilan
- `sebabBatal()`: siapa yang membatalkan
- `useSisaWaktu()`: hitung mundur batas bayar, diperbarui setiap detik.

## Isi file

### `Rekening` dan `BookingPenyewa`

`Rekening` berisi `bank`, `nomor`, dan `atasNama`.

`BookingPenyewa` adalah satu booking dalam bentuk yang dikirim `BookingPenyewaController::detail()`. Isian yang perlu diperhatikan:

| Isian | Artinya |
| --- | --- |
| `statusPembayaran` | `null` kalau belum ada bukti. |
| `jamDiambil` | Booking belum dibayar (atau buktinya ditolak), dan jamnya sudah ditahan booking lain. Penyewa tidak boleh mentransfer. |
| `batasBayar` | Waktu batas bayar (ISO 8601), atau `null` untuk booking yang dibuat Admin. |
| `buktiUrl` | Alamat route privat untuk melihat bukti. |

### `keadaan(b)`

```ts
export function keadaan(b): Keadaan {
    if (b.status === 'Dibatalkan') return 'dibatalkan';
    if (b.status === 'Dikonfirmasi' || b.statusPembayaran === 'Terverifikasi') return 'dikonfirmasi';
    if (b.statusPembayaran === 'Ditolak') return 'ditolak';
    if (b.statusPembayaran) return 'menungguVerifikasi';
    return 'belumBayar';
}
```

Status booking hanya punya tiga nilai, tetapi penyewa perlu melihat lima keadaan. "Menunggu verifikasi" dan "Ditolak" hanya ada di tabel pembayaran. Fungsi ini menggabungkan keduanya, dicek dari atas:

| Keadaan | Syarat |
| --- | --- |
| `dibatalkan` | Booking `Dibatalkan`. |
| `dikonfirmasi` | Booking `Dikonfirmasi`, atau pembayaran `Terverifikasi`. |
| `ditolak` | Pembayaran `Ditolak`. |
| `menungguVerifikasi` | Ada pembayaran dengan status lain, yaitu `Menunggu Verifikasi`. |
| `belumBayar` | Belum ada pembayaran. |

`Pick<BookingPenyewa, 'status' | 'statusPembayaran'>` berarti fungsi ini cukup menerima objek dengan dua isian itu, tidak perlu booking lengkap.

### `sebabBatal(b)`

| Hasil | Syarat |
| --- | --- |
| `'penyewa'` | `dibatalkanPenyewa` benar. |
| `'otomatis'` | Tidak ada pembayaran dan ada batas bayar. Booking itu kedaluwarsa. |
| `'pengelola'` | Selain itu. |

Panel pembayaran memakainya untuk menulis "Anda membatalkan booking ini.", "Dibatalkan otomatis", atau "Dibatalkan pengelola".

`'penyewa' as const` membuat TypeScript mengingat nilai persisnya, sehingga tipe hasilnya `'penyewa' | 'otomatis' | 'pengelola'`, bukan sekadar `string`.

### `waktuSingkat(iso)`

Menulis waktu seperti "Kamis, 26 Nov pukul 16.12", untuk riwayat status di panel.

### `useSisaWaktu(batas)`

```ts
export function useSisaWaktu(batas: string | null) {
    const [sekarang, setSekarang] = useState(() => Date.now());
    useEffect(() => {
        if (!batas) return;
        const t = setInterval(() => setSekarang(Date.now()), 1000);
        return () => clearInterval(t);
    }, [batas]);
    ...
    return { jamBatas, sisa, habis, genting };
}
```

Hook adalah fungsi React yang namanya diawali `use` dan boleh memakai `useState` atau `useEffect`. Hook ini memperbarui `sekarang` setiap detik, lalu menghitung:

| Hasil | Contoh | Artinya |
| --- | --- | --- |
| `jamBatas` | `"16.45"` | Jam batas bayar, ditulis dengan titik. |
| `sisa` | `"12:07"` | Sisa waktu dalam menit dan detik. Hitung mundur tetap memakai titik dua. |
| `habis` | `true` | Sisa waktu sudah 0. |
| `genting` | `true` | Kurang dari 10 menit. Tampilan berubah merah. |

Kalau `batas` bernilai `null`, hook mengembalikan `null` dan tidak membuat penghitung waktu.

`Math.max(0, ...)` mencegah sisa waktu menjadi negatif.

## Aturan di file ini

- Komponen tidak membandingkan `status` dan `statusPembayaran` sendiri. Selalu lewat `keadaan()`.
- Tipe `BookingPenyewa` harus sama dengan isi `detail()` di server.

## FAQ

**Apa yang terjadi kalau hitung mundur mencapai nol?**
Komponen yang memakai hook ini melihat `habis` bernilai benar, lalu memanggil `onHabis`. Halaman meminta data terbaru dari server, dan server membatalkan booking itu.

**Kenapa jam perangkat penyewa yang dipakai?**
Supaya hitung mundur berjalan tanpa server. Kalau jam perangkat salah, tampilan bisa meleset, tetapi keputusan batal tetap diambil server dengan jamnya sendiri.

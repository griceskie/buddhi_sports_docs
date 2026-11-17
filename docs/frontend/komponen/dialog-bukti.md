---
title: booking/DialogBukti.tsx
urutan: 11
---

# booking/DialogBukti.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/DialogBukti.tsx`
- **Jenis:** komponen React (TSX), dengan dua komponen yang diekspor
- **Dipakai oleh:** [PanelPembayaran](./panel-pembayaran). `HubungiPengelola` juga dipakai [Booking saya](/frontend/penyewa/booking), `KonfirmasiBatal`, dan panel lain.
- **Data:** `booking.buktiUrl` (route privat `pembayaran.bukti`), props bersama `waPengelola`
:::

## Ringkasan

File ini berisi dua komponen:

1. **`DialogBukti`** (bawaan): dialog yang menampilkan bukti transfer yang sudah dikirim penyewa, beserta status, jumlah, dan alasan penolakan kalau ditolak. Di bawahnya ada tombol **Buka di tab baru** dan **Tutup**.
2. **`HubungiPengelola`**: teks "Hubungi pengelola" yang menjadi tautan WhatsApp kalau nomor pengelola tersedia.

## Isi file

### `DialogBukti`

```tsx
const k = keadaan(booking);
const ditolak = k === 'ditolak';
const [gagal, setGagal] = useState(false);
```

- Judul "Bukti transfer", atau "Bukti sebelumnya" kalau ditolak.
- Keterangan waktu kirim, misalnya "Dikirim Kamis, 26 Nov pukul 16.12", ditambah "· ditolak pengelola" kalau ditolak.

#### Gambar bukti

```tsx
{booking.buktiUrl && !gagal ? (
    <img src={booking.buktiUrl} alt="Bukti transfer" onError={() => setGagal(true)} ... />
) : (
    <div>Pratinjau tidak tersedia</div>
)}
```

Gambar dimuat dari route privat. Kalau gagal dimuat, misalnya karena file lama berupa PDF yang tidak bisa ditampilkan sebagai gambar, `onError` mengganti tampilan dengan kotak "Pratinjau tidak tersedia". Penyewa tetap bisa membukanya di tab baru.

#### Rincian

Pasangan label dan nilai dalam `<dl>`: Status (badge), Jumlah dibayar, dan Alasan ditolak (hanya kalau ditolak).

#### Catatan bawah

Kalimatnya berbeda menurut keadaan:

| Keadaan | Kalimat |
| --- | --- |
| Ditolak | "Kirim bukti yang baru dari langkah 2. Butuh bantuan? Hubungi pengelola." |
| Dikonfirmasi | "Ada yang tidak sesuai? Hubungi pengelola." |
| Lainnya | "Salah kirim? Hubungi pengelola." |

### `HubungiPengelola`

```tsx
export function HubungiPengelola({ awalBesar = false }: { awalBesar?: boolean }) {
    const { waPengelola } = usePage<PageProps>().props;
    const teks = awalBesar ? 'Hubungi pengelola' : 'hubungi pengelola';
    if (!waPengelola) return <span className="font-semibold text-foreground">{teks}</span>;

    const pesan = encodeURIComponent('Halo pengelola Buddhi Sports, saya mau bertanya tentang booking saya.');
    return <a href={`https://wa.me/${waPengelola}?text=${pesan}`} target="_blank" rel="noopener">{teks}</a>;
}
```

- `awalBesar` menentukan apakah huruf pertamanya kapital, sesuai posisinya di kalimat.
- Kalau `waPengelola` kosong, teks tampil tebal tanpa tautan.
- Kalau ada, teks menjadi tautan `wa.me` dengan pesan pembuka yang sudah terisi. `encodeURIComponent` mengubah spasi dan tanda baca menjadi bentuk yang aman di alamat.

Nomornya diatur di `.env` (`PENGELOLA_WA`, angka saja, diawali 62) dan hanya dikirim ke penyewa. Lihat [config/pengelola.php](/backend/route/config-pengelola).

## Aturan di file ini

- Path file bukti tidak pernah dipakai di browser. Hanya `buktiUrl`, alamat route yang memeriksa hak akses.
- Semua teks "Hubungi pengelola" di sisi penyewa memakai komponen ini, supaya nomor dan pesannya sama di mana-mana.

## FAQ

**Kenapa rasio gambar bukti 9:16?**
Bukti transfer biasanya tangkapan layar aplikasi bank di HP, yang berbentuk tegak.

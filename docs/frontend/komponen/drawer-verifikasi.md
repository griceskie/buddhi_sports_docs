---
title: admin/DrawerVerifikasi.tsx
urutan: 12
---

# admin/DrawerVerifikasi.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/admin/DrawerVerifikasi.tsx`
- **Jenis:** komponen React (TSX), berupa sheet samping
- **Dipakai oleh:** [Dashboard Admin](/frontend/admin/dashboard-admin), [Pembayaran Admin](/frontend/admin/master-pembayaran), [Pembayaran Manager](/frontend/manager/pembayaran) (`hanyaLihat`)
- **Bentuk data:** `AdminDashboardController::bukti()` (lihat [AdminDashboardController](/backend/controller/admin-dashboard))
:::

## Ringkasan

Sheet lebar (sampai 880px) dari kanan untuk memeriksa satu bukti bayar. Di kiri ada gambar bukti, di kanan rinciannya:

- kotak peringatan: oranye "Perlu dicek" untuk bukti biasa, atau merah "Jam bentrok" kalau jamnya sudah dikonfirmasi untuk booking lain
- rincian: status, penyewa, lapangan, jadwal main, tanggal bayar, waktu kirim, **total booking**, dan **jumlah dibayar**
- kolom alasan, kalau Admin menekan Tolak.

Di bawah ada penunjuk antrean ("3 dari 7" dengan panah) dan tombol keputusan.

Komponen ini sengaja **tidak** menyimpulkan apakah nominalnya cocok. Total booking dan jumlah dibayar ditampilkan berdampingan, dan Admin yang mencocokkan dengan bukti.

## Isi file

### Tipe `BuktiAntrean`

Bentuk satu bukti, sama dengan keluaran `AdminDashboardController::bukti()`. Isian khususnya:

- `bentrokDengan`: kode booking yang bentrok, atau `null`.
- `menitTunggu`: lama menunggu di jam buka. Dipakai di Pemantauan.
- `buktiBayar`: alamat route privat bukti.
- `buktiPdf`: file berupa PDF.

### Komponen luar: tetap terpasang

```tsx
export default function DrawerVerifikasi({ buka = true, ...props }: Props & { buka?: boolean }) {
    const terakhir = useRef(props.bukti);
    if (props.bukti) terakhir.current = props.bukti;
    const bukti = props.bukti ?? terakhir.current;
    return (
        <Sheet open={buka && !!props.bukti} onOpenChange={(b) => !b && props.onTutup()}>
            <SheetContent ...>{bukti && <IsiDrawer key={bukti.idPembayaran} {...props} bukti={bukti} />}</SheetContent>
        </Sheet>
    );
}
```

- `Sheet` selalu ada di halaman, dan hanya `open` yang berubah. Base UI butuh sheet yang sudah ada dalam keadaan tertutup supaya animasi meluncur masuk bisa berjalan.
- Saat ditutup, `props.bukti` menjadi `null`. `useRef` menyimpan bukti terakhir, supaya isinya masih terlihat selama sheet meluncur keluar.
- `key={bukti.idPembayaran}` membuat isi baru untuk setiap bukti. Kolom alasan dan status "sedang menolak" jadi bersih setiap kali pindah bukti.

### Props

| Props | Gunanya |
| --- | --- |
| `bukti` | Bukti yang dibuka, atau `null` untuk menutup. |
| `posisi`, `jumlah` | Urutan di antrean (mulai 0) dan jumlahnya. `posisi = -1` kalau bukti tidak ada di antrean. |
| `adaBerikutnya` | Tombol Terima berbunyi "Terima & berikutnya". |
| `onSebelum`, `onBerikut`, `onTutup` | Navigasi. |
| `onTerima`, `onTolak` | Keputusan. Opsional, karena mode hanya lihat tidak memakainya. |
| `hanyaLihat` | Mode Manager. |
| `galatAlasan`, `memproses` | Galat dari server dan status pengiriman. |

### Tombol keputusan

Tombol di bawah dipilih dari beberapa keadaan, dicek dari atas:

| Keadaan | Tombol |
| --- | --- |
| `hanyaLihat` | Tutup, dengan catatan "Admin yang menerima atau menolak bukti ini." |
| Bukti sudah diproses | Tutup |
| Sedang menolak | Batal dan **Tolak pembayaran** (aktif kalau alasan sudah diisi) |
| Menunggu | **Tolak** dan **Terima pembayaran** (atau **Terima & berikutnya**) |

Terima dinonaktifkan kalau jamnya bentrok, kalau tidak ada file bukti, atau selama sedang memproses.

### Menolak dalam dua langkah

```tsx
const [menolak, setMenolak] = useState(false);
const [alasan, setAlasan] = useState('');
```

Menekan **Tolak** tidak langsung mengirim apa pun. Kolom alasan muncul dulu (maksimal 500 karakter, dengan contoh di placeholder). Baru tombol **Tolak pembayaran** yang mengirim `onTolak(alasan.trim())`.

Di bawah kolom ada penjelasan: "Ditampilkan ke penyewa agar bisa mengunggah ulang bukti yang benar." Kalau server menolak, misalnya karena alasan kosong, pesannya muncul di tempat yang sama.

## Aturan di file ini

- Komponen ini tidak mengirim permintaan sendiri. Halaman yang memakainya yang memanggil route `verifikasi.terima` dan `verifikasi.tolak`.
- Jangan menambah kesimpulan otomatis seperti "nominal cocok". Admin yang memutuskan.

## FAQ

**Kenapa Terima nonaktif padahal buktinya benar?**
Kalau ada kotak merah "Jam bentrok", jam itu sudah dikonfirmasi untuk booking lain. Tolak bukti ini dengan alasan, lalu penyewa diminta menghubungi pengelola untuk pindah jadwal.

**Apa itu "Terima & berikutnya"?**
Setelah menerima, panel langsung membuka bukti berikutnya di antrean, sehingga Admin bisa memeriksa banyak bukti tanpa menutup dan membuka panel berulang kali.

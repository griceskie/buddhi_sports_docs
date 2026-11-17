---
title: booking/PanelPembayaran.tsx
urutan: 3
---

# booking/PanelPembayaran.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/PanelPembayaran.tsx` (sekitar 750 baris, komponen terbesar di sisi penyewa)
- **Jenis:** komponen React (TSX)
- **Dipakai oleh:** halaman [Bayar](/frontend/penyewa/bayar) (`tampilan="halaman"`) dan popup di [Booking saya](/frontend/penyewa/booking) (`tampilan="dialog"`)
- **Memakai:** [pembayaran.ts](./pembayaran-ts), `RekeningTransfer`, `FileUpload`, [UbahJadwal](./ubah-jadwal), [DialogBukti](./dialog-bukti)
:::

## Ringkasan

Satu panel untuk semua keadaan booking penyewa. Isinya berubah sesuai keadaan:

| Keadaan | Judul | Isi utama |
| --- | --- | --- |
| Belum bayar | Konfirmasi dan bayar | Hitung mundur, langkah **transfer** lalu **unggah bukti**, tombol Batalkan booking |
| Ditolak | Kirim ulang bukti transfer | Kotak alasan penolakan, langsung di langkah unggah |
| Menunggu verifikasi | Bukti transfer terkirim | Garis waktu status, tombol lihat bukti |
| Dikonfirmasi | Booking dikonfirmasi | Garis waktu status |
| Dibatalkan | Booking dibatalkan | Siapa yang membatalkan, tombol Pesan lapangan lagi |

Di samping atau di atas langkah-langkah itu ada ringkasan booking: lapangan, tanggal, jam, total, dan tombol Ubah jadwal kalau masih boleh.

## Dua tampilan

| | `halaman` | `dialog` |
| --- | --- | --- |
| Tempat | `/booking/{id}/bayar` | Popup di Booking saya |
| Tombol kembali atau tutup | Tombol kembali bulat yang menempel di kiri | Tombol X bulat yang menempel di kanan atas |
| Ringkasan | Kolom kanan 420px mulai layar `lg`, menempel saat digulir | Di atas langkah, rinciannya dilipat di balik "Lihat rincian" |
| Bar bawah (HP) | Menempel di bawah layar (`fixed`) | Menempel di bawah popup (`sticky`) |

## Isi file

### Props

| Props | Gunanya |
| --- | --- |
| `booking`, `rekening` | Data booking dan rekening tujuan. |
| `tampilan` | `'halaman'` atau `'dialog'`. |
| `terisi` | Jam yang ditahan, untuk Ubah jadwal. `undefined` sampai dimuat. |
| `onTutup` | Menutup popup. Hanya untuk dialog. |
| `onMintaBatal` | Meminta konfirmasi batal. Dialog konfirmasinya dipegang halaman atau popup, bukan panel. |
| `onHabis` | Dipanggil sekali saat batas bayar habis selagi panel terbuka. |

### Menentukan keadaan

```tsx
const k0 = keadaan(booking);
const sisa = useSisaWaktu(k0 === 'belumBayar' ? booking.batasBayar : null);
const habis = k0 === 'belumBayar' && !!sisa?.habis;
const k = habis ? 'dibatalkan' : k0;
const sebab = habis ? 'otomatis' : sebabBatal(booking);
const diambil = (belum || ditolak) && booking.jamDiambil;
```

1. `k0` adalah keadaan menurut data server.
2. Hitung mundur hanya berjalan kalau belum bayar.
3. Kalau hitung mundur habis selagi panel terbuka, panel langsung menampilkan "dibatalkan otomatis", tanpa menunggu server.
4. `diambil` benar kalau jamnya sudah ditahan penyewa lain. Dalam keadaan ini, langkah bayar dan bar bawah disembunyikan, dan kotak merah "Jangan transfer untuk jadwal ini" tampil dengan tautan Pilih jadwal lain (atau Hubungi pengelola kalau buktinya pernah ditolak).

### Melapor sekali saat habis

```tsx
const habisDilaporkan = useRef(false);
useEffect(() => {
    if (!habis || habisDilaporkan.current) return;
    habisDilaporkan.current = true;
    setBukaUbah(false);
    setBukaBukti(false);
    onHabis?.();
}, [habis, onHabis]);
```

`useRef` menyimpan tanda "sudah dilaporkan" yang tidak hilang saat panel digambar ulang. Tanpa tanda ini, `onHabis` bisa terpanggil berkali-kali. Dialog Ubah jadwal dan lihat bukti juga ditutup.

`onHabis?.()` memanggil fungsi hanya kalau ada.

### Langkah transfer dan unggah

```tsx
const [langkah, setLangkah] = useState<'transfer' | 'unggah'>(ditolak ? 'unggah' : 'transfer');
```

Dua langkah bernomor yang bisa dilipat:

1. **Transfer**: nomor rekening, nama pemilik, dan jumlah yang harus ditransfer (`RekeningTransfer`), lalu tombol **Saya sudah transfer**.
2. **Unggah**: pilih file bukti (JPG atau PNG, maksimal 2 MB), lalu tombol **Kirim bukti**.

Kalau bukti pernah ditolak, panel langsung mulai di langkah unggah.

### Mengirim bukti

```tsx
const form = useForm<{ bukti: File | null }>({ bukti: null });
const kirim = () => form.post(route('booking.bukti', booking.idBooking), {
    forceFormData: true, preserveScroll: true, preserveState: true, onSuccess: () => form.reset(),
});
```

`forceFormData: true` memastikan file dikirim sebagai `multipart/form-data`. Setelah berhasil, server mengirim data booking baru, dan panel berganti ke keadaan "Bukti transfer terkirim".

### Bar bawah di HP

Selama belum bayar atau ditolak (dan jamnya tidak diambil orang lain), layar di bawah 640px menampilkan bar di bawah dengan total, keterangan singkat ("Bayar sebelum 16.45 · 12:07", atau status bukti), dan tombol langkah yang sedang aktif. Keterangan berubah merah kalau sisa waktu kurang dari 10 menit.

### Komponen kecil di file ini

| Komponen | Gunanya |
| --- | --- |
| `Lipat` | Bagian yang bisa dilipat dengan animasi tinggi (`grid-rows-[0fr]` menjadi `[1fr]`). `selaluBukaLg` membuatnya selalu terbuka mulai layar `lg`. |
| `Titik` | Lingkaran nomor langkah atau tanda centang di garis waktu. |
| `StatusPembayaran` | Garis waktu: Booking dibuat, Bukti transfer terkirim (dengan tombol lihat bukti), lalu Diperiksa pengelola atau Pembayaran terverifikasi. |
| `Ringkasan` | Kartu ringkasan booking dengan foto lapangan, jadwal, harga, dan tombol Ubah jadwal. |

### Batalkan booking

Tombol merah lembut **Batalkan booking** hanya tampil saat belum bayar. Tombol ini memanggil `onMintaBatal`, lalu halaman membuka `KonfirmasiBatal`.

## Aturan di file ini

- Panel ini satu-satunya tempat tampilan pembayaran penyewa. Halaman Bayar dan popup tidak menambah isi sendiri.
- Keadaan selalu dari `keadaan()` dan `sebabBatal()` di [pembayaran.ts](./pembayaran-ts).
- Satu tombol `elevated` per tampilan, yaitu Kirim bukti.
- Di layar penyewa, sebut "pengelola", bukan "admin".

## FAQ

**Kenapa langkah unggah tidak langsung terbuka?**
Supaya penyewa mentransfer dulu. Banyak penyewa yang langsung mencari tombol unggah sebelum mentransfer. Langkah transfer memastikan nomor rekening dan jumlah terlihat lebih dulu.

**Kenapa Ubah jadwal hanya tersedia sebelum bukti dikirim?**
Setelah bukti dikirim, jamnya sudah ditahan dan sedang diperiksa pengelola. Memindah jadwal setelah itu harus lewat pengelola.

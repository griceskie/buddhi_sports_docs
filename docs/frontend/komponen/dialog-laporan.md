---
title: pengelola/DialogLaporan.tsx
urutan: 16
---

# pengelola/DialogLaporan.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/pengelola/DialogLaporan.tsx`
- **Jenis:** komponen React (TSX), berupa dialog
- **Dipakai oleh:** halaman [Laporan pembayaran Admin](/frontend/admin/master-laporan)
- **Server:** `POST /laporanpembayaran/buat` ([LaporanPembayaranController](/backend/controller/laporan-pembayaran))
- **Memakai:** `ui/signature-pad`, `FormSelect`
:::

## Ringkasan

Dialog **Buat laporan pembayaran**. Isinya:

- jumlah dan total pembayaran terverifikasi bulan itu
- nama laporan ("Laporan Pembayaran Oktober 2026") dan tanggal laporan (hari ini). Keduanya hanya dibaca
- pilihan **Manager tujuan**
- kotak **tanda tangan digital**.

Setelah dikirim, server membuat PDF, menyimpannya, dan menandai laporan sebagai sudah diserahkan.

Komentar di atas komponen menyebut halaman Pembayaran juga memakainya. Itu sudah tidak berlaku: sejak tombol Buat laporan dipindah, dialog ini hanya dipakai halaman Laporan.

## Isi file

### Props

| Props | Gunanya |
| --- | --- |
| `buka`, `onClose` | Status dialog. |
| `periode` | Bulan dan tahun laporan. |
| `namaLaporan` | Nama laporan, dari server. |
| `ringkasan` | Jumlah dan total per status pembayaran. Yang ditampilkan hanya bagian terverifikasi. |
| `datamanager` | Pilihan Manager (ID dan nama). |
| `idManagerAwal` | Manager yang langsung dipilih, misalnya Manager laporan sebelumnya saat membuat ulang. |

### Form

```tsx
const form = useForm({
    bulan: periode.bulan,
    tahun: periode.tahun,
    idManager: idManagerAwal ? String(idManagerAwal) : datamanager[0] ? String(datamanager[0].idManager) : '',
    tandaTangan: '',
});
```

Manager awal: Manager laporan sebelumnya, kalau ada. Kalau tidak, Manager pertama di daftar.

Tanggal laporan tidak ada di form. Server selalu memakai tanggal hari ini.

### Tanda tangan

```tsx
<SignaturePad onChange={(v) => form.setData('tandaTangan', v)} aria-invalid={!!form.errors.tandaTangan} />
```

`SignaturePad` adalah kanvas untuk menggambar tanda tangan dengan mouse atau jari. Setiap kali tanda tangan berubah, isinya dikirim sebagai teks `data:image/jpeg;base64,...`, yaitu gambar JPEG yang ditulis sebagai teks.

JPEG dipakai, bukan PNG, karena pembuat PDF di server (dompdf) butuh ekstensi GD untuk membaca PNG, dan lingkungan proyek ini tidak punya GD.

### Mengirim

```tsx
const kirim = () =>
    form.post(route('laporan.buat'), {
        preserveScroll: true,
        onSuccess: () => {
            form.setData('tandaTangan', '');
            onClose();
        },
    });
```

Setelah berhasil, tanda tangan dikosongkan dan dialog ditutup. Toast hijau dari server memberi tahu bahwa laporan sudah dibuat. Kalau server menolak (misalnya masih ada bukti yang menunggu), toast merah muncul.

## Aturan di file ini

- Tanda tangan wajib diisi. Server menolak tanda tangan kosong atau bukan JPEG.
- Dialog diberi `key` dari periode di halaman, supaya isinya bersih setiap kali bulan berganti.

## FAQ

**Apakah tanda tangan disimpan di database?**
Tidak. Tanda tangan hanya dipakai untuk menggambar PDF, lalu tercetak di dalam file PDF itu.

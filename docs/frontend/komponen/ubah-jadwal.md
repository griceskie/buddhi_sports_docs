---
title: booking/UbahJadwal.tsx
urutan: 8
---

# booking/UbahJadwal.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/booking/UbahJadwal.tsx`
- **Jenis:** komponen React (TSX), berupa dialog
- **Dipakai oleh:** [PanelPembayaran](./panel-pembayaran)
- **Memakai:** [DateStrip](./date-strip), [KartuJam](./kartu-jam), [jadwal.ts](./jadwal-ts)
- **Server:** `PATCH /booking/{id}/jadwal` (`BookingPenyewaController::ubahJadwal`)
:::

## Ringkasan

Dialog untuk memindah booking ke tanggal atau jam lain di **lapangan yang sama**. Isinya strip tanggal dan kartu jam, sama dengan di Home, lalu ringkasan harga baru dan tombol **Simpan jadwal**. Ada juga catatan bahwa batas bayar tidak berubah.

Dialog ini hanya tersedia selama booking belum dibayar.

## Isi file

### Memuat jam terisi saat dibuka

```tsx
useEffect(() => {
    if (open && !terisi) router.reload({ only: ['terisi'] });
}, [open, terisi]);
```

Halaman Bayar dan Booking saya tidak memuat `terisi` di awal, karena server mengirimnya dengan `Inertia::optional`. Saat dialog pertama kali dibuka, komponen meminta props itu saja. Selama datanya belum datang, kotak jam ditampilkan sebagai `Skeleton` (kotak abu-abu berkedip).

### Isi hanya dibuat saat terbuka

```tsx
{open && <IsiUbahJadwal ... onTutup={() => onOpenChange(false)} />}
```

Isi dialog ada di komponen terpisah, `IsiUbahJadwal`, yang hanya dibuat saat dialog terbuka. Setiap kali dibuka, pilihan dimulai lagi dari jadwal booking saat ini.

### Pilihan awal

```tsx
const [tanggal, setTanggal] = useState(() => new Date(booking.tanggal + 'T00:00:00'));
const [pilihan, setPilihan] = useState<TimeRange | null>(
    booking.jamDiambil ? null : { start: booking.jamMulai, end: booking.jamSelesai },
);
```

- Tanggal awal adalah tanggal booking. `'T00:00:00'` memastikan tanggal dibaca di zona waktu perangkat, bukan UTC.
- Jam awal adalah jam booking, kecuali jam itu sudah diambil penyewa lain. Dalam keadaan itu, tidak ada jam yang dipilih, supaya penyewa memilih jam baru.

### Lapangan buatan

```tsx
const lapangan: Lapangan = { idLapangan: booking.idLapangan, ..., status: 'Tersedia', foto: [] };
```

Fungsi di [jadwal.ts](./jadwal-ts) butuh objek `Lapangan`. Data booking tidak membawa status lapangan, jadi dibuat objek sederhana dengan status `Tersedia`. Kalau lapangan ternyata sedang diperbaiki, server menolak saat menyimpan.

### Pindah tanggal

```tsx
const muat = (r: TimeRange, d: Date) =>
    !booked(d).some((b) => toMinutes(r.start) < toMinutes(b.end) && toMinutes(r.end) > toMinutes(b.start)) &&
    !jamSudahLewat(toMinutes(r.start) / 60, d, sekarang);

const ubahTanggal = (d: Date) => {
    setTanggal(d);
    setPilihan((p) => (p && muat(p, d) ? p : null));
};
```

Saat tanggal diganti, jam yang dipilih dipertahankan kalau masih kosong di tanggal baru. Kalau tidak, pilihan dikosongkan.

### Menyimpan

```tsx
const sama = !!pilihan && isoTanggal(tanggal) === booking.tanggal && pilihan.start === booking.jamMulai && pilihan.end === booking.jamSelesai;

const simpan = () => {
    if (!pilihan) return;
    if (sama) return onTutup();
    router.patch(route('booking.jadwal', booking.idBooking), { tanggal: isoTanggal(tanggal), jamMulai: pilihan.start, jamSelesai: pilihan.end }, { ... });
};
```

- Kalau tidak ada yang berubah, dialog langsung ditutup tanpa mengirim apa pun.
- Kalau berubah, kirim `PATCH`. Setelah berhasil, dialog ditutup dan toast "Jadwal booking BK-0012 diubah." muncul.
- Kalau server menolak (misalnya jamnya baru diambil orang lain), pesannya tampil di dalam dialog.

`KartuJam` diberi `kataAksi="simpan"`, sehingga petunjuknya berbunyi "...atau langsung simpan."

## Aturan di file ini

- Lapangan tidak bisa diganti di sini. Untuk pindah lapangan, penyewa membatalkan lalu membuat booking baru.
- Batas bayar tidak berubah, dan dialog menyebutkannya, supaya penyewa tidak mengira waktunya bertambah.

## FAQ

**Apakah total bayar ikut berubah?**
Ya, kalau jumlah jamnya berubah. Server menghitung ulang total dari tarif lapangan, dan ringkasan di dialog menunjukkan total baru sebelum disimpan.

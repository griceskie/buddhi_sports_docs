---
title: Master/Booking/TampilData.tsx
urutan: 5
---

# Master/Booking/TampilData.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Master/Booking/TampilData.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/tampilbooking` (dengan `?tambah`, sheet Tambah langsung terbuka)
- **Server:** [MasterBookingController](/backend/controller/master-booking)
- **Pola dasar:** sama dengan [Master Penyewa](./master-penyewa)
- **Komponen penting:** `FormCombobox`, `FormSelect`, `DateInput`, `CurrencyInput`, `BadgeTip`
:::

## Ringkasan

Halaman Data booking milik Admin. Tabelnya menampilkan kode, penyewa, lapangan, tanggal, jam, total, dan status. Form di sheet mengisi beberapa nilai sendiri: Admin yang sedang login, jam selesai, dan total bayar.

## Isi file

### Props dan pencarian cepat

```tsx
export default function TampilData({ databooking, ...pilihan }: { databooking: Booking[] } & Pilihan) {
    const namaPenyewa = new Map(pilihan.datapenyewa.map((p) => [p.idPenyewa, p.namaPenyewa]));
    const lapangan = new Map(pilihan.datalapangan.map((l) => [l.idLapangan, l]));
```

- `...pilihan` mengumpulkan sisa props (penyewa, lapangan, Admin, `idAdminLogin`) menjadi satu objek, lalu diteruskan ke form dengan `{...pilihan}`.
- Server mengirim booking dengan ID penyewa dan ID lapangan saja. `Map` adalah daftar pasangan kunci dan nilai, supaya nama bisa dicari cepat dengan `namaPenyewa.get(id)`, tanpa menelusuri seluruh daftar untuk setiap baris.

### Membuka Tambah dari dashboard

```tsx
useEffect(() => {
    if (new URLSearchParams(url.split('?')[1]).has('tambah')) sheet.buka();
}, []);
```

Tombol "Tambah booking" di dashboard Admin membuka `/tampilbooking?tambah`. Saat halaman pertama kali tampil, `useEffect` dengan daftar kosong `[]` berjalan sekali, memeriksa `?tambah`, lalu membuka sheet.

### Kolom

- **Kode:** `BK-` ditambah ID dengan nol di depan sampai 4 angka (`padStart(4, '0')`). ID 12 menjadi `BK-0012`.
- **Lapangan:** ikon olahraga dan nama lapangan.
- **Tanggal:** `formatTanggal(..., 'EEE, d MMM yyyy')` menjadi "Sen, 16 Nov 2026". Urutannya memakai tanggal ditambah jam mulai.
- **Jam:** "16.00–18.00", ditulis dengan titik.
- **Status:** badge, dan tulisan oranye "Tanpa pembayaran" kalau booking `Dikonfirmasi` tanpa pembayaran terverifikasi.

Kolom status diurutkan menurut urutan status (`indexOf` di daftar), bukan menurut abjad.

### Form: isi awal

```tsx
txtadmin: row ? (row.idAdmin ? String(row.idAdmin) : '') : idAdminLogin ? String(idAdminLogin) : '',
```

Saat Tambah, kolom Admin langsung berisi Admin yang sedang login. Saat Edit, kolom itu berisi Admin yang tercatat di booking.

Semua ID diubah menjadi teks (`String(...)`), karena komponen pilihan bekerja dengan teks. `''` berarti belum dipilih.

### Total terisi otomatis

```tsx
const denganTotal = (d: typeof data) => {
    const tarif = datalapangan.find((l) => String(l.idLapangan) === d.txtlapangan)?.tarifPerJam;
    return tarif && d.txtjammulai && d.txtjamselesai
        ? { ...d, txttotal: String(bookingTotal(d.txtjammulai, d.txtjamselesai, tarif)) }
        : d;
};
```

Setiap kali lapangan, jam mulai, atau jam selesai berubah, total dihitung ulang: tarif × jumlah jam. Kalau salah satu belum diisi, total dibiarkan. Admin tetap bisa mengubah total secara manual. Membuka Edit tidak mengubah total yang tersimpan, karena perhitungan hanya berjalan saat isian berubah.

`setData((d) => ...)` memakai fungsi, supaya beberapa field bisa diubah sekaligus dari data terbaru.

### Jam mulai dan jam selesai

```tsx
const pilihJamMulai = (mulai: string) =>
    setData((d) => denganTotal({
        ...d,
        txtjammulai: mulai,
        txtjamselesai: mulai && (!d.txtjamselesai || angkaJam(d.txtjamselesai) <= angkaJam(mulai))
            ? jam(angkaJam(mulai) + 1)
            : d.txtjamselesai,
    }));
```

Saat jam mulai dipilih, jam selesai otomatis menjadi satu jam setelahnya, kalau jam selesai masih kosong atau tidak lagi setelah jam mulai.

- Pilihan jam mulai: 08.00 sampai 21.00.
- Pilihan jam selesai: satu jam setelah jam mulai sampai 22.00.

```tsx
<FormSelect key={data.txtjammulai} id="txtjamselesai" ... />
```

`key={data.txtjammulai}` membuat pilihan jam selesai dibuat ulang setiap kali jam mulai berganti. Komponen Select dari Base UI kehilangan nilai yang dipilih kalau nilai dan daftar pilihannya berubah bersamaan, jadi pilihan itu dibuat ulang.

### Alasan pembatalan

```tsx
{row && row.status !== 'Dibatalkan' && data.txtstatus === 'Dibatalkan' && ( <Textarea id="txtalasanbatal" maxLength={255} ... /> )}
```

Kolom alasan hanya muncul saat Edit, dan hanya kalau status baru saja diubah menjadi Dibatalkan. Alasannya disimpan di log aktivitas.

## Aturan di file ini

- Jam di layar ditulis dengan titik (16.00), tetapi nilai yang dikirim tetap `16:00`.
- Daftar jam dibuat dari `JAM_BUKA` dan `JAM_TUTUP` di [jadwal.ts](/frontend/komponen/jadwal-ts), bukan ditulis manual.
- Penyewa, Lapangan, Admin, dan Status memakai `FormCombobox` (bisa diketik untuk mencari). Jam memakai `FormSelect`.

## FAQ

**Kenapa Admin tidak bisa memilih jam 21.30?**
Booking hanya per jam penuh. Server juga menolak jam yang tidak ada di daftar.

**Booking yang dibuat di sini muncul di Booking saya penyewa?**
Ya, karena tercatat atas nama penyewa yang dipilih. Booking itu tidak punya batas bayar dan tidak kedaluwarsa otomatis.

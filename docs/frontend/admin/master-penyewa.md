---
title: Master/Penyewa/TampilData.tsx
urutan: 3
---

# Master/Penyewa/TampilData.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Master/Penyewa/TampilData.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/tampilpenyewa`
- **Server:** [MasterPenyewaController](/backend/controller/master-penyewa)
- **Komponen penting:** [DataTable](/frontend/komponen/data-table), [FormSheet](/frontend/komponen/form-sheet), `AksiBaris`, `JudulHalaman`
:::

## Ringkasan

Halaman Data penyewa milik Admin: tabel penyewa dengan pencarian, lalu sheet samping untuk Tambah dan Edit. Ini halaman master data paling sederhana, jadi baca file ini lebih dulu untuk memahami pola halaman master lainnya.

## Pola halaman master

```text
AdminSidebarLayout (header = JudulHalaman)
├─ DataTable (baris, kolom, cari, aksi per baris, tombol Tambah)
└─ FormSheet
   └─ Form{Model} key={sheet.versi}  ← form di dalam sheet
```

Halaman Lapangan, Booking, Pembayaran, dan Laporan memakai susunan yang sama, dengan kolom dan form masing-masing.

## Isi file

### Tipe baris

```tsx
type Penyewa = { idPenyewa: number; namaPenyewa: string; noHp: string; email: string; jumlahBooking: number };
```

Sama dengan kolom yang dipilih server di `tampilData()`. Tidak ada password.

### `useFormSheet`

```tsx
const sheet = useFormSheet<Penyewa>();
```

Hook dari [FormSheet](/frontend/komponen/form-sheet) yang menyimpan keadaan sheet:

| Nilai | Gunanya |
| --- | --- |
| `sheet.open` | Sheet sedang terbuka. |
| `sheet.row` | Baris yang diedit, atau `null` untuk Tambah. |
| `sheet.buka(row?)` | Membuka sheet. Tanpa parameter berarti Tambah. |
| `sheet.tutup()` | Menutup sheet. |
| `sheet.versi` | Angka yang bertambah setiap kali sheet dibuka. |

### Tabel

```tsx
<DataTable
    baris={datapenyewa}
    kunci={(r) => r.idPenyewa}
    satuan="penyewa"
    cari={(r) => `${r.namaPenyewa} ${r.email} ${r.noHp}`}
    kolom={[
        { id: 'nama', label: 'Nama', tetap: true, urut: (r) => r.namaPenyewa, render: (r) => r.namaPenyewa },
        { id: 'hp', label: 'No HP', render: (r) => formatHp(r.noHp) },
        ...
    ]}
    aksi={(r) => <AksiBaris nama={r.namaPenyewa} onEdit={() => sheet.buka(r)} hapus={`/deletepenyewa/${r.idPenyewa}`} />}
    toolbarKanan={<Button onClick={() => sheet.buka()}>Tambah penyewa</Button>}
/>
```

- `kunci`: ID unik setiap baris, dipakai React untuk mengenali baris.
- `cari`: teks yang dicocokkan dengan kata pencarian.
- `kolom`: daftar kolom. `render` menentukan isi sel, `urut` membuat kolom bisa diurutkan, dan `tetap: true` membuat kolom tidak bisa disembunyikan.
- `aksi`: tombol di ujung baris. `AksiBaris` berisi ikon Edit dan ikon Hapus dengan dialog konfirmasi. Hapus dikirim sebagai `DELETE`.

`formatHp` menampilkan No HP dalam kelompok 4 angka, sama dengan `PhoneInput`.

### Form di dalam sheet

```tsx
<FormSheet open={sheet.open} onClose={sheet.tutup}>
    <FormPenyewa key={sheet.versi} row={sheet.row} onDone={sheet.tutup} />
</FormSheet>
```

`key={sheet.versi}` membuat `FormPenyewa` dibuat baru setiap kali sheet dibuka. Isi form selalu dimulai dari data baris yang dipilih, bukan sisa dari pembukaan sebelumnya.

### `FormPenyewa`

```tsx
const { data, setData, post, processing, errors } = useForm({
    txtid: row?.idPenyewa ?? '',
    txtnama: row?.namaPenyewa ?? '',
    txtnohp: row?.noHp ?? '',
    txtemail: row?.email ?? '',
    txtpassword: '',
});

post(row ? '/updatepenyewa' : '/insertpenyewa', { preserveState: true, preserveScroll: true, onSuccess: onDone });
```

- Nama field memakai awalan `txt`, sesuai controller master.
- `row ? ... : ...`: kalau ada baris, kirim ke update. Kalau tidak, kirim ke insert.
- `preserveState: true`: state halaman (pencarian, filter, halaman tabel) tetap setelah disimpan.
- `onSuccess: onDone`: sheet ditutup kalau berhasil. Kalau gagal, sheet tetap terbuka dengan pesan galat.

Field Password hanya muncul saat Tambah (`{!row && (...)}`). Admin tidak bisa mengubah password penyewa yang sudah ada.

`SheetForm` memberi kerangka sheet: judul, isi, dan tombol Batal serta Simpan di bawah.

## Aturan di file ini

- Tambah dan Edit memakai sheet di halaman ini, bukan halaman terpisah.
- Satu komponen form untuk Tambah dan Edit, dibedakan oleh `row`.
- Form diberi `key={sheet.versi}`.
- Alamat master (`/insertpenyewa`, dan seterusnya) ditulis langsung, karena route-nya tidak punya nama.

## FAQ

**Kenapa alamat ditulis langsung, bukan `route('...')`?**
Route master data dibuat tanpa nama, mengikuti template awal proyek. Halaman lain yang route-nya punya nama memakai `route('...')`.

**Menghapus penyewa yang punya booking. Apa yang terjadi?**
Server menolak, dan toast merah "Penyewa tidak bisa dihapus karena masih memiliki data booking." muncul.

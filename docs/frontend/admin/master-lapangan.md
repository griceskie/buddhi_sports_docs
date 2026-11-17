---
title: Master/Lapangan/TampilData.tsx
urutan: 4
---

# Master/Lapangan/TampilData.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Master/Lapangan/TampilData.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/tampillapangan`
- **Server:** [MasterLapanganController](/backend/controller/master-lapangan)
- **Pola dasar:** sama dengan [Master Penyewa](./master-penyewa)
:::

## Ringkasan

Halaman Data lapangan milik Admin. Susunannya sama dengan halaman Penyewa (tabel, lalu sheet Tambah dan Edit). Bagian barunya ada dua: **filter** di tabel (Jenis dan Status) dan **unggah foto** di form.

## Isi file

### Filter tabel

```tsx
filter={[
    { id: 'jenis', label: 'Jenis', nilai: (r) => r.jenisLapangan,
      opsi: [{ id: 'Bulu Tangkis', label: 'Bulu tangkis' }, { id: 'Basket', label: 'Basket' }] },
    { id: 'status', label: 'Status', nilai: (r) => r.status, opsi: [...] },
]}
```

Setiap filter tampil sebagai tombol bergaris putus-putus di atas tabel. `nilai` mengambil nilai baris yang dicocokkan dengan pilihan. Angka di samping setiap pilihan dihitung otomatis oleh [DataTable](/frontend/komponen/data-table).

### Kolom

- **Nama:** ikon olahraga 20px (dari `IKON_JENIS` di [jadwal.ts](/frontend/komponen/jadwal-ts)) dan nama lapangan. Foto tidak ditampilkan di tabel. Foto dilihat dan diubah di sheet Edit.
- **Tarif per jam:** `formatRupiah(50000)` menjadi "Rp50.000".
- **Status:** `CourtStatusBadge`, dibungkus `BadgeTip` yang menampilkan penjelasan saat disorot.

### Form: isi awal

```tsx
const { data, setData, post, processing, errors } = useForm<{
    txtid: number | string; txtnama: string; txtjenis: string; txttarif: string; txtstatus: string;
    fotoLama: string[]; foto: File[];
}>({
    ...
    fotoLama: row?.foto.map((f) => f.path) ?? [],
    foto: [],
});
```

- `fotoLama`: path foto yang sudah ada dan dipertahankan. Saat Edit dibuka, isinya semua foto lapangan itu.
- `foto`: file baru yang dipilih Admin.

Karena form berisi `File`, Inertia otomatis mengirimnya sebagai `multipart/form-data`, format yang dipakai browser untuk mengunggah file.

### Pratinjau foto baru

```tsx
const pratinjau = useMemo(() => data.foto.map((f) => URL.createObjectURL(f)), [data.foto]);
useEffect(() => () => pratinjau.forEach((u) => URL.revokeObjectURL(u)), [pratinjau]);
```

- `URL.createObjectURL(file)` membuat alamat sementara agar browser bisa menampilkan file yang belum diunggah.
- `useMemo` hanya membuat alamat baru kalau daftar file berubah.
- `useEffect` dengan fungsi yang dikembalikan menjalankan pembersihan: alamat lama dilepas (`revokeObjectURL`) saat daftar berubah atau sheet ditutup, supaya memori browser tidak terus terpakai.

### Batas jumlah foto

```tsx
const MAKS_FOTO = 6; // harus sama dengan FotoLapangan::MAKS di server
const sisa = MAKS_FOTO - lama.length - data.foto.length;
```

Kotak "Tambah foto" hanya tampil kalau `sisa > 0`. Saat memilih file, hanya `sisa` file pertama yang diambil (`.slice(0, sisa)`). Server tetap memeriksa ulang.

```tsx
onChange={(e) => {
    const dipilih = Array.from(e.target.files ?? []).slice(0, sisa);
    setData('foto', [...data.foto, ...dipilih]);
    e.target.value = '';
}}
```

`e.target.value = ''` mengosongkan pilihan input, supaya Admin bisa memilih file yang sama lagi setelah menghapusnya.

### Menghapus foto

- Foto lama: path-nya dikeluarkan dari `fotoLama`. File baru benar-benar dihapus dari server setelah Simpan.
- Foto baru: file dikeluarkan dari `foto`.

### Galat foto

```tsx
const galatFoto = errors.foto ?? Object.entries(errors).find(([k]) => k.startsWith('foto.'))?.[1];
```

Laravel menulis galat per file dengan nama seperti `foto.0` atau `foto.2`. Baris ini mengambil galat `foto` umum, atau galat file pertama yang bermasalah.

### Kolom tarif

`CurrencyInput` menampilkan angka dengan titik ribuan ("50.000") dan mengembalikan angka murni. Nilainya disimpan di form sebagai teks.

## Aturan di file ini

- `MAKS_FOTO` harus sama dengan `FotoLapangan::MAKS` di server.
- Pilihan jenis dan status sama dengan daftar `in:` di controller.
- Foto pertama dipakai sebagai foto utama di Home.

## FAQ

**Bagaimana mengubah urutan foto?**
Belum ada fitur geser untuk mengurutkan. Foto lama tetap di depan, dan foto baru ditambahkan di belakang. Untuk mengganti foto utama, hapus foto pertama, lalu unggah ulang sesuai urutan yang diinginkan.

**Kenapa label "Dalam perbaikan" berbeda dengan nilai `Perbaikan`?**
Nilai di database pendek dan tetap (`Perbaikan`). Label di layar ditulis lebih jelas untuk manusia.

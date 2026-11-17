---
title: Master/Pembayaran/TampilData.tsx
urutan: 6
---

# Master/Pembayaran/TampilData.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Master/Pembayaran/TampilData.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/tampilpembayaran?periode=YYYY-MM`
- **Server:** [MasterPembayaranController](/backend/controller/master-pembayaran) dan, untuk Terima atau Tolak, [AdminDashboardController](/backend/controller/admin-dashboard)
- **Pola dasar:** sama dengan [Master Penyewa](./master-penyewa)
- **Komponen penting:** [DrawerVerifikasi](/frontend/komponen/drawer-verifikasi), `PeriodPicker`, `ProofPreview`, [DataTable](/frontend/komponen/data-table)
:::

## Ringkasan

Halaman Data pembayaran milik Admin, per bulan. Dibanding halaman master lain, ada tiga tambahan:

1. **Pemilih periode** di samping judul. Mengganti bulan memuat ulang data bulan itu.
2. **Kartu status** (Semua, Menunggu verifikasi, Terverifikasi, Ditolak) yang sekaligus menjadi filter tabel.
3. **Klik baris membuka panel verifikasi** ([DrawerVerifikasi](/frontend/komponen/drawer-verifikasi)), tempat Admin menerima atau menolak bukti.

Kalau laporan bulan itu sudah diserahkan, halaman menampilkan catatan terkunci. Tombol Edit dan Hapus diganti ikon gembok, dan Tambah dinonaktifkan.

## Isi file

### Pemilih periode

```tsx
const ubahPeriode = (p: Period) =>
    router.get('/tampilpembayaran', { periode: `${p.tahun}-${String(p.bulan).padStart(2, '0')}` },
        { preserveScroll: true, preserveState: true, replace: true });
```

- `router.get` meminta halaman yang sama dengan `?periode=2026-10`.
- `preserveState: true`: isi pencarian dan pengaturan tabel tetap.
- `replace: true`: tidak menambah riwayat browser, jadi tombol Kembali tidak melewati setiap bulan yang pernah dipilih.

### Kartu status sebagai filter

```tsx
const [filterStatus, setFilterStatus] = useState<NilaiFilter>({});

<button role="tab" aria-selected={aktif} onClick={() => setFilterStatus(t.id === 'semua' ? {} : { status: [t.id] })}>
```

Filter tabel biasanya diatur di dalam `DataTable`. Di halaman ini, halaman yang memegangnya (`nilaiFilter` dan `onNilaiFilter`), supaya kartu di atas tabel bisa mengubahnya. Filter `status` di tabel diberi `tersembunyi: true`, sehingga tidak tampil dua kali.

`role="tab"` dan `aria-selected` membuat pembaca layar membaca kartu-kartu itu sebagai tab.

### Panel verifikasi

```tsx
const menunggu = bukti.filter((b) => b.status === 'Menunggu Verifikasi');
const buktiDitinjau = bukti.find((b) => b.idPembayaran === ditinjau) ?? null;
const posisi = buktiDitinjau ? menunggu.findIndex(...) : -1;
```

- `bukti`: semua bukti bulan itu dalam bentuk untuk panel, dari server.
- `ditinjau`: ID pembayaran yang sedang dibuka di panel, atau `null`.
- `posisi`: urutan bukti itu di antrean menunggu. Panel memakainya untuk tombol sebelumnya dan berikutnya.

#### `putuskan()`

```tsx
const putuskan = (aksi: 'terima' | 'tolak', alasan?: string) => {
    const lanjut = posisi >= 0 ? (menunggu[posisi + 1] ?? (posisi > 0 ? menunggu[0] : null)) : null;
    router.post(route(`verifikasi.${aksi}`, buktiDitinjau.idPembayaran), aksi === 'tolak' ? { alasan } : {}, {
        onError: (e) => setGalatAlasan(e.alasan),
        onSuccess: () => setDitinjau(lanjut?.idPembayaran ?? null),
    });
};
```

1. Tentukan bukti berikutnya sebelum mengirim: yang setelahnya di antrean, atau yang pertama kalau ini yang terakhir.
2. Kirim ke `POST /verifikasi/{id}/terima` atau `/tolak`. Nama route-nya dibuat dari teks: `` `verifikasi.${aksi}` ``.
3. Kalau berhasil, panel langsung menampilkan bukti berikutnya ("Terima & berikutnya"). Kalau antrean habis, panel tertutup.
4. Kalau alasan penolakan ditolak server (misalnya kosong), pesannya tampil di panel.

### Form Edit Pembayaran

- Saat Edit, sheet menampilkan bukti transfer di atas form (`ProofPreview`), dibuka lewat route privat `pembayaran.bukti`.
- Kalau pembayaran sudah `Terverifikasi`, statusnya hanya bisa dibaca, dan ada catatan bahwa status final. Field lain masih bisa dikoreksi selama bulannya belum terkunci.
- Pilihan status di form hanya Menunggu verifikasi dan Ditolak. `Terverifikasi` hanya didapat lewat tombol Terima di panel.
- Kolom alasan wajib kalau status Ditolak.
- Kolom bukti berisi path file, dan server hanya menerima path di folder `bukti/`.

## Aturan di file ini

- Keputusan menerima bukti selalu lewat panel verifikasi, bukan lewat form.
- Saat `terkunci` bernilai benar, tidak ada tombol yang bisa mengubah data bulan itu.
- Jumlah rata kanan, supaya angka rupiah mudah dibandingkan.

## FAQ

**Kenapa pembayaran bulan lalu tidak muncul?**
Halaman menampilkan satu bulan menurut tanggal bayar. Pilih bulan lain di pemilih periode.

**Apa bedanya Terima di sini dan di dashboard?**
Tidak ada. Keduanya memakai panel dan route yang sama. Di dashboard, antreannya mencakup semua bulan. Di sini, hanya bulan yang dipilih.

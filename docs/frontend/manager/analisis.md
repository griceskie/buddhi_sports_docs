---
title: Manager/Analisis.tsx
urutan: 2
---

# Manager/Analisis.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Manager/Analisis.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/manager/analisis`, route `manager.analisis`
- **Server:** `ManagerController::analisis()` dan [AnalitikBisnis](/backend/support/analitik-bisnis)
- **Komponen penting:** `Components/manager/analisis/` (`PemilihPeriode`, `TabPendapatan`, `TabPenyewa`, `TabPola`, `TabAdmin`, dan [bagian.tsx](/frontend/komponen/analisis-bagian))
:::

## Ringkasan

Halaman Analisis bisnis milik Manager. Di atas ada judul periode ("Analisis Oktober 2026"), badge "Belum final" kalau angkanya masih bisa berubah, dan pemilih periode. Di bawahnya ada empat tab: **Pendapatan**, **Penyewa**, **Pola booking**, dan **Kinerja Admin**.

Halaman ini tidak menghitung apa pun. Semua angka, persen, dan kalimat sudah disiapkan oleh [AnalitikBisnis](/backend/support/analitik-bisnis) di server. React hanya menampilkannya.

## Isi file

### Props

| Props | Isinya |
| --- | --- |
| `periode` | Periode dan tab yang sedang dibuka: `jenis`, `th`, `bl`, `q`, `rentang`, `dari`, `sampai`, `tab`. |
| `pilihan` | Tahun, bulan, dan kuartal yang bisa dipilih, serta pilihan rentang. |
| `judul`, `deskripsi` | Judul dan keterangan periode, sudah jadi. |
| `belumFinal` | Alasan angkanya belum final, atau `null`. |
| `rentangTeks` | Teks rentang tanggal untuk pemilih periode. |
| `data` | Isi tab yang dibuka. Bentuknya berbeda untuk setiap tab. |

Server hanya mengirim data untuk satu tab. Pindah tab berarti meminta halaman lagi.

### `kunjungi()`

```tsx
const kunjungi = (ubah: Partial<Periode> | Tujuan) => {
    const p = { ...periode, ...ubah } as Periode;
    const query = { jenis: p.jenis, tab: p.tab };
    if (p.jenis === 'bulan') Object.assign(query, { th: p.th, bl: p.bl });
    ...
    setMemuat(true);
    router.get(route('manager.analisis'), query, { preserveScroll: true, preserveState: true });
};
```

Satu fungsi untuk semua perubahan: ganti tab, ganti periode, atau klik batang grafik.

1. Gabungkan periode sekarang dengan perubahan.
2. Susun query string hanya dengan isian yang dipakai jenis periode itu. Bulanan butuh tahun dan bulan, kuartal butuh tahun dan kuartal, dan seterusnya.
3. Minta halaman lagi.

`Partial<Periode>` berarti objek dengan sebagian isian `Periode` saja. `Tujuan` adalah isian yang dibawa batang grafik saat diklik, dikirim server di setiap batang.

Karena periode dan tab disimpan di alamat, halaman bisa dibagikan, ditandai, atau dibuka ulang dengan tampilan yang sama.

### Tanda memuat

```tsx
const [memuat, setMemuat] = useState(false);
useEffect(() => router.on('finish', () => setMemuat(false)), []);
...
<div aria-busy={memuat} className={cn('...', memuat && 'opacity-60')}>
```

Selama data baru dimuat, isi tab dibuat agak pudar. `router.on('finish', ...)` mengembalikan fungsi untuk berhenti mendengarkan, dan `useEffect` memanggilnya saat halaman ditinggalkan.

`aria-busy` memberi tahu pembaca layar bahwa isi bagian itu sedang dimuat.

### Tab

```tsx
{periode.tab === 'penyewa' ? <TabPenyewa data={data as DataPenyewa} onPilih={kunjungi} />
 : periode.tab === 'pola' ? <TabPola key={kunciPeriode} data={data as DataPola} />
 : ...}
```

`data as DataPenyewa` memberi tahu TypeScript bentuk data untuk tab itu. TypeScript tidak bisa menebaknya sendiri dari nilai `tab`.

`TabPola` diberi `key` dari periode, supaya pilihan di dalamnya (misalnya hari yang disorot di peta) bersih setiap kali periode berganti.

### Mencegah halaman melebar

```tsx
<div className="flex flex-col gap-6 [contain:inline-size]">
```

Grafik dan peta panas bisa lebih lebar dari layar dan punya scroll sendiri. Tanpa `contain: inline-size`, lebar alaminya mendorong seluruh layout panel ikut melebar, terutama di layar 768px.

## Aturan di file ini

- Jangan menghitung angka atau menyusun kalimat dari angka di React. Tambahkan di `AnalitikBisnis`.
- Setiap perubahan periode atau tab lewat `kunjungi()`, supaya alamat selalu cocok dengan tampilan.

## FAQ

**Batang grafik bergaris. Apa artinya?**
Bulan itu belum final: laporannya belum diperiksa Manager, masih direvisi, atau bulannya masih berjalan. Arahkan kursor ke badge "Belum final" untuk membaca alasannya.

**Kenapa halaman membuka bulan lalu?**
Bulan lalu sudah lengkap. Pilihan ini masih terbuka untuk diubah pemilik proyek.

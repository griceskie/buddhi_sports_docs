---
title: AdminSidebarLayout.tsx
urutan: 3
---

# AdminSidebarLayout.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Layouts/AdminSidebarLayout.tsx` (26 baris)
- **Jenis:** layout React (TSX)
- **Dipakai oleh:** semua halaman Admin dan Manager yang aktif
- **Berhubungan dengan:** [AdminSidebar](/frontend/komponen/admin-sidebar), `Components/pengelola/HeaderPengelola.tsx`, `Components/pengelola/JudulHalaman.tsx`, `Components/ui/sidebar.tsx`
:::

## Ringkasan

Bingkai panel pengelola: sidebar di kiri yang bisa diciutkan menjadi ikon, header di atas (judul halaman, notifikasi, tombol tema, menu akun), lalu isi halaman. Menu di sidebar mengikuti peran: Admin dan Manager melihat menu berbeda.

Masih ada layout lama, `AdminLayout.tsx`, dengan menu di atas. Layout itu hanya dipakai dua halaman lama (`Master/Admin` dan `Master/Manager`) yang tidak bisa dibuka lagi dari aplikasi, dan sengaja dibiarkan.

## Isi file

```tsx
export default function AdminSidebarLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const { url, props } = usePage<PageProps>();
    const pengelola = props.pengelola;

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset className="bg-canvas">
                {pengelola && <HeaderPengelola judul={judulHalamanPengelola(url, pengelola.role)} pengelola={pengelola} />}
                <main className="flex w-full flex-col gap-6 p-4 text-sm sm:p-6">
                    {header && <div>{header}</div>}
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
```

### Bagian-bagiannya

| Bagian | Gunanya |
| --- | --- |
| `usePage<PageProps>()` | Membaca alamat halaman (`url`) dan props bersama, termasuk `pengelola`. |
| `SidebarProvider` | Menyimpan status sidebar (terbuka atau diciutkan) untuk semua bagian di dalamnya. Status ini juga disimpan di cookie `sidebar_state`, jadi tetap sama setelah pindah halaman. |
| `AdminSidebar` | Sidebar dengan menu sesuai peran dan badge angka. |
| `SidebarInset` | Area di sebelah sidebar. Lebarnya menyesuaikan saat sidebar diciutkan. |
| `HeaderPengelola` | Header atas. Judulnya diambil dari label menu yang sedang aktif lewat `judulHalamanPengelola`. |
| `main` | Isi halaman. Jarak tepi 16px di HP dan 24px mulai 640px, jarak antarbagian 24px, teks dasar 14px. |
| `header` | Judul halaman di dalam isi. Halaman mengirim `<JudulHalaman judul="..." deskripsi="...">` beserta tombol aksi di kanan. |

`usePage<PageProps>()` memakai `<PageProps>` untuk memberi tahu TypeScript bentuk props, sehingga `props.pengelola` dikenali.

### Cara pakai di halaman

```tsx
<AdminSidebarLayout
    header={
        <JudulHalaman judul="Booking" deskripsi="Semua booking lapangan.">
            <Button onClick={sheet.bukaTambah}>Tambah booking</Button>
        </JudulHalaman>
    }
>
    <Head title="Booking" />
    <DataTable ... />
</AdminSidebarLayout>
```

## Pintasan dan perilaku

- **Ctrl+B** atau **Cmd+B**: menciutkan atau membuka sidebar.
- Di HP, sidebar muncul sebagai sheet dari kiri. Tombolnya ada di header.
- Saat diciutkan, sidebar hanya menampilkan ikon. Label menu muncul sebagai tooltip saat ikon disorot.

## Aturan di file ini

- Setiap halaman Admin dan Manager baru memakai layout ini.
- Judul di header atas berasal dari label menu. Halaman baru yang punya menu sendiri cukup ditambahkan ke daftar menu di `AdminSidebar.tsx`.
- Halaman tidak membuat jarak tepi sendiri. `main` sudah menyediakannya.

## FAQ

**Kenapa ada dua judul, di header atas dan di dalam isi?**
Header atas selalu menunjukkan bagian aplikasi yang sedang dibuka, juga saat halaman digulir. Judul di dalam isi (`JudulHalaman`) membawa penjelasan dan tombol aksi halaman itu, mengikuti rancangan di kanvas.

**Sidebar tidak muncul atau menu dropdown-nya tidak terlihat. Apa penyebabnya?**
Biasanya karena komponen yang dipakai sebagai target `render` milik Base UI tidak memakai `React.forwardRef`. Di React 18, popup tidak bisa menempel ke komponen seperti itu dan muncul tak terlihat di pojok kiri atas.

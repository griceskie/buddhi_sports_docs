---
title: Komponen ui/
urutan: 6
---

# Komponen ui/

::: info Tentang halaman ini
- **Lokasi:** `resources/js/Components/ui/` (sekitar 45 file)
- **Jenis:** komponen dasar React (TSX), gaya shadcn di atas Base UI
- **Sumber rancangan:** artifact Design System Buddhi Sports dan Design System Administrator
- **Lihat juga:** `panduan.md` di repo aplikasi untuk warna, huruf, dan sudut
:::

## Ringkasan

`ui/` berisi komponen dasar yang dipakai di seluruh aplikasi: tombol, isian, dialog, tabel, dan seterusnya. Bentuknya mengikuti [shadcn/ui](https://ui.shadcn.com), tetapi dibangun di atas **Base UI**, pustaka komponen tanpa gaya yang mengurus perilaku dan aksesibilitas (fokus, keyboard, ARIA).

File-file ini jarang diubah. Halaman dan komponen aplikasi cukup memakainya. Sebelum membuat komponen baru, periksa folder ini lebih dulu.

## Daftar komponen

### Dasar

| File | Isinya |
| --- | --- |
| `button.tsx` | `Button` dan `buttonVariants`. Varian: `default`, `elevated` (tombol utama yang timbul, satu per halaman), `outline`, `secondary`, `ghost`, `destructive` (merah lembut), `link`. |
| `input.tsx`, `textarea.tsx`, `label.tsx` | Isian dan label. `Input` dan `Textarea` memakai `forwardRef`. |
| `checkbox.tsx`, `radio-group.tsx`, `switch.tsx` | Pilihan. `Checkbox` berupa `span` inline, jadi beri `className="flex"` di luar baris flex. |
| `select.tsx`, `combobox.tsx` | Pilihan dari daftar. Dibungkus `FormSelect` dan `FormCombobox` untuk form. |
| `badge.tsx` | `Badge`, ditambah `PaymentStatusBadge`, `BookingStatusBadge`, dan `CourtStatusBadge`. |
| `card.tsx`, `separator.tsx`, `skeleton.tsx`, `empty.tsx`, `alert.tsx` | Kartu, garis pemisah, kotak muat, keadaan kosong, kotak peringatan. |

### Lapisan di atas halaman

| File | Isinya |
| --- | --- |
| `dialog.tsx`, `alert-dialog.tsx` | Dialog biasa dan dialog konfirmasi. |
| `sheet.tsx` | Panel samping. Selebar layar di HP, `max-w-md` mulai 640px, dengan latar diburamkan. |
| `popover.tsx`, `tooltip.tsx`, `dropdown-menu.tsx` | Popup kecil, tooltip, menu. |
| `toast.tsx` | `Toaster` dan `toast.success()` / `toast.error()`. |
| `sidebar.tsx` | Sidebar panel pengelola, dengan API shadcn Sidebar. |

### Tanggal, waktu, dan uang

| File | Isinya |
| --- | --- |
| `format.ts` | `formatRupiah` ("Rp50.000"), `formatTanggal`, `formatJam` ("08.00"), `rentangJam` ("16.00–18.00"), `toMinutes`, `durationHours`, `bookingTotal`, `BULAN`. |
| `calendar.tsx`, `date-picker.tsx` | Kalender dan tombol pemilih tanggal. |
| `date-input.tsx` | Isian tanggal yang bisa diketik: "8 6" menjadi 08/06/tahun ini. Nilainya tetap `YYYY-MM-DD`. |
| `period-picker.tsx` | Pemilih bulan dan tahun. |
| `currency-input.tsx` | Isian rupiah dengan titik ribuan. |

### Khusus aplikasi booking

| File | Isinya |
| --- | --- |
| `slot-picker.tsx` | Kotak-kotak jam, dengan varian `compact`. Dipakai [KartuJam](/frontend/komponen/kartu-jam). |
| `court-card.tsx`, `booking-summary.tsx`, `booking-timeline.tsx` | Kartu lapangan, ringkasan booking, lini waktu. Bagian dari sistem desain, sebagian tidak lagi dipakai halaman. |
| `proof-review.tsx` | `ProofReview` dan `ProofPreview` untuk menampilkan bukti bayar. |
| `file-upload.tsx`, `attachment.tsx` | Unggah file dan baris file terpilih. |
| `signature-pad.tsx` | Kanvas tanda tangan, keluarannya JPEG. |
| `stepper.tsx`, `stat-card.tsx`, `chart.tsx` | Langkah bernomor, kartu angka, grafik pemasukan. |
| `table.tsx`, `pagination.tsx`, `search-input.tsx` | Tabel, halaman, kolom cari. |
| `tabs.tsx` | Tab gaya shadcn `base-nova`, dengan `TabsIndicator` (garis bawah yang bergeser). |

## Hal yang perlu diketahui

### Target `render` harus `forwardRef`

Base UI sering memakai props `render` untuk mengganti elemen, misalnya `<DropdownMenuTrigger render={<SidebarMenuButton />}>`. Di React 18, komponen yang dipakai sebagai target harus memakai `React.forwardRef`. Kalau tidak, popup tidak bisa menempel ke elemen itu dan muncul tak terlihat di pojok kiri atas.

`Button` tidak memakai `forwardRef`. Karena itu, untuk pemicu popup, pasang kelas `buttonVariants()` langsung pada pemicunya, bukan `render={<Button />}`.

### Jangan pasang ulang lewat CLI

`npx shadcn add` membaca alias `@/components/...` (huruf kecil), sedangkan foldernya `Components`. CLI juga menawarkan untuk menimpa file yang sudah disesuaikan, misalnya `button.tsx`. Lebih aman menyalin kode dari situs shadcn secara manual.

### Warna dari token

Komponen memakai token (`bg-primary`, `text-muted-foreground`, `border`), bukan warna mentah seperti `gray-500`. Token ini dipetakan ke warna iOS di `resources/css/app.css`, dan ke tema panel di `resources/css/admin.css`.

## Aturan

- Gunakan komponen `ui/` sebelum membuat sendiri.
- Perubahan di `ui/` berpengaruh ke seluruh aplikasi. Periksa halaman penyewa dan panel pengelola setelah mengubahnya.
- Setelah komponen `ui/` berubah, artifact Design System perlu disinkronkan.

## FAQ

**Apa bedanya `Components/ui/` dan `Components/`?**
`ui/` berisi komponen dasar yang tidak tahu apa-apa tentang booking atau lapangan. `Components/` berisi komponen yang khusus untuk aplikasi ini dan memakai komponen `ui/`.

---
title: Manager/Pemantauan.tsx
urutan: 1
---

# Manager/Pemantauan.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Manager/Pemantauan.tsx` (7 baris)
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/dashboard-manager`, route `dashboard.manager`
- **Server:** `ManagerController::dashboard()` (lihat [ManagerController](/backend/controller/manager))
- **Isi sebenarnya:** [Dashboard/Admin.tsx](/frontend/admin/dashboard-admin)
:::

## Ringkasan

Halaman pertama Manager setelah login. Isinya sama dengan dashboard Admin, tetapi hanya untuk dilihat. Manager bisa memantau apa yang terjadi hari ini dan apa yang masih harus diselesaikan Admin, tanpa bisa mengubahnya.

File ini hanya pembungkus. Seluruh tampilannya ada di `Dashboard/Admin.tsx`.

## Isi file

```tsx
import AdminDashboard, { Aktivitas } from '@/Pages/Dashboard/Admin';
import { ComponentProps } from 'react';

export default function Pemantauan({ aktivitas, ...props }: Omit<ComponentProps<typeof AdminDashboard>, 'pemantauan' | 'terbaru'> & { aktivitas: Aktivitas[] }) {
    return <AdminDashboard {...props} pemantauan={{ aktivitas }} />;
}
```

### Tipe props

`ComponentProps<typeof AdminDashboard>` mengambil tipe props dashboard Admin secara otomatis. `Omit<..., 'pemantauan' | 'terbaru'>` membuang dua props yang tidak dikirim server untuk Manager. Lalu `& { aktivitas }` menambah props khusus Manager.

Dengan cara ini, kalau props dashboard Admin berubah, tipe halaman ini ikut berubah tanpa ditulis ulang.

### Isi

- `aktivitas` diambil dari props.
- `...props` (sisa props) diteruskan apa adanya.
- `pemantauan={{ aktivitas }}` menyalakan mode Pemantauan di dashboard.

## Apa yang berbeda dalam mode Pemantauan

| Bagian | Admin | Manager (Pemantauan) |
| --- | --- | --- |
| Tombol Tambah booking | Ada | Tidak ada |
| Kartu antrean | "Perlu tindakan", tombol Tinjau | "Hal yang masih harus diselesaikan Admin", tanpa tombol, dengan lama menunggu di jam buka |
| Blok bukti di jadwal | Bisa diklik untuk meninjau | Hanya tampilan |
| Kartu bawah | Booking terbaru | Aktivitas hari ini |
| Pembaruan | Saat halaman dibuka | Otomatis setiap 30 detik, berhenti setelah 30 menit tanpa sentuhan |

## Aturan di file ini

- Jangan menambah tampilan di file ini. Ubah `Dashboard/Admin.tsx` dan bedakan dengan `pemantauan`.

## FAQ

**Kenapa Manager tidak punya grafik pendapatan di halaman pertamanya?**
Grafik dan angka bisnis pindah ke halaman [Analisis bisnis](./analisis). Halaman pertama Manager sekarang fokus pada hari ini.

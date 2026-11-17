---
title: app.tsx
urutan: 1
---

# app.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/app.tsx`
- **Jenis:** pintu masuk frontend (TSX)
- **Dimuat oleh:** `resources/views/app.blade.php` lewat Vite
- **Berhubungan dengan:** [types](./types) (`PageProps`), `Components/ui/toast.tsx`, `Components/pengelola/tema.ts`, [HandleInertiaRequests](/backend/route/handle-inertia-requests)
:::

## Ringkasan

File ini adalah titik awal semua kode React. Isinya pendek, tetapi tiga hal penting terjadi di sini:

1. Inertia dijalankan, dan diberi tahu cara menemukan file halaman dari nama yang dikirim controller.
2. Pesan flash dari server (`success` dan `error`) diubah menjadi toast, di halaman mana pun.
3. Tema panel pengelola dipasang atau dilepas setiap kali pindah halaman.

## Posisinya dalam alur

```text
Browser membuka /booking
  └─ Laravel: BookingPenyewaController::daftar() → Inertia::render('Booking', props)
       └─ app.blade.php memuat app.tsx
            └─ createInertiaApp → resolve('Booking') → ./Pages/Booking.tsx
                 └─ <Booking {...props} /> ditampilkan
```

Penjelasan lengkap alur ini ada di [Cara kerja aplikasi](/mulai/cara-kerja).

## Isi file

### Impor

```tsx
import '../css/app.css';
import './bootstrap';
```

- `app.css` berisi Tailwind, token warna, dan skala tipografi. Mengimpornya di sini membuat CSS berlaku di seluruh aplikasi.
- `bootstrap.ts` menyiapkan axios (pengirim permintaan HTTP), warisan Breeze.

### `tampilkanFlash()`

```tsx
const tampilkanFlash = (flash?: PageProps['flash']) => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
};
```

Controller mengirim pesan dengan `back()->with('success', '...')`. Pesan itu sampai ke React sebagai props `flash`. Fungsi ini menampilkannya sebagai toast hijau atau merah di bagian bawah layar.

`flash?.success` memakai `?.`, yang berarti "baca `success` kalau `flash` ada". Kalau `flash` tidak ada, hasilnya `undefined` dan tidak ada galat.

### `createInertiaApp`

```tsx
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) { ... },
    progress: { color: '#4B5563' },
});
```

| Pilihan | Gunanya |
| --- | --- |
| `title` | Judul tab browser. Halaman yang memakai `<Head title="Booking saya" />` menjadi "Booking saya - Buddhi Sports". |
| `resolve` | Mengubah nama halaman dari controller menjadi file. `'Master/Booking/TampilData'` menjadi `./Pages/Master/Booking/TampilData.tsx`. |
| `setup` | Menempelkan React ke halaman HTML. |
| `progress` | Warna garis tipis di atas layar saat pindah halaman. |

`import.meta.glob('./Pages/**/*.tsx')` meminta Vite mengumpulkan semua file halaman. Vite memecahnya menjadi file terpisah, jadi browser hanya memuat halaman yang sedang dibuka.

### `setup()`

```tsx
root.render(
    <>
        <App {...props} />
        <Toaster />
    </>,
);
```

- `<App>` adalah halaman Inertia yang sedang aktif.
- `<Toaster />` adalah tempat toast muncul. Karena dipasang di luar halaman, toast tetap terlihat saat pindah halaman.
- `<>...</>` (fragment) membungkus dua elemen tanpa menambah elemen HTML.

Setelah itu ada dua pasang langkah, masing-masing untuk halaman pertama dan halaman berikutnya:

```tsx
tampilkanFlash(props.initialPage.props.flash);
router.on('success', (event) => tampilkanFlash(event.detail.page.props.flash));

sinkronTemaPanel(!!props.initialPage.props.temaPanel);
router.on('navigate', (event) => sinkronTemaPanel(!!event.detail.page.props.temaPanel));
```

- `props.initialPage` adalah halaman pertama yang dibuka.
- `router.on('success', ...)` berjalan setiap kali permintaan Inertia berhasil, termasuk setelah mengirim form.
- `router.on('navigate', ...)` berjalan setiap kali pindah halaman.
- `!!nilai` mengubah nilai apa pun menjadi `true` atau `false`.

`as unknown as PageProps` memberi tahu TypeScript bentuk props yang sebenarnya. Tipe bawaan Inertia terlalu umum, jadi perlu diarahkan.

### Tema panel

`sinkronTemaPanel(aktif)` (di `Components/pengelola/tema.ts`) memasang kelas `tema-pengelola` di elemen `<html>` untuk halaman Admin, Manager, dan login pengelola. Kelas `dark` juga dipasang kalau pengelola memilih mode gelap, yang disimpan per perangkat di cookie `tema_pengelola`. Halaman penyewa selalu terang.

Kelas dipasang di `<html>`, bukan di dalam halaman, supaya dropdown, dialog, dan sheet yang muncul di luar halaman (portal) ikut bertema.

Pemasangan pertama sebelum React berjalan ada di skrip kecil di `app.blade.php`, supaya halaman tidak sempat berkedip terang dulu.

## Aturan di file ini

- Jangan menampilkan flash di halaman masing-masing. Semua flash sudah ditangani di sini sebagai toast.
- Halaman baru cukup dibuat di `resources/js/Pages/`. Tidak perlu didaftarkan di mana pun.
- Agar sebuah halaman memakai tema panel, controller tidak perlu melakukan apa-apa. Props `temaPanel` diatur di [HandleInertiaRequests](/backend/route/handle-inertia-requests).

## FAQ

**Toast muncul dua kali setelah partial reload. Kenapa?**
Itu terjadi kalau `flash` tidak dikirim ulang dan halaman masih membawa flash lama. Karena itu `flash` dikirim dengan `Inertia::always` di [HandleInertiaRequests](/backend/route/handle-inertia-requests), supaya selalu diperbarui.

**Bagaimana menampilkan toast dari kode React sendiri, tanpa server?**
Impor `toast` dari `@/Components/ui/toast`, lalu panggil `toast.success('...')` atau `toast.error('...')`.

**Kenapa `appName` bisa berisi "Laravel"?**
Itu nilai cadangan kalau `VITE_APP_NAME` tidak ada di `.env`. Di proyek ini, `.env.example` mengisi `APP_NAME="Buddhi Sports"`, dan Vite membacanya lewat `VITE_APP_NAME="${APP_NAME}"`.

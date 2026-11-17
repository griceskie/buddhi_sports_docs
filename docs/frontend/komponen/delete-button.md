---
title: DeleteButton.tsx
urutan: 20
---

# DeleteButton.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/DeleteButton.tsx` (66 baris)
- **Jenis:** komponen React (TSX)
- **Dipakai oleh:** `Components/pengelola/AksiBaris.tsx` (semua tabel master Admin) dan [Data admin Manager](/frontend/manager/admin)
- **Memakai:** `ui/alert-dialog`
:::

## Ringkasan

Tombol Hapus yang selalu meminta konfirmasi dulu. Menekannya membuka dialog "Hapus data?" dengan tombol **Batal** dan **Hapus**. Baru setelah Hapus ditekan, permintaan dikirim ke server.

Ada dua bentuk tombol:

- **dengan `label`**: ikon tempat sampah saja, abu-abu dan berubah merah saat disorot. Dipakai di tabel panel pengelola. `label` menjadi nama tombol untuk pembaca layar, misalnya "Hapus Airlangga".
- **tanpa `label`**: tombol merah kecil bertuliskan "Hapus". Bentuk lama.

## Isi file

### Props

| Props | Gunanya |
| --- | --- |
| `href` | Alamat yang dikunjungi saat Hapus dikonfirmasi. |
| `message` | Kalimat di dialog. Bawaannya "Yakin ingin menghapus data ini? Tindakan ini tidak bisa dibatalkan." |
| `method` | `'get'` (bawaan) atau `'delete'`. |
| `label` | Kalau diisi, tombol berupa ikon saja dengan nama ini. |

### Mengirim

```tsx
<AlertDialogAction variant="destructive" onClick={() => router.visit(href, { method, preserveScroll: true })}>
    Hapus
</AlertDialogAction>
```

`router.visit` dari Inertia mengunjungi alamat dengan metode yang dipilih. `preserveScroll: true` membuat halaman tidak melompat ke atas setelah data terhapus.

### Tentang `method`

Komentar di kode masih menyebut route master menghapus dengan GET. Itu sudah tidak berlaku: kelima route `/delete*` sekarang `Route::delete`, dan permintaan GET ke sana ditolak. `AksiBaris` selalu mengirim `method="delete"`.

Nilai bawaan `'get'` hanya tersisa untuk dua halaman lama yang tidak dipakai (`Master/Admin` dan `Master/Manager`).

## Aturan di file ini

- Setiap tombol hapus di aplikasi memakai komponen ini, supaya selalu ada konfirmasi.
- Untuk tombol baru, selalu kirim `method="delete"`.
- Kalau server menolak (misalnya karena data masih dipakai tabel lain), toast merah dari server menjelaskan alasannya.

## FAQ

**Kenapa hapus harus memakai DELETE, bukan GET?**
Permintaan GET bisa terpicu tanpa sengaja, misalnya dari tautan, gambar, atau browser yang memuat halaman lebih dulu. Mengubah data lewat GET berbahaya. DELETE hanya terkirim kalau memang disengaja, dan dilindungi token CSRF.

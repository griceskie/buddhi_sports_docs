---
title: Manager/Admin.tsx
urutan: 6
---

# Manager/Admin.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Manager/Admin.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/manager/admin`, route `manager.admin`
- **Server:** `ManagerController::admin()`, `tambahAdmin()`, `resetPasswordAdmin()`, dan `hapusAdmin()` (lihat [ManagerController](/backend/controller/manager))
- **Komponen penting:** [FormSheet](/frontend/komponen/form-sheet), [DeleteButton](/frontend/komponen/delete-button), `Tooltip`
:::

## Ringkasan

Halaman Data admin, satu-satunya tempat akun Admin dikelola. Manager bisa:

- melihat daftar Admin: inisial, nama, username, aktivitas terakhir, dan di data mana saja Admin itu tercatat
- menambah Admin baru
- mereset password Admin
- menghapus Admin yang belum tercatat di data mana pun.

## Isi file

### Tabel

Halaman ini memakai `Table` biasa, bukan `DataTable`, karena jumlah Admin sedikit dan tidak perlu pencarian.

Kolom "Tercatat di" diisi dari tiga angka server (`pembayaran`, `laporan`, `booking`), misalnya "12 pembayaran, 2 laporan". Kalau semuanya 0, isinya "—".

### Tombol per baris

```tsx
<Button aria-label={`Reset password ${a.namaAdmin}`} onClick={() => sheet.buka(a)}><KeyRound /></Button>
{dipakai ? (
    <Tooltip>
        <TooltipTrigger render={<span tabIndex={0} className="... cursor-not-allowed ..." />}>
            <Trash2 aria-label={`${a.namaAdmin} tidak bisa dihapus`} />
        </TooltipTrigger>
        <TooltipContent>Tidak bisa dihapus: masih tercatat di {dipakai}.</TooltipContent>
    </Tooltip>
) : (
    <DeleteButton href={route('manager.admin.hapus', a.idAdmin)} method="delete" ... />
)}
```

- **Reset password**: membuka sheet dengan form password baru.
- **Hapus**: kalau Admin masih tercatat di data lain, tombolnya diganti ikon redup dengan tooltip yang menjelaskan alasannya. Kalau tidak, `DeleteButton` meminta konfirmasi lalu mengirim `DELETE`.

Ikon nonaktif dibungkus `span` dengan `tabIndex={0}`, supaya tooltip tetap bisa dibuka dengan keyboard. Tombol `disabled` biasa tidak bisa difokuskan, jadi tooltip-nya tidak akan pernah terlihat oleh pengguna keyboard.

Server juga menolak penghapusan lewat foreign key, jadi aturan ini aman walaupun tampilannya dilewati.

### Satu sheet, dua form

```tsx
<FormSheet open={sheet.open} onClose={sheet.tutup}>
    {sheet.row ? <FormResetPassword key={sheet.versi} admin={sheet.row} onDone={sheet.tutup} />
               : <FormTambahAdmin key={sheet.versi} onDone={sheet.tutup} />}
</FormSheet>
```

- Ada baris yang dipilih: form Reset password untuk Admin itu (`PUT`).
- Tidak ada: form Tambah Admin, berisi nama, username, dan password (`POST`).

Password minimal 8 karakter, sama dengan aturan server.

## Aturan di file ini

- Admin tidak pernah membuka halaman ini. Route-nya hanya untuk Manager.
- Isi password tidak pernah ditampilkan kembali setelah disimpan.

## FAQ

**Setelah password direset, apa yang terjadi pada Admin itu?**
Sesinya berakhir pada permintaan berikutnya, dan Admin harus login dengan password baru. Sampaikan password baru itu langsung kepada Admin yang bersangkutan.

**Kenapa tidak ada tombol Edit nama Admin?**
Admin mengubah nama dan username-nya sendiri di halaman Profile.

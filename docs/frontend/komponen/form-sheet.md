---
title: FormSheet.tsx
urutan: 17
---

# FormSheet.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/FormSheet.tsx` (84 baris)
- **Jenis:** hook dan dua komponen React (TSX)
- **Dipakai oleh:** semua halaman master Admin, [Data admin Manager](/frontend/manager/admin), [Profile pengelola](/frontend/admin/profile-pengelola)
- **Memakai:** `ui/sheet`
:::

## Ringkasan

Tiga alat untuk form Tambah dan Edit yang muncul di sheet samping, bukan di halaman terpisah:

1. **`useFormSheet<T>()`**: menyimpan apakah sheet terbuka, baris yang diedit, dan nomor versi.
2. **`FormSheet`** (bawaan): sheet kosong yang membungkus form.
3. **`SheetForm`**: kerangka isi sheet: judul, isian yang bisa digulir, dan tombol Batal serta Simpan di bawah.

## Isi file

### `useFormSheet<T>()`

```tsx
export function useFormSheet<T>() {
    const [state, setState] = useState<{ open: boolean; row: T | null; versi: number }>({ open: false, row: null, versi: 0 });

    return {
        ...state,
        buka: (row: T | null = null) => setState((s) => ({ open: true, row, versi: s.versi + 1 })),
        tutup: () => setState((s) => ({ ...s, open: false })),
    };
}
```

| Nilai | Artinya |
| --- | --- |
| `open` | Sheet terbuka. |
| `row` | Baris yang diedit, atau `null` untuk Tambah. |
| `versi` | Bertambah setiap kali sheet dibuka. |
| `buka(row?)` | Membuka sheet. Tanpa parameter berarti Tambah. |
| `tutup()` | Menutup sheet. `row` sengaja tidak dihapus, supaya isinya masih terlihat selama sheet meluncur keluar. |

#### Kenapa ada `versi`?

Form di dalam sheet memakai `useForm`, yang hanya membaca nilai awal sekali. Kalau Admin membuka Edit baris A, menutupnya, lalu membuka Edit baris B, form masih berisi data A.

Dengan `<FormPenyewa key={sheet.versi} ... />`, setiap kali sheet dibuka, `key` berubah. React lalu membuang form lama dan membuat form baru dengan data yang benar.

### `FormSheet`

```tsx
export default function FormSheet({ open, onClose, className, children }) {
    return (
        <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
            <SheetContent className={className}>{children}</SheetContent>
        </Sheet>
    );
}
```

Sheet tetap ada di halaman, dan hanya `open` yang berubah, supaya animasi masuk dan keluar berjalan. `onOpenChange` terpanggil saat pengguna menutup sheet dengan klik di luar, tombol X, atau Esc.

`className` bisa dipakai untuk melebarkan sheet, misalnya `sm:max-w-lg` di halaman Pembayaran.

### `SheetForm`

```tsx
<form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
    <SheetHeader><SheetTitle>{title}</SheetTitle>{description && <SheetDescription>...</SheetDescription>}</SheetHeader>
    <SheetBody className="space-y-4 py-4">{children}</SheetBody>
    <SheetFooter>
        <SheetClose className={buttonVariants({ variant: 'outline' })}>Batal</SheetClose>
        <Button type="submit" disabled={processing}>{processing ? 'Menyimpan…' : submitLabel}</Button>
    </SheetFooter>
</form>
```

- Seluruh isi sheet berada di dalam satu `<form>`, sehingga tombol Simpan di bawah dan tombol Enter di kolom mana pun sama-sama mengirim form.
- `min-h-0 flex-1` membuat bagian isian bisa digulir sendiri, sementara judul dan tombol tetap terlihat.
- Selama mengirim, tombol Simpan berubah menjadi "Menyimpan…" dan nonaktif.

## Aturan di file ini

- Tambah dan Edit di panel pengelola selalu memakai sheet ini, bukan halaman terpisah.
- Form di dalam sheet selalu diberi `key={sheet.versi}`.

## FAQ

**Sheet tertutup, tetapi galat validasi masih terlihat saat dibuka lagi. Kenapa?**
Itu terjadi kalau form tidak diberi `key={sheet.versi}`. Tanpa `key`, React memakai form lama beserta galatnya.

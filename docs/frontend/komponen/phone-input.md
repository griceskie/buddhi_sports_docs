---
title: PhoneInput.tsx
urutan: 19
---

# PhoneInput.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Components/PhoneInput.tsx` (66 baris)
- **Jenis:** komponen React (TSX)
- **Dipakai oleh:** [Register](/frontend/penyewa/register), [Profile penyewa](/frontend/penyewa/profile-edit), form [Master Penyewa](/frontend/admin/master-penyewa)
- **Aturan server:** `Penyewa::ATURAN_NO_HP` (lihat [Penyewa](/backend/model/penyewa))
:::

## Ringkasan

Kolom isian nomor HP yang **menampilkan** angka dalam kelompok 4-4-sisa supaya mudah dicek ("0812 3456 7890"), tetapi **mengembalikan** angka saja ("081234567890"). Paling banyak 13 angka. Kursor tetap di tempat yang benar walaupun spasi ditambah atau dihapus otomatis.

## Isi file

### `formatPhone()`

```tsx
export function formatPhone(digits: string) {
    return [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8)].filter(Boolean).join(' ');
}
```

Potong menjadi tiga bagian, buang bagian yang kosong, lalu gabungkan dengan spasi. "08123" menjadi "0812 3".

### Props

```tsx
Omit<ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> & {
    value: string;
    onValueChange: (digits: string) => void;
}
```

Komponen ini menerima semua props `Input` biasa (`id`, `placeholder`, `aria-*`, dan seterusnya), kecuali `type`, `value`, dan `onChange`, yang diganti:

- `value`: angka saja.
- `onValueChange`: dipanggil dengan angka saja setiap kali isinya berubah.

### Mengubah isi

```tsx
const update = (raw: string, caretPos: number) => {
    caret.current = raw.slice(0, caretPos).replace(/\D/g, '').length;
    onValueChange(raw.replace(/\D/g, '').slice(0, MAX_DIGITS));
};
```

1. Hitung berapa **angka** yang ada sebelum kursor. Spasi tidak dihitung. `/\D/g` berarti "semua yang bukan angka".
2. Buang semua yang bukan angka, potong menjadi 13, lalu kirim ke pemanggil.

### Menjaga posisi kursor

```tsx
useLayoutEffect(() => {
    const el = ref.current;
    if (el && caret.current !== null && document.activeElement === el) {
        let pos = 0;
        for (let seen = 0; pos < el.value.length && seen < caret.current; pos++) {
            if (/\d/.test(el.value[pos])) seen++;
        }
        el.setSelectionRange(pos, pos);
    }
    caret.current = null;
});
```

Setelah isinya digambar ulang dengan spasi baru, kursor dipindah ke posisi setelah jumlah angka yang sama seperti sebelumnya. Tanpa ini, mengetik di tengah nomor akan membuat kursor melompat ke akhir.

`useLayoutEffect` tanpa daftar ketergantungan berjalan setiap kali komponen digambar, sebelum layar diperbarui.

### Backspace setelah spasi

Kalau kursor tepat setelah spasi dan pengguna menekan Backspace, yang terhapus adalah angka sebelum spasi, bukan hanya spasinya. Tanpa aturan ini, spasi akan muncul lagi dan tombol Backspace terasa tidak bekerja.

### Jenis kolom

```tsx
<Input type="tel" inputMode="numeric" ... />
```

- `type="tel"`: browser memperlakukannya sebagai nomor telepon, misalnya untuk isi otomatis.
- `inputMode="numeric"`: HP menampilkan papan angka.

## Aturan di file ini

- Selalu pakai `onValueChange`, bukan `onChange`.
- Format nomor dicek server (diawali 08, 10 sampai 13 angka). Komponen ini hanya membatasi panjang dan membuang yang bukan angka.

## FAQ

**Kenapa nomor tidak disimpan dengan spasi?**
Supaya tautan WhatsApp (`wa.me/62...`) di dashboard Admin bisa dibuat langsung dari nomor itu, dan supaya pencarian nomor tidak terganggu spasi.

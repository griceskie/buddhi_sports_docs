---
title: lib/cn.ts
urutan: 3
---

# lib/cn.ts

::: info Tentang file ini
- **Lokasi:** `resources/js/lib/cn.ts`
- **Jenis:** fungsi pembantu (TypeScript)
- **Dipakai oleh:** hampir semua komponen, lewat `import { cn } from 'cn'`
- **Diatur di:** `vite.config.js` (alias) dan `resources/css/app.css` (skala tipografi)
:::

## Ringkasan

`cn(...)` menggabungkan kelas Tailwind dan membuang kelas yang saling bertabrakan. Contohnya, `cn('px-2', 'px-4')` menghasilkan `px-4`, karena kelas yang belakangan menang.

Proyek ini punya skala tipografi sendiri (`text-footnote`, `text-callout`, dan seterusnya). Tanpa file ini, `cn` mengira `text-footnote` adalah warna, karena bentuknya sama dengan `text-red-500`. Akibatnya, `cn('text-footnote', 'text-muted-foreground')` membuang ukuran huruf. File ini memberi tahu `cn` bahwa nama-nama itu adalah ukuran huruf.

## Isi file

```ts
import { createCn } from 'cn/config';

export const cn = createCn({
    extend: {
        classGroups: {
            'font-size': [
                { text: ['large-title', 'title-1', 'title-2', 'title-3', 'headline', 'body',
                         'callout', 'subheadline', 'footnote', 'caption-1', 'caption-2'] },
            ],
        },
    },
});
```

- `createCn` membuat fungsi `cn` dengan pengaturan tambahan.
- `classGroups['font-size']` adalah kelompok kelas ukuran huruf. Kelas di kelompok yang sama saling menggantikan, sedangkan kelas di kelompok berbeda (ukuran dan warna) bisa berdampingan.

### Alias di Vite

```js
alias: [{ find: /^cn$/, replacement: fileURLToPath(new URL('./resources/js/lib/cn.ts', import.meta.url)) }],
```

Setiap `import { cn } from 'cn'` diarahkan ke file ini, bukan ke paket `cn` aslinya. Komponen dari shadcn bisa tetap menulis `from 'cn'` tanpa diubah.

## Skala tipografi

| Kelas | Ukuran |
| --- | --- |
| `text-large-title` | 48px |
| `text-title-1` sampai `text-title-3` | Judul, sampai 32px |
| `text-body` | 24px (bukan ukuran paragraf) |
| `text-callout` | 20px |
| `text-subheadline` | 16px |
| `text-footnote` | 14px, ukuran teks UI |
| `text-caption-1` | 12px |
| `text-caption-2` | 10px |

Ukuran lengkap ada di `panduan.md` bagian 3 di repo aplikasi. Kelas Tailwind biasa (`text-xs` sampai `text-xl`) tetap ada, karena komponen shadcn memakainya.

## Aturan di file ini

- Setiap kali menambah ukuran huruf baru di blok `@theme` kedua `app.css`, tambahkan namanya juga ke daftar di file ini.
- Selalu impor `cn` dari `'cn'`, bukan dari path file ini, supaya tetap melalui alias.

## FAQ

**Bagaimana tahu kalau masalahnya dari `cn`?**
Tanda umumnya: ukuran huruf hilang saat kelas warna ditambahkan, atau warna hilang saat ukuran ditambahkan. Periksa apakah nama ukurannya sudah ada di daftar.

**Apa bedanya `cn` dengan menulis kelas langsung di `className`?**
Kalau kelasnya tetap, tulis langsung. `cn` berguna saat kelas digabung dari beberapa sumber, misalnya kelas bawaan komponen ditambah `className` dari pemakainya, atau kelas yang hanya dipasang dengan syarat: `cn('rounded', aktif && 'bg-primary')`.

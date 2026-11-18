# Dokumentasi Buddhi Sports

Situs dokumentasi kode untuk aplikasi [Buddhi Sports](https://github.com/griceskie/buddhi_sports). Setiap halaman menjelaskan satu file: gunanya, logika setiap fungsi dengan potongan kodenya, aturan yang berlaku, dan beberapa pertanyaan yang sering muncul.

Situs dibuat dengan [VitePress](https://vitepress.dev). Isinya file Markdown biasa di folder `docs/`.

Tampilannya mengikuti shadcn/ui (base color neutral, font Geist), terang dan gelap. Token dan aturannya ada di `docs/.vitepress/theme/style.css`.

## Menjalankan di komputer

Butuh Node.js 18 atau lebih baru.

```bash
npm install
npm run dev
```

Lalu buka alamat yang muncul di terminal, biasanya `http://localhost:5173`.

Untuk membuat versi siap pasang di folder `docs/.vitepress/dist`:

```bash
npm run build
npm run preview
```

`npm run build` juga memeriksa tautan antarhalaman. Kalau ada tautan ke halaman yang tidak ada, build gagal dan nama halamannya disebutkan.

## Susunan folder

| Folder | Isinya |
| --- | --- |
| `docs/mulai/` | Halaman pengantar: cara membaca, cara kerja aplikasi, dasar Laravel dan TSX, alur bisnis, aturan kode, glosarium |
| `docs/backend/route/` | Route, config, dan middleware Inertia |
| `docs/backend/support/` | Kelas di `app/Support` (aturan bisnis dan hitungan) |
| `docs/backend/controller/` | Controller |
| `docs/backend/model/` | Model `Penyewa` dan seeder |
| `docs/frontend/dasar/` | `app.tsx`, tipe, dan `cn` |
| `docs/frontend/layout/` | Layout |
| `docs/frontend/penyewa/`, `admin/`, `manager/` | Halaman per peran |
| `docs/frontend/komponen/` | Komponen aplikasi yang besar |
| `docs/ds/penyewa/`, `docs/ds/administrator/` | Design system penyewa dan panel pengelola: warna, tipografi, bentuk, komponen, pola halaman, cara menulis |
| `docs/kelompok/` | File yang dijelaskan berkelompok: komponen `ui/`, komponen kecil, model lain, auth Breeze, migration, tes |

## Menambah halaman

1. Buat file `.md` di folder yang sesuai. Sidebar membaca folder itu secara otomatis.
2. Isi frontmatter:

   ```md
   ---
   title: NamaFile.tsx
   urutan: 5
   ---
   ```

   `urutan` menentukan posisi di sidebar.
3. Ikuti susunan halaman lain: kotak `::: info Tentang file ini`, lalu `## Ringkasan`, `## Isi file`, `## Aturan di file ini`, dan `## FAQ`.
4. Jalankan `npm run build` untuk memeriksa tautan.

Dokumentasi ini ditulis berdasarkan kode di branch `main` per 17 November 2026. Kalau kode berubah, halaman yang bersangkutan perlu ikut diperbarui.

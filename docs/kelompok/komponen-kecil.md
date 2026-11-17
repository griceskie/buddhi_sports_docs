---
title: Komponen aplikasi lainnya
urutan: 5
---

# Komponen aplikasi lainnya

::: info Tentang halaman ini
- **Lokasi:** `resources/js/Components/` di luar folder `ui/`
- **Jenis:** komponen React (TSX) dan beberapa file TypeScript
- **Komponen besar:** dijelaskan di halamannya sendiri di bagian **Komponen aplikasi**
:::

## Ringkasan

Komponen yang khusus untuk aplikasi ini, tetapi cukup kecil untuk dijelaskan singkat. Setiap baris berisi gunanya dan tempat pemakaiannya.

## Pembantu form dan umum

| File | Gunanya | Dipakai di |
| --- | --- | --- |
| `FormSelect.tsx` | Pilihan (Select) yang bekerja dengan teks. `''` berarti belum dipilih dan menampilkan `placeholder`. Pilihan dengan nilai `''` (misalnya "-") bisa mengosongkan isian opsional. | Form master Admin |
| `FormCombobox.tsx` | Seperti `FormSelect`, tetapi bisa diketik untuk mencari. Untuk daftar panjang. `clearable` bawaannya `false`. | Form Booking (Penyewa, Lapangan, Admin, Status) |
| `InputError.tsx` | Pesan galat merah di bawah isian. Tidak menggambar apa pun kalau pesannya kosong. | Semua form |
| `PasswordInput.tsx` | Isian password dengan tombol mata untuk menampilkan dan menyembunyikan isinya. | Login, Register, Profile |
| `Wordmark.tsx` | Nama "Buddhi Sports" sebagai teks. Proyek ini tidak punya logo gambar. | Navigasi penyewa |
| `RingkasanPembayaran.tsx` | Widget Total pemasukan dan Status pembayaran untuk satu periode. Tipe `Ringkasan`-nya dipakai di beberapa halaman. | Tipe dipakai halaman Pembayaran dan Laporan |
| `MenuAkun.tsx` | Menu akun penyewa: Booking saya (dengan angka perlu tindakan), Profile, Log Out. Bentuk `nama` (nama dan panah) atau `avatar` (inisial dan tombol menu bulat). | Navigasi penyewa |

## Bagian penyewa (`booking/`)

| File | Gunanya |
| --- | --- |
| `NavPenyewa.tsx` | Navigasi Booking saya dan Profile: logo dengan titik status, dan avatar. Juga mengekspor `LogoStatus`, yang dipakai `HeaderBeranda`. |
| `StatusBuka.tsx` | `useSekarangPerMenit()` (waktu yang diperbarui setiap menit), `TitikStatus` (titik berdenyut hijau atau merah), dan status "Buka 08.00–22.00" di navigasi halaman Bayar. |
| `IslandStatus.tsx` | Pil putih di bawah tengah layar dengan papan Open atau Close yang berayun. Muncul saat menggulir (paling sering setiap 2 menit) atau saat titik status diklik, lalu hilang setelah 6 detik. |
| `PilihLapangan.tsx` | Pilihan lapangan berbentuk kartu radio untuk HP, dengan kotak putih yang bergeser ke kartu terpilih. |
| `PillLapangan.tsx` | Pilihan lapangan berbentuk pil bersegmen mulai 640px, meniru kolom pencarian Airbnb. |
| `RekeningTransfer.tsx` | Bank, nomor rekening, atas nama, dan jumlah transfer, dengan tombol salin. |
| `KonfirmasiBatal.tsx` | Dialog "Batalkan booking ini?" dengan gambar tempat sampah. Mengirim `POST /booking/{id}/batal`. |
| `popup.ts` | Kelas `kelasPopup` untuk dialog yang menjadi sheet dari bawah di HP dan dialog di tengah di layar lebih lebar. |

## Bagian pengelola (`pengelola/`)

| File | Gunanya |
| --- | --- |
| `HeaderPengelola.tsx` | Header panel: tombol sidebar, judul halaman, lonceng notifikasi, tombol tema, menu akun. |
| `JudulHalaman.tsx` | Judul halaman 20px, deskripsi di bawahnya, dan tombol aksi di kanan. |
| `AksiBaris.tsx` | Ikon Edit dan Hapus di ujung baris tabel master. Hapus memakai [DeleteButton](/frontend/komponen/delete-button) dengan `method="delete"`. |
| `BadgeTip.tsx` | Badge status dengan tooltip. Juga berisi `tipPembayaran`, `tipBooking`, dan `tipLapangan`, yang menyusun kalimat tooltip. |
| `NotifikasiHeader.tsx` | Lonceng dengan titik merah, daftar notifikasi, dan "Tandai sudah dibaca". Isinya dari [NotifikasiAdmin](/backend/support/notifikasi-admin) dan [NotifikasiManager](/backend/support/notifikasi-manager). |
| `MenuAkunPengelola.tsx` | Menu akun pengelola (Profile, Log aktivitas, Mode gelap, Log Out), juga fungsi `inisial()`. |
| `TombolTema.tsx` | Tombol ikon pengalih mode terang dan gelap. |
| `tema.ts` | Penyimpan pilihan tema di cookie `tema_pengelola`, `sinkronTemaPanel()`, dan hook `useModeGelap()`. |
| `PanelPratinjauLogin.tsx` | Panel kanan halaman login pengelola, dengan status `tidak ada`, `ada`, atau `banyak`. |

## Bagian lain

| File | Gunanya |
| --- | --- |
| `manager/TabelLaporan.tsx` | Tabel laporan untuk Manager, ditambah tombol `TandaiDiperiksa` dan `MintaRevisi` beserta dialognya. |
| `profile/BarisProfil.tsx` | Satu baris di Profile penyewa: label, nilai tersamar, tombol Ubah atau Batal, dan form yang terbuka seperti akordeon. Halaman ikut digulir sampai bagian bawah form terlihat. |
| `profile/sensor.ts` | `sensorHp` ("0812 **** 7890") dan `sensorEmail` ("r***a@example.com"). |
| `auth/AuthScene.tsx` | Gambar benda olahraga di sekeliling form tamu. Lihat [GuestLayout](/frontend/layout/guest-layout). |

## Aturan

- Komponen yang dipakai di lebih dari satu halaman ditaruh di `Components/`. Komponen yang hanya dipakai satu halaman cukup ditulis di file halaman itu.
- Sebelum membuat komponen baru, periksa `ui/` dan daftar ini lebih dulu.
- Komponen yang dipakai sebagai target `render` Base UI harus memakai `React.forwardRef`.

## FAQ

**Kenapa sebagian komentar berbahasa Inggris dan sebagian berbahasa Indonesia?**
Komponen yang lebih lama, dan yang terkait halaman berbahasa Inggris (Login, Register), memakai komentar Bahasa Inggris. Komponen yang lebih baru memakai Bahasa Indonesia.

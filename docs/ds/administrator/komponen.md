---
title: Komponen
urutan: 4
---

# Komponen

::: info Tentang halaman ini
- **Sumber di kode:** `Components/pengelola/`, `Components/admin/`, `Components/manager/`, `Components/ui/`
- **Sumber rancangan:** folder `project/components/` di artifact Design System Administrator
:::

## Ringkasan

Komponen di artifact DS ditulis sebagai HTML dan CSS biasa. Di repo, komponen yang sama dibangun dengan React di atas `Components/ui/`. Tabel di bawah memasangkan keduanya.

## Komponen dan padanannya

| Di artifact DS | Di repo | Gunanya |
| --- | --- | --- |
| TopBar | `pengelola/HeaderPengelola.tsx` | Header panel. |
| Notifikasi | `pengelola/NotifikasiHeader.tsx` | Lonceng dengan titik merah, paling banyak 5 baris. |
| Sidebar | [`AdminSidebar.tsx`](/frontend/komponen/admin-sidebar) + `ui/sidebar.tsx` | Menu sesuai peran. |
| StatRow | bagian angka di [`Dashboard/Admin.tsx`](/frontend/admin/dashboard-admin) | Empat angka hari ini dalam satu kartu, masing-masing dengan keterangan asalnya. |
| JadwalTimeline | [`admin/JadwalGeser.tsx`](/frontend/komponen/jadwal-geser) | Lini waktu per lapangan, 100px per jam, bisa digeser. |
| PerluTindakan | bagian antrean di `Dashboard/Admin.tsx` | Antrean bukti (terlama di atas) dan Tugas lain. |
| DrawerVerifikasi | [`admin/DrawerVerifikasi.tsx`](/frontend/komponen/drawer-verifikasi) | Sheet lebar untuk menerima atau menolak bukti. Ada mode `hanyaLihat` untuk Manager. |
| DataTable | [`pengelola/DataTable.tsx`](/frontend/komponen/data-table) | Tabel dengan cari, filter, urut, halaman. |
| StatusBadge | `ui/badge.tsx` + `pengelola/BadgeTip.tsx` | Badge kapsul lembut dengan tooltip. |
| Button | `ui/button.tsx` | Satu `default` (primary) per layar, sisanya `outline` dan `ghost`. |
| LoginPengelola | [`PengelolaGuestLayout`](/frontend/layout/pengelola-guest-layout), [`LoginPengelola.tsx`](/frontend/admin/login-pengelola), `pengelola/PanelPratinjauLogin.tsx` | Form di kiri, panel pratinjau di kanan. |
| LogAktivitas | [`Admin/LogAktivitas/TampilData.tsx`](/frontend/admin/log-aktivitas) | Daftar tindakan dengan rantai hash. |

## Komponen panel lain

| Komponen | Gunanya |
| --- | --- |
| `pengelola/JudulHalaman.tsx` | Judul halaman dengan deskripsi dan aksi. |
| `pengelola/AksiBaris.tsx` | Ikon Edit dan Hapus di ujung baris tabel. |
| [`FormSheet`](/frontend/komponen/form-sheet) | Sheet samping untuk Tambah dan Edit. |
| [`pengelola/DialogLaporan.tsx`](/frontend/komponen/dialog-laporan) | Dialog Buat laporan dengan tanda tangan. |
| [`admin/AnalitikLaporan.tsx`](/frontend/komponen/analitik-laporan) | Analitik satu bulan di halaman Laporan. |
| [`manager/analisis/bagian.tsx`](/frontend/komponen/analisis-bagian) | Kartu, chip perubahan, grafik batang untuk Analisis bisnis. |
| `manager/TabelLaporan.tsx` | Tabel laporan Manager, tombol Tandai diperiksa dan Minta revisi. |
| `pengelola/MenuAkunPengelola.tsx`, `TombolTema.tsx` | Menu akun dan pengalih tema. |

## Tombol di panel

| Varian | Dipakai untuk |
| --- | --- |
| `default` | Satu aksi utama: Tambah booking, Terima pembayaran, Buat laporan |
| `outline` | Aksi kedua: Buka PDF, Tinjau, tombol di Tugas lain (28px) |
| `ghost` | Ikon di baris tabel, tombol header |
| `destructive` | Tolak, Hapus di dialog konfirmasi |

Varian `elevated` khusus penyewa, dan tidak dipakai di panel.

## Aturan komponen

- Komponen yang dipakai sebagai target `render` Base UI harus memakai `forwardRef`. `ui/button` tidak memakainya. Untuk pemicu popup, pasang kelas `buttonVariants()` langsung di pemicunya.
- Ikon tanpa teks wajib punya `aria-label`.
- Komponen yang hanya menampilkan untuk Manager (mode `hanyaLihat`, `pemantauan`) dibuat dengan menyembunyikan tombol, bukan dengan menyalin komponen.
- Setelah komponen panel berubah, artifact DS administrator perlu disinkronkan.

## FAQ

**Kenapa komponen panel tidak diletakkan di `ui/`?**
`ui/` berisi komponen dasar yang dipakai kedua sisi dan tidak tahu apa-apa tentang booking. Komponen panel tahu tentang bukti, jadwal, dan laporan, jadi diletakkan di `pengelola/`, `admin/`, atau `manager/`.

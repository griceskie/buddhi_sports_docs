---
title: Komponen
urutan: 5
---

# Komponen

::: info Tentang halaman ini
- **Sumber di kode:** `resources/js/Components/ui/`, `resources/js/Components/`, `resources/js/Components/booking/`
- **Lihat juga:** [Komponen ui/](/kelompok/komponen-ui) dan halaman komponen di bagian **Komponen aplikasi**
:::

## Ringkasan

Komponen DS penyewa ada di tiga tempat:

1. **`Components/ui/`**: komponen dasar gaya shadcn di atas Base UI. Dipakai kedua sisi.
2. **`Components/`**: pembantu aplikasi, misalnya `FormSelect`, `PhoneInput`, `PasswordInput`.
3. **`Components/booking/`**: bagian khusus alur booking penyewa.

Sebelum membuat komponen baru, periksa daftar di bawah. Kalau komponennya sudah ada, pakai itu.

## Kontrol dasar

| Komponen | Kapan dipakai |
| --- | --- |
| `Button` | Semua tombol. `elevated` hanya untuk satu aksi utama per halaman. `destructive` sudah berwarna merah lembut, cocok untuk "Batalkan booking". |
| `Input`, `Textarea`, `Label` | Isian teks, selalu dengan label di atasnya. |
| `PasswordInput` | Password, dengan tombol mata. |
| `PhoneInput` | No HP: tampil "0812 3456 7890", mengirim angka saja. |
| `Checkbox`, `Switch`, `RadioGroup` | Pilihan. |
| `Select`, `Combobox` | Pilihan dari daftar. Di form, pakai `FormSelect` dan `FormCombobox`. |
| `InputError` | Pesan galat di bawah isian. |

## Tampilan data

| Komponen | Kapan dipakai |
| --- | --- |
| `Badge` | Label status. Varian solid (`success`, `destructive`) dengan teks putih, karena warna transparan dengan teks berwarna tidak lolos 4,5:1. |
| `PaymentStatusBadge`, `BookingStatusBadge`, `CourtStatusBadge` | Status pembayaran, booking, dan lapangan, masing-masing dengan ikon dan label tetap. |
| `Card` | Kotak isi. |
| `Empty` | Keadaan kosong dengan gambar, kalimat, dan satu tombol. |
| `Skeleton` | Kotak berkedip saat data dimuat. |
| `Tabs` dan `TabsIndicator` | Tab dengan garis bawah yang bergeser (Home, Booking saya). |

## Lapisan di atas halaman

| Komponen | Kapan dipakai |
| --- | --- |
| `Dialog` + `kelasPopup` | Popup yang menjadi sheet dari bawah di HP (`booking/popup.ts`). |
| `AlertDialog` | Konfirmasi tindakan yang tidak bisa dibatalkan, misalnya `KonfirmasiBatal`. |
| `Popover` | Rincian kecil: rincian harga, penjelasan status. |
| `DropdownMenu` | Menu akun. |
| `toast` | Pemberitahuan singkat di bawah layar. Flash dari server otomatis menjadi toast. |

## Bagian alur booking

| Komponen | Isinya |
| --- | --- |
| [`DateStrip`](/frontend/komponen/date-strip) | Deretan tanggal dengan status Tersedia, Terbatas, Penuh. |
| [`KartuJam`](/frontend/komponen/kartu-jam) + `SlotPicker` | Pemilih jam per lapangan. |
| [`RingkasanBooking`](/frontend/komponen/ringkasan-booking), `BarBookingMobile` | Harga dan tombol Booking sekarang. |
| [`GaleriLapangan`](/frontend/komponen/galeri-lapangan) | Foto lapangan dan penampil layar penuh. |
| `PilihLapangan`, `PillLapangan` | Pilihan lapangan di HP dan mulai 640px. |
| [`HeaderBeranda`](/frontend/komponen/header-beranda) | Header Home yang meringkas saat digulir. |
| `StatusBuka`, `IslandStatus` | Status buka atau tutup GOR. |
| [`KartuBookingSaya`](/frontend/komponen/kartu-booking-saya) | Kartu booking dengan status dan hitung mundur. |
| [`PanelPembayaran`](/frontend/komponen/panel-pembayaran) | Konfirmasi dan bayar, di halaman maupun popup. |
| `RekeningTransfer` | Rekening tujuan dengan tombol salin. |
| [`UbahJadwal`](/frontend/komponen/ubah-jadwal), [`DialogBukti`](/frontend/komponen/dialog-bukti) | Dialog pindah jadwal dan lihat bukti. |

## Layout

| Layout | Dipakai untuk |
| --- | --- |
| [`PenyewaLayout`](/frontend/layout/penyewa-layout) | Halaman penyewa yang sudah login. |
| [`GuestLayout`](/frontend/layout/guest-layout) | Landing, Login, Register, lupa password. |

## Ikon

- Semua ikon dari Lucide (`lucide-react`).
- Di dalam tombol: 16px (`size-4`). Di ukuran kecil: 12–14px.
- Ikon memakai `currentColor`, jadi warnanya mengikuti teks.
- Ikon tanpa teks hanya di tombol berukuran `icon`, dan selalu diberi `aria-label`.
- Ikon olahraga dan lapangan 3D memakai gambar di `public/images/olahraga/`, bukan Lucide.

## Logo

Proyek ini belum punya logo. Semua layout menulis nama produk sebagai teks lewat `Wordmark`: **Buddhi Sports** dengan ketebalan semibold.

## Aturan

- Komponen yang dipakai sebagai target `render` Base UI harus memakai `React.forwardRef`.
- Komponen Breeze lama (`PrimaryButton`, `TextInput`, `Modal`, `FlashMessage`, dan sejenisnya) sudah dihapus. Jangan dikembalikan.
- Komponen baru masuk ke DS setelah dipakai di lebih dari satu tempat.

## FAQ

**Bagaimana menambah komponen shadcn yang belum ada?**
Salin kodenya dari situs shadcn secara manual. Hindari `npx shadcn add`, karena alias di `components.json` memakai huruf kecil (`@/components`) sedangkan foldernya `Components`, dan CLI menawarkan untuk menimpa file yang sudah disesuaikan.

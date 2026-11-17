---
title: Tes otomatis
urutan: 4
---

# Tes otomatis

::: info Tentang halaman ini
- **Lokasi:** `tests/Feature/` (sekitar 30 file, ditambah folder `Auth/`), `tests/Unit/`, dan `phpunit.xml`
- **Jenis:** tes PHPUnit lewat Laravel
- **Dijalankan oleh:** `php artisan test`
- **Daftar kasus uji manual:** `blackbox-testing.md` di repo aplikasi
:::

## Ringkasan

Tes otomatis adalah kode yang mencoba fitur aplikasi lalu memeriksa hasilnya. Contohnya: buat penyewa, kirim booking, lalu pastikan booking tersimpan dan penyewa diarahkan ke halaman Bayar. Kalau suatu perubahan merusak fitur, tes yang gagal akan menunjukkannya.

Semua tes di proyek ini adalah **feature test**: tes mengirim permintaan HTTP ke aplikasi seperti browser, lalu memeriksa respons dan isi database.

## Cara menjalankan

```bash
php artisan test
```

Kalau `.env` atau terminal menetapkan `DB_DATABASE`, jalankan tanpa variabel itu:

```bash
env -u DB_DATABASE php artisan test
```

Hal ini penting. Kalau tes berjalan di database sungguhan, `RefreshDatabase` akan mengosongkannya.

Kalau muncul galat "Unable to locate file in Vite manifest", jalankan `npm run build` dulu. Beberapa tes membuka halaman, dan halaman butuh file hasil build.

## Lingkungan tes

`phpunit.xml` mengatur lingkungan khusus untuk tes:

| Pengaturan | Nilai | Artinya |
| --- | --- | --- |
| `DB_CONNECTION`, `DB_DATABASE` | `sqlite`, `:memory:` | Database sementara di memori, dibuat ulang untuk setiap tes. |
| `CACHE_STORE`, `SESSION_DRIVER` | `array` | Cache dan sesi hanya di memori. |
| `MAIL_MAILER` | `array` | Email tidak dikirim, hanya dicatat untuk diperiksa. |
| `BCRYPT_ROUNDS` | 4 | Hash password lebih cepat, supaya tes tidak lambat. |

## Kelompok tes

| Kelompok | Contoh file | Yang diuji |
| --- | --- | --- |
| Blackbox | `BlackboxBookingPenyewaTest`, `BlackboxMasterDataTest`, `BlackboxHakAksesTest` | Kasus uji di `blackbox-testing.md`, dengan kode kasus seperti D01 atau G08 di komentar. |
| Fitur penyewa | `BookingPenyewaTest`, `BuktiBayarTest`, `FotoLapanganTest` | Booking, unggah bukti, jam yang ditahan, foto. |
| Panel Admin | `AdminDashboardTest`, `MasterDataSheetTest`, `KunciPembayaranLaporanTest`, `LaporanPembayaranTest` | Verifikasi, form master, kunci laporan, pembuatan PDF. |
| Panel Manager | `ManagerTest`, `RevisiLaporanTest`, `AnalitikBisnisTest` | Pemantauan, revisi, Analisis bisnis. |
| Keamanan dan log | `KeamananLoginPengelolaTest`, `LogAktivitasTest`, `CelahPrioritasRendahTest` | Batas percobaan login, rantai hash log, celah yang sudah ditutup. |
| Tampilan panel | `TemaPanelTest`, `HeaderPengelolaTest`, `LoginPengelolaStatusTest` | Props tema, notifikasi, status login. |
| Data awal | `SeederTest`, `FotoContohLapanganTest` | DatabaseSeeder, DemoSeeder, perintah foto contoh. |
| Bawaan Breeze | `Auth/*`, `ProfileTest` | Login, daftar, reset password, profile penyewa. |

## Bentuk satu tes

```php
class BlackboxBookingPenyewaTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_booking_tersimpan_lalu_diarahkan_ke_halaman_bayar(): void
    {
        // 1. siapkan data: penyewa, lapangan
        // 2. lakukan: $this->actingAs($penyewa)->post('/booking', [...])
        // 3. periksa: ->assertRedirect(...), $this->assertDatabaseHas('bookings', [...])
    }
}
```

- `RefreshDatabase`: database dikosongkan dan dibuat ulang sebelum setiap tes.
- Nama fungsi diawali `test_` dan menjelaskan apa yang diuji, dalam Bahasa Indonesia.
- `actingAs($penyewa)` membuat tes berjalan sebagai pengguna yang login. Untuk pengelola: `actingAs($admin, 'admin')`.
- `Carbon::setTestNow(...)` membekukan waktu, supaya tes yang bergantung pada jam (batas bayar, jam lewat) selalu memberi hasil yang sama. `tearDown()` mengembalikan waktu setelah tes.

## Hal yang perlu diperhatikan

- **Tidak ada GD di lingkungan ini.** File gambar palsu dibuat dengan `UploadedFile::fake()->create('bukti.jpg', 100, 'image/jpeg')`, bukan `->image()`. Tanda tangan di tes laporan harus JPEG.
- **Guard yang tetap aktif.** Setelah `actingAs($manager, 'manager')`, guard Manager tetap login sampai tes selesai. Kalau perlu menguji sebagai Admin juga, lakukan itu lebih dulu.
- **Penyewa palsu** dibuat dengan `Penyewa::factory()->create()`. Pembuatnya ada di `database/factories/PenyewaFactory.php`.

## Aturan

- Setiap perubahan perilaku disertai tes baru atau tes yang diperbarui.
- Semua tes harus lolos sebelum PR digabungkan.
- Tes tidak boleh bergantung pada jam sungguhan. Bekukan waktu dengan `Carbon::setTestNow`.

## FAQ

**Berapa jumlah tes saat ini?**
Sekitar 240, dan semuanya lolos (data 17 November 2026).

**Tes lolos, tetapi aplikasi di browser rusak. Bagaimana bisa?**
Tes PHP memeriksa server, bukan tampilan React. Pemeriksaan TypeScript (`npx tsc --noEmit`) dan pengecekan langsung di browser tetap diperlukan untuk tampilan.

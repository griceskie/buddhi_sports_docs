---
title: Profile/Edit.tsx
urutan: 7
---

# Profile/Edit.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Profile/Edit.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/profile`, route `profile.edit`
- **Server:** [ProfileController](/backend/controller/profile) (nama, No HP, email) dan `Auth/PasswordController` (password)
- **Komponen penting:** `Components/profile/BarisProfil.tsx`, `Components/profile/sensor.ts`, [PhoneInput](/frontend/komponen/phone-input), `PasswordInput`
:::

## Ringkasan

Halaman Profile penyewa, satu kolom selebar 640px:

1. Kartu identitas: avatar inisial, nama, email yang disamarkan.
2. **Informasi pribadi:** baris Nama, No HP, Email, lalu kartu dua pertanyaan singkat.
3. **Login dan keamanan:** baris Password, baris Hapus akun (dinonaktifkan), lalu Log Out.

Setiap baris menampilkan nilai yang disamarkan dan tombol **Ubah**. Menekan Ubah membuka form kecil di bawah baris itu. Hanya satu baris yang bisa terbuka sekaligus, dan baris lain diredupkan.

## Isi file

### Dua form

```tsx
const profil = useForm({ namaPenyewa: user.namaPenyewa, noHp: user.noHp, email: user.email });
const password = useForm({ current_password: '', password: '', password_confirmation: '' });
```

- `profil` diisi data penyewa saat ini, dibaca dari props bersama `auth.user`. Ketiga field selalu dikirim bersama, walaupun penyewa hanya membuka satu baris, karena server memvalidasi ketiganya.
- `password` mulai kosong.

### Baris mana yang terbuka

```tsx
const [edit, setEdit] = useState<Bagian | null>(null);

const baris = (bagian: Bagian) => ({
    id: bagian,
    terbuka: edit === bagian,
    redup: edit !== null && edit !== bagian,
    onBuka: () => setEdit(bagian),
    onTutup: tutup,
});
```

`edit` berisi `'nama'`, `'hp'`, `'email'`, `'password'`, atau `null`. Fungsi `baris()` menyusun props untuk setiap `BarisProfil`, lalu disebar dengan `{...baris('nama')}`.

- `terbuka`: baris ini yang sedang diubah.
- `redup`: ada baris lain yang terbuka. Baris ini diredupkan dan tombolnya dinonaktifkan.

### `tutup()`

Mengembalikan kedua form ke nilai awal, menghapus galat, lalu menutup baris. Perubahan yang belum disimpan dibuang.

### `simpanProfil()`

```tsx
profil.patch(route('profile.update'), {
    preserveScroll: true,
    onSuccess: () => {
        profil.setDefaults();
        setEdit(null);
    },
});
```

- `patch` mengirim dengan metode PATCH, sesuai route `PATCH /profile`.
- `preserveScroll: true`: halaman tidak melompat ke atas setelah disimpan.
- `setDefaults()`: isi form sekarang menjadi nilai awal yang baru, supaya `reset()` berikutnya tidak mengembalikan ke data lama.

Toast "Profil disimpan." datang dari server.

### `simpanPassword()`

Mengirim `PUT /password`. Kalau gagal:

- password baru salah: kosongkan password baru dan ulangannya
- password sekarang salah: kosongkan password sekarang saja.

Di bawah kolom password baru ada tanda "Minimal 8 karakter". Warnanya berubah hijau begitu syaratnya terpenuhi. Pemeriksaan ini hanya untuk membantu. Server tetap yang menentukan.

### Nilai yang disamarkan

`sensorHp` dan `sensorEmail` dari `Components/profile/sensor.ts`:

- No HP `081234567890` tampil sebagai `0812 **** 7890`.
- Email `rina@example.com` tampil sebagai `r***a@example.com`.

Password selalu tampil sebagai `********`.

### Komponen kecil di file ini

| Komponen | Gunanya |
| --- | --- |
| `Island` | Kotak putih bersudut bulat. Baris di dalamnya dipisah garis (`[&>*+*]:border-t`, yaitu garis atas untuk setiap anak kecuali yang pertama). |
| `FormBaris` | Form kecil di dalam baris: kalimat bantuan, kolom, galat, tombol Simpan. |
| `Faq` | Satu pertanyaan dengan gambar kecil. Jawabannya dibatasi 2 baris di HP dan 1 baris di desktop. |
| `inisial()` | Huruf depan dua kata pertama nama, untuk avatar. |

Komponen kecil yang hanya dipakai di satu halaman ditaruh di file halaman itu, di bawah komponen utama.

### Log Out

```tsx
<Link href={route('logout')} method="post" as="button" disabled={edit !== null}>Log Out</Link>
```

Logout harus dikirim dengan POST. `method="post" as="button"` membuat `Link` Inertia mengirim POST dan tampil sebagai tombol. Tombol ini dinonaktifkan selama ada baris yang terbuka.

## Aturan di file ini

- Satu baris terbuka sekaligus.
- Nilai pribadi selalu disamarkan sampai baris dibuka.
- Halaman penyewa tidak punya mode gelap.

## FAQ

**Kenapa Hapus akun tidak bisa ditekan?**
Dinonaktifkan atas keputusan pemilik proyek. Penyewa yang sudah punya booking juga tidak bisa dihapus tanpa merusak riwayat. Lihat [ProfileController](/backend/controller/profile).

**Saat baris dibuka, halaman bergulir sendiri. Kenapa?**
`BarisProfil` menggulir halaman sedikit demi sedikit, mengikuti animasi buka, sampai bagian bawah form terlihat. Jarak navigasi yang menempel dihitung langsung dari tingginya, bukan angka tetap.

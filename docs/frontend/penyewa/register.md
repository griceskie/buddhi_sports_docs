---
title: Auth/Register.tsx
urutan: 3
---

# Auth/Register.tsx

::: info Tentang file ini
- **Lokasi:** `resources/js/Pages/Auth/Register.tsx`
- **Jenis:** halaman Inertia (TSX)
- **Dibuka di:** `/register`
- **Server:** [RegisteredUserController](/backend/controller/registered-user)
- **Layout:** [GuestLayout](/frontend/layout/guest-layout)
- **Komponen penting:** [PhoneInput](/frontend/komponen/phone-input), `PasswordInput`
:::

## Ringkasan

Halaman daftar akun penyewa. Field-nya nama, No HP, email, password, dan konfirmasi password. Setelah berhasil, penyewa langsung login dan dibawa ke Home.

Bentuknya sama dengan [Login](./login): `useForm`, lalu Label, kontrol, dan `InputError` untuk setiap field. Halaman ini hanya menjelaskan bagian yang berbeda.

## Isi file

### Isi form

```tsx
const { data, setData, post, processing, errors, reset } = useForm({
    namaPenyewa: '',
    noHp: '',
    email: '',
    password: '',
    password_confirmation: '',
    remember: false as boolean,
});
```

Nama field sama persis dengan yang divalidasi server (`namaPenyewa`, `noHp`). Kalau namanya berbeda, server tidak menemukan isinya dan menganggap field itu kosong.

`password_confirmation` harus bernama begitu. Aturan `confirmed` di Laravel mencari field dengan nama `password` ditambah `_confirmation`.

### No HP

```tsx
<PhoneInput
    id="noHp"
    value={data.noHp}
    placeholder="0812 3456 7890"
    aria-describedby="noHp-hint"
    onValueChange={(digits) => setData('noHp', digits)}
/>
<p id="noHp-hint">In case we need to reach you about a booking.</p>
```

- `PhoneInput` menampilkan nomor berkelompok ("0812 3456 7890"), tetapi mengirim angka saja ("081234567890"). Karena itu, komponen ini memakai `onValueChange`, bukan `onChange`.
- Server memeriksa formatnya: diawali 08, 10 sampai 13 angka.
- `aria-describedby="noHp-hint"` menghubungkan kolom dengan kalimat petunjuk di bawahnya, supaya pembaca layar ikut membacakannya.

### Petunjuk password

Di bawah password ada petunjuk "At least 8 characters." Petunjuk ini juga dihubungkan dengan `aria-describedby`.

`autoComplete="new-password"` memberi tahu browser bahwa ini password baru, sehingga browser bisa menawarkan password acak yang kuat.

### Setelah dikirim

```tsx
post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
```

Kedua field password dikosongkan setelah pengiriman, berhasil maupun gagal. Field lain tetap terisi, jadi kalau ada galat, penyewa tidak perlu mengetik ulang semuanya.

## Aturan di file ini

- Nama field mengikuti nama kolom di database.
- Field yang punya petunjuk memakai `aria-describedby`.
- `required` dipasang di setiap field, supaya browser sudah menolak form kosong sebelum dikirim. Server tetap memeriksa ulang.

## FAQ

**Penyewa mengetik nomor dengan +62. Apa yang terjadi?**
`PhoneInput` membuang semua yang bukan angka, jadi tersisa "62812...". Server lalu menolaknya, karena nomor harus diawali 08, dan pesannya muncul di bawah kolom.

**Kenapa ada "Keep me logged in" di halaman daftar?**
Karena penyewa langsung login setelah mendaftar. Pilihan ini menentukan apakah sesi pertamanya bertahan lama.

# 🔧 Perbaikan Error NEXT_REDIRECT - Dokumentasi Lengkap

## 📋 Ringkasan Masalah

**Gejala:**

- ✅ Data berhasil disimpan ke database
- ❌ Error NEXT_REDIRECT muncul
- ❌ Popup "Gagal Menyimpan" ditampilkan
- ❌ User tidak diredirect ke halaman list

**Penyebab Root:**
`redirect()` di Next.js 13+ adalah **control flow mechanism**, bukan error biasa. Ketika dipanggil, ia melempar error khusus `NEXT_REDIRECT`. Jika tertangkap oleh `try-catch`, error ini dianggap sebagai error biasa, menyebabkan data tersimpan tetapi redirect terhalangi.

---

## 🔍 Analisis Detail

### Masalah #1: Server Action dengan Try-Catch

**File Sebelumnya:** `src/app/dashboard/master/barang/actions.js`

```javascript
// ❌ MASALAH
const barang = await prisma.master_barang.create({ ... });
await writeAuditLog({ ... });

revalidatePath("/dashboard/master/barang");
redirect("/dashboard/master/barang");  // ← Error NEXT_REDIRECT dilempar di sini
```

### Masalah #2: Client Component dengan Try-Catch

**File Sebelumnya:** `src/app/dashboard/master/barang/tambah/page.jsx`

```javascript
// ❌ MASALAH
try {
  await addBarang(formData);
} catch (err) {
  showError("Gagal Menyimpan", err.message); // ← Error NEXT_REDIRECT tertangkap di sini!
  setIsPending(false);
}
```

**Flow Masalah:**

```
Client: await addBarang(formData)
  ↓
Server Action: addBarang()
  ├─ CREATE data ✅
  ├─ INSERT audit log ✅
  ├─ CALL revalidatePath() ✅
  └─ THROW NEXT_REDIRECT ❌
  ↓
Client try-catch: CATCH NEXT_REDIRECT ❌
  ├─ showError() muncul ❌
  ├─ setIsPending(false) dipanggil ❌
  └─ redirect() TIDAK TERJADI ❌
```

---

## ✅ Solusi yang Diterapkan

### Solusi #1: Gunakan `try-finally` di Server Action

**Prinsip:** Redirect dipindahkan ke `finally` block, memastikan ia selalu dijalankan terlepas dari error.

```javascript
// ✅ PERBAIKAN
try {
  const barang = await prisma.master_barang.create({ ... });

  await writeAuditLog({
    userId: user.id,
    username: user.username,
    aksi: AUDIT_AKSI.TAMBAH_BARANG,
    tabel: "master_barang",
    recordId: barang.id,
    afterData: barang,
  });

  revalidatePath("/dashboard/master/barang");
} finally {
  // ✅ redirect() SELALU dipanggil di finally
  redirect("/dashboard/master/barang");
}
```

**Mengapa Ini Bekerja:**

- `finally` block SELALU dijalankan, bahkan jika ada error di `try`
- `redirect()` tidak tertangkap oleh `try-catch` apa pun
- Jika ada error di `create()`, error akan di-throw sebelum `redirect()`
- Jika `create()` berhasil, `redirect()` tetap berjalan di `finally`

### Solusi #2: Gunakan `useTransition()` di Client Component

**Prinsip:** Mengganti `useState` dengan `useTransition()` untuk menangani Server Actions dengan lebih baik.

```javascript
// ✅ PERBAIKAN
"use client";

import { useTransition } from "react";
import { addBarang } from "../actions";
import { showError } from "@/lib/swal";

export default function TambahBarangPage() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Validasi lokal
    const gambar = formData.get("gambar");
    if (gambar && gambar.size > 2 * 1024 * 1024) {
      showError("Gagal Menyimpan", "Ukuran gambar terlalu besar. Maksimal 2 MB.");
      return;
    }

    startTransition(async () => {
      try {
        await addBarang(formData);
        // Jika redirect() berhasil, kita tidak perlu melakukan apapun
      } catch (err) {
        // Hanya tampilkan error jika bukan NEXT_REDIRECT
        if (err.message !== "NEXT_REDIRECT") {
          showError("Gagal Menyimpan", err.message);
        }
      }
    });
  };

  return (
    // ... JSX form
  );
}
```

**Keuntungan `useTransition()`:**

- Automatically handles `isPending` state
- Cleaner syntax untuk Server Actions
- Lebih intuitif untuk menangani side effects
- Recommended pattern di Next.js 13+

---

## 📝 File-File yang Diperbaiki

### 1. Server Action Files

- **[src/app/dashboard/master/barang/actions.js](src/app/dashboard/master/barang/actions.js)** ✅
  - ✅ `addBarang()` - Wrap dengan `try-finally`
  - ✅ `updateBarang()` - Wrap dengan `try-finally`

- **[src/app/dashboard/master/kategori-produk/actions.js](src/app/dashboard/master/kategori-produk/actions.js)** ✅
  - ✅ `addKategori()` - Wrap dengan `try-finally`
  - ✅ `updateKategori()` - Wrap dengan `try-finally`

### 2. Client Component Files

- **[src/app/dashboard/master/barang/tambah/page.jsx](src/app/dashboard/master/barang/tambah/page.jsx)** ✅
  - ✅ Ganti `useState` → `useTransition`
  - ✅ Ganti `setIsPending(false)` → dihandle otomatis oleh `useTransition`
  - ✅ Gunakan `showError()` untuk error handling

- **[src/app/dashboard/master/barang/edit/[id]/EditBarangForm.jsx](src/app/dashboard/master/barang/edit/[id]/EditBarangForm.jsx)** ✅
  - ✅ Ganti `useState` → `useTransition`
  - ✅ Ganti `setIsPending(false)` → dihandle otomatis oleh `useTransition`
  - ✅ Gunakan `showError()` untuk error handling

- **[src/app/dashboard/master/kategori-produk/tambah/page.jsx](src/app/dashboard/master/kategori-produk/tambah/page.jsx)** ✅
  - ✅ Ganti `useState` → `useTransition`
  - ✅ Hapus error state manual
  - ✅ Gunakan `showError()` dari SweetAlert
  - ✅ Tambahkan `disabled={isPending}` ke input form

---

## 🎯 Checklist Perbaikan

### Server Actions

- [x] Identifikasi semua `redirect()` calls
- [x] Wrap logika bisnis dengan `try` block
- [x] Pindahkan `redirect()` ke `finally` block
- [x] Pastikan error validation tetap di `try` block
- [x] Test bahwa data tersimpan DAN redirect terjadi

### Client Components

- [x] Ganti `useState(false)` → `useTransition()`
- [x] Ganti `setIsPending(true)` → tidak perlu lagi
- [x] Ganti `setIsPending(false)` → tidak perlu lagi
- [x] Ganti `try-catch` → wrap dalam `startTransition()`
- [x] Tambahkan check untuk error message !== "NEXT_REDIRECT"

---

## 🚀 Cara Menerapkan ke Server Actions Lainnya

Jika ada Server Actions lain di folder `anggota/`, `pinjaman/`, `simpanan/`, dll yang memiliki masalah yang sama, gunakan pattern ini:

### Template Server Action yang Benar

```javascript
"use server";

import { redirect, revalidatePath } from "next/navigation";

export async function myServerAction(formData) {
  // 1. Validasi & authorization
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  // 2. Parse form data
  const name = formData.get("name");
  if (!name) throw new Error("Name required");

  try {
    // 3. Business logic (queries, validations, operations)
    const result = await prisma.table.create({
      data: { name, ...otherFields },
    });

    // 4. Audit log, revalidate
    await writeAuditLog({ ...logData });
    revalidatePath("/dashboard/page");
  } finally {
    // 5. ✅ Redirect SELALU di finally
    redirect("/dashboard/page");
  }
}
```

### Template Client Component yang Benar

```javascript
"use client";

import { useTransition } from "react";
import { myServerAction } from "./actions";
import { showError } from "@/lib/swal";

export default function MyForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Validasi client-side
    const name = formData.get("name");
    if (!name) {
      showError("Error", "Name required");
      return;
    }

    startTransition(async () => {
      try {
        await myServerAction(formData);
      } catch (err) {
        if (err.message !== "NEXT_REDIRECT") {
          showError("Error", err.message);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" disabled={isPending} />
      <button disabled={isPending}>{isPending ? "Loading..." : "Submit"}</button>
    </form>
  );
}
```

---

## 📚 Referensi Next.js

### Official Documentation

- [redirect() - Next.js Docs](https://nextjs.org/docs/app/api-reference/functions/redirect)
- [useTransition() - React Docs](https://react.dev/reference/react/useTransition)
- [Server Actions - Next.js Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

### Penting

> ⚠️ **JANGAN GUNAKAN TRY-CATCH UNTUK MENANGKAP REDIRECT()**
>
> `redirect()` melempar error khusus untuk kontrol alur. Menangkapnya akan mengganggu mekanisme redirecting Next.js.

---

## 🧪 Testing

### Test Scenario 1: Successful Insert dengan Redirect

```javascript
1. Fill form dengan data valid
2. Submit form
3. Verify:
   - ✅ Data tersimpan di database
   - ✅ Audit log tercatat
   - ✅ Popup error TIDAK muncul
   - ✅ Redirect ke list page terjadi
```

### Test Scenario 2: Validation Error

```javascript
1. Leave required field empty
2. Submit form
3. Verify:
   - ❌ Data TIDAK tersimpan
   - ❌ Popup error MUNCUL dengan pesan validasi
   - ❌ Tidak terjadi redirect
```

### Test Scenario 3: Duplicate Kode

```javascript
1. Fill form dengan kode yang sudah ada
2. Submit form
3. Verify:
   - ❌ Data TIDAK tersimpan
   - ✅ Popup error "Kode barang sudah terdaftar"
   - ❌ Tidak terjadi redirect
```

---

## 📞 Pertanyaan Umum

**Q: Bagaimana jika ada error di dalam `finally` block?**
A: Error di `finally` akan mengganggu redirect. Oleh karena itu, hanya `redirect()` yang boleh ada di `finally` block, tanpa operasi lainnya.

**Q: Apa perbedaan `useTransition` vs `useState`?**
A: `useTransition` lebih cocok untuk Server Actions karena:

- Secara otomatis manage pending state
- Handle async transitions dengan baik
- Lebih clean dan recommended oleh Next.js team

**Q: Apakah semua Server Actions perlu perbaikan ini?**
A: Ya, semua Server Actions yang menggunakan `redirect()` harus mengikuti pattern ini untuk menghindari error NEXT_REDIRECT.

---

## ✨ Kesimpulan

**Masalah:** NEXT_REDIRECT exception tertangkap oleh try-catch  
**Solusi:** Gunakan `try-finally` di Server Action dan `useTransition()` di Client Component  
**Hasil:** Data tersimpan dengan benar, user diredirect ke halaman list, SweetAlert hanya muncul jika ada error sesungguhnya

Selamat mencoba! 🎉

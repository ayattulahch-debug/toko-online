# Toko Akrilik Kreatif — Toko Online

Katalog toko online bergaya Shopee, jalan sepenuhnya di browser (tidak butuh server/backend).
Dibuat dengan **Vite + React + TypeScript + Tailwind CSS v4**.

## Fitur

- Beranda: pencarian produk, banner promo, grid kategori, dan daftar produk
- Filter cepat: Rekomendasi / Termurah / Premium
- Detail produk: galeri foto, harga coret, rating, deskripsi, tombol chat WhatsApp
- Halaman toko: banner, statistik, dan katalog produk
- Panel admin (CRUD): tambah/edit produk, kelola kategori, atur nama toko & banner
- Data tersimpan di `localStorage` browser, jadi perubahan admin tetap ada setelah refresh

## Menjalankan di localhost

```bash
cd toko-online
npm install
npm run dev
```

Buka http://localhost:5173/

Perintah lain:

```bash
npm run build     # typecheck + build produksi ke folder dist/
npm run preview   # uji hasil build secara lokal
npm run lint      # jalankan oxlint
```

## Login admin

Halaman admin dibuka dari halaman toko (ikon gerigi kanan atas), dengan kredensial:

- Username: `admin`
- Password: `admin123`

> Catatan keamanan: login ini berjalan di sisi browser dan hanya untuk demo. Jangan dipakai untuk
> data sensitif. Untuk toko sungguhan, pindahkan verifikasi ke backend.

## Kustomisasi cepat

- **Nomor WhatsApp tujuan** → `src/data.ts` (`WHATSAPP_NUMBER`), format `62812...` tanpa `+` atau `0` di depan
- **Produk, kategori, nama toko, banner** → bisa langsung diubah lewat panel admin, atau ubah nilai
  awal di `src/data.ts` (dipakai saat localStorage masih kosong)
- **Warna utama** → cari `#ee4d2d` (oranye khas Shopee)

## Struktur proyek

```
src/
  App.tsx                       # state utama + routing antar halaman
  data.ts                       # data awal produk, kategori, pengaturan toko
  types.ts                      # tipe TypeScript
  utils.ts                      # format harga & jumlah terjual
  hooks/usePersistentState.ts   # sinkronisasi state ke localStorage
  components/
    HomeView.tsx                # beranda
    ProductDetailView.tsx       # detail produk
    StoreView.tsx               # halaman toko
    ProductCard.tsx             # kartu produk (dipakai beranda & toko)
    AdminLoginView.tsx          # login pengelola
    AdminDashboardView.tsx      # dashboard admin
    AdminEditProductView.tsx    # form tambah/edit produk
    AdminCategoryView.tsx       # kelola kategori
    AdminSettingsView.tsx       # pengaturan tampilan toko
```

## Alur deploy: GitHub → Zenhosta (cPanel)

Karena aplikasi ini murni statis, hasil `npm run build` (folder `dist/`) bisa langsung di-upload ke hosting.

> **PENTING — jangan jalankan `git add .` dari folder `Pictures\Toko Online`.**
> Di komputer ini, repo git yang aktif ber-root di `C:\Users\El syafier` (home directory) dan
> terhubung ke remote `portfolio-ayat.git`. Menjalankan git dari sana berisiko menyeret seluruh
> profil Windows (NTUSER.DAT, AppData, Documents, dll) ke dalam commit.
> Buat repo git baru **khusus di dalam folder `toko-online`** (langkah 1 di bawah).

### 1. Buat repo git khusus untuk project ini

```bash
cd toko-online
git init
git add .
git commit -m "Toko online akrilik - versi awal"
```

`.gitignore` sudah disiapkan: `node_modules` dan `dist` tidak akan ikut ter-commit.

### 2. Push ke GitHub

Buat repository baru di GitHub (misal `toko-online`), lalu:

```bash
cd toko-online
git branch -M main
git remote add origin https://github.com/<username>/toko-online.git
git push -u origin main
```

Jika muncul error "remote origin already exists", berarti folder ini masih mewarisi remote induk —
hapus dulu dengan `git remote remove origin` lalu ulangi perintah di atas.

### 3. Build untuk produksi

```bash
cd toko-online
npm install
npm run build
```

Hasilnya ada di `toko-online/dist/` berisi `index.html` + folder `assets/`.

### 4. Upload ke cPanel Zenhosta

1. Login ke cPanel `zenhosta.com`
2. Buka **File Manager** → masuk ke `public_html`
3. Kalau ada `index.html` bawaan (halaman default hosting), hapus atau rename dulu
4. Upload **isi** folder `dist` (bukan foldernya), yaitu `index.html` + folder `assets`
   - Cara praktis: compress `dist` jadi `dist.zip`, upload, lalu **Extract** di dalam `public_html`
5. Pastikan strukturnya jadi: `public_html/index.html` dan `public_html/assets/...`
6. Buka `zenhosta.com` di browser

### Alternatif: deploy otomatis lewat Git di cPanel

Kalau cPanel Zenhosta menyediakan menu **Git™ Version Control**:

1. Daftarkan repository GitHub yang sama di menu tersebut
2. Clone ke direktori `public_html`
3. Setiap kali ada perubahan: `git push` ke GitHub, lalu klik **Update from Remote** di cPanel
4. Tetap jalankan `npm run build` di lokal dan upload folder `dist` — hosting statis tidak
   menjalankan Node.js, jadi build tidak bisa dilakukan di server

### Catatan penting saat deploy

- Aplikasi memakai gambar dari Unsplash dan font Inter dari Google Fonts, jadi butuh koneksi internet.
  Untuk sepenuhnya mandiri, unduh gambar/font dan simpan di `public/`.
- Semua data tersimpan di `localStorage` **per browser**. Produk yang diubah lewat panel admin hanya
  tampil di browser itu sendiri, tidak otomatis muncul untuk pengunjung lain. Kalau nanti butuh
  katalog yang sama untuk semua orang, perlu backend atau database.
- Aplikasi ini single-page tanpa URL routing, jadi tidak butuh konfigurasi `.htaccess` atau
  rewrite rule khusus di cPanel.

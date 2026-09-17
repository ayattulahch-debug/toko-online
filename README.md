# Toko Akrilik Kreatif — Toko Online

Katalog toko online bergaya Shopee dengan **data tersimpan di server**, bukan lagi di browser.
Dibuat dengan **Vite + React + TypeScript + Tailwind CSS v4** di sisi tampilan, dan
**PHP + MySQL** di sisi data — keduanya berjalan di satu paket cPanel biasa.

## Fitur

- Beranda: pencarian produk, banner promo (fotonya bisa diganti sendiri oleh penjual),
  grid kategori, dan daftar produk
- Filter cepat: Rekomendasi / Termurah / Premium
- Detail produk: galeri foto, harga coret, rating, deskripsi, tombol chat WhatsApp
- Halaman toko: banner, statistik, dan katalog produk
- Panel admin (login server-side): tambah / edit / hapus produk, kelola kategori beserta
  produk yang masuk ke dalamnya, atur nama toko, kedua banner, dan nomor WhatsApp,
  serta ganti password
- Gambar produk dikompres otomatis di browser sebelum diunggah, jadi hemat ruang hosting
- Katalog tersimpan di database, sehingga **semua pengunjung melihat data yang sama**

## Arsitektur

```
Pengunjung  ──►  index.html + assets/   (React SPA, hasil build Vite)
                     │
                     └── fetch ──►  /api/*.php  ──►  MySQL
                                        │
                                        └──►  /uploads/produk/  (foto hasil upload admin)
```

Kenapa bukan Node.js? Paket hosting cPanel ini tidak menjamin fitur "Setup Node.js App", dan RAM
0,5 GB terlalu sempit untuk proses Node yang jalan terus. PHP + MySQL selalu tersedia di cPanel dan
tidak menyimpan proses di memori.

## Struktur proyek

```
api/                              backend PHP (dibaca langsung oleh cPanel, tidak di-build)
  config.sample.php               contoh konfigurasi — disalin jadi config.php di hosting
  bootstrap.php                   koneksi PDO, helper JSON, autentikasi Bearer
  install.php                     instalasi sekali pakai (buat tabel + admin) — HAPUS setelah dipakai
  auth.php                        login, logout, ganti password
  catalog.php                     GET publik: produk + kategori + pengaturan
  products.php                    tambah / edit / hapus produk
  categories.php                  simpan daftar kategori
  category-products.php           pilih produk mana saja yang masuk satu kategori
  settings.php                    simpan pengaturan toko
  upload.php                      terima gambar (full + thumbnail)

public/.htaccess                  konfigurasi Apache, otomatis tersalin ke dist/
src/
  App.tsx                         state utama + routing antar halaman
  api.ts                          semua pemanggilan ke /api
  types.ts                        tipe TypeScript
  utils.ts                        format harga & jumlah terjual
  lib/image.ts                    kompres & perkecil gambar di browser
  hooks/useCatalog.ts             ambil katalog dari server + refresh
  components/                     seluruh tampilan (beranda, detail, admin, dll)

.github/workflows/deploy.yml      build otomatis → push ke branch `deploy`
```

## Menjalankan di localhost

Tampilan saja (pakai data dari server yang sudah online):

```bash
npm install
npm run dev
```

Untuk memakai backend lokal juga, buat `.env.local`:

```
VITE_API_BASE=https://domainmu.com/api
```

Cara itu tidak perlu PHP di komputer. Kalau PHP tersedia, backend bisa dijalankan lokal dengan
membuat `api/config.php` (salin dari `config.sample.php`) lalu:

```bash
php -S localhost:8000
npm run dev
```

Perintah lain:

```bash
npm run build     # typecheck + build produksi ke folder dist/
npm run preview   # uji hasil build secara lokal
npm run lint      # jalankan oxlint
```

> **Catatan Windows:** kalau `npm run build` gagal dengan `'tsc' is not recognized`, berarti
> variabel environment `NODE_ENV=production` sedang aktif sehingga `npm install` melewatkan
> devDependencies. Perbaiki dengan `npm install --include=dev`.

## Setup hosting (sekali saja)

### 1. Buat database

cPanel → **MySQL® Databases**:

1. Buat database, misal `toko`
2. Buat user database beserta password yang kuat
3. Tambahkan user itu ke database dengan **ALL PRIVILEGES**

Nama yang dipakai nanti akan berawalan username cPanel, misal `elsya_toko` dan `elsya_tokouser`.

### 2. Daftarkan repo di cPanel Git

cPanel → **Git™ Version Control** → **Create**:

- Clone URL: `https://github.com/<username>/<repo>.git`
- Branch: **`deploy`** (bukan `main`)
- Directory: `/home/<username>/public_html`

Bersihkan dulu isi `public_html` dari file bawaan hosting (misal `index.html` default) supaya
tidak bentrok.

Butuh branch `deploy` ini sudah ada. Caranya: push ke branch `main` di GitHub, lalu GitHub Actions
akan otomatis membangun situs dan mendorongnya ke branch `deploy` (lihat bagian berikutnya).

### 3. Buat file konfigurasi

Lewat cPanel **File Manager**, masuk ke `public_html/api`, lalu:

1. Salin `config.sample.php` menjadi `config.php`
2. Isi `db_name`, `db_user`, `db_pass` sesuai langkah 1
3. Ganti `setup_key` dengan teks rahasia pilihanmu

File ini tidak ikut Git, jadi tidak akan tertimpa saat update.

### 4. Jalankan instalasi

Buka `https://domainmu.com/api/install.php`, isi setup key dan tentukan username + password admin.
Halaman ini akan membuat tabel, mengisi data contoh, dan membuat akun admin.

**Setelah selesai, hapus `api/install.php` lewat File Manager.** Selama file itu ada, siapa pun yang
tahu setup key bisa membuat akun admin baru.

### 5. Aktifkan HTTPS

cPanel → **Domains** → aktifkan **Force HTTPS Redirect**, supaya password admin tidak dikirim
lewat koneksi tanpa enkripsi.

## Deploy setiap kali ada perubahan

```bash
git push          # ke branch main
```

Alurnya:

```
git push (main)
   └─ GitHub Actions: npm ci → npm run build → rakit branch `deploy` → push
        └─ cPanel → Git™ Version Control → klik "Update from Remote"
```

`GITHUB_TOKEN` bawaan dipakai untuk mendorong branch `deploy`, jadi **tidak perlu menambah secret**.

Folder `uploads/` dan `api/config.php` sengaja tidak di-track Git, sehingga foto yang sudah diunggah
dan kredensial database **aman** saat update. Jangan pernah menambahkan keduanya ke repo.

### Kenapa langkah terakhir masih manual?

Sempat dicoba dibuat otomatis: GitHub Actions memanggil API cPanel
(`VersionControl/update`, sama dengan tombol **Update from Remote**) memakai API token. Cara ini
**tidak berhasil** — firewall hosting menolak koneksi dari server GitHub ke port `2083`, sehingga
permintaannya selalu timeout.

Yang penting dipahami: ini **bukan** soal salah token, salah username, atau salah hostname. Port
`2083` terbuka normal dari jaringan lain (termasuk dari browser biasa) — kebijakan firewall
Zenhosta saja yang memblokir rentang IP GitHub. Karena tidak bisa diperbaiki dari sisi kode,
langkah otomatis itu **dihapus dari workflow** supaya tidak memunculkan error merah yang
menyesatkan di setiap push.

Kalau nanti ingin benar-benar otomatis, jalur yang tidak butuh koneksi masuk sama sekali adalah
**Cron Job di cPanel** yang menjalankan `git pull` di folder repo secara berkala — servernya sendiri
yang menarik perubahan, jadi tidak ada yang perlu diizinkan firewall.

### Kalau AutoSSL belum dijalankan

Situs ini bisa diakses lewat `elaseracrylic.my.id`, tapi selama sertifikatnya masih self-signed,
akses HTTPS ke domain itu akan memunculkan peringatan. Jalankan **Security → SSL/TLS Status →
Run AutoSSL** di cPanel sekali saja.

## Gambar dan kuota hosting

Paket yang dipakai punya 512 MB ruang. Karena itu setiap foto diperkecil otomatis di browser:

| Versi | Ukuran sisi terpanjang | Perkiraan ukuran | Dipakai di |
|---|---|---|---|
| Thumbnail | 400 px | ± 25 KB | grid katalog |
| Foto penuh | 1400 px | ± 180 KB | halaman detail |

Perkiraan total untuk 50 produk × 5 foto ≈ **50 MB**. Kalau nanti jumlah foto melewati ±350 MB
(kira-kira 300+ produk berfoto 5), baru pertimbangkan memindahkan gambar ke layanan seperti
Cloudinary.

## Keamanan

- Login diverifikasi **di server** dengan password ter-hash bcrypt, bukan di JavaScript
- Setiap aksi admin memakai token Bearer yang disimpan di tabel `admin_tokens` dan kedaluwarsa
  setelah 14 hari
- Semua query memakai prepared statement
- Upload divalidasi tipe MIME aslinya, dibatasi 2 MB, diberi nama acak, dan folder `uploads/`
  tidak bisa mengeksekusi PHP
- `.htaccess` memblokir akses ke folder `.git` dan berkas `.sql`/`.md`/`.log`

## Kalau ada masalah

| Gejala | Penyebab dan solusi |
|---|---|
| "Server belum dikonfigurasi" | `api/config.php` belum dibuat atau salah nama |
| "Tidak dapat terhubung ke database" | Cek `db_name`/`db_user`/`db_pass` di `api/config.php` |
| Login selalu "username atau password salah" | Akun admin belum dibuat — jalankan `install.php`, atau password salah |
| Katalog gagal dimuat | Buka `https://domainmu.com/api/catalog.php`; kalau muncul pesan error, itu penyebabnya |
| Login berhasil di lokal tapi gagal di hosting | Header `Authorization` tidak diteruskan — pastikan `.htaccess` ikut ter-upload |
| Gambar tidak muncul setelah upload | Pastikan folder `public_html/uploads/produk` ada dan bisa ditulis (permission 755) |
| Perubahan tidak muncul di situs | Pastikan GitHub Actions selesai tanpa error, lalu klik **Update from Remote** di cPanel → Git™ Version Control. Langkah itu memang masih manual |
| `Update from Remote` gagal karena "tree kotor" | Ada berkas yang diubah langsung di server sehingga `git pull` menolak. Batalkan perubahan berkas tersebut lewat File Manager |

## Batasan

- Katalog memuat seluruh produk sekaligus. Masih tepat untuk di bawah 100 produk; kalau nanti jauh
  lebih banyak, perlu pagination di sisi server.
- Belum ada keranjang dan pembayaran online — transaksi lewat WhatsApp, sesuai kebutuhan.
- Produk contoh memakai gambar dari Unsplash. Ganti dengan foto aslimu lewat panel admin agar
  katalog tidak bergantung pada situs luar.

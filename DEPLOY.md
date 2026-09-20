# Panduan Penyebaran — Torang Bersih

## Status saat ini (19 September 2026)

| | Alamat | Tempat |
|---|---|---|
| **Situs** | https://torangbersih.vercel.app | Vercel, proyek `torang-bersih` |
| **API** | https://api-production-003f6.up.railway.app | Railway, proyek `torang-bersih-api`, layanan `api` |

- Perintah mulai backend diatur di `be/railpack.json`. `be/railway.json` **tidak
  dibaca** oleh Railpack — jangan mengandalkannya untuk mengubah perintah mulai.
- CORS backend hanya menerima `localhost:5173` dan dua alamat Vercel proyek ini.
- Login Google memakai client OAuth `224263520652-b344…` (proyek Google Cloud
  "MineApp"). Anggota tim yang menjalankan frontend secara lokal harus memakai
  client ID ini di `fe/.env` masing-masing.
- Menambah alamat frontend baru berarti menambahkannya di dua tempat: variabel
  `CORS_ORIGINS` di Railway **dan** "Authorized JavaScript origins" di Google
  Cloud Console.

**Jalur utama: backend di Railway, frontend di Vercel.**

- Backend → **Bagian R** (tepat di bawah ini)
- Frontend → **Bagian 0.2**
- Bagian 0.1 (backend di Vercel) dan Bagian 1–4 (Netlify + server sendiri)
  disimpan sebagai cadangan.

Langkah pertama tetap **Bagian 0.0: pulihkan database Supabase** — tanpa itu
backend di mana pun tidak bisa mengambil data.

---

## Bagian R — Backend di Railway

Kenapa Railway lebih cocok dari Vercel untuk backend ini: servernya **terus
hidup**, jadi tidak ada batas ukuran unggahan 4,5 MB, tidak ada jeda "bangun"
di permintaan pertama, dan koneksi database dipakai ulang antar-permintaan.

### R.1 Pasang dan login (Anda sendiri)

```powershell
npm install -g @railway/cli
railway login
```

### R.2 Buat layanan dan unggah

```powershell
cd be
railway init        # buat proyek baru, beri nama mis. torang-bersih-api
railway up          # unggah folder be dan mulai build
```

`railway up` mengikuti `.gitignore`, jadi `.venv` (117 MB) dan `.env` tidak
ikut terunggah.

Yang sudah disiapkan di kode, tidak perlu disentuh:

- `be/railway.json` — builder Railpack, server dijalankan dengan **gunicorn**
  (2 worker × 4 thread, batas waktu 120 detik untuk jawaban chatbot), cek
  kesehatan di `/health`, dan otomatis dinyalakan ulang kalau mogok.
- `be/.python-version` — Python **3.11**, sama dengan versi yang dipakai dan
  diuji di komputer pengembang.
- Pool koneksi dibatasi **5 per worker** (total 10), di bawah kuota pooler
  Supabase paket gratis (15). Bawaan SQLAlchemy bisa membuka sampai 30.

### R.3 Variabel lingkungan

Railway → layanan → **Variables** → **Raw Editor**, tempel isi `be/.env`, lalu
ubah tiga baris ini:

```
FLASK_ENV=production
SECRET_KEY=<nilai acak baru>
JWT_SECRET_KEY=<nilai acak baru, berbeda>
```

Nilai acak:
```powershell
.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
```

**Hapus** baris `PORT` dan `HOST` dari yang ditempel — Railway mengisi `PORT`
sendiri, dan kalau ditimpa 5000 server bisa tidak terjangkau.

**Di `DATABASE_URL`, ganti port `:5432/` menjadi `:6543/`** (host dan sisanya
tetap). Diukur 18 September 2026 dari alamat yang sama:

| Pooler Supabase | median per query | terburuk |
|---|---|---|
| session, port 5432 | 585 ms | 1.187 ms |
| transaction, port 6543 | 335 ms | 494 ms |

Mode transaction lebih stabil karena koneksinya dibagi per transaksi, bukan
dikunci per klien.

Server **menolak menyala** di mode produksi kalau dua kunci itu masih nilai
contoh — itu disengaja. Kalau deploy gagal dengan pesan "Mode produksi
ditolak", artinya langkah ini terlewat.

### R.4 Alamat publik dan region

1. Layanan → **Settings → Networking → Generate Domain**. Hasilnya seperti
   `https://torang-bersih-api-production.up.railway.app`.
2. **Settings → Region → Southeast Asia (Singapore)** — region Railway
   terdekat dengan database Supabase di Tokyo. Bawaannya di AS, dan dari sana
   setiap query menyeberang Pasifik.
3. Buka `https://<alamat>/health` → harus membalas
   `{"success": true, "message": "OK"}`.

> `/health` sengaja tidak menyentuh database. Jadi kalau `/health` berhasil tapi
> daftar laporan kosong atau galat, masalahnya di database (lihat 0.0), bukan
> di server.

Setelah itu lanjut ke **Bagian 0.2** untuk frontend, dengan
`VITE_API_URL=https://<alamat-railway>/api`. Setelah frontend punya alamat,
kembali ke Railway → Variables → isi `CORS_ORIGINS` dan `FRONTEND_URL` dengan
alamat frontend itu.

---

## Bagian 0 — Vercel (frontend + backend)

Dua proyek Vercel terpisah dari satu repositori: satu untuk `be`, satu untuk
`fe`. **Backend dulu**, karena alamatnya dibutuhkan frontend.

### 0.0 Pulihkan database Supabase — WAJIB, lakukan paling awal

Per 18 September 2026 database **tidak bisa dihubungi sama sekali**, bahkan
dari mode pengembangan tanpa perubahan apa pun. Supabase membalas
`tenant/user not found`, galat yang muncul saat proyek **dijeda**. Paket gratis
Supabase menjeda proyek otomatis setelah 7 hari tanpa aktivitas.

Buka supabase.com → pilih proyek → **Restore project**. Tunggu sampai
statusnya aktif. Sebelum ini selesai, backend di mana pun tidak akan bisa
mengambil data.

> Jaga agar tidak dijeda lagi menjelang penilaian: cukup buka situsnya atau
> panggil satu endpoint API setidaknya sekali dalam seminggu.

### 0.1 Backend

1. vercel.com → **Add New → Project** → impor repositori ini.
2. **Root Directory: `be`**. Framework terdeteksi otomatis sebagai Flask —
   Vercel mencari objek `app` di `server.py`, dan itu sudah ada.
3. **Environment Variables** — salin dari `be/.env`, dengan tiga perbedaan:

   | Nama | Nilai |
   |---|---|
   | `FLASK_ENV` | `production` |
   | `SECRET_KEY` | nilai acak baru (lihat di bawah) |
   | `JWT_SECRET_KEY` | nilai acak baru, berbeda dari di atas |
   | `CORS_ORIGINS` | alamat frontend Vercel, diisi lagi setelah 0.2 |
   | `FRONTEND_URL` | alamat frontend Vercel, diisi lagi setelah 0.2 |
   | sisanya | `DATABASE_URL`, `CLOUDINARY_*`, `MAIL_*`, `RESEND_API_KEY`, `MAIL_FROM`, `GEMINI_API_KEY` — salin apa adanya |

   Nilai acak:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(48))"
   ```
   Server **menolak menyala** di mode produksi kalau dua kunci itu masih nilai
   contoh — itu disengaja.
4. **Deploy.** Buka `https://<proyek-be>.vercel.app/health` → harus membalas
   `{"success": true, "message": "OK"}`.

Yang sudah disiapkan di kode, tidak perlu disentuh:

- `be/vercel.json` — fungsi dijalankan di **Tokyo (`hnd1`)**, satu wilayah
  dengan database Supabase. Bawaan Vercel adalah AS Timur; dari sana setiap
  query menyeberang Pasifik dan halaman daftar jadi ratusan milidetik lebih
  lambat.
- `be/.vercelignore` — yang terunggah cuma ±511 KB. Tanpa berkas ini, `.venv`
  (117 MB) ikut terunggah.
- Pool koneksi otomatis berganti ke `NullPool` saat berjalan di Vercel,
  supaya instans fungsi yang berumur pendek tidak menahan koneksi Supabase.

### 0.2 Frontend

1. **Add New → Project** → repositori yang sama → **Root Directory: `fe`**.
   Framework terdeteksi sebagai Vite.
2. **Environment Variables:**

   | Nama | Nilai |
   |---|---|
   | `VITE_API_URL` | `https://<proyek-be>.vercel.app/api` |
   | `VITE_GOOGLE_CLIENT_ID` | salin dari `fe/.env` |

   Variabel di dasbor Vercel mengalahkan isi `fe/.env.production`, jadi
   placeholder di berkas itu tidak perlu diubah.
3. **Deploy.**
4. Kembali ke proyek **backend** → isi `CORS_ORIGINS` dan `FRONTEND_URL`
   dengan alamat frontend ini → **Redeploy** backend.
5. Google Cloud Console → Credentials → OAuth Client → **Authorized JavaScript
   origins** → tambahkan alamat frontend.

### 0.3 Batas Vercel yang perlu diketahui

- **Ukuran unggahan per permintaan maksimal 4,5 MB.** Foto kini dimampatkan
  otomatis di peramban sebelum dikirim (sisi terpanjang 1600px, WebP), jadi
  satu foto ponsel ±300 KB. Kalau totalnya tetap lebih dari 4,2 MB, pengguna
  mendapat pesan yang jelas alih-alih galat 413.
- Pembatas laju (rate limit) disimpan di memori tiap instans, jadi di Vercel
  sifatnya per instans, bukan global. Tetap berfungsi, hanya kurang ketat.

---

## Bagian 1 — Backend dulu, jangan frontend

Urutannya penting. Alamat backend dipanggang ke dalam berkas frontend saat
dibangun, jadi alamat itu harus sudah ada dan sudah bisa dijangkau sebelum
frontend dibangun.

### 1.1 Jalankan backend supaya bisa dijangkau dari internet

Netlify menyajikan situs lewat HTTPS. Peramban modern **menolak** permintaan
dari halaman HTTPS ke alamat HTTP biasa (disebut *mixed content*), dan
penolakannya senyap — hanya muncul di konsol. Jadi backend wajib punya HTTPS.

Dua jalur yang masuk akal untuk kondisi "server sendiri":

| Jalur | Kapan dipakai | Alamat yang didapat |
|---|---|---|
| **Cloudflare Tunnel** / **ngrok** | server di komputer sendiri atau di balik router tanpa IP publik | `https://xxx.ngrok-free.app` |
| **Domain + Nginx + Certbot** | server punya IP publik | `https://api.domain-anda.com` |

Catatan untuk ngrok gratis: alamatnya **berubah setiap kali ngrok
dijalankan ulang**. Setiap kali berubah, frontend harus dibangun dan diunggah
ulang. Kalau situs ini akan dinilai orang lain di waktu yang tidak Anda kendalikan,
pakai Cloudflare Tunnel (alamatnya tetap dan gratis) — bukan ngrok gratisan.

### 1.2 Izinkan alamat Netlify di backend

Di `be/.env`, tambahkan domain Netlify Anda ke `CORS_ORIGINS`, dipisah koma
tanpa spasi:

```
CORS_ORIGINS=http://localhost:5173,https://nama-situs-anda.netlify.app
```

Kalau langkah ini terlewat, situsnya terbuka normal tetapi **semua data gagal
dimuat**, dan pesan errornya hanya terlihat di konsol peramban. Ini penyebab
kegagalan penyebaran nomor satu.

> **Catatan:** `be/.env` saat ini berisi `*` di akhir daftar
> (`...localhost:3000,*`), sehingga backend menerima permintaan dari situs
> mana pun. Risikonya **rendah** di aplikasi ini: token login dikirim lewat
> header `Authorization` (`JWT_TOKEN_LOCATION = ['headers']`), bukan cookie,
> jadi situs lain tidak punya kredensial pengunjung yang bisa ikut terbawa.
> Tetap lebih rapi kalau `*` diganti daftar domain yang benar-benar dipakai.
>
> *(Versi sebelumnya dokumen ini menyebut risikonya tinggi — itu keliru, sudah
> dikoreksi setelah diperiksa.)*

### 1.2a Mode produksi dan kunci rahasia — WAJIB

Di `be/.env` server:

```
FLASK_ENV=production
SECRET_KEY=<nilai acak baru>
JWT_SECRET_KEY=<nilai acak baru>
```

Buat masing-masing nilai acak dengan:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Dua alasan, dan keduanya serius:

- **`SECRET_KEY` dan `JWT_SECRET_KEY` di `.env` sekarang masih kalimat contoh.**
  Nilai contoh itu tertulis di `.env.example` pada repositori publik. Siapa pun
  yang membacanya bisa membuat token login sendiri dan masuk sebagai **admin**
  tanpa kata sandi. Server kini **menolak menyala** di mode produksi selama
  kuncinya masih nilai contoh (lihat `be/app/config/environment.py`).
- **`FLASK_ENV=development` menyalakan debugger Werkzeug.** Kalau server
  dijalankan dengan `python server.py` lalu dibuka ke internet lewat tunnel,
  debugger itu memungkinkan siapa pun **menjalankan kode apa saja di komputer
  Anda**.

Jalankan server dengan waitress (sudah ada di `requirements.txt`), bukan
`python server.py`:

```bash
waitress-serve --host=127.0.0.1 --port=5000 server:app
```

Mengganti kunci JWT membuat semua orang yang sedang login harus login ulang
sekali. Itu wajar.

### 1.2b Ganti kredensial yang bocor di riwayat git — WAJIB

Repositori `Niel-D22/waste-management-app` **publik**, dan dua commit tanggal
12 Maret 2026 (`312fee9`, `8e4e3d2`) menyimpan nilai asli di `be/.env.example`
untuk:

- `CLOUDINARY_API_SECRET`
- `MAIL_PASSWORD` (sandi aplikasi Gmail)

Nilainya sudah tidak ada di versi terbaru, tetapi **riwayat git tetap bisa
dibaca siapa pun**. Menghapus berkasnya sekarang tidak menarik kembali apa yang
sudah terlanjur publik.

Satu-satunya perbaikan yang benar adalah **mengganti kredensialnya**:

1. **Cloudinary** → Dashboard → Settings → API Keys → buat API key baru, hapus
   yang lama. Isi nilai baru di `be/.env`.
2. **Gmail** → myaccount.google.com → Security → App passwords → cabut sandi
   aplikasi lama, buat yang baru. Isi di `MAIL_PASSWORD`.

Membersihkan riwayat git (`git filter-repo`) boleh dilakukan sesudahnya, tapi
itu opsional dan butuh force-push — lakukan sendiri kalau mau, dan hanya setelah
kredensialnya diganti. Tanpa penggantian, pembersihan riwayat tidak ada artinya:
salinan repositori mungkin sudah diambil orang.

### 1.3 Pastikan backend benar-benar hidup

```bash
curl https://alamat-backend-anda.com/health
# harus membalas: {"success": true, "message": "OK"}
```

Kalau perintah ini gagal, berhenti di sini. Melanjutkan ke frontend hanya akan
menghasilkan situs yang terlihat hidup tapi kosong.

---

## Bagian 2 — Frontend ke Netlify

### 2.1 Isi alamat backend

Buka `fe/.env.production`, ganti barisnya:

```
VITE_API_URL=https://alamat-backend-anda.com/api
```

Jangan lupa `/api` di ujungnya.

Kalau baris ini masih berisi placeholder atau menunjuk ke `localhost`, perintah
build akan **berhenti dengan pesan yang menjelaskan masalahnya**. Itu disengaja —
lihat `fe/vite.config.js`.

### 2.2 Bangun

```bash
cd fe
npm install
npm run build
```

Hasilnya ada di `fe/dist` (sekitar 5,6 MB).

### 2.3 Unggah

Buka [app.netlify.com/drop](https://app.netlify.com/drop), lalu **seret folder
`fe/dist`** ke sana. Bukan isinya, bukan folder `fe` — folder `dist`-nya.

Berkas `_redirects` dan `_headers` sudah ikut di dalam `dist` dan akan langsung
dibaca Netlify:

- `_redirects` membuat alamat seperti `/peta` bisa dibuka langsung dan dimuat
  ulang tanpa jadi 404.
- `_headers` mengatur masa simpan cache dan beberapa tajuk keamanan.

> `netlify.toml` di akar folder `fe` **tidak berlaku** untuk cara seret-lepas,
> karena berkas itu tidak ikut masuk ke `dist`. Berkas itu hanya berguna kalau
> nanti menyebar lewat Git. Itulah sebabnya aturan yang sama disimpan juga di
> `fe/public/_redirects`.

### 2.4 Daftarkan domain di Google OAuth

Google Cloud Console → **Credentials** → OAuth Client → **Authorized JavaScript
origins**, tambahkan `https://nama-situs-anda.netlify.app`.

Tanpa ini, tombol "Masuk dengan Google" ditolak dengan galat `redirect_uri_mismatch`.

---

## Bagian 3 — Daftar periksa setelah tayang

Buka situsnya dan pastikan semuanya, satu per satu:

- [ ] Logo muncul di tab peramban
- [ ] Halaman depan tampil lengkap dengan ilustrasi
- [ ] `/peta` menampilkan penanda (artinya backend tersambung)
- [ ] Muat ulang di `/peta` **tidak** menghasilkan 404
- [ ] Daftar artikel terisi
- [ ] Daftar aset, kolaborator, laporan terisi
- [ ] Login dan daftar berfungsi
- [ ] Tautan situs ditempel di WhatsApp memunculkan gambar pratinjau
- [ ] Buka lewat ponsel — tata letak tidak melebar ke samping
- [ ] Tekan Tab dari atas: muncul tombol "Lewati ke konten utama"
- [ ] Buka `/alamat-ngawur` → muncul halaman 404 bertema, **bukan** halaman login
- [ ] Sudah masuk, buka `/username-orang-lain` → muncul 404, bukan dasbor sendiri
- [ ] Judul tab saat di halaman 404 berbunyi "Halaman tidak ditemukan"

Kalau data tidak muncul: buka **DevTools → Console**. Pesan yang mengandung
`CORS` berarti langkah 1.2 terlewat. Pesan `Mixed Content` berarti backend
masih HTTP, bukan HTTPS.

---

## Bagian 4 — Kalau logo atau gambar diganti

Berkas gambar asli (PNG/JPG) disimpan di `fe/assets-src/images/`, **bukan** di
`fe/public/`. Ini disengaja: semua isi `public/` ikut terunggah, dan berkas asli
berukuran total 29,5 MB padahal tidak satu pun dirujuk oleh kode — kode hanya
memakai versi `.webp`-nya.

Alur kerjanya:

```bash
# 1. taruh berkas baru di fe/assets-src/images/
# 2. ubah jadi webp di public/images/
npm run optimize:images

# 3. kalau yang diganti logo, buat ulang favicon & gambar pratinjau
npm run generate:brand
```

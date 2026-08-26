# Panduan Penyebaran — Torang Bersih

Frontend ke **Netlify** (seret-lepas folder `dist`), backend di **server sendiri**.

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

> **Perhatikan:** `be/.env` saat ini berisi `*` di akhir daftar
> (`...localhost:3000,*`). Tanda itu membuat backend menerima permintaan dari
> **situs mana pun**, bukan hanya milik Anda. Digabung dengan
> `supports_credentials=True` di `be/app/__init__.py`, artinya situs pihak
> ketiga bisa memanggil API ini memakai kredensial pengunjung yang sedang login.
>
> Untuk demo hal itu memudahkan, tetapi sebelum dinilai sebaiknya `*` dihapus
> dan diganti daftar domain yang benar-benar dipakai. Selama `*` masih ada,
> menambahkan domain Netlify sebetulnya tidak wajib — situsnya akan tetap jalan,
> hanya saja pintunya terbuka untuk semua orang.

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

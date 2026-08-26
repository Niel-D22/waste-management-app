/**
 * generate-brand-assets.mjs
 *
 * Menghasilkan berkas ikon situs (favicon, ikon layar utama) dan gambar
 * pratinjau tautan (Open Graph) dari satu sumber: public/images/logo.png.
 *
 * Dijalankan sekali saat logo berubah, bukan setiap build — hasilnya berkas
 * statis yang ikut masuk repositori. Alasannya: ukurannya kecil, tidak sering
 * berubah, dan membangunnya saat build hanya menambah ketergantungan pada
 * `sharp` di mesin yang melakukan build.
 *
 *   npm run generate:brand
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const SRC = path.join(ROOT, "assets-src");

const LOGO = path.join(SRC, "images", "logo.png");
const LOGO_PUTIH = path.join(SRC, "images", "logo-fill.png");
const LATAR_HERO = path.join(SRC, "images", "Hero asset", "BG-Hero.png");

// Warna latar untuk ikon yang TIDAK boleh transparan. iOS dan Android
// menempelkan ikon di atas latar buatan mereka sendiri kalau alfanya kosong —
// biasanya hitam, yang membuat logo navy kita nyaris hilang.
const LATAR_IKON = { r: 255, g: 255, b: 255, alpha: 1 };

/** Memuat logo, memangkas pinggiran transparannya, lalu menyimpannya di memori. */
async function muatLogoTerpangkas() {
  // trim() penting: kanvas logo aslinya punya sisa transparan di sekelilingnya.
  // Tanpa dipangkas, logo di favicon 32px terlihat mengambang kekecilan karena
  // sebagian ruangnya habis untuk margin kosong.
  return sharp(LOGO).trim().png().toBuffer();
}

/** Ikon persegi dengan logo di tengah dan padding proporsional. */
async function buatIkon(sumber, ukuran, tujuan, { latar = null, padding = 0.1 } = {}) {
  const isi = Math.round(ukuran * (1 - padding * 2));
  const logo = await sharp(sumber)
    .resize(isi, isi, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: ukuran,
      height: ukuran,
      channels: 4,
      background: latar ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(tujuan);

  const kb = (fs.statSync(tujuan).size / 1024).toFixed(1);
  console.log(`  ${path.relative(ROOT, tujuan).padEnd(34)} ${ukuran}x${ukuran}  ${kb} KB`);
}

/**
 * Gambar pratinjau tautan 1200x630 — yang muncul saat tautan situs dibagikan
 * di WhatsApp, Discord, X, atau LinkedIn. Tanpa berkas ini, tautan tampil
 * sebagai teks polos tanpa gambar.
 */
async function buatGambarPratinjau() {
  const L = 1200;
  const T = 630;

  // Latar hero dipotong "cover" supaya rasio 3:2 miliknya menyesuaikan kanvas
  // 1,9:1 tanpa gepeng.
  const latar = await sharp(LATAR_HERO).resize(L, T, { fit: "cover", position: "bottom" }).toBuffer();

  // Selubung putih tipis di atas gambar. Langit hero sudah terang, tapi bagian
  // bawahnya berisi pasir dan objek — tanpa selubung, teks navy di atasnya
  // kehilangan kontras persis di area yang paling ramai.
  const selubung = Buffer.from(
    `<svg width="${L}" height="${T}">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0%"  stop-color="#ffffff" stop-opacity="0.92"/>
           <stop offset="55%" stop-color="#ffffff" stop-opacity="0.72"/>
           <stop offset="100%" stop-color="#ffffff" stop-opacity="0.10"/>
         </linearGradient>
       </defs>
       <rect width="${L}" height="${T}" fill="url(#g)"/>
     </svg>`,
  );

  const logo = await sharp(await muatLogoTerpangkas())
    .resize(150, 150, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const teks = Buffer.from(
    `<svg width="${L}" height="${T}" xmlns="http://www.w3.org/2000/svg">
       <style>
         .judul { font-family: "Segoe UI", "Plus Jakarta Sans", sans-serif; font-size: 78px; font-weight: 800; fill: #1d1c78; }
         .sub   { font-family: "Segoe UI", "Raleway", sans-serif; font-size: 30px; font-weight: 500; fill: #33326b; }
         .label { font-family: "Segoe UI", "Raleway", sans-serif; font-size: 22px; font-weight: 700; fill: #10bbe2; letter-spacing: 3px; }
       </style>
       <text class="label" x="92" y="245">SULAWESI UTARA</text>
       <text class="judul" x="90" y="330">Torang Bersih</text>
       <text class="sub" x="92" y="392">Satu platform untuk warga, komunitas, dan</text>
       <text class="sub" x="92" y="436">pemerintah menjaga lingkungan dari sampah.</text>
     </svg>`,
  );

  const tujuan = path.join(PUBLIC, "og-image.jpg");
  await sharp(latar)
    .composite([
      { input: selubung, top: 0, left: 0 },
      { input: logo, top: 74, left: 84 },
      { input: teks, top: 0, left: 0 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(tujuan);

  const kb = (fs.statSync(tujuan).size / 1024).toFixed(1);
  console.log(`  ${path.relative(ROOT, tujuan).padEnd(34)} ${L}x${T}  ${kb} KB`);
}

async function main() {
  for (const berkas of [LOGO, LOGO_PUTIH, LATAR_HERO]) {
    if (!fs.existsSync(berkas)) {
      console.error(`Berkas sumber tidak ada: ${path.relative(ROOT, berkas)}`);
      process.exit(1);
    }
  }

  const logo = await muatLogoTerpangkas();

  console.log("Ikon situs:");
  // Favicon dibiarkan transparan supaya menyatu dengan tab terang maupun gelap.
  await buatIkon(logo, 16, path.join(PUBLIC, "favicon-16.png"), { padding: 0.02 });
  await buatIkon(logo, 32, path.join(PUBLIC, "favicon-32.png"), { padding: 0.02 });
  await buatIkon(logo, 180, path.join(PUBLIC, "apple-touch-icon.png"), {
    latar: LATAR_IKON,
    padding: 0.12,
  });
  await buatIkon(logo, 192, path.join(PUBLIC, "icon-192.png"), { latar: LATAR_IKON, padding: 0.12 });
  await buatIkon(logo, 512, path.join(PUBLIC, "icon-512.png"), { latar: LATAR_IKON, padding: 0.12 });

  console.log("\nGambar pratinjau tautan:");
  await buatGambarPratinjau();

  console.log("\nSelesai.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

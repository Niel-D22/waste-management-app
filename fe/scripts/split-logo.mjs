/**
 * Memecah logo.png menjadi dua lapisan terpisah berdasarkan warnanya.
 *
 * Logo Torang Bersih tersusun dari elemen yang memang tidak menyatu: arc cyan
 * di kiri atas, huruf T navy dengan garis ombak, dan daun cyan di kanan bawah.
 * Analisis piksel menunjukkan isinya praktis hanya DUA warna — cyan #10bbe2
 * (39%) dan navy #1d1c78 (58%) — jadi keduanya bisa dipisah tepat tanpa perlu
 * file desain aslinya dan tanpa menggambar ulang apa pun.
 *
 * Hasilnya dua PNG transparan yang bisa digerakkan sendiri-sendiri di halaman
 * (kecepatan parallax berbeda), sehingga logonya terlihat "terurai" saat
 * di-scroll lalu menyatu kembali.
 *
 * Piksel tepi yang beranti-alias tidak dibuang, tapi diberikan ke warna yang
 * jaraknya paling dekat. Kalau dibuang, kedua lapisan akan punya pinggiran
 * bergerigi saat ditumpuk kembali.
 *
 * Jalankan: npm run split:logo
 */
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "public", "images", "logo.png");
const OUT_DIR = join(ROOT, "public", "images", "logo-parts");

const CYAN = [0x10, 0xbb, 0xe2];
const NAVY = [0x1d, 0x1c, 0x78];

const dist2 = (d, i, c) =>
  (d[i] - c[0]) ** 2 + (d[i + 1] - c[1]) ** 2 + (d[i + 2] - c[2]) ** 2;

const { data, info } = await sharp(SOURCE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const cyanBuf = Buffer.from(data);
const navyBuf = Buffer.from(data);

let cyanCount = 0;
let navyCount = 0;

for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] < 8) continue;

  if (dist2(data, i, CYAN) <= dist2(data, i, NAVY)) {
    navyBuf[i + 3] = 0; // buang dari lapisan navy
    cyanCount++;
  } else {
    cyanBuf[i + 3] = 0; // buang dari lapisan cyan
    navyCount++;
  }
}

const raw = { raw: { width: info.width, height: info.height, channels: 4 } };

await sharp(cyanBuf, raw)
  .trim() // pangkas ruang transparan supaya tiap lapisan bisa diposisikan sendiri
  .webp({ quality: 90 })
  .toFile(join(OUT_DIR, "logo-cyan.webp"));

await sharp(navyBuf, raw)
  .trim()
  .webp({ quality: 90 })
  .toFile(join(OUT_DIR, "logo-navy.webp"));

console.log(`cyan: ${cyanCount} piksel  ->  logo-parts/logo-cyan.webp`);
console.log(`navy: ${navyCount} piksel  ->  logo-parts/logo-navy.webp`);

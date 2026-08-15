/**
 * Mengubah PNG/JPG di public/images menjadi WebP.
 *
 * Kenapa perlu: aset ilustrasi di landing page berupa PNG hasil generate AI,
 * ukurannya 0,9-1,8 MB per file. Isinya bentuk-bentuk datar dengan sedikit
 * warna — jenis gambar yang paling boros disimpan sebagai PNG dan paling
 * efisien sebagai WebP.
 *
 * File aslinya TIDAK dihapus. WebP ditulis berdampingan, jadi kalau hasilnya
 * mengecewakan tinggal kembalikan path di kode tanpa kehilangan apa pun.
 *
 * Jalankan: npm run optimize:images
 */
import { readdir, stat, writeFile } from "node:fs/promises";
import { join, extname, basename, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES_DIR = join(ROOT, "public", "images");

// Lebar maksimum. Tidak ada aset di halaman ini yang pernah ditampilkan lebih
// lebar dari layar, jadi menyimpan lebih dari 1600px hanya membuang byte —
// bahkan di layar retina sekalipun untuk gambar dekoratif seperti ini.
const MAX_WIDTH = 1600;
const QUALITY = 80;

const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg"]);

async function collect(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collect(full)));
    else if (SOURCE_EXT.has(extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function kb(bytes) {
  return (bytes / 1024).toFixed(0).padStart(6);
}

const files = await collect(IMAGES_DIR);
let before = 0;
let after = 0;

for (const file of files.sort()) {
  const original = (await stat(file)).size;
  const image = sharp(file);
  const meta = await image.metadata();

  // withoutEnlargement: gambar yang sudah lebih kecil dari MAX_WIDTH dibiarkan
  // apa adanya, tidak diperbesar (memperbesar hanya menambah byte tanpa
  // menambah detail).
  const buffer = await image
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  const target = join(dirname(file), `${basename(file, extname(file))}.webp`);
  await writeFile(target, buffer);

  before += original;
  after += buffer.length;

  const saved = (100 * (1 - buffer.length / original)).toFixed(0);
  console.log(
    `${kb(original)} KB -> ${kb(buffer.length)} KB  (-${saved.padStart(2)}%)  ` +
      `${relative(IMAGES_DIR, file).replace(/\\/g, "/")}  [${meta.width}x${meta.height}]`,
  );
}

console.log(
  `\nTOTAL  ${(before / 1024 / 1024).toFixed(2)} MB -> ` +
    `${(after / 1024 / 1024).toFixed(2)} MB  ` +
    `(hemat ${(100 * (1 - after / before)).toFixed(0)}%)`,
);

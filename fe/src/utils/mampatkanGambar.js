/**
 * Memampatkan foto di peramban SEBELUM diunggah.
 *
 * Dua alasan, keduanya konkret:
 *
 * 1. Batas penyebaran. Backend di Vercel menolak permintaan yang badannya lebih
 *    dari 4,5 MB (galat 413). Formulir laporan mengizinkan 5 foto; satu foto
 *    kamera ponsel saja sudah 2–5 MB. Tanpa pemampatan, laporan dengan lebih
 *    dari satu foto akan selalu gagal.
 *
 * 2. Jaringan lambat. Foto 4 MB di sinyal 3G butuh sekitar setengah menit
 *    untuk terkirim. Diperkecil ke sisi terpanjang 1600px, foto yang sama
 *    tinggal ±300 KB — tetap tajam di layar mana pun, dan terkirim dalam
 *    beberapa detik.
 *
 * Dipasang di interceptor axios (lihat services/api/axios.jsx), jadi seluruh
 * 12 titik unggah di aplikasi ikut termampatkan tanpa satu pun diubah.
 */

// Tidak ada tempat di situs ini yang menampilkan foto lebih lebar dari 1600px.
const SISI_TERPANJANG = 1600;
const KUALITAS = 0.82;
// Foto yang sudah sekecil ini tidak perlu disentuh — memampatkannya lagi hanya
// menurunkan kualitas tanpa menghemat berarti.
const LEWATI_JIKA_DI_BAWAH = 300 * 1024;

// Sedikit di bawah batas 4,5 MB Vercel, menyisakan ruang untuk isian teks
// dan pembatas multipart di badan permintaan yang sama.
export const BATAS_TOTAL_UNGGAH = 4.2 * 1024 * 1024;

function kanvasKeBlob(kanvas, tipe, kualitas) {
  return new Promise((resolve) => kanvas.toBlob(resolve, tipe, kualitas));
}

export async function mampatkanGambar(berkas) {
  if (!(berkas instanceof File)) return berkas;
  // GIF bisa beranimasi dan SVG adalah vektor — keduanya rusak kalau
  // digambar ulang ke kanvas.
  if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(berkas.type)) return berkas;
  if (berkas.size < LEWATI_JIKA_DI_BAWAH) return berkas;

  let gambar;
  try {
    // createImageBitmap membaca orientasi EXIF, jadi foto ponsel yang diambil
    // tegak tidak berubah jadi miring setelah dimampatkan.
    gambar = await createImageBitmap(berkas, { imageOrientation: "from-image" });
  } catch {
    return berkas; // format yang tidak bisa dibaca peramban ini — kirim apa adanya
  }

  const skala = Math.min(1, SISI_TERPANJANG / Math.max(gambar.width, gambar.height));
  const kanvas = document.createElement("canvas");
  kanvas.width = Math.round(gambar.width * skala);
  kanvas.height = Math.round(gambar.height * skala);
  kanvas.getContext("2d").drawImage(gambar, 0, 0, kanvas.width, kanvas.height);
  gambar.close?.();

  // WebP lebih dulu: lebih kecil dari JPEG dan tetap menyimpan transparansi,
  // yang penting untuk logo kolaborator. Safari lama tidak bisa menulis WebP
  // dan diam-diam mengembalikan PNG — kalau itu yang terjadi, pakai JPEG.
  let hasil = await kanvasKeBlob(kanvas, "image/webp", KUALITAS);
  if (!hasil || hasil.type !== "image/webp") {
    if (berkas.type === "image/png") return berkas; // JPEG akan menghitamkan latar transparan
    hasil = await kanvasKeBlob(kanvas, "image/jpeg", KUALITAS);
  }

  // Jangan pernah mengirim versi yang justru lebih besar dari aslinya.
  if (!hasil || hasil.size >= berkas.size) return berkas;

  const ekstensi = hasil.type === "image/webp" ? "webp" : "jpg";
  const nama = berkas.name.replace(/\.[^.]+$/, "") + "." + ekstensi;
  return new File([hasil], nama, { type: hasil.type, lastModified: Date.now() });
}

/**
 * Membangun ulang FormData dengan setiap gambar di dalamnya sudah dimampatkan.
 * Urutan dan nama isian dipertahankan persis — backend membaca beberapa isian
 * bernama sama (mis. foto_bukti_urls) sebagai daftar, dan urutannya berarti.
 */
export async function mampatkanFormData(formData) {
  const isian = [...formData.entries()];
  const hasil = await Promise.all(
    isian.map(async ([kunci, nilai]) => [kunci, await mampatkanGambar(nilai)]),
  );

  const baru = new FormData();
  let total = 0;
  for (const [kunci, nilai] of hasil) {
    total += nilai instanceof Blob ? nilai.size : String(nilai).length;
    if (nilai instanceof File) baru.append(kunci, nilai, nilai.name);
    else baru.append(kunci, nilai);
  }

  // Ditolak di sini dengan pesan yang bisa dimengerti, bukan dikirim lalu
  // dibalas galat 413 yang tidak menjelaskan apa-apa.
  if (total > BATAS_TOTAL_UNGGAH) {
    const mb = (total / 1024 / 1024).toFixed(1);
    const galat = new Error(
      `Total ukuran foto ${mb} MB terlalu besar untuk sekali kirim. Kurangi jumlah foto lalu coba lagi.`,
    );
    galat.response = { data: { message: galat.message } };
    throw galat;
  }

  return baru;
}

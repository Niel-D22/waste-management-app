/**
 * Sumber ubin (tile) peta untuk SELURUH aplikasi.
 *
 * Kenapa OpenStreetMap, dan kenapa itu sempat rusak:
 *
 * Juri lomba menemukan bug: di halaman detail laporan, aset, dan kolaborator,
 * peta berubah jadi kotak kuning bertuliskan "Access blocked" (403). Penyebabnya
 * baru ketemu belakangan, dan sederhana: index.html memasang
 * <meta name="referrer" content="no-referrer">, sehingga peramban tidak
 * mengirim header Referer sama sekali. Kebijakan pemakaian OpenStreetMap
 * mewajibkan Referer dan memblokir permintaan yang tidak punya. Diuji langsung:
 * ubin yang sama mengembalikan peta asli DENGAN Referer dan gambar
 * "Access blocked" TANPA Referer.
 *
 * Perbaikan sesungguhnya ada di index.html (kebijakan referrer). Jangan
 * dikembalikan ke "no-referrer" — semua peta di situs ini akan rusak lagi.
 *
 * Catatan sejarah supaya tidak diulang: sempat dicoba pindah ke ubin CARTO
 * (basemaps.cartocdn.com) sebagai penyelamat. Per 26 September 2026 CARTO
 * mengembalikan watermark "API KEY REQUIRED" untuk semua ubin rasternya tanpa
 * kunci, jadi tidak bisa dipakai. Kode HTTP-nya tetap 200, sehingga pemeriksaan
 * yang hanya melihat status akan salah menyimpulkan "berfungsi" — periksa
 * isi gambarnya.
 *
 * Ditaruh di satu berkas supaya tidak ada lagi belasan salinan URL yang bisa
 * menyimpang sendiri-sendiri.
 */

// Tanpa subdomain {s}: OpenStreetMap sudah tidak menganjurkan a/b/c.
// Zoom maksimum asli 19; lapisan yang memakai zoom lebih tinggi harus
// menyetel maxNativeZoom={19} supaya ubinnya diperbesar, bukan diminta ke
// server (yang akan menjawab galat).
export const UBIN_PETA = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

/**
 * Atribusi WAJIB ditampilkan, bukan hiasan. Data petanya berlisensi ODbL, dan
 * lisensi itu mensyaratkan penyebutan kontributornya.
 */
export const ATRIBUSI_PETA =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Atribusi lapisan alternatif di halaman peta utama (MapView).
 *
 * Dipisah karena ubinnya bukan dari OpenStreetMap: menyebut sumber yang salah
 * sama saja dengan tidak menyebut sumber sama sekali.
 */
export const ATRIBUSI_GOOGLE =
  '&copy; <a href="https://www.google.com/intl/id/help/terms_maps/">Google</a>';

export const ATRIBUSI_ESRI =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

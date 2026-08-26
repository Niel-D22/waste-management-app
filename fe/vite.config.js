import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Menahan kesalahan penyebaran yang paling sering terjadi dan paling mahal:
 * membangun berkas produksi sementara VITE_API_URL masih menunjuk ke localhost.
 *
 * Hasilnya situs yang tampak sehat sempurna di komputer si pembangun — karena
 * di situ backend-nya memang berjalan di localhost — tapi mati total di
 * komputer orang lain, termasuk juri. Gejalanya membingungkan pula: halamannya
 * tampil normal, hanya datanya tidak pernah muncul.
 *
 * Lebih baik gagal saat build dengan pesan yang jelas, daripada gagal diam-diam
 * setelah terunggah.
 */
function pastikanAlamatApiLayakProduksi(command, mode) {
  // command === "build", bukan sekadar mode === "production".
  //
  // `vite preview` juga berjalan dalam mode produksi, padahal ia cuma
  // menyajikan berkas yang SUDAH terlanjur dibangun dari komputer ini sendiri —
  // menghadangnya tidak mencegah kesalahan apa pun, hanya membuat perintah
  // pratinjau mati tanpa alasan. Yang perlu dijaga adalah saat berkasnya
  // dibuat, karena di situlah alamat API dipanggang permanen.
  if (command !== "build" || mode !== "production") return;

  const env = loadEnv(mode, process.cwd(), "VITE_");
  const url = env.VITE_API_URL || "";

  if (!url || url.includes("GANTI_DENGAN_URL_SERVER_ANDA")) {
    throw new Error(
      [
        "",
        "VITE_API_URL belum diisi.",
        "Buka fe/.env.production lalu ganti dengan alamat backend Anda,",
        "contoh: VITE_API_URL=https://api-anda.com/api",
        "",
      ].join("\n"),
    );
  }

  if (/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url)) {
    throw new Error(
      [
        "",
        `VITE_API_URL menunjuk ke ${url}`,
        "Alamat itu hanya berarti di komputer ini. Situs yang dibangun dengannya",
        "tidak akan bisa mengambil data di komputer siapa pun yang lain.",
        "Isi fe/.env.production dengan alamat server yang dapat dijangkau dari internet.",
        "",
      ].join("\n"),
    );
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  pastikanAlamatApiLayakProduksi(command, mode);

  return {
    plugins: [react(), tailwindcss()],

    server: {
      host: true,
      port: 5173,
    },

    build: {
      // Peramban yang tidak mendukung modul ES pun tidak mendukung hampir semua
      // hal lain yang dipakai situs ini. Menargetkan es2020 membuat keluarannya
      // lebih ringkas karena tidak perlu menurunkan sintaks modern.
      target: "es2020",

      // Peta sumber dimatikan di produksi: berkasnya berukuran megabyte, ikut
      // terunggah, dan membeberkan seluruh kode sumber kepada siapa pun yang
      // membuka panel pengembang.
      sourcemap: false,

      rollupOptions: {
        output: {
          // Pustaka pihak ketiga dipisah dari kode aplikasi.
          //
          // Alasannya soal cache, bukan ukuran total. React dan kawan-kawan
          // hampir tidak pernah berubah, sedangkan kode aplikasi berubah tiap
          // kali ada perbaikan. Kalau keduanya menyatu dalam satu berkas, satu
          // huruf yang diubah di halaman mana pun membuat nama berkasnya
          // berubah dan pengunjung lama harus mengunduh ulang React yang
          // sebenarnya sudah ada di peramban mereka.
          //
          // Dipisah begini, penyebaran berikutnya hanya menyuruh mereka
          // mengunduh bagian yang benar-benar berubah.
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // Inti React: dibutuhkan sebelum piksel pertama muncul, jadi
            // disatukan supaya cukup satu permintaan.
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
              return "react-vendor";
            }
            if (/[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/.test(id)) {
              return "router";
            }
            // Pustaka animasi. Besar, dipakai di seluruh situs, dan versinya
            // jarang berubah — kandidat cache jangka panjang yang ideal.
            if (/[\\/]node_modules[\\/]motion/.test(id)) {
              return "motion";
            }
          },
        },
      },

      // Ambang peringatan diturunkan dari 500 KB ke 350 KB. Bukan untuk
      // membungkam peringatannya, justru sebaliknya: supaya berkas yang mulai
      // menggemuk ketahuan lebih awal, sebelum sempat jadi 1,7 MB seperti dulu.
      chunkSizeWarningLimit: 350,
    },
  };
});

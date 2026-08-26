import { motion } from "motion/react";

const ASET = "/images/Login%20Asset";

// Titik-titik ini DIUKUR dari login-scene.webp (kanvas 1536x1024), bukan
// dikira-kira. Dinyatakan dalam persen terhadap kotak ilustrasi supaya tetap
// tepat di ukuran layar apa pun. Kalau file scene-nya diganti, keduanya HARUS
// diukur ulang.
const TANGAN = { left: "32.9%", top: "28.8%" }; // telapak tangan yang terangkat
const MULUT_TEMPAT_SAMPAH = { x: -87, y: 167 }; // relatif ukuran botol, lihat di bawah

// Lebar botol = 6% lebar ilustrasi. Rasio kanvas botolnya 1024x1536, jadi
// tingginya 9% lebar ilustrasi.
//
// Perpindahan dari tangan ke mulut tempat sampah:
//   mendatar  -5,2% lebar ilustrasi  = -5,2/6  = -87% lebar botol
//   menurun  +22,5% tinggi ilustrasi = +15% lebar ilustrasi = 15/9 = +167% tinggi botol
// Nilai x dan y di motion memang relatif terhadap ukuran elemen itu sendiri,
// bukan induknya — itu sebabnya angkanya perlu dikonversi seperti ini.

function AuthIllustration() {
  return (
    <div className="relative w-full max-w-lg">
      {/* Karakter, tempat sampah, dan tanaman. Ayunan naik-turunnya pelan dan
          terpisah dari animasi botol, jadi keduanya tidak pernah sinkron dan
          gerakannya tidak terasa mekanis. */}
      <motion.img
        src={`${ASET}/login-scene.webp`}
        alt=""
        draggable={false}
        className="w-full select-none"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pembungkus penempatan: memegang posisi dan ukuran, TIDAK dianimasikan.
          Dipisah karena motion menulis properti transform, sementara pemusatan
          -translate-x-1/2 juga transform — digabung, keduanya saling menimpa
          dan botolnya meleset dari telapak tangan. */}
      <div
        className="pointer-events-none absolute w-[6%] -translate-x-1/2 -translate-y-1/2"
        style={{ left: TANGAN.left, top: TANGAN.top }}
      >
        <motion.img
          src={`${ASET}/login-botol.webp`}
          alt=""
          draggable={false}
          className="w-full select-none"
          animate={{
            // Lintasannya melengkung: naik dulu sedikit, baru jatuh — bukan
            // garis lurus dari tangan ke tempat sampah. Benda yang dilempar
            // memang begitu, dan itu yang membuatnya terbaca sebagai lemparan.
            x: ["0%", "-45%", `${MULUT_TEMPAT_SAMPAH.x}%`, `${MULUT_TEMPAT_SAMPAH.x}%`, "0%", "0%"],
            y: ["0%", "-55%", `${MULUT_TEMPAT_SAMPAH.y}%`, `${MULUT_TEMPAT_SAMPAH.y}%`, "0%", "0%"],
            rotate: [0, -35, -160, -160, 0, 0],
            opacity: [1, 1, 1, 0, 0, 1],
          }}
          transition={{
            // 4,6 detik untuk satu putaran penuh, ditambah jeda 1 detik.
            // Sengaja lambat: animasi hias yang cepat menarik mata menjauh dari
            // formulir, padahal formulirnya yang harus diisi.
            duration: 4.6,
            // times mengatur KAPAN tiap keyframe terjadi. Jarak 0,62 -> 0,70
            // sengaja pendek: itu saat botol lenyap masuk ke tempat sampah.
            // Lalu 0,70 -> 0,86 dipakai untuk kembali ke tangan dalam keadaan
            // tak terlihat, sehingga tidak ada botol yang terbang mundur.
            times: [0, 0.34, 0.62, 0.7, 0.86, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      </div>
    </div>
  );
}

export default AuthIllustration;

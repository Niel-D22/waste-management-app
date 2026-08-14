import React, { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { LuSprout, LuArrowRight } from "react-icons/lu";

// Folder aset mengandung spasi ("Hero asset"), jadi path-nya di-encode
// (%20) supaya aman di semua browser.
const ASSET = "/images/Hero%20asset";

// Sisi dalam rumpun daun dilebur jadi transparan supaya pertemuannya di tengah
// layar tidak berupa garis lurus. Peleburan baru mulai di 72% — bukan lebih
// awal — karena puncak tertinggi rumpun ada di sekitar tengah gambar, dan kalau
// mask-nya mulai dari situ puncaknya ikut memudar.
const LEAF_MASK = "linear-gradient(to right, #000 72%, transparent 98%)";

// Tiap karakter: posisi & ukuran dalam persen terhadap gambar background,
// supaya selalu sejajar dengan scene di belakangnya di ukuran layar apa pun.
// Nilai bottom WAJIB positif — kalau negatif, karakter berdiri di bawah tepi
// bawah gambar background (melayang di luar scene). Angka 9-12% adalah garis
// pasir tempat mereka berpijak; kakinya tetap tersamarkan karena lapisan daun
// (z-30) ada di depan karakter (z-20).
const CHARACTERS = [
  {
    id: "wanita",
    src: `${ASSET}/char-1-wanita.png`,
    className: "bottom-[10%] left-[2%] w-[13%]",
    floatDuration: 4.2,
  },
  {
    id: "petugas",
    src: `${ASSET}/char-2-petugas.png`,
    className: "bottom-[12%] left-[45%] w-[13%]",
    floatDuration: 3.6,
  },
  {
    id: "pria",
    src: `${ASSET}/char-3-pria.png`,
    className: "bottom-[9%] left-[82%] w-[14%]",
    floatDuration: 4.8,
  },
];

const Hero = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Makin jauh di belakang, makin lambat geraknya (nilai positif = tertinggal
  // di belakang scroll). Daun di paling depan bergerak paling cepat.
  const yBackground = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yCharacters = useTransform(scrollYProgress, [0, 1], [0, 40]);
  // Truk berada di bidang tanah yang lebih jauh dari karakter, jadi geserannya
  // di antara background (140) dan karakter (40).
  const yTruck = useTransform(scrollYProgress, [0, 1], [0, 75]);
  // Daun bergerak paling cepat (nilai negatif = naik lebih cepat dari scroll).
  // Geserannya sengaja kecil (25px) supaya sisi bawah gambar daun tidak pernah
  // keluar dari balik gelombang putih yang menutupinya.
  const yLeaves = useTransform(scrollYProgress, [0, 1], [0, -25]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Section sengaja LEBIH TINGGI dari satu layar (140vh). Layar pertama hanya
  // berisi teks di atas langit; pantai, karakter, truk, dan rumpun daun berada
  // di bawah lipatan dan baru naik masuk pandangan saat di-scroll — pola yang
  // sama seperti referensi. Kalau dipaksa h-screen, semua isi harus muat
  // sekaligus dan karakternya pasti bertabrakan dengan teks.
  return (
    <section
      ref={sectionRef}
      className="relative flex h-[140vh] w-full flex-col bg-white"
    >
      {/* Teks di area langit kosong */}
      <motion.div
        style={{ y: yText, opacity: textOpacity }}
        className="relative z-30 mx-auto flex max-w-3xl flex-col items-center px-4 pt-32 text-center md:px-6 md:pt-36"
      >
        <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-gray-600 shadow-sm backdrop-blur md:text-sm">
          <LuSprout size={15} className="text-(--primary)" />
          Platform Lingkungan Sulawesi Utara
        </span>

        <h1 className="mt-5 text-4xl leading-[1.1] font-bold tracking-tight text-(--primary) sm:text-5xl md:text-6xl">
          Laporkan. Pantau.
          <br />
          Bergerak Bersama.
        </h1>

        <p className="mt-4 max-w-lg text-base text-gray-500 md:text-lg">
          Satu platform untuk menghubungkan warga, komunitas, dan pemerintah
          menjaga lingkungan dari sampah.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/laporan/buat"
            className="flex items-center gap-2 rounded-full bg-(--primary) px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-(--primary-dark) md:text-base"
          >
            Laporkan Sampah
            <LuArrowRight size={17} />
          </Link>
          <Link
            to="/peta"
            className="rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 md:text-base"
          >
            Lihat Peta
          </Link>
        </div>
      </motion.div>

      {/* Scene (background + karakter) — dibungkus container ber-overflow
          hidden supaya bagian gambar yang lebih tinggi dari layar terpotong
          rapi dan tidak menutupi navbar. */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {/* Gambar BG rasionya 3:2, sementara layar umumnya 16:9 yang lebih
            lebar. Karena gambar harus penuh selebar layar (kalau dipaskan ke
            tinggi malah muncul celah putih di kiri-kanan), sebagian tingginya
            mau tidak mau terpotong. Container digeser turun 6vh supaya yang
            terpotong pindah ke bawah — sisi bawah gambar toh sudah tertutup
            gelombang putih — sehingga langit yang hilang di atas jauh lebih
            sedikit. */}
        <div className="absolute inset-x-0 bottom-[-6vh]">
          <motion.img
            src={`${ASSET}/BG-Hero.png`}
            alt=""
            style={{ y: yBackground }}
            className="w-full select-none"
            draggable={false}
          />

          {/* Truk sampah — diam di tempat, satu-satunya geraknya adalah
              parallax saat scroll.
              bottom-[25%] menaruh rodanya di garis promenade/tanggul (bukan di
              pasir — truk parkir di jalan), dan sudah memperhitungkan margin
              transparan di sisi bawah file PNG-nya (~14% dari tinggi gambar).
              Ukurannya lebih kecil dari karakter karena bidangnya lebih jauh.
              left-[24%] dipilih supaya tidak menutupi pos timbang dan tempat
              sampah yang ada di sisi kanan background. */}
          <motion.div
            style={{ y: yTruck }}
            className="absolute bottom-[25%] left-[24%] z-10 w-[15%]"
          >
            <img
              src={`${ASSET}/Truck.png`}
              alt=""
              className="w-full select-none drop-shadow-[0_8px_10px_rgba(30,31,120,0.12)]"
              draggable={false}
            />
          </motion.div>

          {CHARACTERS.map((char) => (
            <motion.div
              key={char.id}
              style={{ y: yCharacters }}
              className={`absolute z-20 ${char.className}`}
            >
              <motion.img
                src={char.src}
                alt=""
                animate={{ y: [0, -9, 0] }}
                transition={{
                  duration: char.floatDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-full select-none drop-shadow-[0_10px_14px_rgba(30,31,120,0.14)]"
                draggable={false}
              />
            </motion.div>
          ))}
        </div>

        {/* Gradasi ke putih di batas bawah hero. Tanpa ini, gambar background
            terpotong lurus persis di garis section dan sambungannya ke konten
            berikutnya (yang ber-background putih) terlihat seperti garis. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[16vh] bg-linear-to-b from-transparent to-white" />
      </div>

      {/* Rumpun tanaman kiri & kanan, mengikuti referensi: bukan satu sabuk
          penuh selebar layar, tapi dua rumpun yang membingkai sudut kiri dan
          kanan sehingga bagian tengah tetap lega.
          Gambarnya dipakai UTUH dengan rasio aslinya — tidak ada object-cover,
          tidak ada crop — jadi siluet pucuknya yang naik-turun tetap terbaca
          dan tidak ada satu pun daun yang terpotong.
          Sisi DALAM tiap rumpun (yang menghadap tengah) dilebur pakai mask
          gradient supaya tidak muncul garis potong vertikal di tengah layar.
          Rumpun kanan di-mirror lewat scaleX: -1 — karena mask ikut ter-flip
          bersama elemennya, arah leburnya otomatis jadi ke kiri, sekaligus
          bikin kiri dan kanan tidak kelihatan kembar.
          bottom-[-5vh]: bentuk rumpunnya adalah gundukan (tinggi di tengah,
          menipis di ujung), jadi alasnya perlu digeser turun sedikit melewati
          batas section supaya titik terdalamnya lewat dari garis bawah. Tidak
          ada lagi lapisan putih di depannya — dulu ada, tapi justru itu yang
          memotong daun jadi dua dengan garis putih di tengah. */}
      {[
        { id: "kiri", side: "left-0", scaleX: 1 },
        { id: "kanan", side: "right-0", scaleX: -1 },
      ].map((cluster) => (
        <motion.img
          key={cluster.id}
          src={`${ASSET}/fg-daun.png`}
          alt=""
          style={{
            y: yLeaves,
            scaleX: cluster.scaleX,
            maskImage: LEAF_MASK,
            WebkitMaskImage: LEAF_MASK,
          }}
          className={`pointer-events-none absolute bottom-[-8vh] z-30 w-[45%] select-none ${cluster.side}`}
          draggable={false}
        />
      ))}

    </section>
  );
};

export default Hero;

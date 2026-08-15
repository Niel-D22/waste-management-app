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
// bawah gambar background (melayang di luar scene). Angka 6-8% menaruh kakinya
// cukup rendah sehingga tertutup rumpun daun (z-30, di depan karakter z-20),
// sementara kepala dan badan atasnya tetap muncul di atas daun.
// Posisi horizontalnya dipilih agar kakinya jatuh di area yang memang ada
// tumpukannya: rumpun kiri menutupi 0-40%, rumpun kanan 60-100%. Bagian tengah
// sengaja dibiarkan kosong dan diisi truk, bukan karakter.
// Tambahan "+4px" ditulis sebagai calc(), bukan dengan menaikkan angka
// persennya. Persen di sini relatif terhadap tinggi scene, jadi menaikkannya
// akan menggeser karakter makin jauh di layar besar dan makin sedikit di layar
// kecil. Yang diminta adalah dorongan tetap 4px, sama di semua ukuran layar.
const CHARACTERS = [
  {
    id: "wanita",
    src: `${ASSET}/char-1-wanita.png`,
    className: "bottom-[calc(7%+14px)] left-[4%] w-[13%]",
    floatDuration: 4.2,
  },
  {
    id: "petugas",
    src: `${ASSET}/char-2-petugas.png`,
    className: "bottom-[calc(8%+14px)] left-[24%] w-[13%]",
    floatDuration: 3.6,
  },
  {
    id: "pria",
    src: `${ASSET}/char-3-pria.png`,
    className: "bottom-[calc(6%+14px)] left-[81%] w-[14%]",
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
  // Mulai memudar di 0.2, bukan 0 — section-nya kini 140vh, jadi kalau memudar
  // sejak scroll pertama teksnya sudah pucat padahal masih di tengah layar.
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.55], [1, 0]);

  // Tinggi section TIDAK dipatok angka mati, karena tinggi gambar BG selalu
  // mengikuti LEBAR layar (rasionya 3:2, jadi tingginya = 66,67vw) — bukan
  // mengikuti tinggi layar. Waktu dipatok 140vh, di layar lebar-tapi-pendek
  // (fullscreen 1920x1080) section jadi 1512px sementara gambarnya cuma 1280px,
  // dan sisa 232px langit kosong itu mendorong seluruh scene turun jauh ke bawah
  // lipatan. clamp() membuat section mengikuti tinggi gambar, dengan pagar:
  //   - minimal 100vh  → tidak pernah lebih pendek dari satu layar
  //   - maksimal 140vh → scroll-nya tidak pernah kepanjangan di layar sempit
  // Hasilnya scene selalu duduk setinggi mungkin tanpa menyisakan langit kosong.
  //
  // Warna latarnya #BBDDFC, bukan putih: tinggi gambar BG selalu = lebar layar
  // dibagi 1,5 (rasionya 3:2), jadi di layar yang lebar-tapi-pendek gambarnya
  // TIDAK sampai menutupi 140vh dan menyisakan celah di atas. #BBDDFC diambil
  // langsung dari baris piksel paling atas BG-Hero.png (diukur, bukan dikira),
  // sehingga celah itu menyatu jadi langit dan tidak terlihat sebagai pita
  // putih. Jangan diganti tanpa mengukur ulang kalau file BG-nya berubah.
  return (
    <section
      ref={sectionRef}
      className="relative flex h-[clamp(100vh,66.67vw,140vh)] w-full flex-col bg-[#BBDDFC]"
    >
      {/* Teks di area langit kosong */}
      <motion.div
        style={{ y: yText, opacity: textOpacity }}
        className="relative z-30 mx-auto flex max-w-3xl flex-col items-center px-4 pt-32 text-center md:px-6 md:pt-36"
      >
        {/* Sengaja BUKAN text-(--primary). Navy #1e1f78 di atas langit biru
            #BBDDFC itu biru-di-atas-biru: headline-nya menyatu dengan latar dan
            hilang ketegasannya. Warna brand tetap hadir lewat tombol utama. */}
        <h1 className="mt-5 text-4xl leading-[1.1] font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          Laporkan. Pantau.
          <br />
          Bergerak Bersama.
        </h1>

        <p className="mt-4 max-w-lg text-base text-slate-600 md:text-lg">
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
              File PNG-nya punya margin transparan ~14% dari tinggi gambar di
              sisi bawah, jadi roda truk TIDAK menyentuh nilai bottom di sini —
              posisi roda sebenarnya = bottom + ~1,7%. Perhitungan itu yang
              menentukan angka 16%: rodanya jatuh di sekitar 18% tinggi scene,
              yaitu hamparan pasir, bukan mengambang di atasnya.
              left-[42%] dipilih karena di sisi kiri (x<30%) garis air menjorok
              jauh ke kanan — truk di situ akan terlihat parkir di laut. Di
              tengah, pasirnya paling lebar. Sekaligus mengisi celah antara
              rumpun daun kiri dan kanan. */}
          <motion.div
            style={{ y: yTruck }}
            className="absolute bottom-[15%] left-[42%] z-10 w-[14%]"
          >
            <img
              src={`${ASSET}/Truck.png`}
              alt=""
              className="w-full drop-shadow-[0_8px_10px_rgba(30,31,120,0.12)] select-none"
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
                className="w-full drop-shadow-[0_10px_14px_rgba(30,31,120,0.14)] select-none"
                draggable={false}
              />
            </motion.div>
          ))}
        </div>

        {/* Gradasi di batas bawah hero, menuju --surface-tint (BUKAN putih
            murni). Tujuannya bukan sekadar menyamarkan potongan gambar, tapi
            meneruskan nuansa langit ke section berikutnya. Kalau memudar ke
            putih, warna hero terputus mendadak dan halaman terasa mati persis
            setelah bagian paling menarik. Nilainya HARUS sama dengan latar
            section tepat di bawah hero (IconRevealSection). */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[16vh] bg-linear-to-b from-transparent to-(--surface-sky)" />
      </div>

      {/* Tumpukan sampah terkumpul di kiri & kanan, mengikuti referensi: bukan
          satu sabuk penuh selebar layar, tapi dua rumpun yang membingkai sudut
          kiri dan kanan sehingga bagian tengah tetap lega.
          Gambarnya dipakai UTUH dengan rasio aslinya — tidak ada object-cover,
          tidak ada crop — jadi siluet pucuknya yang naik-turun tetap terbaca
          dan tidak ada satu pun daun yang terpotong.
          Sisi DALAM tiap rumpun (yang menghadap tengah) dilebur pakai mask
          gradient supaya tidak muncul garis potong vertikal di tengah layar.
          Rumpun kanan di-mirror lewat scaleX: -1 — karena mask ikut ter-flip
          bersama elemennya, arah leburnya otomatis jadi ke kiri, sekaligus
          bikin kiri dan kanan tidak kelihatan kembar.
          bottom-[-4vh]: diukur langsung dari file, bukan ditebak. Margin
          transparan di sisi bawah gambar 11,2% di bagian tengah dan ~17% di
          kedua ujungnya — bentuknya memang gundukan, jadi ujungnya duduk lebih
          tinggi. Geseran turun ini membuat titik terdalamnya lewat dari garis
          bawah section, sementara ujungnya tetap terlihat menapak. */}
      {[
        // src dipisah per sisi supaya kiri dan kanan bisa memakai gambar yang
        // benar-benar berbeda, bukan gambar yang sama dicerminkan. Selama file
        // variasi kedua belum ada, keduanya memakai gambar yang sama dan yang
        // kanan dicerminkan agar tidak kelihatan kembar persis.
        // bottom dipisah per tumpukan karena margin transparan di sisi bawah
        // kedua file BERBEDA (diukur: 11,2% di Tumpukan.png, 5,2% di
        // Tumpukan2.png pada bagian tengahnya). Kalau nilainya disamakan,
        // tumpukan kedua duduk ~26px lebih dalam dan terlihat tenggelam.
        { id: "kiri", src: "Tumpukan.png", side: "left-0", scaleX: 1, bottom: "bottom-[-4vh]" },
        { id: "kanan", src: "Tumpukan2.png", side: "right-0", scaleX: -1, bottom: "bottom-[-2vh]" },
      ].map((cluster) => (
        <motion.img
          key={cluster.id}
          src={`${ASSET}/${cluster.src}`}
          alt=""
          style={{
            y: yLeaves,
            scaleX: cluster.scaleX,
            maskImage: LEAF_MASK,
            WebkitMaskImage: LEAF_MASK,
          }}
          className={`pointer-events-none absolute z-30 w-[40%] select-none ${cluster.bottom} ${cluster.side}`}
          draggable={false}
        />
      ))}
    </section>
  );
};

export default Hero;

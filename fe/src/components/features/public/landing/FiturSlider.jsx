import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

// Judul dan tautannya sengaja disamakan persis dengan Fitur.jsx yang lama —
// keempatnya memang fitur yang sama. Yang berbeda hanya panjang deskripsinya:
// format slider punya ruang jauh lebih luas daripada kartu kecil, jadi tiap
// fitur bisa dijelaskan utuh, bukan cuma satu kalimat.
const FITUR = [
  {
    id: "kolaborator",
    label: "Kolaborator",
    title: "Bergabung dengan yang sudah bergerak",
    body: "Komunitas, organisasi lingkungan, bank sampah, dan instansi daerah di Sulawesi Utara terdaftar di satu tempat. Lihat siapa yang aktif di wilayahmu, apa yang mereka kerjakan, dan hubungi langsung kalau mau ikut turun tangan.",
    cta: "Lihat Kolaborator",
    link: "/kolaborator",
    image: "/images/Fitur2/fitur-1-kolaborator.png",
  },
  {
    id: "aset",
    label: "Aset Pengelolaan",
    title: "Temukan tempat buang yang benar",
    body: "Bank sampah, TPS, dan pengepul terdekat lengkap dengan lokasi, jam buka, dan jenis sampah yang mereka terima. Tidak perlu lagi menebak-nebak harus membawa botol plastik atau minyak jelantah ke mana.",
    cta: "Jelajahi Aset",
    link: "/aset",
    image: "/images/Fitur2/fitur-2-aset.png",
  },
  {
    id: "laporan",
    label: "Laporan Sampah Ilegal",
    title: "Laporkan titik sampah liar",
    body: "Foto tumpukan sampah liar yang kamu temukan, lokasinya terisi otomatis dari GPS, lalu kirim. Laporanmu diverifikasi, ditindak petugas, dan kamu bisa memantau sendiri statusnya sampai selesai — lengkap dengan foto bukti penanganan.",
    cta: "Buat Laporan",
    link: "/laporan",
    image: "/images/Fitur2/fitur-3-laporan.png",
  },
  {
    id: "daur-ulang",
    label: "Barang Daur Ulang",
    title: "Barang bekasmu masih berguna",
    body: "Punya kardus, botol, atau perabot bekas yang masih layak? Tandai lokasimu dan biarkan pengepul atau orang yang membutuhkan menjemputnya. Barang yang tadinya jadi sampah berpindah tangan, bukan berakhir di TPA.",
    cta: "Lihat Barang Daur Ulang",
    link: "/barang-bekas",
    image: "/images/Fitur2/fitur-4-daur-ulang.png",
  },
];

const AUTOPLAY_MS = 5000;

function FiturSlider() {
  // direction dipakai supaya animasi geser mengikuti arah tombol yang ditekan:
  // maju menggeser dari kanan, mundur dari kiri. Tanpa ini semua perpindahan
  // terasa sama dan pengguna kehilangan rasa "maju/mundur".
  const [[index, direction], setState] = useState([0, 0]);

  const item = FITUR[index];

  const paginate = (delta) => {
    // Sisa pembagian dibuat selalu positif supaya mundur dari slide pertama
    // membawa ke slide terakhir, bukan ke indeks negatif.
    const next = (index + delta + FITUR.length) % FITUR.length;
    setState([next, delta]);
  };

  const goTo = (target) => {
    if (target === index) return;
    setState([target, target > index ? 1 : -1]);
  };

  // Berhenti otomatis begitu pengguna menyentuh slider ini — lewat tombol
  // panah, titik indikator, atau sekadar mengarahkan kursor ke atasnya.
  // Tanpa ini, slide bisa berganti sendiri persis saat seseorang sedang
  // membaca paragrafnya, dan itu terasa seperti kontrolnya direbut.
  const [paused, setPaused] = useState(false);

  // Disimpan di ref, bukan dijadikan dependensi useEffect. Kalau index masuk
  // sebagai dependensi, timer-nya dibongkar-pasang tiap kali slide berganti —
  // termasuk saat pengguna menekan panah, sehingga hitungannya jadi tidak
  // konsisten. Dengan ref, satu timer berjalan terus dan selalu membaca nilai
  // terbaru.
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % FITUR.length;
      setState([next, 1]);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [paused]);

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
  };

  const transition = { duration: 0.35, ease: [0.22, 1, 0.36, 1] };

  return (
    <section className="w-full bg-(--surface-sky) px-4 py-16 md:px-10 md:py-24">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-(--surface) px-6 py-12 md:px-14 md:py-16"
      >
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Ilustrasi */}
          <div className="order-2 lg:order-1">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={item.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="flex aspect-square w-full items-center justify-center"
              >
                <img
                  src={item.image}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-contain select-none"
                  // Ilustrasinya belum tentu sudah ada. Tanpa penanganan ini,
                  // yang muncul adalah ikon gambar rusak bawaan browser di
                  // tengah landing page.
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  style={{ display: "none" }}
                  className="h-full w-full items-center justify-center rounded-3xl bg-(--primary)/5 text-7xl font-bold text-(--primary)/20"
                >
                  {index + 1}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Teks */}
          <div className="order-1 flex flex-col lg:order-2">
            <h2 className="text-3xl leading-tight font-bold tracking-tight text-slate-900 md:text-5xl">
              Apa yang bisa kamu lakukan di sini
            </h2>

            {/* Tinggi minimum dikunci supaya tombol panah dan indikator di bawah
                tidak melompat-lompat saat panjang teks tiap fitur berbeda. */}
            <div className="mt-8 min-h-[20rem] md:min-h-[17rem]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={item.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >
                  <span className="text-sm font-bold tracking-widest text-(--accent) uppercase">
                    {item.label}
                  </span>
                  <div className="mt-2 h-1 w-12 rounded-full bg-(--accent)" />
                  <h3 className="mt-4 text-2xl font-bold text-(--primary) md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {item.body}
                  </p>
                  {/* Tiap slide membawa tautannya sendiri. Ini keuntungan format
                      slider dibanding kartu kecil: ada ruang untuk mengajak
                      bertindak, tidak cuma menjelaskan. */}
                  <Link
                    to={item.link}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-(--primary) underline decoration-(--accent) decoration-2 underline-offset-4 transition hover:text-(--accent)"
                  >
                    {item.cta}
                    <LuArrowRight size={16} />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center justify-between gap-6">
              {/* Titik indikator juga bisa diklik — pengguna yang ingin langsung
                  ke fitur keempat tidak perlu menekan panah tiga kali. */}
              <div className="flex items-center gap-2">
                {FITUR.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => goTo(i)}
                    aria-label={`Ke fitur ${f.label}`}
                    aria-current={i === index}
                    className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                      i === index
                        ? "w-8 bg-(--primary)"
                        : "w-2 bg-(--primary)/25 hover:bg-(--primary)/50"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => paginate(-1)}
                  aria-label="Fitur sebelumnya"
                  className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-white text-(--primary) shadow-md transition hover:bg-(--primary) hover:text-white"
                >
                  <LuArrowLeft size={20} />
                </button>
                <button
                  onClick={() => paginate(1)}
                  aria-label="Fitur berikutnya"
                  className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-(--primary) text-white shadow-md transition hover:bg-(--primary-dark)"
                >
                  <LuArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FiturSlider;

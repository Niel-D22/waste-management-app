import { Suspense, lazy, useRef } from "react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import { LuArrowRight, LuFilter, LuMapPin, LuNavigation } from "react-icons/lu";

// Leaflet dipisah dari bundel awal beranda dan baru diunduh saat section ini
// mendekat. Ini penting: sebagian besar pengunjung tidak pernah menggulung
// sampai sini, dan memaksa mereka mengunduh seluruh pustaka peta di muka
// memperlambat halaman depan untuk semua orang tanpa alasan.
const ShowcasePetaMap = lazy(() => import("./ShowcasePetaMap"));

// Posisi layar di dalam ilustrasi laptop. Angka ini DIUKUR dari file
// Laptop.png, bukan dikira-kira: kotak mint (#E8F7F0) yang sengaja dibiarkan
// kosong oleh ilustratornya berada di x 397..1091 dan y 214..632 pada kanvas
// 1536x1024. Dinyatakan dalam persen supaya tetap pas di ukuran layar apa pun.
// Kalau file laptopnya diganti, angka ini HARUS diukur ulang.
const LAYAR = {
  left: "25.85%",
  top: "20.90%",
  width: "45.25%",
  height: "40.92%",
};

const KEMAMPUAN = [
  { ikon: LuFilter, teks: "Saring per kategori: laporan, aset, kolaborator, daur ulang" },
  { ikon: LuMapPin, teks: "Klik titik mana pun untuk melihat detail dan fotonya" },
  { ikon: LuNavigation, teks: "Temukan bank sampah dan pengepul terdekat dari lokasimu" },
];

function ShowcasePeta() {
  const ref = useRef(null);
  // once: true — peta hanya perlu dipasang sekali. Tanpa ini, menggulung naik
  // lalu turun lagi akan membongkar-pasang peta berulang kali.
  const dekat = useInView(ref, { once: true, margin: "300px" });

  return (
    <section
      ref={ref}
      className="w-full overflow-x-clip bg-(--surface-sky) px-4 py-16 md:px-10 md:py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
        {/* Kolom teks */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col"
        >
          <h2 className="font-display text-[clamp(1.75rem,5.2vw,3rem)] leading-tight font-extrabold tracking-tight text-slate-900">
            Semua titik sampah dalam satu peta
          </h2>
          <p className="mt-5 max-w-xl text-[clamp(0.95rem,3.2vw,1.125rem)] leading-relaxed text-slate-600">
            Bukan gambar. Peta di sebelah ini benar-benar hidup dan datanya
            sama persis dengan halaman peta kami. Coba geser dengan kursormu.
          </p>

          <ul className="mt-8 flex flex-col gap-4">
            {KEMAMPUAN.map(({ ikon: Ikon, teks }) => (
              <li key={teks} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-[clamp(1.75rem,6vw,2rem)] shrink-0 items-center justify-center rounded-full bg-(--accent)/12 text-(--primary)">
                  <Ikon size={16} />
                </span>
                <span className="text-[clamp(0.9rem,3vw,1rem)] leading-relaxed text-slate-700">
                  {teks}
                </span>
              </li>
            ))}
          </ul>

          <Link
            to="/peta"
            className="mt-9 flex w-fit items-center gap-2 rounded-xl bg-(--primary) px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-(--primary-dark) md:text-base"
          >
            Buka Peta Lengkap
            <LuArrowRight size={17} />
          </Link>
        </motion.div>

        {/* Kolom laptop */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full"
        >
          <img
            src="/images/ornamen/Laptop.webp"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="w-full select-none"
          />

          {/* Peta ditumpuk tepat di atas kotak mint. Ilustrasinya sendiri tetap
              tercat di bawah, jadi bingkai, keyboard, karakter, dan tanamannya
              tidak tertutup. */}
          <div
            className="absolute overflow-hidden rounded-[3px]"
            style={LAYAR}
          >
            {dekat ? (
              <Suspense
                fallback={<div className="h-full w-full bg-[#E8F7F0]" />}
              >
                <ShowcasePetaMap />
              </Suspense>
            ) : (
              // Sebelum peta dipasang, kotaknya diisi warna layar dari
              // ilustrasi aslinya — jadi tidak ada kedipan lubang kosong.
              <div className="h-full w-full bg-[#E8F7F0]" />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ShowcasePeta;

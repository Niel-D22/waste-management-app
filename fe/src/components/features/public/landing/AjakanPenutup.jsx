import { Link } from "react-router";
import { motion } from "motion/react";
import { LuArrowRight } from "react-icons/lu";
import { pramuat, saatMendekat } from "../../../../utils/pramuatRute";

// Band penutup di atas footer. Dua tugasnya:
// 1. Menutup halaman dengan ajakan, bukan berhenti begitu saja di section peta.
// 2. Jadi tangga dari section terang ke footer yang nyaris hitam (#16161c).
//    Tanpa ini, halaman terjun langsung dari biru muda ke hampir hitam.
//
// Lengkung di tepi atas dan gumpalan latarnya sengaja ditulis sebagai SVG dan
// bentuk CSS, BUKAN gambar. Bentuk polos seperti ini kalau dijadikan PNG akan
// terkunci di satu warna (padahal warnanya mengikuti token), pecah di layar
// besar, dan menambah ratusan KB ke halaman yang gambarnya sudah berat.
function AjakanPenutup() {
  return (
    <section className="relative w-full overflow-hidden bg-(--surface-sky-deep)">
      {/* Lengkung tepi atas, diisi warna section SEBELUMNYA (--surface-sky).
          Efeknya: warna section di atas terlihat meluber turun dalam bentuk
          lengkung, bukan berhenti di garis lurus. */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[8vh] w-full"
      >
        <path
          d="M0,0 L1440,0 L1440,38 C1200,86 1040,18 800,44 C560,70 380,110 180,74 C110,61 50,52 0,56 Z"
          fill="var(--surface-sky)"
        />
      </svg>

      {/* Gumpalan samar sebagai tekstur. bg-white beropasitas rendah, bukan
          gambar — nol kilobyte. */}
      <div className="pointer-events-none absolute -top-10 -left-24 size-80 rounded-full bg-white/30 blur-2xl" />
      <div className="pointer-events-none absolute top-32 -right-20 size-96 rounded-full bg-white/25 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        // Padding bawah ditulis dalam vw, bukan rem. Strip objek di bawah
        // berrasio 3:1 dan selebar layar, jadi TINGGINYA ikut lebar layar
        // (=lebar/3), bukan tetap. Dengan pb dalam rem, di layar sempit dia
        // menyisakan celah kosong besar dan di layar lebar malah menimpa
        // tombolnya. Angka vw membuat ruang yang disisakan selalu sebanding
        // dengan tinggi strip yang sebenarnya.
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-5 pt-20 pb-[46vw] text-center sm:px-6 sm:pt-28 md:pt-36 md:pb-[26vw]"
      >
        <h2 className="font-display text-[clamp(1.9rem,6vw,3.75rem)] leading-[1.15] font-extrabold tracking-tight text-slate-900">
          {/* Satu kata disorot dalam kotak membulat, mengikuti pola referensi:
              mata langsung menangkap kata kerjanya lebih dulu, baru sisanya. */}
          <span className="mr-1.5 inline-block -rotate-2 rounded-xl bg-(--primary) px-3 py-0.5 text-white shadow-lg sm:mr-2 sm:rounded-2xl sm:px-5 sm:py-1">
            Bergerak
          </span>{" "}
          untuk Sulawesi Utara
        </h2>

        <p className="mt-6 max-w-2xl text-[clamp(1rem,3.2vw,1.25rem)] leading-relaxed text-slate-600">
          Setiap laporan yang dikirim, setiap barang yang didaur ulang, dan
          setiap komunitas yang bergabung menumpuk jadi perubahan yang bisa
          dilihat langsung di peta.
        </p>

        <Link
          to="/login"
          {...saatMendekat(pramuat.login)}
          className="mt-8 flex items-center gap-2 rounded-xl bg-(--primary) px-7 py-3.5 text-sm font-bold text-white shadow-xl transition hover:bg-(--primary-dark) sm:px-9 sm:py-4 sm:text-base"
        >
          Bergabung Sekarang
          <LuArrowRight size={18} />
        </Link>
      </motion.div>

      {/* Strip objek di batas bawah. Menempel rata ke sisi bawah section
          (bottom-0) supaya sisi bawahnya yang pekat langsung bertemu footer
          gelap — di situlah perpindahan warnanya terjadi.
          Gambarnya berrasio 3:1 dengan 46% bagian atas kosong, jadi w-full
          sudah menghasilkan tinggi yang pas tanpa perlu di-crop. */}
      <img
        src="/images/ornamen/fg-transisi.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full select-none"
      />
    </section>
  );
}

export default AjakanPenutup;

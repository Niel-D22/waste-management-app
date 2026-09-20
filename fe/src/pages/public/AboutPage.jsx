import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { pramuat, saatMendekat } from "../../utils/pramuatRute";

/* ────────────────────────────────────────────────────────────────────────
   Halaman Tentang Kami.

   Susunannya mengikuti mockup yang disetujui: band pembuka → cerita →
   tiga pilar → ajakan. Empat bagian.

   Dua bagian sengaja TIDAK ada di sini:
   - "Empat pihak, satu meja" — itu grid kartu ketiga yang bentuknya sama
     persis dengan dua lainnya. Deretan grid seragam adalah pola yang paling
     cepat membuat halaman terbaca sebagai hasil generate, dan isinya sudah
     tersirat di paragraf "Kenapa platform ini ada".
   - "Pertanyaan Umum" — pertanyaan seperti itu lebih tepat dijawab chatbot
     atau halaman bantuan sendiri; di sini ia hanya memanjangkan halaman.

   Aturan radius di seluruh berkas ini: 12px untuk kartu dan tombol, 16px
   untuk blok besar. Tidak ada 24px, tidak ada bulat penuh kecuali avatar.
   ──────────────────────────────────────────────────────────────────────── */

/* ── Ilustrasi pilar ──────────────────────────────────────────────────────
   SVG sebaris, bukan berkas gambar. Bentuknya sederhana, warnanya diambil
   langsung dari token proyek sehingga tidak mungkin meleset dari palet, dan
   tidak menambah satu byte pun unduhan. Ukurannya mengikuti lebar induk. */

function IlustrasiPeta() {
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label="Peta dengan tiga penanda lokasi" className="h-auto w-full max-w-44">
      <path d="M20 46 L68 30 L132 50 L182 34 L182 108 L132 124 L68 104 L20 120 Z" fill="var(--surface-sky-deep)" />
      <path d="M68 30 L68 104 M132 50 L132 124" stroke="#a7c9ec" strokeWidth="3" />
      <path d="M24 78 C60 66 92 92 128 76 S172 66 178 72" stroke="#8fbbe6" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M92 42 c0-11 9-20 20-20 s20 9 20 20 c0 15-20 34-20 34 s-20-19-20-34 z" fill="var(--primary)" />
      <circle cx="112" cy="42" r="7" fill="#fff" />
      <path d="M44 78 c0-8 6-14 14-14 s14 6 14 14 c0 11-14 24-14 24 s-14-13-14-24 z" fill="var(--cyan)" />
      <circle cx="58" cy="78" r="5" fill="#fff" />
      <path d="M146 84 c0-8 6-14 14-14 s14 6 14 14 c0 11-14 24-14 24 s-14-13-14-24 z" fill="var(--cyan)" />
      <circle cx="160" cy="84" r="5" fill="#fff" />
    </svg>
  );
}

function IlustrasiSirkular() {
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label="Botol, kaleng, dan koran di dalam lingkaran daur ulang" className="h-auto w-full max-w-44">
      <path d="M100 24 a52 52 0 0 1 45 26" stroke="var(--cyan)" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M145 50 l-16 3 l7 -15 z" fill="var(--cyan)" />
      <path d="M145 100 a52 52 0 0 1 -45 26" stroke="#8DC63F" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M100 126 l14 -9 l-2 16 z" fill="#8DC63F" />
      <path d="M55 100 a52 52 0 0 1 0 -50" stroke="var(--primary)" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M55 50 l2 16 l-14 -9 z" fill="var(--primary)" />
      <rect x="84" y="60" width="16" height="34" rx="4" fill="var(--surface-sky-deep)" />
      <rect x="88" y="53" width="8" height="8" rx="2" fill="#a7c9ec" />
      <rect x="104" y="68" width="18" height="26" rx="3" fill="var(--surface-sand)" />
      <path d="M104 76 h18" stroke="#e3c9a4" strokeWidth="3" />
    </svg>
  );
}

function IlustrasiEdukasi() {
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label="Buku terbuka dengan tiga tempat sampah terpilah" className="h-auto w-full max-w-44">
      <path d="M28 108 L98 96 L98 44 L28 56 Z" fill="var(--surface-sky)" />
      <path d="M172 108 L102 96 L102 44 L172 56 Z" fill="var(--surface-sky-deep)" />
      <path d="M98 44 L102 44 L102 96 L98 96 Z" fill="#a7c9ec" />
      <rect x="52" y="52" width="22" height="34" rx="4" fill="var(--primary)" />
      <rect x="55" y="46" width="16" height="6" rx="2" fill="var(--primary)" />
      <path d="M58 62 h10 M58 70 h10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="89" y="50" width="22" height="34" rx="4" fill="#8DC63F" />
      <rect x="92" y="44" width="16" height="6" rx="2" fill="#8DC63F" />
      <path d="M96 66 c0-5 4-8 8-8" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="126" y="52" width="22" height="34" rx="4" fill="var(--cyan)" />
      <rect x="129" y="46" width="16" height="6" rx="2" fill="var(--cyan)" />
      <circle cx="137" cy="67" r="5" fill="none" stroke="#fff" strokeWidth="2.5" />
      <path d="M148 30 c8-6 16-4 18 2 c-6 6-14 6-18-2 z" fill="#8DC63F" />
    </svg>
  );
}

const PILAR = [
  {
    Ilustrasi: IlustrasiPeta,
    judul: "Pemantauan",
    isi: "Titik tumpukan sampah liar dilaporkan warga, dipetakan, lalu tindak lanjutnya bisa diikuti sampai selesai.",
  },
  {
    Ilustrasi: IlustrasiSirkular,
    judul: "Sirkular",
    isi: "Barang bekas yang masih bernilai dipertemukan dengan Bank Sampah dan pengepul, bukan berakhir di TPA.",
  },
  {
    Ilustrasi: IlustrasiEdukasi,
    judul: "Edukasi",
    isi: "Panduan memilah dan artikel yang membuat kebiasaan baik lebih mudah dimulai dan diteruskan.",
  },
];

export default function AboutPage() {
  const kurangiGerakan = useReducedMotion();

  // Satu pola animasi dipakai di seluruh halaman: memudar naik sedikit, sekali
  // saja. Versi lama memakai spring dari samping (x: -60 / x: +80) di hampir
  // tiap blok — di halaman yang tujuannya DIBACA, tiap paragraf yang melesat
  // masuk membuat mata terus mengejar, bukan terasa hidup.
  const munculKeAtas = kurangiGerakan
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <div className="flex min-h-screen flex-col bg-(--surface) text-(--dark-text)">
      {/* ═══════════════ 1. PEMBUKA ═══════════════
          Satu kalimat, satu tombol, dan tidak ada yang lain. Statistik, kartu,
          dan ikon sengaja ditahan sampai bagian berikutnya — itu yang membuat
          bagian pembuka terasa lapang, bukan penambahan hiasan.

          Ruang atasnya lebih longgar dari halaman biasa karena navbar di sini
          MENGAMBANG di atas band (lihat FLOATING_NAV_PAGES di Header.jsx),
          bukan mendorong isi ke bawah. Kartu logo mengambang itu tingginya
          ~92px di layar lebar; pt-44 (176px) menyisakan jarak yang jelas. */}
      {/* min-h mengikuti LEBAR layar, bukan tinggi: ilustrasi latarnya berasio
          1,70, jadi tingginya selalu = lebar layar dibagi 1,70 (58,8vw). Dengan
          min-h-[59vw] band selalu cukup tinggi untuk memuat gambarnya utuh,
          sehingga puncak menara jembatan tidak pernah terpotong di lebar mana
          pun. Pola yang sama dipakai hero halaman depan. */}
      <section className="relative isolate min-h-[59vw] overflow-hidden bg-[#ABD7FD] pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-44">
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <motion.p
            {...munculKeAtas}
            // Navy PENUH, bukan --cyan dan bukan navy 75%.
            // Diukur di atas ilustrasi latarnya: cyan hanya mencapai 1,5:1, dan
            // navy 75% turun ke 3,60:1 di titik tergelap (siluet gunung
            // #70A9D4) — dua-duanya gagal AA. Navy penuh memberi 5,46:1 di titik
            // terburuk, sehingga TIDAK perlu lapisan peredam di atas gambar dan
            // ilustrasinya tetap terlihat utuh.
            // Urutan bacanya tetap jelas karena dibedakan ukuran, huruf kapital,
            // dan jarak antarhuruf — bukan oleh warna.
            className="text-[0.8rem] font-bold tracking-[0.18em] text-(--primary) uppercase"
          >
            Tentang Torang Bersih
          </motion.p>

          <motion.h1
            {...munculKeAtas}
            transition={{ ...munculKeAtas.transition, delay: 0.08 }}
            // clamp(), bukan tumpukan breakpoint. Ukurannya berubah mulus
            // mengikuti lebar layar, bukan melompat di tiga titik.
            className="font-display mt-5 text-[clamp(1.9rem,5.6vw,3.4rem)] leading-[1.12] font-extrabold tracking-tight text-balance text-(--primary)"
          >
            Sampah bukan urusan satu instansi. Ini urusan torang samua.
          </motion.h1>

          <motion.p
            {...munculKeAtas}
            transition={{ ...munculKeAtas.transition, delay: 0.16 }}
            // Solid, bukan /75 — alasannya sama seperti label di atas: di titik
            // tergelap ilustrasi latarnya, 75% hanya mencapai 3,55:1.
            className="mt-6 max-w-xl text-[clamp(0.95rem,1.6vw,1.1rem)] leading-8 text-pretty text-(--dark-text)"
          >
            Satu tempat untuk warga, komunitas, dan pemerintah Sulawesi Utara
            bekerja pada masalah yang sama.
          </motion.p>

          <motion.div
            {...munculKeAtas}
            transition={{ ...munculKeAtas.transition, delay: 0.24 }}
            className="mt-9"
          >
            <Link
              to="/peta"
              className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-8 py-4 font-bold text-white shadow-lg transition hover:bg-(--primary-dark) motion-reduce:transition-none"
            >
              Lihat Peta Sampah
              <ArrowRight aria-hidden="true" className="size-[1.1em]" />
            </Link>
          </motion.div>
        </div>

        {/* Ilustrasi Teluk Manado dengan Jembatan Ir. Soekarno — LATAR band,
            bukan strip di bawah teks. Teks duduk di atasnya.

            Latar section memakai #ABD7FD, bukan token --surface-sky: angka itu
            DIUKUR dari baris piksel paling atas berkas ini (rata-rata seluruh
            baris, rentang kecerahan hanya 11/765, jadi praktis seragam). Di
            layar sempit gambarnya lebih pendek dari band, dan sisa ruang di
            atasnya terisi warna yang sama persis — terbaca sebagai langit
            tambahan, bukan pita. Kalau berkasnya diganti, ukur ulang.

            Berkasnya dipotong di sumber pada baris 120..1024 dari keluaran AI.
            Bukan 270 seperti percobaan sebelumnya: potongan itu membuang hampir
            seluruh langit, dan begitu gambarnya dijadikan latar, teksnya tidak
            punya tempat berpijak selain menimpa jembatan. Menyisakan langit di
            atas justru yang membuat komposisinya bekerja.

            TANPA object-cover: rasionya 1,70 dan min-h band juga 59vw, jadi
            gambarnya selalu muat utuh tanpa perlu dipotong lagi.

            width/height dicantumkan supaya peramban menyisakan ruangnya sejak
            awal dan halaman tidak tersentak saat gambarnya selesai dimuat.

            Di bawah sm gambarnya dilebarkan 150% dan digeser ke tengah: pada
            lebar 390px, gambar seukuran layar hanya setinggi 230px dan
            jembatannya mengecil sampai tidak terbaca. */}
        <img
          src="/images/Tentang%20Kami/Jembatan.webp"
          alt="Ilustrasi Jembatan Ir. Soekarno membentang di Teluk Manado dengan Gunung Manado Tua di kejauhan"
          width="1536"
          height="904"
          draggable={false}
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-auto w-[150%] max-w-none -translate-x-1/2 select-none sm:w-full"
        />
      </section>

      {/* ═══════════════ 2. CERITA ═══════════════
          Asimetris dan rata kiri, bukan kolom seimbang rata tengah. Ini bagian
          yang dibaca, bukan dipindai. */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          <motion.div
            {...munculKeAtas}
            className="relative mx-auto w-full max-w-md lg:mx-0"
          >
            {/* Blok warna yang bergeser di belakang foto. Memberi kedalaman
                tanpa bayangan — pendekatan yang sama dipakai di seluruh situs. */}
            <div
              aria-hidden="true"
              className="absolute -top-4 -left-4 h-full w-full rounded-2xl bg-(--surface-sky-deep)"
            />
            <img
              src="/images/tpa.webp"
              alt="TPA Sumompow di Manado dalam kondisi melebihi kapasitas"
              loading="lazy"
              className="relative w-full rounded-2xl object-cover"
              style={{ aspectRatio: "4 / 5" }}
            />
          </motion.div>

          <motion.div {...munculKeAtas} className="flex flex-col gap-5">
            <h2 className="font-display text-[clamp(1.35rem,3vw,2rem)] leading-tight font-extrabold text-(--primary)">
              Kenapa platform ini ada
            </h2>
            <p className="max-w-[62ch] text-[0.98rem] leading-8 text-(--dark-text)/80">
              <strong className="text-(--primary)">Torang Bersih</strong> lahir
              dari satu kenyataan sederhana: TPA Sumompow sudah melebihi
              kapasitas, sementara warga, Bank Sampah, dan pemerintah bekerja
              sendiri-sendiri tanpa saling melihat.
            </p>
            <p className="max-w-[62ch] text-[0.98rem] leading-8 text-(--dark-text)/80">
              Platform ini dikembangkan tim{" "}
              <strong className="text-(--primary)">Lasalle Vibers</strong> dari
              Universitas Katolik De La Salle Manado untuk ajang kompetisi
              Infinitera 2.0. Kata <em>&ldquo;Torang&rdquo;</em> berarti
              &ldquo;Kita&rdquo; — nama itu dipilih karena krisis sampah di
              Sulawesi Utara memang tidak dapat diselesaikan satu instansi saja.
            </p>
            <p className="max-w-[62ch] text-[0.98rem] leading-8 text-(--dark-text)/80">
              Torang Bersih menjadi payung informasi untuk pemantauan titik
              tumpukan sampah liar, bursa barang bekas daur ulang, serta wadah
              berkumpulnya individu, aktivis lingkungan, dan semua pihak yang
              peduli pada kelestarian lingkungan hidup di Sulawesi Utara.
            </p>
            <p className="font-display text-lg font-extrabold text-(--cyan)">
              #TorangBisaTorangBersih
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ 3. TIGA PILAR ═══════════════ */}
      <section className="bg-(--surface-sky) py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <motion.h2
            {...munculKeAtas}
            className="font-display max-w-[20ch] text-[clamp(1.35rem,3vw,2rem)] leading-tight font-extrabold text-(--primary)"
          >
            Tiga hal yang kami kerjakan
          </motion.h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {PILAR.map(({ Ilustrasi, judul, isi }, i) => (
              <motion.article
                key={judul}
                {...munculKeAtas}
                transition={{ ...munculKeAtas.transition, delay: i * 0.08 }}
                // Garis tipis di atas, bukan kotak kartu. Tiga kartu seragam
                // berjajar adalah pola yang paling cepat membuat halaman
                // terbaca sebagai hasil generate; garis atas memberi struktur
                // tanpa membingkai.
                className="flex flex-col gap-4 border-t-2 border-(--primary) pt-6"
              >
                <Ilustrasi />
                <h3 className="font-display text-lg font-extrabold text-(--primary)">
                  {judul}
                </h3>
                <p className="max-w-[34ch] text-sm leading-7 text-(--dark-text)/70">
                  {isi}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 4. AJAKAN ═══════════════ */}
      <section className="px-6 pb-20 sm:pb-28">
        <motion.div
          {...munculKeAtas}
          className="mx-auto flex max-w-6xl flex-col gap-7 rounded-2xl bg-(--primary) px-7 py-12 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12"
        >
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-[clamp(1.35rem,3vw,2rem)] leading-tight font-extrabold text-white">
              Ingin ikut?
            </h2>
            <p className="max-w-[52ch] text-[0.95rem] leading-7 text-white/75">
              Warga, komunitas, Bank Sampah, maupun pelaku usaha — semua bisa
              masuk ke ekosistem yang sama.
            </p>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/register"
          {...saatMendekat(pramuat.daftar)}
              className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 font-bold text-(--primary) transition hover:bg-(--gray-shine) motion-reduce:transition-none"
            >
              Daftar Sekarang
            </Link>
            <Link
              to="/artikel"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/25 px-7 py-3.5 font-bold text-white transition hover:border-white/50 hover:bg-white/10 motion-reduce:transition-none"
            >
              Pelajari Edukasi
              <ArrowRight aria-hidden="true" className="size-[1.1em]" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

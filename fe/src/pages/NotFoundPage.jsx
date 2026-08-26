import { useEffect } from "react";
import { Link } from "react-router";
import { LuMap, LuMegaphone, LuNewspaper, LuArrowLeft } from "react-icons/lu";
import { useAuth } from "../contexts/AuthContext";

// Tujuan yang benar-benar berguna, bukan cuma "kembali ke beranda".
// Orang yang mendarat di sini biasanya sedang mencari sesuatu yang spesifik —
// menyodorkan beranda saja memaksa mereka mengulang pencarian dari nol.
// Empat pintu ini dipilih karena mewakili empat hal yang paling sering dicari
// pengunjung: melihat titik sampah, melapor, membaca, dan pulang.
const TUJUAN = [
  {
    ke: "/peta",
    ikon: LuMap,
    judul: "Peta Sampah",
    ringkas: "Lihat titik sampah dan bank sampah terdekat",
  },
  {
    ke: "/laporan/buat",
    ikon: LuMegaphone,
    judul: "Laporkan Sampah",
    ringkas: "Kirim laporan tumpukan sampah ilegal",
  },
  {
    ke: "/artikel",
    ikon: LuNewspaper,
    judul: "Artikel",
    ringkas: "Panduan memilah dan mengelola sampah",
  },
];

export default function NotFoundPage() {
  const { user } = useAuth();
  const beranda = user?.role === "admin" ? "/admin" : "/";

  useEffect(() => {
    const judulSebelumnya = document.title;
    document.title = "Halaman tidak ditemukan — Torang Bersih";

    // Netlify mengembalikan status 200 untuk alamat tak dikenal (itu syarat
    // supaya /peta bisa dibuka langsung — lihat public/_redirects). Efek
    // sampingnya, mesin telusur menganggap halaman error ini halaman sah dan
    // ikut mengindeksnya — dikenal sebagai "soft 404".
    //
    // Tag noindex yang dipasang saat halaman ini muncul menutup celah itu,
    // tanpa mengorbankan perutean sisi peramban.
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);

    return () => {
      document.title = judulSebelumnya;
      meta.remove();
    };
  }, []);

  return (
    <main
      // bg-(--surface-sky), bukan bg-gray-50. Abu netral memang aman di mana
      // saja, tapi di sebelah palet bernuansa langit milik situs ini ia terbaca
      // kotor — dan halaman 404 yang warnanya asing justru menguatkan kesan
      // "ada yang rusak" melebihi yang sebenarnya terjadi.
      className="flex min-h-screen flex-col items-center justify-center bg-(--surface-sky) px-6 py-16"
    >
      <div className="w-full max-w-3xl">
        <Link
          to="/"
          className="mx-auto mb-10 flex w-fit items-center gap-2"
          aria-label="Torang Bersih, kembali ke beranda"
        >
          <img
            src="/images/logo.webp"
            alt=""
            aria-hidden="true"
            className="size-11"
            draggable={false}
          />
          <span className="flex flex-col text-[0.95rem] leading-none font-bold text-(--primary)">
            <span>TORANG</span>
            <span>BERSIH</span>
          </span>
        </Link>

        <div className="text-center">
          {/* Angkanya besar sebagai penanda visual, tetapi disembunyikan dari
              pembaca layar: "empat nol empat" tidak berarti apa-apa kalau
              dibacakan. Judul yang sebenarnya ada di <h1> di bawahnya. */}
          <p
            aria-hidden="true"
            className="font-display text-[clamp(5rem,18vw,9rem)] leading-none font-extrabold tracking-tight text-(--primary)/15"
          >
            404
          </p>

          <h1 className="font-display mt-2 text-[clamp(1.5rem,4.5vw,2.25rem)] leading-tight font-extrabold text-(--primary)">
            Halaman ini tidak ada
          </h1>

          <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-7 text-(--dark-text)/75">
            Mungkin alamatnya salah ketik, atau halamannya sudah dipindahkan.
            Tidak apa-apa — dari sini masih banyak jalan.
          </p>
        </div>

        {/* Tiga pintu keluar utama. Grid, bukan daftar tautan biasa: sasaran
            sentuh yang lebar jauh lebih mudah ditekan di layar ponsel. */}
        <nav aria-label="Halaman yang mungkin Anda cari" className="mt-10">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TUJUAN.map(({ ke, ikon: Ikon, judul, ringkas }) => (
              <li key={ke}>
                <Link
                  to={ke}
                  className="flex h-full flex-col gap-2 rounded-2xl bg-white/80 p-5 ring-1 ring-(--primary)/10 transition hover:bg-white hover:ring-(--primary)/30 hover:shadow-lg motion-reduce:transition-none"
                >
                  <Ikon
                    aria-hidden="true"
                    className="size-6 shrink-0 text-(--primary)"
                  />
                  <span className="font-bold text-(--primary)">{judul}</span>
                  <span className="text-sm leading-6 text-(--dark-text)/70">
                    {ringkas}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 flex justify-center">
          <Link
            to={beranda}
            className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-7 py-3.5 font-bold text-white shadow-lg transition hover:bg-(--primary-dark) motion-reduce:transition-none"
          >
            <LuArrowLeft aria-hidden="true" className="size-[1.1em]" />
            {user?.role === "admin" ? "Kembali ke Panel Admin" : "Kembali ke Beranda"}
          </Link>
        </div>
      </div>

      {/* Ilustrasi petugas dari hero, dipakai ulang — berkasnya kemungkinan
          besar sudah ada di cache pengunjung karena halaman depan memakainya.
          Sekadar dekorasi, jadi alt-nya kosong dan disembunyikan dari pembaca
          layar. */}
      <img
        src="/images/Hero%20asset/char-2-petugas.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        className="pointer-events-none mt-12 w-[clamp(7rem,22vw,10rem)] opacity-90 select-none"
      />
    </main>
  );
}

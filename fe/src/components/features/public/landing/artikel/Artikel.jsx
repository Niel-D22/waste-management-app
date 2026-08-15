import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { LuArrowRight, LuEye } from "react-icons/lu";
import { artikelAPI } from "../../../../../services/api/routes/artikel.route";

// Tiga, bukan lima. Ini section penggoda di landing page, bukan halaman indeks:
// tugasnya membuktikan platform ini hidup lalu mengantar pergi ke /artikel —
// bukan menyediakan tempat membaca. Layout lama (satu headline besar + daftar
// "Terbaru" di sampingnya) adalah layout halaman indeks, dan itu yang bikin
// section ini terasa beda sendiri: dia punya dua titik fokus yang bersaing,
// sementara semua section lain di landing berfokus tunggal dan terpusat.
const JUMLAH_TAMPIL = 3;

const Artikel = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLandingArtikel = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          per_page: JUMLAH_TAMPIL,
          sort_by: "created_at",
          sort_order: "desc",
          status_publikasi: "published",
        };

        const res = await artikelAPI.getAll(params);
        const data = res.data.data || [];

        setArticles(
          data.map((item) => ({
            id: item.id,
            title: item.judul_artikel,
            image: item.foto_cover_url ?? "",
            category: item.kategori?.nama ?? item.kategori ?? "",
            author:
              item.penulis?.full_name ?? item.penulis?.username ?? "Anonim",
            date: item.waktu_publish
              ? new Date(item.waktu_publish).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-",
            views: item.jumlah_views ?? 0,
          })),
        );
      } catch (err) {
        setError(err.response?.data?.message || "Gagal memuat artikel.");
      } finally {
        setLoading(false);
      }
    };

    fetchLandingArtikel();
  }, []);

  const hasData = !loading && !error && articles.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="relative flex w-full justify-center overflow-x-clip bg-(--surface-sky) px-4 py-16 md:px-6"
    >
      {/* Ornamen latar. Diletakkan sebagai anak PERTAMA supaya tercat di
          lapisan paling belakang tanpa perlu z-index — isi section setelahnya
          otomatis menimpanya. pointer-events-none supaya tidak pernah mencuri
          klik. Disembunyikan di bawah md: di layar sempit ruangnya sudah
          sesak, ornamen di situ jadi mengganggu, bukan menghias. */}
      <img
        src="/images/ornamen/ornamen-awan.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute -top-4 -right-16 hidden w-[30%] opacity-60 select-none md:block"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10">
        {/* Judul section — terpusat, skalanya sama dengan FiturSlider dan
            IconReveal supaya iramanya tidak mengecil di ujung halaman. */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Berita &amp; Artikel
          </h2>
          <p className="max-w-2xl text-xl leading-8 text-slate-600 md:text-2xl md:leading-9">
            Informasi terkini seputar pengelolaan sampah dan lingkungan di
            Sulawesi Utara.
          </p>
        </div>

        {/* Tiga kartu SETARA. Perlakuan yang identik inilah yang menghilangkan
            ketimpangan layout lama, di mana satu kolom berupa kartu dan kolom
            lainnya menempel telanjang di latar. */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            [...Array(JUMLAH_TAMPIL)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_2px_15px_2px_rgba(0,0,0,0.06)]"
              >
                <div className="aspect-video w-full bg-(--surface-sky)" />
                <div className="flex flex-col gap-3 p-5">
                  <div className="h-3 w-20 rounded bg-(--surface-sky)" />
                  <div className="h-5 w-full rounded bg-(--surface-sky)" />
                  <div className="h-5 w-2/3 rounded bg-(--surface-sky)" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-(--surface-sky)" />
                </div>
              </div>
            ))}

          {!loading && error && (
            <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700 sm:col-span-2 lg:col-span-3">
              Gagal memuat artikel: {error}
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 sm:col-span-2 lg:col-span-3">
              Belum ada artikel yang dipublikasikan.
            </div>
          )}

          {hasData &&
            articles.map((artikel) => (
              <Link
                key={artikel.id}
                to={`/artikel/${artikel.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_2px_15px_2px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_24px_2px_rgba(30,31,120,0.14)]"
              >
                {/* aspect-video dikunci supaya ketiga kartu punya tinggi gambar
                    yang persis sama, berapa pun rasio foto aslinya. Tanpa ini
                    barisnya jadi tidak rata dan kesan "setara"-nya hilang. */}
                <div className="aspect-video w-full overflow-hidden bg-(--surface-sky)">
                  {artikel.image ? (
                    <img
                      src={artikel.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {artikel.category && (
                    <span className="mb-3 self-start rounded-full bg-(--accent)/10 px-3 py-1 text-[11px] font-bold tracking-wider text-(--primary) uppercase">
                      {artikel.category}
                    </span>
                  )}

                  {/* line-clamp-2 supaya judul panjang tidak mendorong tinggi
                      kartunya sendiri dan merusak kerataan baris. */}
                  <h3 className="line-clamp-2 text-lg leading-snug font-bold text-slate-900 transition-colors group-hover:text-(--primary)">
                    {artikel.title}
                  </h3>

                  <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-slate-500">
                    <span className="truncate">{artikel.author}</span>
                    <span aria-hidden="true">•</span>
                    <span className="shrink-0">{artikel.date}</span>
                    <span className="ml-auto flex shrink-0 items-center gap-1">
                      <LuEye size={13} />
                      {artikel.views}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {hasData && (
          <div className="flex justify-center">
            <Link
              to="/artikel"
              className="flex items-center gap-2 rounded-full bg-(--primary) px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-(--primary-dark) md:text-base"
            >
              Lihat semua artikel
              <LuArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Artikel;

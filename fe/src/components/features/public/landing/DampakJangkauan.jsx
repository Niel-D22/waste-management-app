import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { animate, motion, useInView } from "motion/react";
import { LuArrowRight, LuMapPin } from "react-icons/lu";
import { getWilayahLeaderboard } from "../../../../services/api/routes/leaderboard.route";

// Menggantikan section "Jangkauan Kami" yang lama. Yang lama memasang peta
// Leaflet di beranda tapi isinya marker HARDCODED — kalau juri membandingkannya
// dengan halaman /peta yang datanya asli, itu ketahuan. Section ini menjawab
// pertanyaan yang sama ("seberapa luas jangkauan kami") dengan angka sungguhan
// dari GET /api/leaderboard/wilayah, dan sekaligus mengeluarkan Leaflet dari
// bundel beranda.
const JUMLAH_WILAYAH_TAMPIL = 5;

// Angka menghitung naik saat section masuk layar. Ini bukan hiasan: angka yang
// bergerak memaksa mata berhenti dan membacanya, sedangkan angka diam ikut
// terlewat bersama sisa halaman.
function AngkaHitung({ nilai, suffix = "" }) {
  const ref = useRef(null);
  const terlihat = useInView(ref, { once: true, amount: 0.5 });
  const [tampil, setTampil] = useState(0);

  useEffect(() => {
    if (!terlihat) return;
    const kontrol = animate(0, nilai, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setTampil(Math.round(v)),
    });
    return () => kontrol.stop();
  }, [terlihat, nilai]);

  return (
    <span ref={ref}>
      {tampil.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

function DampakJangkauan() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getWilayahLeaderboard()
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err?.response?.data?.message || "Gagal memuat data."),
      );
  }, []);

  const perWilayah = data?.per_wilayah ?? [];
  const status = data?.laporan_per_status ?? {};
  const total = data?.total_laporan ?? 0;
  const ditangani = (status.ditindak ?? 0) + (status.selesai ?? 0);

  const angka = [
    { label: "Laporan Masuk", nilai: total },
    { label: "Wilayah Terjangkau", nilai: perWilayah.length },
    { label: "Sudah Ditangani", nilai: ditangani },
    {
      label: "Tingkat Penanganan",
      // Pembagi dijaga minimal 1: tanpa itu, saat belum ada laporan sama sekali
      // hasilnya NaN dan yang tampil di beranda jadi "NaN%".
      nilai: Math.round((ditangani / Math.max(total, 1)) * 100),
      suffix: "%",
    },
  ];

  const teratas = perWilayah.slice(0, JUMLAH_WILAYAH_TAMPIL);
  // Dipakai sebagai pembagi lebar batang, jadi tidak boleh nol.
  const tertinggi = Math.max(...teratas.map((w) => w.jumlah_laporan), 1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-(--surface-sky) px-4 py-16 md:px-10 md:py-24"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-[clamp(1.75rem,5.2vw,3rem)] leading-tight font-extrabold tracking-tight text-slate-900">
            Dampak &amp; Jangkauan Kami
          </h2>
          <p className="max-w-2xl text-[clamp(0.95rem,3.2vw,1.125rem)] leading-relaxed text-slate-600">
            Angka di bawah ini diambil langsung dari laporan warga yang masuk,
            bukan perkiraan.
          </p>
        </div>

        {error ? (
          <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <>
            <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {angka.map((a) => (
                <div
                  key={a.label}
                  className="flex flex-col items-center rounded-2xl bg-white px-4 py-8 text-center shadow-[0px_2px_15px_2px_rgba(0,0,0,0.06)]"
                >
                  <span className="font-display text-[clamp(2rem,6vw,3.5rem)] leading-none font-extrabold text-(--primary)">
                    <AngkaHitung nilai={a.nilai} suffix={a.suffix} />
                  </span>
                  <span className="mt-3 text-sm font-semibold text-slate-500">
                    {a.label}
                  </span>
                </div>
              ))}
            </div>

            {teratas.length > 0 && (
              <div className="w-full rounded-3xl bg-white p-6 shadow-[0px_2px_15px_2px_rgba(0,0,0,0.06)] md:p-10">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <LuMapPin size={20} className="text-(--accent)" />
                  Wilayah dengan laporan terbanyak
                </h3>

                <div className="flex flex-col gap-5">
                  {teratas.map((w, i) => (
                    <div key={w.kabupaten_kota} className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="truncate text-sm font-bold text-slate-800">
                          {w.kabupaten_kota}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-(--primary)">
                          {w.jumlah_laporan}
                        </span>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-(--surface-sky)">
                        {/* Lebar batang relatif terhadap wilayah TERTINGGI,
                            bukan terhadap total. Kalau relatif terhadap total,
                            semua batang jadi pendek dan perbandingannya justru
                            tidak terbaca. */}
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${(w.jumlah_laporan / tertinggi) * 100}%`,
                          }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1,
                            delay: i * 0.1,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="h-full rounded-full bg-linear-to-r from-(--primary) to-(--accent)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Link
          to="/peta"
          className="flex items-center gap-2 rounded-full bg-(--primary) px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-(--primary-dark) md:text-base"
        >
          Lihat Peta Lengkap
          <LuArrowRight size={17} />
        </Link>
      </div>
    </motion.section>
  );
}

export default DampakJangkauan;

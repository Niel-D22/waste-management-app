import { Link, useNavigate, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { LuMenu, LuX, LuLogOut, LuSettings, LuUser } from "react-icons/lu";
import { fiturItems } from "./navConstants";
import { pramuat, saatMendekat } from "../../../../utils/pramuatRute";

// Semua tautan dalam SATU daftar rata, bukan bertingkat dengan sub-menu yang
// bisa dibuka-tutup. Di layar sentuh, menu bertingkat memaksa dua ketukan
// untuk sampai ke tujuan dan menyembunyikan separuh isi menu di balik akordeon.
// Daftar rata memperlihatkan seluruh isinya sekaligus.
const TAUTAN = [
  { label: "Beranda", path: "/" },
  { label: "Peta", path: "/peta" },
  { label: "Artikel", path: "/artikel" },
  ...fiturItems,
  { label: "Tentang Kami", path: "/tentang-kami" },
];

function MobileMenu({ isAuthenticated, user, onLogout, menuOpen, setMenuOpen }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tutup = () => setMenuOpen(false);

  const handleLogout = async () => {
    tutup();
    await onLogout();
    navigate("/login");
  };

  return (
    <>
      {/* Tombol hamburger. Tampil sampai lg (bukan md) — di tablet, nav desktop
          kita berisi lima tautan plus dropdown dan tombol; ruangnya sudah sesak
          dan lebih baik dilipat ke menu. */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={menuOpen}
        className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-white transition hover:bg-white/10 lg:hidden"
      >
        {menuOpen ? <LuX className="size-6" /> : <LuMenu className="size-6" />}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Latar gelap. Menutup menu saat disentuh — jalan keluar yang
                paling dicari orang setelah tombol X. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={tutup}
              className="fixed inset-0 z-990 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />

            <motion.nav
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              // Panel mengambang dengan jarak dari keempat tepi, bukan menempel
              // penuh ke layar. Bentuk kartu ini yang membuatnya terbaca sebagai
              // lapisan di atas halaman, bukan halaman baru.
              className="fixed inset-x-4 top-4 z-995 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl bg-(--primary) p-5 shadow-2xl lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <Link to="/" onClick={tutup} className="flex items-center gap-2">
                  {/* Versi logo berisi putih, bukan logo berwarna — logo navy
                      di atas panel navy praktis tidak terlihat. */}
                  <img
                    src="/images/logo-fill.webp"
                    alt=""
                    className="size-10"
                    draggable={false}
                  />
                  <span className="flex flex-col text-[0.95rem] leading-none font-bold text-white">
                    <span>TORANG</span>
                    <span>BERSIH</span>
                  </span>
                </Link>

                <button
                  onClick={tutup}
                  aria-label="Tutup menu"
                  className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <LuX className="size-6" />
                </button>
              </div>

              {/* Kartu identitas pengguna, menggantikan kartu kuota di
                  referensi. Isinya baru berguna kalau sudah masuk, jadi hanya
                  ditampilkan saat itu. */}
              {isAuthenticated && (
                <div className="mb-5 rounded-2xl bg-white/10 px-4 py-3">
                  <p className="truncate font-bold text-white">
                    {user?.username || user?.full_name || "Akun"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-white/60">
                    {user?.email}
                  </p>
                </div>
              )}

              <ul className="flex flex-col">
                {TAUTAN.map(({ label, path }) => {
                  const aktif = pathname === path;
                  return (
                    <li key={path}>
                      <Link
                        to={path}
                        onClick={tutup}
                        // py-3 memberi tinggi sentuh ~48px, ambang minimum yang
                        // nyaman untuk jempol.
                        className={`block py-3 text-lg font-semibold transition ${
                          aktif
                            ? "text-white"
                            : "text-white/65 hover:text-white"
                        }`}
                      >
                        {label}
                        {aktif && (
                          <span className="mt-1 block h-0.5 w-8 rounded-full bg-white" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Tombol aksi menempel di dasar panel, selebar penuh — bagian
                  yang paling mudah dijangkau jempol ada di bawah, bukan di
                  atas. */}
              <div className="mt-6 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={user?.role === "admin" ? "/admin" : `/${user?.username}`}
                      onClick={tutup}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-bold text-(--primary) transition hover:bg-(--gray-light)"
                    >
                      {user?.role === "admin" ? (
                        <LuSettings size={18} />
                      ) : (
                        <LuUser size={18} />
                      )}
                      {user?.role === "admin" ? "Panel Admin" : "Dashboard"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-white/25 py-3.5 font-bold text-white transition hover:border-white/50 hover:bg-white/10"
                    >
                      <LuLogOut size={18} />
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/laporan/buat"
                      onClick={tutup}
                      className="rounded-xl bg-white py-3.5 text-center font-bold text-(--primary) transition hover:bg-(--gray-light)"
                    >
                      Laporkan Sampah
                    </Link>
                    <Link
                      to="/login"
          {...saatMendekat(pramuat.login)}
                      onClick={tutup}
                      className="rounded-xl border-2 border-white/25 py-3.5 text-center font-bold text-white transition hover:border-white/50 hover:bg-white/10"
                    >
                      Bergabung
                    </Link>
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileMenu;

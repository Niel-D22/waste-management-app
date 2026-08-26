import { lazy, Suspense } from "react";
import { useLocation, useOutlet } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "./partials/header/Header";
import Footer from "./partials/Footer";

// Widget obrolan tidak ikut berkas utama. Isinya beserta ikon-ikonnya hanya
// berguna kalau tombolnya ditekan, sementara berat unduhnya ditanggung SETIAP
// pengunjung halaman depan — termasuk yang cuma mau melihat peta.
const ChatbotWidget = lazy(() => import("../common/ChatbotWidget"));

function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // useOutlet(), bukan <Outlet />. AnimatePresence perlu memegang elemen halaman
  // sebagai anak ber-key supaya bisa menahannya tetap terpasang selama animasi
  // keluar. <Outlet /> selalu merender rute yang SEDANG aktif, jadi halaman lama
  // langsung lenyap begitu URL berubah dan animasi keluarnya tidak pernah
  // sempat terlihat.
  const outlet = useOutlet();

  // Membaca saklar "kurangi gerakan" milik sistem operasi. Kalau menyala,
  // halaman berganti seketika tanpa memudar dan tanpa bergeser. Bagi pengguna
  // dengan gangguan vestibular, pergeseran berulang di setiap perpindahan
  // halaman memicu pusing sungguhan.
  const kurangiGerakan = useReducedMotion();

  const pagesWithoutFooter = ["/peta", "/profile"];

  return (
    // overflow-x-clip (bukan overflow-x-hidden) supaya position:sticky di
    // halaman anak tetap berfungsi
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white transition-colors duration-200">
      {/* Tautan pertama di halaman, tak terlihat sampai ditekan Tab. Tanpa ini
          pengguna papan ketik harus melewati seluruh isi navbar di setiap
          halaman sebelum sampai ke isinya. */}
      <a href="#konten-utama" className="skip-link">
        Lewati ke konten utama
      </a>

      <Header isAuthenticated={isAuthenticated} user={user} onLogout={logout} />

      {/* id + tabIndex={-1} adalah pasangan wajib untuk tautan lewati-konten:
          id jadi sasaran lompatannya, tabIndex={-1} membuat elemen ini bisa
          MENERIMA fokus lewat program tanpa ikut masuk urutan Tab biasa.
          Tanpa tabIndex, sebagian peramban menggulung halaman ke sini tapi
          fokus papan ketiknya tertinggal di navbar — jadi Tab berikutnya
          melompat balik ke atas. */}
      <main id="konten-utama" tabIndex={-1} className="z-100 flex-1">
        {/* mode="wait" supaya halaman lama selesai memudar dulu sebelum yang
            baru masuk — kalau keduanya tampil bersamaan, isinya saling tumpuk
            dan justru terlihat lebih patah.
            Durasinya sengaja pendek (0.22s masuk / 0.16s keluar): transisi
            halaman yang lebih lama dari ini mulai terasa lambat, bukan halus.

            initial={false} SENGAJA DIHAPUS. Dulu ia dipasang supaya halaman
            depan langsung tampil tanpa memudar saat situs pertama dibuka. Dua
            hal membuatnya tidak lagi tepat:
            - Muat pertama kini ditutupi layar pembuka, jadi tidak ada lagi
              layar putih yang perlu diisi seketika.
            - Datang dari /login berarti PublicLayout dipasang dari nol. Dengan
              initial={false}, beranda muncul begitu saja tanpa transisi — persis
              sentakan yang dikeluhkan. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={kurangiGerakan ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={kurangiGerakan ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{
              duration: kurangiGerakan ? 0 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>

      {pagesWithoutFooter.includes(location.pathname) ? null : <Footer />}

      {/* fallback null, bukan penampung: tombol obrolan yang muncul sepersekian
          detik belakangan tidak mengganggu, sedangkan kerangka abu-abu yang
          berkedip di pojok layar justru menarik perhatian ke hal yang salah. */}
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  );
}

export default PublicLayout;

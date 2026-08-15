import { useLocation, useOutlet } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "./partials/header/Header";
import Footer from "./partials/Footer";
import ChatbotWidget from "../common/ChatbotWidget";

function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // useOutlet(), bukan <Outlet />. AnimatePresence perlu memegang elemen halaman
  // sebagai anak ber-key supaya bisa menahannya tetap terpasang selama animasi
  // keluar. <Outlet /> selalu merender rute yang SEDANG aktif, jadi halaman lama
  // langsung lenyap begitu URL berubah dan animasi keluarnya tidak pernah
  // sempat terlihat.
  const outlet = useOutlet();

  const pagesWithoutFooter = ["/peta", "/profile"];

  return (
    // overflow-x-clip (bukan overflow-x-hidden) supaya position:sticky di
    // halaman anak tetap berfungsi
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white transition-colors duration-200">
      <Header isAuthenticated={isAuthenticated} user={user} onLogout={logout} />

      {/* Content fill empty space*/}
      <main className="z-100 flex-1">
        {/* mode="wait" supaya halaman lama selesai memudar dulu sebelum yang
            baru masuk — kalau keduanya tampil bersamaan, isinya saling tumpuk
            dan justru terlihat lebih patah.
            Durasinya sengaja pendek (0.22s masuk / 0.16s keluar): transisi
            halaman yang lebih lama dari ini mulai terasa lambat, bukan halus.
            initial={false} mencegah animasi ikut berjalan saat halaman pertama
            kali dimuat — di situ yang diinginkan langsung tampil, bukan memudar. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>

      {pagesWithoutFooter.includes(location.pathname) ? null : <Footer />}
      <ChatbotWidget />
    </div>
  );
}

export default PublicLayout;

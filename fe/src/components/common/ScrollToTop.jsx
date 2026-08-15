import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Ditunda sedikit, tidak langsung. PublicLayout memutar animasi keluar halaman
// (AnimatePresence mode="wait") selama ~160ms sebelum halaman baru dipasang.
// Kalau posisi scroll direset seketika saat URL berubah, halaman LAMA yang masih
// terlihat itu akan tersentak ke atas dulu, baru memudar — persis kesan patah
// yang ingin dihilangkan. Menundanya membuat reset terjadi saat layar sudah
// kosong, sehingga lompatannya tidak pernah terlihat.
// Angka ini sengaja sedikit lebih besar dari durasi animasi keluar di
// PublicLayout.jsx — kalau durasi di sana diubah, sesuaikan juga yang ini.
const EXIT_ANIMATION_MS = 170;

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, EXIT_ANIMATION_MS);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

import { useState, useEffect } from "react";
import HeaderLogo from "./HeaderLogo";
import HeaderNav from "./HeaderNav";
import HeaderAuth from "./HeaderAuth";
import MobileMenu from "./MobileMenu";
import { useLocation } from "react-router-dom";

function Header({ isAuthenticated, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Halaman yang kontennya memenuhi layar sampai ke balik navbar (landing:
  // ilustrasi hero, peta: kanvas peta) memakai navbar mengambang. Halaman lain
  // tetap bar putih penuh, karena kontennya dimulai tepat di bawah navbar dan
  // navbar mengambang di situ malah menabrak isi halaman.
  const FLOATING_NAV_PAGES = ["/", "/peta"];
  const isLandingPage = FLOATING_NAV_PAGES.includes(location.pathname);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Gaya "floating pill" hanya dipakai di landing page. Halaman lain tetap
  // memakai header putih penuh seperti sebelumnya.
  const floating = isLandingPage && !menuOpen;

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-999 flex justify-center px-4 transition-all duration-300 md:px-6 ${
        floating
          ? "bg-white py-3 shadow-md md:bg-transparent md:py-0 md:shadow-none"
          : "h-24 bg-white py-2 shadow-md"
      }`}
    >
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 md:items-start">
        <div
          className={
            floating
              ? "md:rounded-b-3xl md:bg-white/95 md:px-6 md:pt-6 md:pb-5 md:shadow-lg md:ring-1 md:ring-black/5 md:backdrop-blur"
              : "flex h-full items-center"
          }
        >
          <HeaderLogo />
        </div>

        {/* Mulai lg, nav dikeluarkan dari aliran flex dan dikunci ke sumbu
            tengah. justify-between hanya MEMBAGI RATA sisa ruang, tidak
            menengahkan — karena kartu logo jauh lebih lebar dari tombol
            "Bergabung", nav-nya jadi terdorong ke kanan dan tidak sejajar
            dengan teks hero yang memang di tengah.
            Baru diaktifkan di lg (bukan md) supaya di lebar 768-1024px nav
            tetap ikut flex dan tidak berpotensi menabrak logo/tombol. */}
        <div
          className={`transition-all duration-300 lg:absolute lg:left-1/2 lg:-translate-x-1/2 ${
            floating
              ? `hidden rounded-full bg-white/95 px-12 py-3.5 shadow-lg ring-1 ring-black/5 backdrop-blur md:block ${
                  scrolled ? "md:mt-3" : "md:mt-5"
                }`
              : "flex h-full items-center"
          }`}
        >
          <HeaderNav />
        </div>

        <div
          className={`flex items-center transition-all duration-300 ${
            floating ? (scrolled ? "md:mt-3" : "md:mt-5") : "h-full"
          }`}
        >
          <HeaderAuth
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={onLogout}
            floating={floating}
          />
        </div>

        <div
          className={`flex items-center transition-all duration-300 md:hidden ${
            floating ? (scrolled ? "md:mt-3" : "md:mt-5") : "h-full"
          }`}
        >
          <MobileMenu
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={onLogout}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
          />
        </div>
      </div>
    </nav>
  );
}

export default Header;

import { useState, useEffect } from "react";
import HeaderLogo from "./HeaderLogo";
import HeaderNav from "./HeaderNav";
import HeaderAuth from "./HeaderAuth";
import MobileMenu from "./MobileMenu";
import { useLocation } from "react-router-dom";

function Header({ isAuthenticated, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

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
          ? scrolled
            ? "py-3"
            : "py-5"
          : "h-24 bg-white py-2 shadow-md"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <div
          className={
            floating
              ? "rounded-2xl bg-white/95 px-4 py-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur"
              : ""
          }
        >
          <HeaderLogo />
        </div>

        <div
          className={
            floating
              ? "hidden rounded-full bg-white/95 px-8 py-3 shadow-lg ring-1 ring-black/5 backdrop-blur md:block"
              : ""
          }
        >
          <HeaderNav />
        </div>

        <HeaderAuth
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={onLogout}
        />
        <MobileMenu
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={onLogout}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
      </div>
    </nav>
  );
}

export default Header;

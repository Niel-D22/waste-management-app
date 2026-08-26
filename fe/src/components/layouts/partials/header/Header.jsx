import { useState, useEffect, useRef } from "react";
import HeaderLogo from "./HeaderLogo";
import HeaderNav from "./HeaderNav";
import HeaderAuth from "./HeaderAuth";
import MobileMenu from "./MobileMenu";
import { useLocation } from "react-router-dom";

function Header({ isAuthenticated, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Halaman yang kontennya memenuhi layar sampai ke balik navbar (landing:
  // ilustrasi hero, peta: kanvas peta, tentang kami: band langit) memakai
  // navbar mengambang. Halaman lain tetap bar putih penuh, karena kontennya
  // dimulai tepat di bawah navbar dan navbar mengambang di situ malah menabrak
  // isi halaman.
  //
  // Syaratnya satu: halaman itu harus menyediakan ruang atas sendiri yang cukup
  // (band pembukanya memakai pt-32 sm:pt-36) supaya kartu navbar tidak menimpa
  // judulnya. Menambahkan halaman ke sini tanpa memberi ruang itu membuat
  // navbar mengambang di atas teks.
  const FLOATING_NAV_PAGES = ["/", "/peta", "/tentang-kami"];
  const isLandingPage = FLOATING_NAV_PAGES.includes(location.pathname);

  const [scrolled, setScrolled] = useState(false);

  // Navbar menyingkir saat digulir ke BAWAH, dan kembali saat digulir ke ATAS.
  //
  // Alasannya: navbar ini mengambang menutupi isi halaman. Saat orang menggulir
  // ke bawah, mereka sedang membaca ke depan dan navbar cuma memakan ruang
  // layar. Saat mereka menggulir ke atas, hampir selalu karena mencari sesuatu —
  // navigasi, tombol kembali — jadi di situlah navbar paling berguna. Pola ini
  // mengembalikan ruang baca tanpa memaksa siapa pun menggulir sampai puncak
  // hanya untuk berpindah halaman.
  const [tersembunyi, setTersembunyi] = useState(false);
  const posisiTerakhirRef = useRef(0);

  useEffect(() => {
    // Jarak minimum sebelum arah gulir dianggap berubah. Tanpa ambang ini,
    // getaran kecil dari trackpad atau guncangan jari di layar sentuh membuat
    // navbar berkedip naik-turun terus-menerus.
    const AMBANG = 8;
    // Di dekat puncak halaman navbar SELALU tampil, berapa pun arah gulirnya.
    // Menyembunyikannya di sana tidak menghemat ruang apa-apa dan justru
    // membuat halaman terasa goyah tepat saat pertama dibuka.
    const ZONA_AMAN_ATAS = 90;

    let menungguFrame = false;

    const saatGulir = () => {
      if (menungguFrame) return;
      menungguFrame = true;

      // Dibaca di dalam requestAnimationFrame, bukan langsung di penangan
      // event: membaca scrollY memaksa peramban menghitung ulang tata letak,
      // dan event gulir bisa menyala puluhan kali per detik.
      requestAnimationFrame(() => {
        // Math.max(0, …) meredam pantulan karet di iOS, yang sempat membuat
        // scrollY bernilai negatif dan terbaca sebagai gulir ke atas palsu.
        const y = Math.max(0, window.scrollY);
        const selisih = y - posisiTerakhirRef.current;

        setScrolled(y > 50);

        if (Math.abs(selisih) > AMBANG) {
          setTersembunyi(y > ZONA_AMAN_ATAS && selisih > 0);
          posisiTerakhirRef.current = y;
        }

        menungguFrame = false;
      });
    };

    // passive: true memberi tahu peramban bahwa penangan ini tidak akan pernah
    // memanggil preventDefault, sehingga gulirnya tidak perlu menunggu
    // JavaScript selesai dan tetap mulus.
    window.addEventListener("scroll", saatGulir, { passive: true });
    return () => window.removeEventListener("scroll", saatGulir);
  }, []);

  // Dikembalikan setiap kali pindah halaman.
  //
  // Tanpa ini ada cacat nyata: gulir ke bawah sampai navbar menyingkir, lalu
  // tekan sebuah tautan. ScrollToTop membawa halaman baru ke puncak, tetapi
  // keadaan "tersembunyi" ikut terbawa — halaman baru terbuka TANPA navbar,
  // dan baru muncul lagi setelah pengunjung menggulir. Di halaman yang isinya
  // pendek dan tidak bisa digulir sama sekali, navbarnya tidak akan pernah
  // kembali.
  //
  // Disesuaikan saat render, bukan lewat useEffect. Ini pola resmi React untuk
  // "menyesuaikan state ketika props berubah": React membuang hasil render ini
  // dan langsung mengulangnya dengan nilai baru, jadi navbar yang tersembunyi
  // tidak pernah sempat tergambar sekejap pun di halaman baru. Lewat useEffect,
  // frame pertama halaman baru akan terlanjur tampil tanpa navbar.
  //
  // Ref posisi gulir sengaja TIDAK ikut direset: kalau nilainya tertinggal
  // besar sementara halaman baru mulai dari 0, selisihnya jadi negatif besar
  // dan terbaca sebagai gulir ke atas — yang justru menampilkan navbar.
  const [pathTerakhir, setPathTerakhir] = useState(location.pathname);
  if (pathTerakhir !== location.pathname) {
    setPathTerakhir(location.pathname);
    setTersembunyi(false);
  }

  // Menu mobile terbuka berarti navbar HARUS tetap di tempat — tombol tutupnya
  // ada di dalam navbar itu sendiri. Menyembunyikannya akan mengurung pengguna
  // di menu yang tidak punya jalan keluar.
  const disembunyikan = tersembunyi && !menuOpen;

  // Gaya "floating pill" hanya dipakai di landing page. Halaman lain tetap
  // memakai header putih penuh seperti sebelumnya.
  const floating = isLandingPage && !menuOpen;

  return (
    <nav
      // -translate-y-[130%], bukan -translate-y-full: di mode mengambang kartu
      // logo menggantung lebih rendah dari kotak <nav> itu sendiri, jadi
      // menggeser setinggi elemen saja masih menyisakan ujungnya terlihat.
      //
      // will-change-transform memberi tahu peramban bahwa elemen ini akan
      // bergeser, sehingga ia menyiapkan lapisan komposit sendiri dan
      // geserannya tidak ikut memicu penggambaran ulang seluruh halaman.
      className={`fixed top-0 right-0 left-0 z-999 flex justify-center px-4 pt-4 transition-all duration-300 will-change-transform motion-reduce:transition-none lg:px-6 lg:pt-0 ${
        disembunyikan ? "-translate-y-[130%]" : "translate-y-0"
      } ${floating ? "" : "lg:h-24 lg:bg-white lg:py-2 lg:shadow-md"}`}
    >
      {/* Di bawah lg seluruh baris ini dibungkus jadi satu pil navy mengambang.
            Mulai lg pembungkusnya dilepas (bg dan padding dinolkan) dan tiap
            bagian kembali berdiri sendiri seperti rancangan desktop. */}
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-3 rounded-3xl bg-(--primary) px-4 py-2.5 shadow-lg lg:items-start lg:gap-4 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none">
        <div
          className={
            floating
              ? "lg:rounded-b-3xl lg:bg-white/95 lg:px-6 lg:pt-6 lg:pb-5 lg:shadow-lg lg:ring-1 lg:ring-black/5 lg:backdrop-blur"
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
              ? `hidden rounded-3xl bg-white/95 px-12 py-3.5 shadow-lg ring-1 ring-black/5 backdrop-blur lg:block ${
                  scrolled ? "lg:mt-3" : "lg:mt-5"
                }`
              : "flex h-full items-center"
          }`}
        >
          <HeaderNav />
        </div>

        <div
          className={`hidden items-center transition-all duration-300 lg:flex ${
            floating ? (scrolled ? "lg:mt-3" : "lg:mt-5") : "h-full"
          }`}
        >
          <HeaderAuth
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={onLogout}
            floating={floating}
          />
        </div>

        <div className="flex items-center lg:hidden">
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

import { useLocation, useOutlet } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import AuthSidePanel from "../features/auth/AuthSidePanel";

// Panel sisi dipasang DI SINI, bukan di masing-masing halaman.
//
// Itu syarat mutlak supaya lebarnya bisa menggeser halus saat berpindah antara
// /login dan /register: kalau tiap halaman memasang panelnya sendiri, pindah
// rute berarti panel lama dibongkar dan panel baru dipasang — tidak ada elemen
// yang bertahan, jadi tidak ada yang bisa dianimasikan. Dengan panel tinggal di
// layout, dia bertahan melewati pergantian rute dan hanya lebarnya yang
// berubah.
function AuthLayout() {
  const { pathname } = useLocation();
  const isRegister = pathname.startsWith("/register");
  const kurangiGerakan = useReducedMotion();

  // useOutlet(), bukan <Outlet />. AnimatePresence perlu memegang elemen halaman
  // sebagai anak ber-key supaya bisa menahannya tetap terpasang selama animasi
  // keluar. <Outlet /> selalu merender rute yang SEDANG aktif, jadi halaman lama
  // langsung lenyap begitu URL berubah dan animasi keluarnya tidak pernah
  // sempat terlihat. Pola yang sama dipakai PublicLayout.
  const outlet = useOutlet();

  return (
    // h-dvh + overflow-hidden: tinggi halaman DIKUNCI setinggi layar. Ini yang
    // menjamin formulir sepanjang apa pun tidak pernah membuat halaman ikut
    // memanjang. Yang menggulung hanya kolom formulir di sebelah kanan, jadi
    // ilustrasi di kiri tetap diam di tempatnya.
    // Seluruh layar masuk memudar, bukan hanya isinya.
    // Sebelumnya latar putih setinggi layar ini muncul seketika sementara panel
    // dan formulir di dalamnya memudar di atasnya — kilatan putih itu yang
    // dominan terlihat, sehingga keseluruhannya tetap terbaca "tanpa animasi".
    <motion.div
      initial={kurangiGerakan ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: kurangiGerakan ? 0 : 0.28, ease: "easeOut" }}
      className="flex h-dvh w-full overflow-hidden bg-white"
    >
      <AuthSidePanel isRegister={isRegister} />

      <div className="flex flex-1 overflow-y-auto">
        {/* Hanya kolom formulir yang beranimasi; panel ilustrasi di kiri
            sengaja berada DI LUAR AnimatePresence supaya ia tidak ikut memudar
            dan lebarnya bisa menggeser mulus dari 60% ke 50% saat berpindah ke
            pendaftaran. Kalau keduanya ikut memudar, geseran panel itu hilang
            tertutup dan perpindahannya justru terasa patah.

            Durasinya lebih pendek dari transisi halaman publik (0,18s vs 0,22s):
            di sini yang berpindah hanya satu kolom, bukan seluruh halaman, jadi
            gerakan yang sama panjangnya akan terasa lamban.

            Bergesernya menyamping, bukan ke atas seperti halaman publik —
            mengikuti arah panel di sebelahnya, sehingga keduanya terbaca sebagai
            satu gerakan yang sama. */}
        {/* TANPA initial={false} — beda dari PublicLayout, dan disengaja.
            initial={false} mematikan animasi pada pemasangan PERTAMA. Di
            halaman publik itu benar: halaman depan adalah hal pertama yang
            dimuat, dan di sana yang diinginkan langsung tampil.
            Di sini kebalikannya — orang selalu SAMPAI ke /login dari halaman
            lain, jadi pemasangan pertama justru satu-satunya momen yang paling
            butuh animasi masuk. Dengan initial={false}, formulirnya muncul
            begitu saja tanpa transisi apa pun. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={kurangiGerakan ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={kurangiGerakan ? { opacity: 1 } : { opacity: 0, x: -14 }}
            transition={{
              duration: kurangiGerakan ? 0 : 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex w-full"
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default AuthLayout;

import { Navigate, Outlet, useLocation } from "react-router";
import NotFoundPage from "../../pages/NotFoundPage";
import { useAuth } from "../../contexts/AuthContext";

// Anak-anak rute "/:user" di App.jsx. Dipakai membedakan alamat dasbor yang
// sah-tapi-kedaluwarsa dari alamat yang memang salah ketik. Kalau ada rute anak
// baru ditambahkan di App.jsx, tambahkan juga di sini.
const SUB_HALAMAN_DASBOR = new Set([
  "kolaborator",
  "aset",
  "barang-bekas",
  "laporan",
  "artikel",
  "profile",
]);

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--primary) border-t-transparent" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--primary) border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}

export function UserRoute() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--primary) border-t-transparent" />
      </div>
    );
  }

  // Rute "/:user" menangkap SEMUA alamat satu segmen — /kontak, /promo, salah
  // ketik apa pun. Selama segmennya tidak diperiksa, tiga hal salah terjadi
  // sekaligus: halaman 404 praktis tidak pernah tercapai, pengunjung yang belum
  // masuk dilempar ke halaman login untuk alamat yang memang tidak ada, dan
  // pengguna yang sudah masuk melihat dasbornya sendiri terpampang di alamat
  // milik orang lain.
  //
  // Segmen ini memang tidak dibaca komponen mana pun — satu-satunya tautan
  // menuju ke sini memakai username sendiri. Justru karena itu, segmen yang
  // TIDAK cocok berarti alamatnya salah, bukan alamat orang lain.
  //
  // Segmennya dibaca dari pathname, BUKAN useParams(). UserRoute adalah rute
  // tanpa path yang membungkus "/:user", dan rute tanpa path tidak ikut
  // menyumbang parameter — useParams() di sini mengembalikan objek kosong,
  // sehingga pemeriksaannya diam-diam tidak pernah berjalan. pathname selalu
  // tersedia apa pun susunan rutenya.
  //
  // 404 dirender langsung di tempat, bukan dialihkan: alamat yang salah ketik
  // harus tetap terlihat di bilah alamat supaya pengunjung sadar apa yang
  // keliru, dan tombol "kembali" peramban tidak berputar-putar.
  const [, segmenUrl, subHalaman] = pathname.split("/");
  if (segmenUrl && user && segmenUrl !== user.username) return <NotFoundPage />;

  if (!user) {
    // Belum masuk. Dua kemungkinan yang perlu dibedakan, karena jawabannya
    // berbeda:
    //
    //  /nama-ngawur           -> pengunjung tidak mungkin tahu username siapa
    //                            pun, jadi ini hampir pasti salah ketik -> 404.
    //  /nama-ngawur/laporan   -> berbentuk persis alamat dasbor. Kemungkinan
    //                            besar penanda halaman lama yang sesinya sudah
    //                            habis -> antar ke halaman masuk, jangan
    //                            disodori 404 yang bikin bingung.
    return SUB_HALAMAN_DASBOR.has(subHalaman) ? (
      <Navigate to="/login" replace />
    ) : (
      <NotFoundPage />
    );
  }
  if (user.role !== "user") return <Navigate to="/admin" replace />;

  return <Outlet />;
}

export function GuestRoute() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--primary) border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    const redirectTo = user?.role === "admin" ? "/admin" : "/";
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

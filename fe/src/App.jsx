import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
  UserRoute,
} from "./components/common/ProtectedRoute";
import RouteFallback from "./components/common/RouteFallback";
import PenangkapGalat from "./components/common/PenangkapGalat";

/* ────────────────────────────────────────────────────────────────────────
   Pemuatan per halaman (code splitting).

   Sebelumnya SELURUH aplikasi — halaman admin, pustaka peta, pustaka grafik —
   dijejalkan ke satu berkas JavaScript 1,7 MB yang harus diunduh dan diurai
   sebelum piksel pertama muncul. Di jaringan 3G daerah dan ponsel kelas bawah,
   itu berarti belasan detik layar putih untuk seseorang yang cuma mau melihat
   peta titik sampah.

   Dengan lazy(), tiap halaman jadi berkas terpisah yang baru diunduh saat
   halamannya benar-benar dibuka. Pengunjung halaman depan tidak lagi ikut
   menanggung berat panel admin yang tidak akan pernah mereka buka.

   Layout publik, penjaga rute, dan halaman depan sengaja TIDAK di-lazy:
   ketiganya selalu dibutuhkan pada muat pertama, jadi memisahkannya hanya
   menambah satu perjalanan bolak-balik jaringan tanpa menghemat apa pun.
   ──────────────────────────────────────────────────────────────────────── */

/* selalu dipakai pada muat pertama — dimuat di muka */
import PublicLayout from "./components/layouts/PublicLayout";
import LandingPage from "./pages/public/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";

const AdminLayout = lazy(() => import("./components/layouts/AdminLayout"));
const AuthLayout = lazy(() => import("./components/layouts/AuthLayout"));
const UserLayout = lazy(() => import("./components/layouts/UserLayout"));

/* auth pages */
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));

/* public pages — PetaPage dan halaman berformulir membawa Leaflet, jadi
   justru halaman-halaman inilah yang paling untung dipisah */
const PetaPage = lazy(() => import("./pages/public/PetaPage"));
const KolaboratorPage = lazy(() => import("./pages/public/KolaboratorPage"));
const DetailKolaboratorPage = lazy(
  () => import("./pages/public/DetailKolaboratorPage"),
);
const RegisterKolaboratorPage = lazy(
  () => import("./pages/public/RegisterKolaboratorPage"),
);
const AsetPage = lazy(() => import("./pages/public/AsetPage"));
const RegisterAsetPage = lazy(() => import("./pages/public/RegisterAsetPage"));
const DetailAsetPage = lazy(() => import("./pages/public/DetailAsetPage"));
const BarangBekasPage = lazy(() => import("./pages/public/BarangBekasPage"));
const BarangBekasDetailPage = lazy(
  () => import("./components/features/public/barangbekas/BarangBekasDetailPages"),
);
const JualBarangBekasPage = lazy(
  () => import("./pages/public/JualBarangBekasPage"),
);
const LaporanPage = lazy(() => import("./pages/public/LaporanPage"));
const BuatLaporanPage = lazy(() => import("./pages/public/BuatLaporanPage"));
const DetailLaporan = lazy(() => import("./pages/public/DetailLaporan"));
const ArtikelPage = lazy(() => import("./pages/public/ArtikelPage"));
const ArticleDetailPage = lazy(() => import("./pages/public/DetailArticle"));
const BuatArtikelPage = lazy(() => import("./pages/public/BuatArtikelPage"));
const AboutPage = lazy(() => import("./pages/public/AboutPage"));
const LeaderboardPage = lazy(() => import("./pages/public/LeaderboardPage"));

/* user pages */
const UserDashboardPage = lazy(() => import("./pages/user/UserDashboardPage"));
const UserKolaboratorPage = lazy(
  () => import("./pages/user/UserKolaboratorPage"),
);
const UserAsetPage = lazy(() => import("./pages/user/UserAsetPage"));
const UserBarangBekasPage = lazy(
  () => import("./pages/user/UserBarangBekasPage"),
);
const UserLaporanPage = lazy(() => import("./pages/user/UserLaporanPage"));
const UserArtikelPage = lazy(() => import("./pages/user/UserArtikelPage"));
const UserProfilePage = lazy(() => import("./pages/user/UserProfilePage"));

/* admin pages — AdminAnalitikPage sendirian membawa recharts, yang tidak ada
   gunanya bagi pengunjung biasa */
const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage"),
);
const AdminAnalitikPage = lazy(() => import("./pages/admin/AdminAnalitikPage"));
const AdminKolaboratorPage = lazy(
  () => import("./pages/admin/AdminKolaboratorPage"),
);
const AdminAsetPage = lazy(() => import("./pages/admin/AdminAsetPage"));
const AdminBarangBekasPage = lazy(
  () => import("./pages/admin/AdminBarangBekasPage"),
);
const AdminLaporanPage = lazy(() => import("./pages/admin/AdminLaporanPage"));
const AdminArtikelPage = lazy(() => import("./pages/admin/AdminArtikelPage"));
const AdminUsersManagementPage = lazy(
  () => import("./pages/admin/AdminUserManagementPage"),
);
const AdminProfilePage = lazy(() => import("./pages/admin/AdminProfilePage"));

function App() {
  return (
    // Satu batas Suspense di puncak sudah cukup: react-router v7 membungkus
    // perpindahan halaman dalam transition, sehingga halaman lama tetap
    // terlihat selagi berkas halaman baru diunduh. Penampung ini praktis hanya
    // muncul kalau seseorang membuka tautan dalam ke halaman berat langsung
    // dari luar situs.
    // Pembatas galat membungkus SELURUH rute. Tanpa ini, satu galat di satu
    // halaman membongkar seluruh aplikasi dan menyisakan layar putih tanpa
    // pesan — persis yang terjadi saat satu nama ikon tidak ada lagi di
    // pustakanya.
    <PenangkapGalat>
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Standalone pages (no layout) */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          {/* Untuk halaman publik yang perlu login user */}
          <Route
            path="/kolaborator/daftar"
            element={<RegisterKolaboratorPage />}
          />
          <Route path="/laporan/buat" element={<BuatLaporanPage />} />
          <Route path="/aset/daftar" element={<RegisterAsetPage />} />
          <Route path="/barang-bekas/jual" element={<JualBarangBekasPage />} />
          <Route path="/artikel/buat" element={<BuatArtikelPage />} />
        </Route>

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Public + User */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="peta" element={<PetaPage />} />
          <Route path="kolaborator" element={<KolaboratorPage />} />
          <Route path="kolaborator/:id" element={<DetailKolaboratorPage />} />
          <Route path="tentang-kami" element={<AboutPage />} />
          <Route path="papan-peringkat" element={<LeaderboardPage />} />

          <Route path="aset" element={<AsetPage />} />
          <Route path="aset/:id" element={<DetailAsetPage />} />
          <Route path="barang-bekas" element={<BarangBekasPage />} />
          <Route path="barang-bekas/:id" element={<BarangBekasDetailPage />} />
          <Route path="laporan" element={<LaporanPage />} />
          <Route path="laporan/:id" element={<DetailLaporan />} />
          <Route path="artikel" element={<ArtikelPage />} />
          <Route path="artikel/:id" element={<ArticleDetailPage />} />
        </Route>

        {/* User (UserSidebar and UserHeader) diakses menggunakan slug user */}
        <Route element={<UserRoute />}>
          <Route path="/:user" element={<UserLayout />}>
            <Route index element={<UserDashboardPage />} />
            <Route path="kolaborator" element={<UserKolaboratorPage />} />
            <Route path="aset" element={<UserAsetPage />} />
            <Route path="barang-bekas" element={<UserBarangBekasPage />} />
            <Route path="laporan" element={<UserLaporanPage />} />
            <Route path="artikel" element={<UserArtikelPage />} />
            <Route path="profile" element={<UserProfilePage />} />
          </Route>
        </Route>

        {/* Admin (sidebar layout) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="analitik" element={<AdminAnalitikPage />} />
            <Route path="kolaborator" element={<AdminKolaboratorPage />} />
            <Route path="aset" element={<AdminAsetPage />} />
            <Route path="barang-bekas" element={<AdminBarangBekasPage />} />
            <Route path="laporan" element={<AdminLaporanPage />} />
            <Route path="artikel" element={<AdminArtikelPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="users" element={<AdminUsersManagementPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </PenangkapGalat>
  );
}

export default App;

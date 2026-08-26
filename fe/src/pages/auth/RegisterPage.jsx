import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { GoogleRegisterButton } from "../../components/features/auth/GoogleButton";
import AuthLogo from "../../components/features/auth/AuthLogo";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { LuMail, LuUser, LuKeyRound, LuCheck } from "react-icons/lu";

// Kelas yang sama persis dengan LoginPage. Ditulis sekali di sini supaya kedua
// halaman auth tidak pernah berbeda tipis tanpa sengaja.
const KELAS_INPUT =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pr-11 pl-11 text-slate-900 placeholder:text-slate-400 transition outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15";

const KELAS_LABEL =
  "mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase";

const KELAS_IKON =
  "pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400";

// Username TIDAK lagi diminta ke pengguna, tapi tetap wajib ada: backend
// mensyaratkannya, dan 28 tempat di frontend memakainya (URL profil
// /:username, huruf awal avatar, dan lainnya). Jadi dibuatkan dari emailnya.
//
// Aturan backend: 3-50 karakter, hanya huruf, angka, dan underscore.
function buatUsername(email, percobaan = 0) {
  const awalan = (email.split("@")[0] || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 40);

  // Minimal 3 karakter — email sependek "ab@..." akan ditolak backend.
  const dasar = awalan.length >= 3 ? awalan : `${awalan}_user`;

  // Percobaan pertama memakai nama bersih tanpa imbuhan. Angka acak baru
  // ditambahkan kalau ternyata sudah dipakai orang lain, supaya mayoritas
  // pengguna tetap mendapat username yang rapi.
  if (percobaan === 0) return dasar;
  return `${dasar}_${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (form.password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      setLoading(false);
      return;
    }

    // Dicoba dua kali: sekali dengan username bersih, sekali lagi dengan
    // imbuhan angka kalau ternyata sudah dipakai. Tanpa percobaan kedua,
    // pengguna dengan email seperti "budi@..." yang kebetulan bentrok akan
    // melihat pesan error tentang kolom yang bahkan tidak dia isi.
    let result;
    for (let percobaan = 0; percobaan < 2; percobaan++) {
      result = await register({
        ...form,
        username: buatUsername(form.email, percobaan),
      });
      if (result.success || result.message !== "Username sudah digunakan")
        break;
    }

    if (result.success) {
      setSuccess(
        "Registrasi berhasil! Silakan cek email kamu untuk verifikasi.",
      );
      setForm({ email: "", password: "", full_name: "" });
      setConfirmPassword("");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Halaman ini HANYA kolom formulir. Panel ilustrasi dipasang oleh AuthLayout.
  //
  // Kolom "Username" DIHILANGKAN dari formulir, bukan dari sistem. Backend
  // tetap mewajibkannya dan 28 tempat di frontend memakainya, jadi nilainya
  // dibuatkan otomatis dari email (lihat buatUsername di atas), dan pengguna
  // bisa menggantinya sendiri lewat halaman profil.
  //
  // Dipilih username — bukan konfirmasi password — karena dia satu-satunya
  // kolom di sini yang nilainya bisa ditebak dengan aman dari kolom lain.
  // Nama lengkap dan kecocokan sandi tidak bisa ditebak.
  //
  // Panel kiri menyusut ke 50% di halaman ini, dan ruang tambahan itu dipakai
  // untuk memasangkan Nama Lengkap dengan Username dalam satu baris. Dengan
  // kolom konfirmasi dihapus, formulirnya tinggal tiga baris dan muat satu
  // layar tanpa perlu digulung.
  return (
    <div className="flex w-full items-center justify-center bg-white px-5 py-10 sm:px-8">
      <div className="w-full max-w-xl">
        {/* Logo hanya muncul saat panel kiri tersembunyi. */}
        <div className="mb-8 lg:hidden">
          <AuthLogo />
        </div>

        <div className="text-center">
          <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.125rem)] leading-tight font-extrabold tracking-tight text-slate-900">
            Buat Akun Baru
          </h1>
          <p className="mt-2 text-slate-500">
            Daftarkan diri untuk mulai bergabung
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          {/* Hanya kedua kolom sandi yang berdampingan; nama dan email
              masing-masing selebar penuh. Alasannya bukan estetika: sandi
              adalah satu-satunya pasangan yang memang perlu DIBANDINGKAN, dan
              membandingkan dua hal jauh lebih mudah kalau keduanya sejajar.
              Nama dan email tidak dibandingkan dengan apa pun, jadi memecahnya
              jadi dua kolom hanya mempersempit ruang ketik tanpa manfaat —
              email khususnya, karena isinya paling panjang. */}
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="full_name" className={KELAS_LABEL}>
                Nama Lengkap
              </label>
              <div className="relative">
                <LuUser size={17} className={KELAS_IKON} />
                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Nama lengkapmu"
                  autoComplete="name"
                  className={KELAS_INPUT}
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className={KELAS_LABEL}>
                Email
              </label>
              <div className="relative">
                <LuMail size={17} className={KELAS_IKON} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className={KELAS_INPUT}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={KELAS_LABEL}>
                Password
              </label>
              <div className="relative">
                <LuKeyRound size={17} className={KELAS_IKON} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  className={KELAS_INPUT}
                  required
                />
                {/* Satu tombol lihat/sembunyi mengendalikan KEDUA kolom sandi.
                    Dua tombol terpisah memaksa pengguna menekan dua kali hanya
                    untuk membandingkan apa yang sudah dia ketik. */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"
                  }
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-slate-600"
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm_password" className={KELAS_LABEL}>
                Konfirmasi Password
              </label>
              <div className="relative">
                <LuCheck size={17} className={KELAS_IKON} />
                <input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  autoComplete="new-password"
                  className={KELAS_INPUT}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full cursor-pointer rounded-xl bg-(--primary) py-3.5 font-bold text-white transition hover:bg-(--primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Buat Akun"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-4">
          <hr className="flex-1 border-slate-200" />
          <span className="text-sm whitespace-nowrap text-slate-400">
            atau daftar dengan
          </span>
          <hr className="flex-1 border-slate-200" />
        </div>

        <GoogleRegisterButton
          disabled={loading}
          onSuccess={({ user }) => {
            const redirectTo = user?.role === "admin" ? "/admin" : "/";
            navigate(redirectTo);
          }}
          onError={(err) => setError(err.message)}
        />

        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-bold text-(--accent) hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { GoogleLoginButton } from "../../components/features/auth/GoogleButton";
import AuthLogo from "../../components/features/auth/AuthLogo";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { LuKeyRound, LuMail } from "react-icons/lu";

// Satu kelas dipakai bersama kedua kolom input. Ditulis sekali supaya keduanya
// tidak pernah berbeda tipis tanpa sengaja — perbedaan 1px pada tinggi atau
// tebal garis langsung terlihat saat dua kolom bertumpuk.
const KELAS_INPUT =
  "w-full rounded-xl border border-slate-200 bg-white py-3.5 pr-11 pl-11 text-slate-900 placeholder:text-slate-400 transition outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15";

const KELAS_LABEL =
  "mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(form.email, form.password);
    if (result.success) {
      const redirectTo = result.user?.role === "admin" ? "/admin" : "/";
      navigate(redirectTo);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Halaman ini HANYA kolom formulir. Panel ilustrasi di sebelah kiri dipasang
  // oleh AuthLayout, bukan di sini — supaya lebarnya bisa menggeser halus saat
  // berpindah ke halaman daftar.
  //
  // Blok kepala (judul + sub-judul) dirata-tengah, sementara label dan kolom
  // isian tetap rata kiri berbagi satu tepi. Pembagian ini disengaja:
  // memusatkan label dan kolom membuat mata harus mencari titik awal tiap baris
  // dan memperlambat pengisian, sedangkan judul yang dirata-tengah justru
  // membantu karena dia berdiri sendiri sebagai satu blok.
  return (
    <div className="flex w-full items-center justify-center bg-white px-5 py-10 sm:px-8">
      <div className="w-full max-w-md">
        {/* Logo hanya muncul saat panel kiri tersembunyi, supaya tidak tampil
              dua kali di layar lebar. */}
        <div className="mb-8 lg:hidden">
          <AuthLogo />
        </div>

        <div className="text-center">
          <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.125rem)] leading-tight font-extrabold tracking-tight text-slate-900">
            Selamat Datang
          </h1>
          <p className="mt-2 text-slate-500">Silakan masuk untuk melanjutkan</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8">
          <div>
            <label htmlFor="email" className={KELAS_LABEL}>
              Email
            </label>
            <div className="relative">
              <LuMail
                size={18}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
              />
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

          <div className="mt-5">
            <label htmlFor="password" className={KELAS_LABEL}>
              Kata Sandi
            </label>
            <div className="relative">
              <LuKeyRound
                size={18}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                className={KELAS_INPUT}
                required
              />
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

          <div className="mt-3 text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-(--accent) hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full cursor-pointer rounded-xl bg-(--primary) py-3.5 font-bold text-white transition hover:bg-(--primary-dark) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <hr className="flex-1 border-slate-200" />
          <span className="text-sm whitespace-nowrap text-slate-400">
            atau masuk dengan
          </span>
          <hr className="flex-1 border-slate-200" />
        </div>

        <GoogleLoginButton
          disabled={loading}
          onSuccess={({ user }) => {
            const redirectTo = user?.role === "admin" ? "/admin" : "/";
            navigate(redirectTo);
          }}
          onError={(err) => setError(err.message)}
        />

        <p className="mt-8 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-bold text-(--accent) hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

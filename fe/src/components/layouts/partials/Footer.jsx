import { useState } from "react";
import { Link } from "react-router";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { LuSend, LuCheck } from "react-icons/lu";
import { kirimSaran } from "../../../services/api/routes/saran.route";
import toaster from "../../../utils/toaster";

// Batasnya disamakan persis dengan SaranCreateSchema di backend. Kalau beda,
// pengguna baru tahu kepanjangan setelah request-nya ditolak server.
const MAX_NAMA = 100;
const MAX_EMAIL = 120;
const MAX_PESAN = 1000;
const MIN_PESAN = 10;

function Footer() {
  const fiturLinks = [
    { label: "Kolaborator", path: "/kolaborator" },
    { label: "Aset Sampah", path: "/aset" },
    { label: "Laporan Sampah", path: "/laporan" },
    { label: "Barang Daur Ulang", path: "/barang-bekas" },
  ];

  const jelajahiLinks = [
    { label: "Peta", path: "/peta" },
    { label: "Artikel", path: "/artikel" },
    { label: "Papan Peringkat", path: "/papan-peringkat" },
    { label: "Tentang Kami", path: "/tentang-kami" },
  ];

  const [form, setForm] = useState({ nama: "", email: "", pesan: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;

    // Divalidasi di sini juga, bukan hanya mengandalkan backend, supaya
    // pengguna dapat jawabannya seketika tanpa menunggu perjalanan ke server.
    if (form.pesan.trim().length < MIN_PESAN) {
      toaster.error(`Pesan minimal ${MIN_PESAN} karakter.`);
      return;
    }

    setSending(true);
    try {
      await kirimSaran(form);
      setSent(true);
      setForm({ nama: "", email: "", pesan: "" });
    } catch (err) {
      // Backend membatasi 3 kiriman per menit. Tanpa penanganan khusus, pesan
      // 429 muncul sebagai "terjadi kesalahan" yang membingungkan.
      const status = err?.response?.status;
      if (status === 429) {
        toaster.error("Terlalu banyak kiriman. Coba lagi sebentar lagi.");
      } else {
        const fieldError = err?.response?.data?.errors?.[0]?.message;
        toaster.error(fieldError || "Gagal mengirim masukan. Coba lagi.");
      }
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/40 focus:bg-white/15";

  return (
    // Full-bleed: tidak ada padding di sisi luar dan tidak ada sudut membulat,
    // supaya latarnya membentang selebar layar sejajar dengan background hero.
    // Yang dibatasi max-w-7xl adalah ISI-nya, bukan latarnya — kalau tidak,
    // barisnya melebar sampai ke tepi layar dan jadi susah dibaca.
    <footer className="relative z-10 w-full overflow-hidden bg-(--dark-soft) transition-colors duration-200">
      <div className="relative w-full">
        {/* Ilustrasi latar. TIDAK diberi lapisan peredam di atasnya: titik
            paling terang di gambar ini luminance-nya cuma 30 dari 255 (diukur,
            bukan dikira), jadi teks putih sudah aman jauh di atas ambang
            kontras — menambah peredam hanya akan menutupi ilustrasinya.
            bg-(--dark-soft) di kartu tetap dipertahankan sebagai warna dasar
            kalau gambarnya gagal dimuat.
            object-cover dipakai supaya rasio aslinya (2,46:1) tidak perlu persis
            sama dengan tinggi kartu yang berubah-ubah mengikuti isi. */}
        <img
          src="/images/Hero%20asset/bgFooter.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
        />

        {/* Dua kolom besar: identitas + navigasi di kiri, kotak saran di kanan.
            Kotak saran sengaja diberi porsi lebar sendiri (bukan diselipkan di
            bawah daftar tautan) supaya terbaca sebagai ajakan, bukan pelengkap. */}
        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 pt-14 pb-12 md:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Kolom kiri */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <img
                  src="/images/logo-fill.webp"
                  alt="logo"
                  className="h-12.5 w-12.5"
                />
                <p className="flex flex-col text-[1.25rem] leading-none font-bold text-white">
                  <span>TORANG</span>
                  <span>BERSIH</span>
                </p>
              </div>
              <p className="max-w-sm text-sm leading-6 text-(--gray-light)">
                Satu platform untuk menghubungkan warga, komunitas, dan
                pemerintah dalam menjaga lingkungan Sulawesi Utara dari ancaman
                sampah.
              </p>
              <div className="flex items-start gap-2 text-sm text-(--gray-light)">
                <HiOutlineLocationMarker className="mt-0.5 shrink-0 text-base" />
                <span>Sulawesi Utara, Indonesia</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-bold tracking-wide text-white uppercase">
                  Fitur
                </h4>
                <ul className="flex flex-col gap-3">
                  {fiturLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="text-sm text-(--gray-light) transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-bold tracking-wide text-white uppercase">
                  Jelajahi
                </h4>
                <ul className="flex flex-col gap-3">
                  {jelajahiLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="text-sm text-(--gray-light) transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Kolom kanan: kotak saran */}
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Punya masukan?
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-(--gray-light)">
              Ada fitur yang kurang, laporan yang belum tertangani, atau ide
              untuk membuat Torang Bersih lebih berguna? Tulis di sini — kami
              baca semuanya.
            </p>

            {sent ? (
              // Keadaan berhasil menggantikan formulir, bukan sekadar notifikasi
              // sekilas. Pengguna butuh kepastian yang menetap bahwa pesannya
              // benar-benar terkirim.
              <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-6">
                <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <LuCheck size={22} />
                </div>
                <p className="font-bold text-white">Masukanmu sudah terkirim</p>
                <p className="text-sm leading-6 text-(--gray-light)">
                  Terima kasih sudah ikut membenahi Torang Bersih.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-1 cursor-pointer text-sm font-bold text-white underline underline-offset-4 transition hover:text-(--accent)"
                >
                  Kirim masukan lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    required
                    maxLength={MAX_NAMA}
                    placeholder="Nama"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    maxLength={MAX_EMAIL}
                    placeholder="Email"
                    className={inputClass}
                  />
                </div>

                <textarea
                  name="pesan"
                  value={form.pesan}
                  onChange={handleChange}
                  required
                  rows={4}
                  maxLength={MAX_PESAN}
                  placeholder="Tulis masukanmu di sini..."
                  className={`${inputClass} resize-none`}
                />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-(--gray-muted)">
                    {form.pesan.length}/{MAX_PESAN}
                  </span>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-(--primary) shadow-lg transition hover:bg-(--gray-light) disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? "Mengirim..." : "Kirim Masukan"}
                    {!sending && <LuSend size={15} />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 border-t border-white/10">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-3 px-6 py-5 sm:flex-row md:px-10">
            <p className="text-xs text-(--gray-muted)">
              &copy; {new Date().getFullYear()} Lasalle Vibers. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

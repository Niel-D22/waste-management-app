import AuthIllustration from "./AuthIllustration";
import AuthLogo from "./AuthLogo";

// Teks per halaman disimpan di sini, bukan dikirim sebagai prop dari tiap
// halaman. Karena panelnya kini tinggal di layout dan bertahan melewati
// pergantian rute, dialah yang tahu sedang di halaman mana.
const TEKS = {
  login: {
    judul: "Bersama Jaga Bumi, Bersama Torang Bersih.",
    deskripsi:
      "Kelola sampah, petakan lokasi, dan bergerak untuk lingkungan yang lebih bersih.",
  },
  register: {
    judul: "Satu Akun, Satu Langkah untuk Sulawesi Utara.",
    deskripsi:
      "Daftar untuk mulai melaporkan, memantau, dan ikut menjaga lingkungan sekitarmu.",
  },
};

function AuthSidePanel({ isRegister = false }) {
  const teks = isRegister ? TEKS.register : TEKS.login;

  return (
    // Lebarnya menyusut 60% -> 50% di halaman daftar. Formulir daftar punya
    // lima kolom isian; ruang tambahan itulah yang memungkinkannya disusun dua
    // kolom sehingga tingginya cukup untuk satu layar.
    //
    // transition-[width] bekerja karena elemen ini TIDAK dibongkar saat rute
    // berganti — dia milik layout, bukan halaman.
    //
    // Disembunyikan di bawah lg: di layar sempit, memaksa panel ini tampil
    // berarti formulirnya terdorong jauh ke bawah lipatan.
    <div
      className={`panel-masuk relative hidden shrink-0 flex-col justify-between overflow-hidden bg-(--surface-sky) px-10 py-10 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:flex xl:px-14 ${
        isRegister ? "w-[50%]" : "w-[60%]"
      }`}
    >
      {/* Latar pemandangan. Memakai BG-Hero yang sama persis dengan halaman
          depan — bukan gambar baru yang "mirip", tapi berkas yang sama.
          Ditempel ke DASAR PANEL, dengan gradasi di kedua ujungnya supaya tidak
          ada tepi yang terbaca sebagai garis potong. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[76%]">
        <img
          src="/images/Hero%20asset/BG-Hero.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-full w-full object-cover object-bottom opacity-55 select-none"
        />
        <div className="absolute inset-x-0 top-0 h-2/5 bg-linear-to-b from-(--surface-sky) to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-(--surface-sky) via-(--surface-sky)/75 to-transparent" />
      </div>

      <div className="relative z-10">
        <AuthLogo />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center py-4">
        {/* max-w dibatasi supaya karakternya tidak ikut membesar tak terkendali
            saat panelnya melebar — dia harus tetap terbaca sebagai tokoh yang
            berdiri di dalam pemandangan, bukan menutupinya. */}
        <div className="w-full max-w-md">
          <AuthIllustration />
        </div>
      </div>

      <div className="relative z-10">
        <h2 className="font-display max-w-lg text-[clamp(1.4rem,2.2vw,2rem)] leading-tight font-extrabold tracking-tight text-(--primary)">
          {teks.judul}
        </h2>
        <p className="mt-3 max-w-lg text-[clamp(0.85rem,1.05vw,1rem)] leading-relaxed text-slate-600">
          {teks.deskripsi}
        </p>
      </div>
    </div>
  );
}

export default AuthSidePanel;

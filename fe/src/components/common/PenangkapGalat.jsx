import { Component } from "react";

/**
 * Menangkap galat yang terjadi saat halaman digambar.
 *
 * Kenapa perlu: React membongkar SELURUH pohon komponen begitu ada satu galat
 * yang tidak tertangkap. Hasilnya layar putih kosong — tanpa pesan, tanpa
 * navigasi, tanpa petunjuk apa pun. Itu persis yang terjadi pada halaman papan
 * peringkat: satu nama ikon yang sudah diganti pustakanya membuat seluruh situs
 * tampak mati.
 *
 * Dengan pembatas ini, galat yang sama hanya mematikan bagian yang bermasalah
 * dan pengunjung tetap melihat pesan serta jalan keluar.
 *
 * Harus berupa class component: sampai hari ini React hanya menyediakan
 * componentDidCatch dan getDerivedStateFromError untuk class, tidak ada
 * padanannya dalam bentuk hook.
 */
class PenangkapGalat extends Component {
  state = { galat: null };

  static getDerivedStateFromError(galat) {
    return { galat };
  }

  componentDidCatch(galat, info) {
    // Tetap dicatat ke konsol supaya pengembang bisa melihat jejak lengkapnya.
    // Pengunjung cukup melihat pesan ramah di bawah.
    console.error("Galat saat merender halaman:", galat, info?.componentStack);
  }

  render() {
    if (!this.state.galat) return this.props.children;

    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-(--surface-sky) px-6 py-20 text-center">
        <h1 className="font-display text-[clamp(1.4rem,4vw,2rem)] font-extrabold text-(--primary)">
          Halaman ini gagal ditampilkan
        </h1>
        <p className="max-w-md text-[0.95rem] leading-7 text-(--dark-text)/75">
          Ada yang salah saat memuat bagian ini. Bagian lain situs tetap bisa
          dibuka.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            // Memuat ulang penuh, bukan sekadar mengosongkan state: kalau
            // penyebabnya berkas yang gagal diunduh, hanya muat ulang yang
            // benar-benar mengambilnya lagi.
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded-xl bg-(--primary) px-7 py-3.5 font-bold text-white transition hover:bg-(--primary-dark) motion-reduce:transition-none"
          >
            Muat Ulang
          </button>
          <a
            href="/"
            className="rounded-xl border-2 border-(--primary)/20 px-7 py-3.5 font-bold text-(--primary) transition hover:border-(--primary)/45 motion-reduce:transition-none"
          >
            Kembali ke Beranda
          </a>
        </div>
      </main>
    );
  }
}

export default PenangkapGalat;

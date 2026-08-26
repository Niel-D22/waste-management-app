/**
 * Menutup layar pembuka yang digambar sebaris di index.html.
 *
 * Yang ditunggu adalah keadaan NYATA, bukan penghitung waktu yang dikira-kira:
 * aplikasi selesai terpasang, huruf webfont selesai diunduh, lalu satu frame
 * cat berikutnya. Menutup dengan timer tetap akan salah di kedua arah — terlalu
 * cepat di jaringan lambat sehingga pengunjung tetap melihat halaman setengah
 * jadi, dan terlalu lambat di jaringan cepat sehingga terasa sengaja diperlambat.
 */

// Jendela waktu tampil.
//
// MINIMUM ada supaya layarnya tidak sekadar berkedip. Di koneksi cepat aplikasi
// siap dalam ~200 ms; logo yang muncul lalu hilang secepat itu terbaca sebagai
// gangguan, bukan sebagai pembuka.
//
// MAKSIMUM adalah pagar pengaman. Apa pun yang tersendat — satu berkas huruf
// gagal, jaringan menggantung — pengunjung tetap masuk ke halamannya. Lebih
// baik halaman yang belum sempurna daripada layar putih tanpa ujung.
const MINIMAL_TAMPIL = 650;
const MAKSIMAL_TAMPIL = 4500;

// Harus sama dengan durasi transition pada #pembuka di index.html. Kalau lebih
// pendek, elemennya dicabut selagi masih memudar dan hasilnya terpotong.
const DURASI_PUDAR = 450;

export function tutupLayarPembuka() {
  const el = document.getElementById("pembuka");
  if (!el) return;

  const mulai = performance.now();
  let sudah = false;

  const tutup = () => {
    if (sudah) return;
    sudah = true;

    el.classList.add("selesai");

    // Dicabut dari DOM setelah memudar, bukan sekadar disembunyikan: elemen
    // position:fixed seukuran layar yang tertinggal tetap ikut diperhitungkan
    // peramban di setiap gulir dan setiap perubahan ukuran.
    window.setTimeout(() => el.remove(), DURASI_PUDAR + 60);
  };

  const tutupSetelahMinimum = () => {
    const sisa = Math.max(0, MINIMAL_TAMPIL - (performance.now() - mulai));
    window.setTimeout(tutup, sisa);
  };

  // document.fonts.ready menyala setelah semua webfont yang dipakai halaman
  // selesai diunduh. Tanpa menunggunya, halaman muncul memakai huruf cadangan
  // lalu seluruh teks bergeser saat Plus Jakarta Sans tiba — persis sentakan
  // yang ingin dihindari oleh layar pembuka.
  const siapHuruf = document.fonts?.ready ?? Promise.resolve();

  siapHuruf
    .then(() => {
      // Dua frame: yang pertama menandai React selesai menulis DOM, yang kedua
      // menandai peramban benar-benar sudah mengecatnya. Menutup di frame
      // pertama kadang memperlihatkan satu kedipan halaman kosong.
      requestAnimationFrame(() => requestAnimationFrame(tutupSetelahMinimum));
    })
    .catch(tutupSetelahMinimum);

  // Pagar pengaman lapis kedua, di sisi JavaScript. Lapis pertama ada di CSS
  // index.html (menyerah pada detik ke-8) dan tetap bekerja bahkan kalau berkas
  // JavaScript-nya sama sekali gagal dimuat.
  window.setTimeout(tutup, MAKSIMAL_TAMPIL);
}

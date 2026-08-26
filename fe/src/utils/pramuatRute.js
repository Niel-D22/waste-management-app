/**
 * Mengunduh lebih awal berkas JavaScript milik halaman yang kemungkinan besar
 * akan dibuka berikutnya.
 *
 * Kenapa perlu: sejak halaman dipecah per rute, menekan "Bergabung" berarti
 * peramban harus mengunduh dua berkas dulu — kerangka halaman masuk dan isi
 * formulirnya. Selama unduhan itu berlangsung, halaman lama diam di tempat dan
 * tidak ada tanda apa pun bahwa sesuatu sedang terjadi; halaman barunya lalu
 * muncul sekaligus. Yang terbaca bukan "transisi", melainkan "macet sebentar,
 * lalu tiba-tiba pindah".
 *
 * Dengan memulai unduhannya saat kursor baru MENYENTUH tautan — atau saat
 * tautan menerima fokus papan ketik — berkasnya biasanya sudah siap sebelum
 * jarinya sempat menekan. Perpindahannya jadi seketika, dan animasi masuk yang
 * sudah ada baru benar-benar terlihat.
 *
 * import() menyimpan hasilnya sendiri, jadi memanggil ini berkali-kali aman:
 * unduhan hanya terjadi sekali.
 */

// Ditulis sebagai fungsi, bukan dipanggil langsung di tingkat modul — kalau
// dipanggil langsung, berkasnya justru ikut terunduh di muat pertama dan
// menghilangkan seluruh gunanya pemecahan berkas.
export const pramuat = {
  login: () => {
    import("../pages/auth/LoginPage");
    import("../components/layouts/AuthLayout");
  },
  daftar: () => {
    import("../pages/auth/RegisterPage");
    import("../components/layouts/AuthLayout");
  },
  peta: () => import("../pages/public/PetaPage"),
  artikel: () => import("../pages/public/ArtikelPage"),
};

/**
 * Properti siap-tempel untuk sebuah <Link>.
 *
 *   <Link to="/login" {...saatMendekat(pramuat.login)}>
 *
 * onPointerEnter, bukan onMouseEnter: yang pertama ikut menyala untuk pena
 * digital dan sebagian interaksi sentuh. onFocus melengkapi untuk pengguna
 * papan ketik, yang tidak pernah mengarahkan kursor ke mana pun.
 */
export function saatMendekat(fn) {
  return { onPointerEnter: fn, onFocus: fn };
}

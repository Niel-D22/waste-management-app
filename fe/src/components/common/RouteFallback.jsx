/**
 * Tampilan sementara selagi berkas JavaScript sebuah halaman diunduh.
 *
 * Muncul hanya saat halaman itu dibuka PERTAMA kali; setelah berkasnya ada di
 * cache peramban, perpindahan berikutnya seketika. Sengaja dibuat ringan dan
 * tanpa gambar supaya tidak menambah antrean unduhan di jaringan lambat.
 */
function RouteFallback() {
  return (
    <div
      // role + aria-live membuat pembaca layar mengumumkan "Memuat halaman"
      // saat isinya berganti. Tanpa ini, pengguna tunanetra hanya mendengar
      // senyap dan tidak tahu apakah tautannya berhasil ditekan.
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 bg-(--surface-sky)"
    >
      <div
        aria-hidden="true"
        className="size-10 animate-spin rounded-full border-3 border-(--primary)/20 border-t-(--primary) motion-reduce:animate-none"
      />
      <p className="text-sm font-semibold text-(--primary)">Memuat halaman…</p>
    </div>
  );
}

export default RouteFallback;

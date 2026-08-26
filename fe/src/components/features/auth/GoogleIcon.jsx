// Empat warna resmi Google, bukan putih polos.
//
// Sebelumnya keempat path diberi fill="#ffffff" karena ikon ini dipakai di
// atas tombol navy. Setelah tombolnya jadi putih, ikon putih di atas putih
// membuatnya hilang sama sekali — tombolnya terlihat kosong.
//
// Warnanya juga tidak boleh diganti mengikuti palet kita: logo Google punya
// ketentuan merek sendiri, dan tombol "Masuk dengan Google" yang logonya
// diwarnai ulang justru mengurangi kepercayaan pengguna karena tidak lagi
// terlihat seperti logo yang mereka kenali.
export default function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
      {/* merah — lengkung atas */}
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.4 13.1 17.7 9.5 24 9.5z"
      />
      {/* biru — sisi kanan */}
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.7 37.4 46.5 31.4 46.5 24.5z"
      />
      {/* kuning — sisi kiri */}
      <path
        fill="#FBBC05"
        d="M10.6 28.6A14.7 14.7 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.1-6z"
      />
      {/* hijau — lengkung bawah */}
      <path
        fill="#34A853"
        d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.7 2.2-7.7 2.2-6.3 0-11.6-3.6-13.4-9.3l-7.9 6.1C6.6 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

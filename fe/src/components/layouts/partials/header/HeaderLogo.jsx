import { Link } from "react-router";

function HeaderLogo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-1.5">
      {/* Dua berkas logo, bukan satu.
          Di bawah lg navbar berupa pil navy, jadi yang dipakai versi berisi
          putih — logo navy di atas navy praktis tidak terlihat.
          Mulai lg navbar kembali berlatar putih dan logo berwarna yang dipakai.
          Keduanya ditumpuk lalu disembunyikan bergantian, bukan diganti lewat
          JavaScript, supaya tidak ada kedipan saat ukuran layar berubah. */}
      <picture>
        <img
          src="/images/logo-fill.webp"
          alt=""
          aria-hidden="true"
          className="h-10 w-10 lg:hidden"
        />
      </picture>
      <picture>
        <img
          src="/images/logo.webp"
          alt="logo"
          className="hidden h-12 w-12 lg:block"
        />
      </picture>

      <p className="flex flex-col gap-0 text-[0.9rem] leading-none font-bold text-white lg:text-[1rem] lg:text-black">
        <span>TORANG</span>
        <span>BERSIH</span>
      </p>
    </Link>
  );
}

export default HeaderLogo;

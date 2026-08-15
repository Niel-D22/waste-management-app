import { Link } from "react-router";

function HeaderLogo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-1.5">
      {/* 48px, bukan 55px: di navbar mengambang, kartu logo berdiri sebaris
          dengan pil nav (~48px) dan tombol Bergabung (~46px). Di 55px kartunya
          jadi ~67px dan terlihat jomplang di sebelah keduanya. */}
      <picture>
        <img src="/images/logo.webp" alt="logo" className="h-12 w-12" />
      </picture>
      <p className="flex flex-col gap-0 text-[1rem] leading-none font-bold text-black">
        <span>TORANG</span>
        <span>BERSIH</span>
      </p>
    </Link>
  );
}

export default HeaderLogo;

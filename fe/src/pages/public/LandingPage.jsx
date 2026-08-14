import Artikel from "../../components/features/public/landing/artikel/Artikel";
import Fitur from "../../components/features/public/landing/fitur/Fitur";
import Hero from "../../components/features/public/landing/Hero";
import IconRevealSection from "../../components/features/public/landing/IconRevealSection";
import Peta from "../../components/features/public/landing/Peta";
import Tujuan from "../../components/features/public/landing/tujuan/Tujuan";

function LandingPage() {
  return (
    // overflow-x-clip (bukan overflow-hidden) supaya position:sticky di
    // IconRevealSection tetap berfungsi
    <div className="relative w-full overflow-x-clip bg-white">
      <Hero />
      <IconRevealSection />
      <Fitur />
      <Tujuan />
      <Peta />
      <Artikel />
    </div>
  );
}

export default LandingPage;

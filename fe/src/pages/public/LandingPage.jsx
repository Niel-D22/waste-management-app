import FiturSlider from "../../components/features/public/landing/FiturSlider";
import AjakanPenutup from "../../components/features/public/landing/AjakanPenutup";
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
      <FiturSlider />
      <Tujuan />
      <Peta />
      <AjakanPenutup />
    </div>
  );
}

export default LandingPage;

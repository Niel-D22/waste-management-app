import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { LuMinus, LuPlus } from "react-icons/lu";
import "leaflet/dist/leaflet.css";
import { getCustomIcon } from "../peta/MapIcons";
import { petaAPI } from "../../../../services/api/routes/peta.route";

// Dipisah jadi file sendiri supaya bisa dimuat lewat React.lazy dari
// ShowcasePeta. Tanpa pemisahan ini, Leaflet dan leaflet.css ikut masuk ke
// bundel awal beranda — padahal petanya baru dibutuhkan setelah pengunjung
// menggulung jauh ke bawah, dan sebagian besar tidak pernah sampai situ.
const PUSAT_SULUT = [1.35, 124.9];

// Tombol zoom sendiri, bukan ZoomControl bawaan Leaflet. Dua alasannya:
// bawaannya berukuran tetap ~30px yang terlalu besar untuk layar laptop
// ilustrasi ini, dan gayanya kotak abu-abu yang asing dari sisa halaman.
function TombolZoom() {
  const map = useMap();

  // stopPropagation di mousedown WAJIB, bukan cuma di click. Tanpa itu,
  // menekan tombol ikut memulai gerakan geser peta, jadi setiap klik zoom
  // menggeser petanya sedikit.
  const tahan = (e) => e.stopPropagation();

  const kelas =
    "flex size-5 cursor-pointer items-center justify-center text-slate-700 transition hover:bg-slate-100 active:scale-90";

  return (
    <div
      className="absolute right-1.5 bottom-1.5 z-[1000] flex flex-col overflow-hidden rounded-md bg-white/95 shadow-md ring-1 ring-black/10 backdrop-blur"
      onMouseDown={tahan}
      onDoubleClick={tahan}
    >
      <button
        type="button"
        aria-label="Perbesar peta"
        className={`${kelas} border-b border-slate-200`}
        onClick={(e) => {
          tahan(e);
          map.zoomIn();
        }}
      >
        <LuPlus size={11} strokeWidth={3} />
      </button>
      <button
        type="button"
        aria-label="Perkecil peta"
        className={kelas}
        onClick={(e) => {
          tahan(e);
          map.zoomOut();
        }}
      >
        <LuMinus size={11} strokeWidth={3} />
      </button>
    </div>
  );
}

function ShowcasePetaMap() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    petaAPI
      .getMarkers()
      .then((res) => setMarkers(res.data.data || []))
      // Sengaja diabaikan diam-diam: ini elemen pajangan, bukan alat kerja.
      // Kalau markernya gagal dimuat, peta kosong masih terlihat wajar —
      // memunculkan pesan error di dalam layar laptop justru merusak kesan.
      .catch(() => {});
  }, []);

  return (
    <MapContainer
      center={PUSAT_SULUT}
      zoom={9}
      zoomControl={false}
      // scrollWheelZoom WAJIB mati. Peta ini menempati bagian tengah layar saat
      // dilewati; kalau roda scroll dibiarkan aktif, pengunjung yang menggulung
      // halaman akan tanpa sengaja memperbesar peta dan halamannya berhenti
      // bergerak — terasa seperti macet.
      scrollWheelZoom={false}
      // Menggeser dengan tangan tetap aktif — itu justru inti dari memasang
      // peta sungguhan di sini, bukan tangkapan layar.
      dragging={true}
      doubleClickZoom={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        maxZoom={20}
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      />
      <TombolZoom />

      {markers.map((loc) => (
        <Marker
          key={`${loc.type}-${loc.id}`}
          position={[loc.lat, loc.lng]}
          icon={getCustomIcon(loc.type)}
        />
      ))}
    </MapContainer>
  );
}

export default ShowcasePetaMap;

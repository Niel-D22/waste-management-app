import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SidebarPeta from "../../components/features/public/peta/SidebarPeta";
import MapView from "../../components/features/public/peta/MapView";
import { petaAPI } from "../../services/api/routes/peta.route";
import toaster from "../../utils/toaster";

const PetaPage = () => {
  const location = useLocation();

  const [filters, setFilters] = useState([
    "Kolaborator",
    "Aset",
    "Laporan Sampah",
    "Barang Daur Ulang",
  ]);

  const [subFilters, setSubFilters] = useState({
    Kolaborator: null,
    Aset: null,
    "Laporan Sampah": null,
    "Barang Daur Ulang": null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk toggle filter/sidebar di mobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Panel desktop bisa disembunyikan. Default-nya terbuka supaya pengunjung
  // baru langsung tahu ada filter & daftar lokasi — kalau default tertutup,
  // fiturnya jadi tersembunyi dan peta terasa kosong saat pertama dibuka.
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Fetch data dari API
  useEffect(() => {
    const fetchMarkers = async () => {
      setLoading(true);
      try {
        const res = await petaAPI.getMarkers();
        setAllLocations(res.data.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkers();
  }, []);

  useEffect(() => {
    if (location.state?.targetLocation) {
      setSelectedLocation(location.state.targetLocation);
      const targetType = location.state.targetLocation.type;
      if (targetType && !filters.includes(targetType)) {
        setFilters((prev) => [...prev, targetType]);
        setSubFilters((prev) => ({
          ...prev,
          [targetType]: [],
        }));
      }
    }
  }, [location.state, filters]);

  // Handle Get GPS Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toaster.error("Browser Anda tidak mendukung geolokasi.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = { lat: latitude, lng: longitude, isUser: true };
        setUserLocation(newLoc);
        setSelectedLocation(newLoc); // Fly to user location
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = "Gagal mendapatkan lokasi.";
        if (error.code === 1) errorMsg = "Izin akses lokasi ditolak.";
        else if (error.code === 2) errorMsg = "Posisi lokasi tidak tersedia.";
        else if (error.code === 3) errorMsg = "Waktu pencarian lokasi habis.";
        toaster.error(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const filteredLocations = allLocations.filter((loc) => {
    const matchCategory = filters.includes(loc.type);

    let matchSubCategory = true;
    if (matchCategory) {
      const activeSubs = subFilters[loc.type];

      if (activeSubs && activeSubs.length > 0) {
        if (loc.type === "Kolaborator") {
          matchSubCategory = activeSubs.includes(loc.detail?.jenis_kolaborator);
        } else if (loc.type === "Aset") {
          matchSubCategory = activeSubs.includes(loc.detail?.kategori_aset);
        } else if (loc.type === "Laporan Sampah") {
          matchSubCategory =
            activeSubs.includes(loc.detail?.status_laporan) ||
            activeSubs.includes(loc.detail?.jenis_sampah);
        } else if (loc.type === "Barang Daur Ulang") {
          matchSubCategory =
            activeSubs.includes(loc.detail?.kategori_barang) ||
            activeSubs.includes(loc.detail?.kondisi);
        }
      } else if (activeSubs && activeSubs.length === 0) {
        matchSubCategory = false;
      }
    }
    const matchSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.detail?.kabupaten_kota || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchCategory && matchSubCategory && matchSearch;
  });

  const handleCardClick = (locationData) => {
    setSelectedLocation(locationData);
  };

  return (
    // pt-20 dihapus: navbar di halaman ini sekarang mengambang, jadi peta
    // sengaja dibiarkan penuh sampai ke balik navbar seperti di mockup.
    // Jarak aman terhadap navbar diatur oleh sidebar (md:top-24), bukan oleh
    // padding di sini.
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-white selection:bg-(--gray-shine) selection:text-(--primary)">
      <div className="relative flex flex-1 overflow-hidden">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-full border border-(--primary)/20 bg-white/90 px-5 py-2.5 shadow-xl backdrop-blur-md">
              <div className="size-4 animate-spin rounded-full border-2 border-(--primary) border-t-transparent"></div>
              <p className="text-sm font-bold text-(--primary)">
                Memuat Titik Peta...
              </p>
            </div>
          </div>
        )}

        {/* Komponen Kiri: Sidebar Filter & List */}
        <SidebarPeta
          filters={filters}
          setFilters={setFilters}
          subFilters={subFilters}
          setSubFilters={setSubFilters}
          allLocations={allLocations}
          locations={filteredLocations}
          onCardClick={(loc) => {
            handleCardClick(loc);
            setIsMobileSidebarOpen(false);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userLocation={userLocation}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isPanelOpen={isPanelOpen}
          onTogglePanel={() => setIsPanelOpen((v) => !v)}
        />

        {/* Tombol pemanggil panel (desktop). Muncul hanya saat panel tersembunyi.
            Ditaruh di tengah bawah — sejajar dengan tombol versi mobile — bukan
            di kiri atas, supaya tidak berebut sudut dengan logo navbar.
            Sengaja membawa jumlah lokasi, supaya dalam keadaan tertutup pun
            pengguna tetap tahu ada berapa titik yang lolos filter. */}
        {!isPanelOpen && (
          <button
            onClick={() => setIsPanelOpen(true)}
            className="absolute bottom-6 left-1/2 z-400 hidden -translate-x-1/2 items-center gap-2.5 rounded-full border border-gray-100 bg-white/90 py-3 pr-5 pl-4 text-sm font-bold text-gray-800 shadow-[0_8px_28px_rgb(0,0,0,0.12)] backdrop-blur-xl transition hover:bg-white md:flex"
          >
            <svg
              className="size-4 text-(--primary)"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter &amp; Daftar
            <span className="rounded-full bg-(--primary)/10 px-2 py-0.5 text-xs font-extrabold text-(--primary)">
              {filteredLocations.length}
            </span>
          </button>
        )}

        {/* Komponen Kanan: Peta Interaktif */}
        <MapView
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          userLocation={userLocation}
          onGetLocation={handleGetLocation}
          isLocating={isLocating}
        />

        {/* Floating Button Filter Mobile (Hanya muncul di HP) */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="absolute bottom-6 left-1/2 z-400 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-gray-900/30 active:scale-95 md:hidden"
        >
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filter & Daftar
        </button>
      </div>
    </div>
  );
};

export default PetaPage;

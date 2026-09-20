import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { LuCalendar, LuMapPin, LuChevronRight } from "react-icons/lu";

import FormTindakLanjut from "../../components/features/public/Laporan/FormTindakLanjut";
import DetailLaporanGallery from "../../components/features/public/Laporan/detail/DetailLaporanGallery";
import DetailLaporanInfo from "../../components/features/public/Laporan/detail/DetailLaporanInfo";
import DetailLaporanMap from "../../components/features/public/Laporan/detail/DetailLaporanMap";
import DetailLaporanTimeline from "../../components/features/public/Laporan/detail/DetailLaporanTimeline";
import DetailLaporanAction from "../../components/features/public/Laporan/detail/DetailLaporanAction";
import { statusLaporan } from "../../components/features/public/Laporan/detail/statusLaporan";

import { useAuth } from "../../contexts/AuthContext";
import { laporanAPI } from "../../services/api/routes/laporan.route";
import toaster from "../../utils/toaster";

const defaultImage =
  "https://images.unsplash.com/photo-1618477461853-cf6ed80fbfc5?auto=format&fit=crop&w=1200&q=80";

const DetailLaporan = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Sebelumnya berkas ini memakai `const isAuthenticated = true` bertanda
  // "MOCK AUTH STATE". Akibatnya tombol "Tindak Lanjuti Laporan" tampil untuk
  // SEMUA pengunjung, termasuk yang belum masuk — dan baru gagal setelah
  // ditekan. Sekarang dibaca dari konteks yang sama dengan seluruh aplikasi.
  const { isAuthenticated } = useAuth();

  const [laporan, setLaporan] = useState(null);
  const [tindakLanjutList, setTindakLanjutList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menyelesaikan, setMenyelesaikan] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [laporanRes, tindakLanjutRes] = await Promise.all([
        laporanAPI.getById(id),
        laporanAPI.getTindakLanjut(id).catch(() => ({ data: { data: [] } })),
      ]);
      setLaporan(laporanRes.data.data);
      setTindakLanjutList(tindakLanjutRes.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat detail laporan. Laporan mungkin tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGoToMap = () => {
    if (!laporan) return;
    navigate("/peta", {
      state: {
        targetLocation: {
          lat: laporan.latitude,
          lng: laporan.longitude,
          name: `Laporan: ${laporan.id}`,
          type: "Laporan Sampah",
          status: laporan.status_laporan,
        },
      },
    });
  };

  const handleActionClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/laporan/${laporan.id}`);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSelesaikanLaporan = async () => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menyelesaikan pelacakan laporan ini?",
      )
    )
      return;

    setMenyelesaikan(true);
    try {
      await laporanAPI.updateStatus(laporan.id, { status_laporan: "selesai" });
      toaster.success("Status laporan berhasil diperbarui menjadi Selesai.");
      fetchData();
    } catch (err) {
      console.error(err);
      toaster.error("Gagal memperbarui status laporan.");
    } finally {
      setMenyelesaikan(false);
    }
  };

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-dvh items-center justify-center bg-(--surface-sky)"
      >
        <div className="size-10 animate-spin rounded-full border-4 border-(--primary)/20 border-t-(--primary) motion-reduce:animate-none" />
        <span className="sr-only">Memuat detail laporan…</span>
      </div>
    );
  }

  if (error || !laporan) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6 pt-32 pb-24">
        <div className="mx-auto max-w-lg rounded-xl bg-red-50 p-8 text-center text-red-700 ring-1 ring-red-100">
          <p className="text-lg font-bold">
            {error || "Data tidak ditemukan."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 cursor-pointer text-sm font-bold underline underline-offset-4 hover:text-red-900"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const status = statusLaporan(laporan.status_laporan);

  const formatTanggal = (isoString) => {
    if (!isoString) return "-";
    return (
      new Date(isoString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WITA"
    );
  };

  const pelaporName = laporan.pelapor
    ? laporan.pelapor.full_name || laporan.pelapor.username
    : "Anonim";
  const namaJenisSampah = laporan.jenis_sampah?.nama ?? "Tidak diketahui";
  const fotoBuktiUrls = laporan.foto_bukti_urls?.length
    ? laporan.foto_bukti_urls
    : [defaultImage];

  // Optional chaining pada split(): versi sebelumnya memanggil
  // laporan.alamat_lokasi.split(",") langsung, sehingga satu laporan tanpa
  // alamat cukup untuk membuat seluruh halaman gagal dirender.
  const lokasiSingkat =
    laporan.alamat_lokasi?.split(",")[0]?.trim() || "Lokasi tidak dicatat";

  return (
    <div className="min-h-dvh bg-white">
      {/* ═══════════ BAND KEPALA ═══════════
          Latarnya potongan LANGIT dari BG-Hero halaman depan, bukan warna rata.
          Berkasnya sudah dipotong di sumber (40% teratas BG-Hero) supaya bagian
          gambar yang gelap — pepohonan, bangunan, perahu — tidak pernah bisa
          muncul di belakang teks di lebar layar mana pun. Titik tergelap yang
          tersisa #BADAFB, dan judul navy di atasnya mencapai 9,53:1.

          Gambarnya ditambatkan ke DASAR band, dan ruang di atasnya diisi
          #BCDDFC — warna baris piksel teratas berkas itu (rentang 12/765, jadi
          praktis seragam). Di layar sempit gambarnya lebih pendek dari band,
          dan sisa ruangnya menyatu tanpa terlihat sebagai pita. */}
      <header className="relative isolate overflow-hidden bg-[#BCDDFC] pt-28 pb-10 lg:pt-32 lg:pb-12">
        <img
          src="/images/Detail/band-langit.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          width="1536"
          height="410"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-auto w-full select-none"
        />

        <div className="mx-auto max-w-[1160px] px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Remah roti"
            className="flex items-center gap-1.5 text-sm font-semibold text-(--primary)/70"
          >
            <Link to="/laporan" className="transition hover:text-(--primary)">
              Laporan
            </Link>
            <LuChevronRight aria-hidden="true" className="size-4" />
            <span className="text-(--primary)">Detail</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* Chip status: blok warna pekat berteks putih, bukan tempelan
                pucat berteks tipis. Status adalah informasi terpenting di
                halaman ini — apakah laporan sudah ditangani atau belum — jadi
                ia sengaja jadi elemen paling nyaring di band ini. */}
            <span
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold tracking-wide text-white uppercase"
              style={{ backgroundColor: status.warna }}
            >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full bg-white ${status.denyut ? "animate-pulse motion-reduce:animate-none" : ""}`}
              />
              {status.label}
            </span>

            <span className="inline-flex items-center gap-2 text-sm font-medium text-(--primary)/80">
              <LuCalendar aria-hidden="true" className="size-4 shrink-0" />
              {formatTanggal(laporan.created_at)}
            </span>

            <span className="inline-flex items-center gap-2 text-sm font-medium text-(--primary)/80">
              <LuMapPin aria-hidden="true" className="size-4 shrink-0" />
              {lokasiSingkat}
            </span>
          </div>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_auto] lg:gap-12">
            <h1 className="font-display max-w-[20ch] text-[clamp(1.7rem,4vw,2.75rem)] leading-[1.12] font-extrabold tracking-tight text-balance text-(--primary)">
              Timbulan Sampah di {lokasiSingkat}
            </h1>

            {/* Kartu koordinat, BUKAN peta kedua. Memasang Leaflet dua kali di
                satu halaman berarti mengunduh dan menjalankan seluruh pustaka
                peta dua kali untuk satu titik yang sama — sementara peta
                sungguhannya sudah ada selebar halaman di bawah. */}
            <div className="w-full rounded-xl bg-white/90 p-5 ring-1 ring-(--primary)/10 backdrop-blur-sm lg:w-72">
              <p className="font-display text-sm font-extrabold text-(--primary)">
                Lokasi
              </p>
              <dl className="mt-3 flex flex-col gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <LuMapPin
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-(--cyan)"
                  />
                  <div>
                    <dt className="sr-only">Koordinat</dt>
                    <dd className="font-medium text-(--dark-text)/80 tabular-nums">
                      {laporan.latitude && laporan.longitude
                        ? `${Number(laporan.latitude).toFixed(4)}° N, ${Number(laporan.longitude).toFixed(4)}° E`
                        : "Koordinat tidak tersedia"}
                    </dd>
                  </div>
                </div>
                <div className="border-t border-(--primary)/10 pt-3">
                  <dt className="sr-only">Alamat</dt>
                  <dd className="leading-6 font-medium text-(--dark-text)/80">
                    {laporan.alamat_lokasi || "Alamat tidak dicatat"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ ISI ═══════════ */}
      <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <DetailLaporanGallery
              fotoBuktiUrls={fotoBuktiUrls}
              laporanStatus={laporan.status_laporan}
            />
            <DetailLaporanInfo
              laporan={laporan}
              pelaporName={pelaporName}
              pelapor={laporan.pelapor}
              namaJenisSampah={namaJenisSampah}
            />
          </div>

          <aside className="lg:col-span-5">
            {/* Ring tipis, bukan bayangan tebal. Kedalaman di seluruh situs ini
                datang dari blok warna dan garis rambut, bukan dari bayangan. */}
            <div className="sticky top-28 rounded-xl bg-white p-6 ring-1 ring-(--primary)/10 sm:p-7">
              <h2 className="font-display mb-6 text-lg font-extrabold text-(--primary)">
                Pelacakan Laporan
              </h2>

              <DetailLaporanTimeline
                tindakLanjutList={tindakLanjutList}
                laporanStatus={laporan.status_laporan}
              />

              <DetailLaporanAction
                laporan={laporan}
                pelapor={laporan.pelapor}
                isAuthenticated={isAuthenticated}
                menyelesaikan={menyelesaikan}
                onActionClick={handleActionClick}
                onSelesaikanLaporan={handleSelesaikanLaporan}
                onGoToMap={handleGoToMap}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* ═══════════ PETA ═══════════
          Selebar halaman, bukan terselip di kolom samping. Ini bukti lokasi —
          bagian yang membuat laporan bisa ditindaklanjuti orang lain — jadi
          ukurannya harus sepadan dengan perannya. */}
      <div className="mx-auto max-w-[1160px] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <DetailLaporanMap laporan={laporan} />
      </div>

      <FormTindakLanjut
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchData();
        }}
        laporanId={laporan?.id}
      />
    </div>
  );
};

export default DetailLaporan;

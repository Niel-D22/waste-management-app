import { LuMapPin, LuCheck, LuArrowRight } from "react-icons/lu";
import { useAuth } from "../../../../../contexts/AuthContext";

/**
 * Tombol aksi di dasar panel pelacakan.
 *
 * Radiusnya 12px dan warnanya memakai token proyek, bukan bg-gray-900 dan
 * ring-gray-200 seperti sebelumnya — hitam netral di tengah palet bernuansa
 * langit terbaca sebagai elemen dari situs lain.
 */
function DetailLaporanAction({
  laporan,
  pelapor,
  isAuthenticated,
  menyelesaikan,
  onActionClick,
  onSelesaikanLaporan,
  onGoToMap,
}) {
  const { user } = useAuth();
  const status = laporan.status_laporan?.toLowerCase();

  const bolehTindakLanjut = status === "diterima" || status === "ditindak";
  const bolehSelesaikan = status === "ditindak" && user?.id === pelapor?.id;
  const adaKoordinat = Boolean(laporan.latitude && laporan.longitude);

  return (
    <div className="mt-7 flex flex-col gap-3 border-t border-(--primary)/10 pt-6">
      {bolehTindakLanjut && (
        <button
          onClick={onActionClick}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3.5 text-sm font-bold text-white transition hover:bg-(--primary-dark) motion-reduce:transition-none"
        >
          {/* Label berbeda untuk pengunjung yang belum masuk. Sebelumnya
              tombolnya tetap berbunyi "Tindak Lanjuti Laporan" lalu diam-diam
              melempar ke halaman masuk — janji yang tidak ditepati tombolnya
              sendiri. */}
          {isAuthenticated ? "Tindak Lanjuti Laporan" : "Masuk untuk Menindaklanjuti"}
          <LuArrowRight aria-hidden="true" className="size-[1.05em]" />
        </button>
      )}

      {bolehSelesaikan && (
        <button
          onClick={onSelesaikanLaporan}
          disabled={menyelesaikan}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#15803D] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#116632] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
        >
          {menyelesaikan ? (
            "Memproses…"
          ) : (
            <>
              <LuCheck aria-hidden="true" className="size-[1.05em]" />
              Selesaikan Laporan
            </>
          )}
        </button>
      )}

      <button
        onClick={onGoToMap}
        disabled={!adaKoordinat}
        // title menjelaskan kenapa tombolnya mati. Tombol nonaktif tanpa
        // keterangan apa pun adalah salah satu hal paling membingungkan di
        // antarmuka — orang mengira aplikasinya rusak.
        title={adaKoordinat ? undefined : "Laporan ini tidak mencatat koordinat"}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-(--primary)/20 px-4 py-3.5 text-sm font-bold text-(--primary) transition hover:border-(--primary)/45 hover:bg-(--surface-sky) disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
      >
        <LuMapPin aria-hidden="true" className="size-[1.05em]" />
        Lihat Lokasi di Peta
      </button>
    </div>
  );
}

export default DetailLaporanAction;

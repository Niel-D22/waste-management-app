import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { LuMapPin, LuArrowRight } from "react-icons/lu";
import { laporanAPI } from "../../../../services/api/routes/laporan.route";

const STATUS_META = {
  menunggu: { label: "Menunggu Verifikasi", bg: "bg-amber-50", text: "text-amber-700" },
  diterima: { label: "Diterima", bg: "bg-blue-50", text: "text-blue-700" },
  ditindak: { label: "Ditindak", bg: "bg-indigo-50", text: "text-indigo-700" },
  ditolak: { label: "Ditolak", bg: "bg-red-50", text: "text-red-700" },
  selesai: { label: "Selesai", bg: "bg-green-50", text: "text-green-700" },
};

function CardSkeleton() {
  return (
    <div className="w-72 animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
      <div className="h-36 bg-gray-100" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
        <div className="h-8 w-full rounded bg-gray-100" />
      </div>
    </div>
  );
}

function HeroLaporanCard() {
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    laporanAPI
      .getAll({ per_page: 5 })
      .then((res) => {
        if (!active) return;
        const items = res.data?.data || [];
        const withPhoto = items.find((item) => item.foto_bukti_urls?.length > 0);
        setLaporan(withPhoto || items[0] || null);
      })
      .catch(() => {
        if (active) setLaporan(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <CardSkeleton />;
  if (!laporan) return null;

  const status = STATUS_META[laporan.status_laporan] || STATUS_META.menunggu;
  const photo = laporan.foto_bukti_urls?.[0] || "/images/placeholder.png";
  const title = laporan.jenis_sampah?.nama
    ? `Sampah ${laporan.jenis_sampah.nama} — ${laporan.kabupaten_kota || "Sulawesi Utara"}`
    : laporan.alamat_lokasi || "Laporan Sampah";

  return (
    <Link
      to={`/laporan/${laporan.id}`}
      className="block w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl transition-transform hover:-translate-y-1"
    >
      <div className="relative h-36 w-full overflow-hidden bg-gray-100">
        <img src={photo} alt="" className="h-full w-full object-cover" />
        <span className="absolute top-3 left-3 rounded-full bg-(--primary) px-2.5 py-1 text-[10px] font-bold text-white">
          Laporan Terbaru
        </span>
      </div>
      <div className="p-4">
        <p className="line-clamp-1 font-bold text-gray-900">{title}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <LuMapPin size={13} />
          {laporan.kabupaten_kota || "Sulawesi Utara"}
        </p>
        <span
          className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-(--primary) px-3 py-2 text-sm font-bold text-white">
          Lihat Detail
          <LuArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}

export default HeroLaporanCard;

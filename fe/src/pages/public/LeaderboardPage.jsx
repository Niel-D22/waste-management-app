import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  LuCrown,
  LuTrophy,
  LuMedal,
  LuFileText,
  LuUsers,
  LuBuilding2,
  LuNewspaper,
  LuArchive,
  LuHandHeart,
  LuMapPin,
  LuSearch,
  LuSparkles,
  LuChevronDown,
  LuChevronUp,
  LuArrowUpRight,
  LuCheckCircle2,
  LuTrash2,
  LuBarChart3,
} from "react-icons/lu";
import { motion, useReducedMotion } from "motion/react";
import FiturHero from "../../components/shared/FiturHero";
import {
  getLeaderboard,
  getWilayahLeaderboard,
} from "../../services/api/routes/leaderboard.route";
import { useAuth } from "../../contexts/AuthContext";

/* ────────────────────────────────────────────────────────────────────────
   Konfigurasi Badge & Poin
   ──────────────────────────────────────────────────────────────────────── */
const BADGE_CONFIG = {
  Pemula: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    range: "< 50 poin",
  },
  Aktif: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    range: "50 - 149 poin",
  },
  "Pahlawan Lingkungan": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    range: "150 - 299 poin",
  },
  "Legenda Torang Bersih": {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    range: "≥ 300 poin",
  },
};

const ATURAN_POIN = [
  { icon: LuFileText, label: "Laporan Sampah Tervalidasi", poin: "+10 Poin", warna: "text-blue-600 bg-blue-50" },
  { icon: LuHandHeart, label: "Tindak Lanjut Lapangan Selesai", poin: "+15 Poin", warna: "text-emerald-600 bg-emerald-50" },
  { icon: LuUsers, label: "Pendaftaran Mitra Kolaborator", poin: "+20 Poin", warna: "text-indigo-600 bg-indigo-50" },
  { icon: LuBuilding2, label: "Pendaftaran Aset Fasilitas (TPS/Bank Sampah)", poin: "+20 Poin", warna: "text-purple-600 bg-purple-50" },
  { icon: LuNewspaper, label: "Publikasi Artikel Edukasi", poin: "+15 Poin", warna: "text-cyan-600 bg-cyan-50" },
  { icon: LuArchive, label: "Posting Barang di Lapak Daur Ulang", poin: "+5 Poin", warna: "text-amber-600 bg-amber-50" },
];

const TABS = [
  { key: "individu", label: "Peringkat Warga" },
  { key: "wilayah", label: "Peringkat Wilayah (Kab/Kota)" },
];

/* ────────────────────────────────────────────────────────────────────────
   Komponen Avatar Aman dengan Fallback
   ──────────────────────────────────────────────────────────────────────── */
function Avatar({ name, url, size = 44, ring = "" }) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || "?").charAt(0).toUpperCase();

  if (url && !imgError) {
    return (
      <img
        src={url}
        alt={name || "Avatar"}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`rounded-full object-cover ${ring}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-(--primary) font-bold text-white ${ring}`}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.36) }}
    >
      {initial}
    </div>
  );
}

function WilayahIcon({ size = 44 }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)"
      style={{ width: size, height: size }}
    >
      <LuMapPin size={size * 0.45} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Breakdown Rincian Aksi Kontribusi
   ──────────────────────────────────────────────────────────────────────── */
function Breakdown({ row, compact = false }) {
  const items = [
    { icon: LuFileText, label: "laporan", value: row.jumlah_laporan },
    { icon: LuHandHeart, label: "tindak lanjut", value: row.jumlah_tindak_lanjut },
    { icon: LuUsers, label: "kolaborator", value: row.jumlah_kolaborator },
    { icon: LuBuilding2, label: "aset", value: row.jumlah_aset },
    { icon: LuNewspaper, label: "artikel", value: row.jumlah_artikel },
    { icon: LuArchive, label: "barang", value: row.jumlah_marketplace },
  ].filter((item) => item.value > 0);

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-1 ${compact ? "justify-center text-[11px]" : "text-xs"} text-gray-500`}>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-1.5 py-0.5 border border-gray-100">
          <item.icon size={compact ? 11 : 12} className="text-(--primary)" />
          <span>{item.value}</span>
          <span className="text-gray-400">{item.label}</span>
        </span>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200/70" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-18 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Komponen Panduan Sistem Poin & Badge (Bisa Dilipat)
   ──────────────────────────────────────────────────────────────────────── */
function PanduanPoinSection() {
  const [buka, setBuka] = useState(false);

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs transition-all">
      <button
        onClick={() => setBuka(!buka)}
        className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
            <LuSparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Cara Mendapatkan Poin & Kenaikan Lencana</p>
            <p className="text-xs text-gray-500">Pelajari aturan poin dan tingkatan badge kontributor Torang Bersih</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-(--primary)">
          <span>{buka ? "Sembunyikan" : "Lihat Aturan"}</span>
          {buka ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
        </div>
      </button>

      {buka && (
        <div className="border-t border-gray-100 bg-slate-50/50 p-5 pt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Bagian Poin */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <LuCheckCircle2 className="text-emerald-600" size={14} />
                Poin per Aksi Nyata
              </h4>
              <div className="space-y-2">
                {ATURAN_POIN.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-gray-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${item.warna}`}>
                        <item.icon size={13} />
                      </div>
                      <span className="font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className="font-bold text-(--primary)">{item.poin}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bagian Lencana / Badge */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <LuMedal className="text-amber-500" size={14} />
                Tingkatan Lencana (Badge)
              </h4>
              <div className="space-y-2">
                {Object.entries(BADGE_CONFIG).map(([namaBadge, cfg]) => (
                  <div key={namaBadge} className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-gray-100 text-xs">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {namaBadge}
                    </span>
                    <span className="text-gray-500 font-medium">{cfg.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Banner Peringkat User Pribadi (Jika Sedang Login)
   ──────────────────────────────────────────────────────────────────────── */
function UserPersonalRankCard({ currentUserId, items, currentUser }) {
  if (!currentUserId || !currentUser) return null;

  const myData = items.find((row) => row.user_id === currentUserId);
  const totalPoin = myData ? myData.total_poin : 0;
  const myRank = myData ? myData.rank : "-";
  const myBadge = myData ? myData.badge : "Pemula";
  const badgeStyle = BADGE_CONFIG[myBadge] || BADGE_CONFIG.Pemula;

  let targetPoin = 50;
  let targetBadge = "Aktif";
  if (totalPoin >= 300) {
    targetPoin = 300;
    targetBadge = "Legenda Torang Bersih";
  } else if (totalPoin >= 150) {
    targetPoin = 300;
    targetBadge = "Legenda Torang Bersih";
  } else if (totalPoin >= 50) {
    targetPoin = 150;
    targetBadge = "Pahlawan Lingkungan";
  }

  const selisih = Math.max(0, targetPoin - totalPoin);

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border-2 border-(--primary)/20 bg-linear-to-r from-[#1e1f78]/5 via-white to-blue-50/40 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.full_name || currentUser.username} url={currentUser.avatar_url} size={54} ring="ring-2 ring-(--primary)/40" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-(--primary) uppercase tracking-wider">Status Kontribusi Kamu</span>
              <span className="rounded-full bg-(--primary) px-2 py-0.5 text-[10px] font-bold text-white">Akun Aktif</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{currentUser.full_name || currentUser.username}</h3>
            <p className="text-xs text-gray-500">
              {myData ? (
                <>Peringkat <strong>#{myRank}</strong> dari {items.length} kontributor terdaftar</>
              ) : (
                "Belum tercatat di papan peringkat. Mulai kontribusi pertamamu!"
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-center shadow-xs">
            <p className="text-[10px] font-medium text-gray-400 uppercase">Total Poin</p>
            <p className="text-xl font-extrabold text-(--primary)">{totalPoin}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-center shadow-xs">
            <p className="text-[10px] font-medium text-gray-400 uppercase">Lencana Saat Ini</p>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
              {myBadge}
            </span>
          </div>
          <Link
            to="/laporan/buat"
            className="flex items-center gap-1.5 rounded-xl bg-(--primary) px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-(--primary-dark)"
          >
            <span>Lapor Sampah (+10)</span>
            <LuArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {totalPoin < 300 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            💡 Kumpulkan <strong>{selisih} poin lagi</strong> untuk meraih lencana <strong>{targetBadge}</strong>!
          </p>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Tab Kontributor Individu
   ──────────────────────────────────────────────────────────────────────── */
function IndividuTab({ items, loading, error, currentUserId, currentUser }) {
  const [search, setSearch] = useState("");
  const kurangiGerakan = useReducedMotion();

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
        <p className="font-bold text-red-600">Gagal Memuat Peringkat Kontributor</p>
        <p className="mt-1 text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <LuTrophy size={24} />
        </div>
        <h3 className="font-bold text-gray-800">Belum Ada Poin Kontributor Tercatat</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
          Jadilah orang pertama yang melaporkan tumpukan sampah, mendaftarkan aset, atau membagikan artikel daur ulang!
        </p>
        <Link
          to="/laporan/buat"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-xs font-bold text-white hover:bg-(--primary-dark)"
        >
          Buat Laporan Sekarang
        </Link>
      </div>
    );
  }

  // Filter pencarian
  const filtered = items.filter((row) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (row.full_name && row.full_name.toLowerCase().includes(q)) ||
      (row.username && row.username.toLowerCase().includes(q)) ||
      (row.badge && row.badge.toLowerCase().includes(q))
    );
  });

  const isFiltering = search.trim().length > 0;
  const top3 = isFiltering ? [] : items.slice(0, 3);
  const rest = isFiltering ? filtered : items.slice(3);

  return (
    <>
      <UserPersonalRankCard currentUserId={currentUserId} items={items} currentUser={currentUser} />

      {/* Bar Pencarian & Info Total */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Daftar Pahlawan Lingkungan</h2>
          <p className="text-xs text-gray-500">Total {items.length} kontributor aktif tercatat di sistem</p>
        </div>

        <div className="relative w-full sm:w-72">
          <LuSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau username..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pr-3.5 pl-9 text-xs text-gray-900 shadow-2xs outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
          />
        </div>
      </div>

      {/* Podium Top 3 (Hanya tampil saat tidak sedang mencari) */}
      {!isFiltering && top3.length > 0 && (
        <div className={`mb-10 grid grid-cols-1 gap-4 ${
          top3.length === 1
            ? "sm:grid-cols-1 max-w-sm mx-auto"
            : top3.length === 2
            ? "sm:grid-cols-2 max-w-xl mx-auto"
            : "sm:grid-cols-3"
        }`}>
          {top3.map((row, idx) => {
            const isMe = currentUserId === row.user_id;
            const badgeStyle = BADGE_CONFIG[row.badge] || BADGE_CONFIG.Pemula;

            let orderClass = "";
            let cardAccent = "border-gray-200";
            let trophyBg = "bg-gray-100 text-gray-600";
            let ringColor = "ring-gray-300";
            let RankIcon = LuTrophy;

            if (idx === 0) {
              orderClass = top3.length === 3 ? "sm:order-2 sm:-translate-y-3" : "";
              cardAccent = "border-amber-300 shadow-md bg-linear-to-b from-amber-50/50 via-white to-white";
              trophyBg = "bg-amber-400 text-amber-950 shadow-sm";
              ringColor = "ring-amber-400";
              RankIcon = LuCrown;
            } else if (idx === 1) {
              orderClass = top3.length === 3 ? "sm:order-1" : "";
              cardAccent = "border-slate-300 shadow-xs bg-linear-to-b from-slate-50/60 via-white to-white";
              trophyBg = "bg-slate-300 text-slate-800";
              ringColor = "ring-slate-300";
              RankIcon = LuTrophy;
            } else if (idx === 2) {
              orderClass = top3.length === 3 ? "sm:order-3" : "";
              cardAccent = "border-amber-200/80 shadow-xs bg-linear-to-b from-orange-50/40 via-white to-white";
              trophyBg = "bg-amber-600 text-white";
              ringColor = "ring-amber-500/40";
              RankIcon = LuMedal;
            }

            return (
              <motion.div
                key={row.user_id}
                initial={kurangiGerakan ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 text-center transition hover:shadow-md ${cardAccent} ${orderClass} ${
                  isMe ? "ring-2 ring-(--primary)" : ""
                }`}
              >
                {isMe && (
                  <span className="absolute top-3 right-3 rounded-full bg-(--primary) px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                    Kamu
                  </span>
                )}

                <div>
                  <div className={`mx-auto mb-3 flex size-11 items-center justify-center rounded-full ${trophyBg}`}>
                    <RankIcon size={22} />
                  </div>

                  <div className="mx-auto mb-3 flex justify-center">
                    <Avatar
                      name={row.full_name || row.username}
                      url={row.avatar_url}
                      size={68}
                      ring={`ring-4 ${ringColor}`}
                    />
                  </div>

                  <h3 className="truncate font-bold text-gray-900" title={row.full_name || row.username}>
                    {row.full_name || row.username}
                  </h3>
                  <p className="text-xs text-gray-400">@{row.username}</p>

                  <div className="my-3">
                    <p className="text-3xl font-extrabold tracking-tight text-(--primary)">{row.total_poin}</p>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Poin Terkumpul</p>
                  </div>

                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                    {row.badge}
                  </span>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-3">
                  <Breakdown row={row} compact={true} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tabel Sisa Peringkat / Hasil Pencarian */}
      {rest.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
          <div className="border-b border-gray-100 bg-slate-50/70 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-4">
            <span className="w-8 text-center">Rank</span>
            <span className="flex-1">Kontributor</span>
            <span className="hidden sm:inline-block w-40 text-center">Lencana</span>
            <span className="w-20 text-right">Poin</span>
          </div>

          <div className="divide-y divide-gray-100">
            {rest.map((row) => {
              const isMe = currentUserId === row.user_id;
              const badgeStyle = BADGE_CONFIG[row.badge] || BADGE_CONFIG.Pemula;

              return (
                <div
                  key={row.user_id}
                  className={`flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/50 ${
                    isMe ? "bg-(--primary)/5 font-medium" : ""
                  }`}
                >
                  <span className="w-8 shrink-0 text-center text-sm font-bold text-gray-500">
                    #{row.rank}
                  </span>

                  <Avatar name={row.full_name || row.username} url={row.avatar_url} size={42} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-bold text-gray-800 text-sm">{row.full_name || row.username}</p>
                      {isMe && (
                        <span className="rounded-full bg-(--primary) px-2 py-0.2 text-[9px] font-bold text-white">
                          Kamu
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">@{row.username}</p>
                    <Breakdown row={row} />
                  </div>

                  <div className="hidden sm:flex shrink-0 w-40 justify-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                      {row.badge}
                    </span>
                  </div>

                  <span className="w-20 shrink-0 text-right text-lg font-bold text-(--primary)">
                    {row.total_poin}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : isFiltering ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Tidak ada kontributor yang cocok dengan pencarian &quot;{search}&quot;.
        </div>
      ) : null}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Tab Peringkat Wilayah (Kabupaten / Kota)
   ──────────────────────────────────────────────────────────────────────── */
function WilayahTab({ data, loading, error }) {
  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
        <p className="font-bold text-red-600">Gagal Memuat Peringkat Wilayah</p>
        <p className="mt-1 text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const perWilayah = data?.per_wilayah || [];
  if (perWilayah.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <LuMapPin size={24} />
        </div>
        <h3 className="font-bold text-gray-800">Belum Ada Laporan Wilayah</h3>
        <p className="mt-1 text-sm text-gray-500">Belum ada titik laporan sampah dengan lokasi terverifikasi.</p>
      </div>
    );
  }

  const top3 = perWilayah.slice(0, 3);
  const rest = perWilayah.slice(3);

  return (
    <>
      {/* 3 KPI Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50/60 to-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Total Laporan Se-Sulut</span>
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <LuBarChart3 size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">{data?.total_laporan || 0}</p>
          <p className="mt-1 text-xs text-gray-500">Titik sampah terlapor di seluruh wilayah</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50/60 to-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Wilayah Paling Aktif</span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <LuMapPin size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-gray-900 truncate" title={data?.wilayah_teraktif || "-"}>
            {data?.wilayah_teraktif || "-"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Tingkat pelaporan & aksi warga tertinggi</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-linear-to-br from-amber-50/60 to-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Jenis Sampah Dominan</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <LuTrash2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-gray-900 truncate" title={data?.jenis_sampah_dominan_keseluruhan || "-"}>
            {data?.jenis_sampah_dominan_keseluruhan || "-"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Kategori sampah yang paling sering dilaporkan</p>
        </div>
      </div>

      {/* Podium Wilayah */}
      <div className={`mb-10 grid grid-cols-1 gap-4 ${
        top3.length === 1
          ? "sm:grid-cols-1 max-w-sm mx-auto"
          : top3.length === 2
          ? "sm:grid-cols-2 max-w-xl mx-auto"
          : "sm:grid-cols-3"
      }`}>
        {top3.map((row, idx) => {
          let orderClass = "";
          let cardAccent = "border-gray-200";
          let chipBg = "bg-gray-100 text-gray-600";
          let RankIcon = LuTrophy;

          if (idx === 0) {
            orderClass = top3.length === 3 ? "sm:order-2 sm:-translate-y-3" : "";
            cardAccent = "border-amber-300 shadow-md bg-linear-to-b from-amber-50/40 via-white to-white";
            chipBg = "bg-amber-400 text-amber-950";
            RankIcon = LuCrown;
          } else if (idx === 1) {
            orderClass = top3.length === 3 ? "sm:order-1" : "";
            cardAccent = "border-slate-300 shadow-xs";
            chipBg = "bg-slate-300 text-slate-800";
            RankIcon = LuTrophy;
          } else if (idx === 2) {
            orderClass = top3.length === 3 ? "sm:order-3" : "";
            cardAccent = "border-orange-200/80 shadow-xs";
            chipBg = "bg-amber-600 text-white";
            RankIcon = LuMedal;
          }

          return (
            <div
              key={row.kabupaten_kota}
              className={`relative rounded-2xl border p-6 text-center transition hover:shadow-md ${cardAccent} ${orderClass}`}
            >
              <div className={`mx-auto mb-3 flex size-10 items-center justify-center rounded-full ${chipBg}`}>
                <RankIcon size={20} />
              </div>
              <div className="mx-auto mb-3 flex justify-center">
                <WilayahIcon size={64} />
              </div>
              <h3 className="truncate font-bold text-gray-900 text-lg">{row.kabupaten_kota}</h3>
              <p className="mt-1 text-xs text-gray-500">
                Sampah dominan: <span className="font-semibold text-gray-700">{row.jenis_sampah_dominan}</span>
              </p>

              <div className="mt-4 border-t border-gray-100 pt-3">
                <p className="text-3xl font-extrabold text-(--primary)">{row.jumlah_laporan}</p>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Laporan Ditindak</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabel Sisa Wilayah */}
      {rest.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
          <div className="border-b border-gray-100 bg-slate-50/70 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-4">
            <span className="w-8 text-center">Rank</span>
            <span className="flex-1">Kabupaten / Kota</span>
            <span className="w-24 text-right">Jumlah Laporan</span>
          </div>

          <div className="divide-y divide-gray-100">
            {rest.map((row, idx) => (
              <div
                key={row.kabupaten_kota}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/50"
              >
                <span className="w-8 shrink-0 text-center text-sm font-bold text-gray-400">
                  #{idx + 4}
                </span>
                <WilayahIcon size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-gray-800 text-sm">{row.kabupaten_kota}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Sampah dominan: <span className="font-semibold text-gray-600">{row.jenis_sampah_dominan}</span> · Status terbanyak:{" "}
                    <span className="font-semibold text-gray-600">{row.status_terbanyak}</span>
                  </p>
                </div>
                <span className="w-24 shrink-0 text-right text-lg font-bold text-(--primary)">
                  {row.jumlah_laporan}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Komponen Utama Halaman Leaderboard
   ──────────────────────────────────────────────────────────────────────── */
function LeaderboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("individu");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [wilayahData, setWilayahData] = useState(null);
  const [wilayahLoading, setWilayahLoading] = useState(false);
  const [wilayahError, setWilayahError] = useState(null);
  const [wilayahFetched, setWilayahFetched] = useState(false);

  // Muat data awal peringkat individu
  useEffect(() => {
    let aktif = true;
    getLeaderboard()
      .then((res) => {
        if (aktif) {
          setItems(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (aktif) {
          setError(err.response?.data?.message || "Gagal memuat papan peringkat.");
          setLoading(false);
        }
      });

    return () => {
      aktif = false;
    };
  }, []);

  // Muat data peringkat wilayah saat tab wilayah dibuka pertama kali
  useEffect(() => {
    if (tab !== "wilayah" || wilayahFetched) return;

    let aktif = true;
    getWilayahLeaderboard()
      .then((res) => {
        if (aktif) {
          setWilayahData(res.data || null);
          setWilayahFetched(true);
          setWilayahLoading(false);
        }
      })
      .catch((err) => {
        if (aktif) {
          setWilayahError(err.response?.data?.message || "Gagal memuat papan peringkat wilayah.");
          setWilayahLoading(false);
        }
      });

    return () => {
      aktif = false;
    };
  }, [tab, wilayahFetched]);

  // Tombol Muat Ulang Manual
  const handleRefresh = () => {
    if (tab === "individu") {
      setLoading(true);
      setError(null);
      getLeaderboard()
        .then((res) => setItems(res.data || []))
        .catch((err) => setError(err.response?.data?.message || "Gagal memuat papan peringkat."))
        .finally(() => setLoading(false));
    } else {
      setWilayahLoading(true);
      setWilayahError(null);
      getWilayahLeaderboard()
        .then((res) => setWilayahData(res.data || null))
        .catch((err) => setWilayahError(err.response?.data?.message || "Gagal memuat papan peringkat wilayah."))
        .finally(() => setWilayahLoading(false));
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#FAFAFA] pb-20">
      <FiturHero
        title="Papan Peringkat Kontributor"
        description="Apresiasi bagi warga dan wilayah yang paling aktif melaporkan sampah, bermitra, mendaftarkan aset lingkungan, dan membagikan literasi edukasi demi Sulawesi Utara yang bersih dan lestari."
        buttonText="Mulai Berkontribusi"
        buttonLink="/laporan/buat"
      />

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        {/* Panduan Sistem Poin & Badge */}
        <PanduanPoinSection />

        {/* Tab Switcher */}
        <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex gap-2 rounded-2xl bg-gray-100 p-1.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`cursor-pointer rounded-xl px-5 py-2 text-xs md:text-sm font-bold transition-all ${
                  tab === t.key
                    ? "bg-(--primary) text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="cursor-pointer text-xs font-semibold text-(--primary) hover:underline"
          >
            Muat Ulang
          </button>
        </div>

        {/* Isi Tab */}
        {tab === "individu" ? (
          <IndividuTab
            items={items}
            loading={loading}
            error={error}
            currentUserId={user?.id}
            currentUser={user}
          />
        ) : (
          <WilayahTab
            data={wilayahData}
            loading={wilayahLoading}
            error={wilayahError}
          />
        )}
      </div>
    </div>
  );
}

export default LeaderboardPage;

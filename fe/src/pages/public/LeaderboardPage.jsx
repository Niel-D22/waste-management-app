import React, { useEffect, useState } from "react";
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
} from "react-icons/lu";
import FiturHero from "../../components/shared/FiturHero";
import {
  getLeaderboard,
  getWilayahLeaderboard,
} from "../../services/api/routes/leaderboard.route";
import { useAuth } from "../../contexts/AuthContext";

const BADGE_STYLE = {
  Pemula: { bg: "bg-gray-100", text: "text-gray-600" },
  Aktif: { bg: "bg-(--accent)/10", text: "text-(--accent-dark)" },
  "Pahlawan Lingkungan": { bg: "bg-(--indigo)/10", text: "text-(--indigo)" },
  "Legenda Torang Bersih": { bg: "bg-(--yellow)/15", text: "text-yellow-700" },
};

const RANK_STYLE = [
  { icon: LuCrown, ring: "ring-yellow-300", chip: "bg-yellow-400 text-yellow-900" },
  { icon: LuTrophy, ring: "ring-gray-300", chip: "bg-gray-300 text-gray-700" },
  { icon: LuMedal, ring: "ring-amber-400", chip: "bg-amber-500 text-white" },
];

const TABS = [
  { key: "individu", label: "Individu" },
  { key: "wilayah", label: "Wilayah" },
];

function Avatar({ name, url, size = 44 }) {
  const initial = (name || "?").charAt(0).toUpperCase();
  if (url) {
    return (
      <img
        src={url}
        alt=""
        referrerPolicy="no-referrer"
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-(--primary) font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}

function WilayahIcon({ size = 44 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-(--accent)/15 text-(--accent-dark)"
      style={{ width: size, height: size }}
    >
      <LuMapPin size={size * 0.45} />
    </div>
  );
}

function Breakdown({ row }) {
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
    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1">
          <item.icon size={12} />
          {item.value} {item.label}
        </span>
      ))}
    </div>
  );
}

function LoadingSpinnerBlock() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--primary) border-t-transparent" />
    </div>
  );
}

function IndividuTab({ items, loading, error, currentUserId }) {
  if (loading) return <LoadingSpinnerBlock />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (items.length === 0) {
    return (
      <div className="p-8 text-center font-medium text-gray-400">
        Belum ada kontribusi tercatat. Jadilah yang pertama!
      </div>
    );
  }

  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {top3.map((row, idx) => {
          const RankIcon = RANK_STYLE[idx].icon;
          const badgeStyle = BADGE_STYLE[row.badge] || BADGE_STYLE.Pemula;
          const isMe = currentUserId === row.user_id;
          return (
            <div
              key={row.user_id}
              className={`relative rounded-2xl border bg-white p-6 text-center shadow-sm ${
                isMe ? "border-(--primary) ring-2 ring-(--primary)/30" : "border-gray-200"
              } ${idx === 0 ? "sm:order-2 sm:-translate-y-3" : idx === 1 ? "sm:order-1" : "sm:order-3"}`}
            >
              {isMe && (
                <span className="absolute top-3 right-3 rounded-full bg-(--primary) px-2 py-0.5 text-[10px] font-bold text-white">
                  Kamu
                </span>
              )}
              <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ${RANK_STYLE[idx].chip}`}>
                <RankIcon size={20} />
              </div>
              <div className={`mx-auto mb-3 w-fit rounded-full ring-4 ${RANK_STYLE[idx].ring}`}>
                <Avatar name={row.full_name || row.username} url={row.avatar_url} size={64} />
              </div>
              <p className="truncate font-bold text-gray-900">{row.full_name || row.username}</p>
              <p className="text-xs text-gray-400">@{row.username}</p>
              <p className="mt-2 text-2xl font-bold text-(--primary)">{row.total_poin}</p>
              <p className="mb-2 text-xs font-medium text-gray-500">poin</p>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badgeStyle.bg} ${badgeStyle.text}`}>
                {row.badge}
              </span>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {rest.map((row) => {
            const badgeStyle = BADGE_STYLE[row.badge] || BADGE_STYLE.Pemula;
            const isMe = currentUserId === row.user_id;
            return (
              <div
                key={row.user_id}
                className={`flex items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0 ${
                  isMe ? "bg-(--primary)/5" : ""
                }`}
              >
                <span className="w-6 shrink-0 text-center font-bold text-gray-400">{row.rank}</span>
                <Avatar name={row.full_name || row.username} url={row.avatar_url} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold text-gray-800">{row.full_name || row.username}</p>
                    {isMe && (
                      <span className="rounded-full bg-(--primary) px-2 py-0.5 text-[10px] font-bold text-white">
                        Kamu
                      </span>
                    )}
                  </div>
                  <Breakdown row={row} />
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${badgeStyle.bg} ${badgeStyle.text}`}>
                  {row.badge}
                </span>
                <span className="w-16 shrink-0 text-right text-lg font-bold text-(--primary)">
                  {row.total_poin}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function WilayahTab({ data, loading, error }) {
  if (loading) return <LoadingSpinnerBlock />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const perWilayah = data?.per_wilayah || [];
  if (perWilayah.length === 0) {
    return (
      <div className="p-8 text-center font-medium text-gray-400">
        Belum ada laporan dengan data lokasi.
      </div>
    );
  }

  const top3 = perWilayah.slice(0, 3);
  const rest = perWilayah.slice(3);

  return (
    <>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {top3.map((row, idx) => {
          const RankIcon = RANK_STYLE[idx].icon;
          return (
            <div
              key={row.kabupaten_kota}
              className={`relative rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm ${
                idx === 0 ? "sm:order-2 sm:-translate-y-3" : idx === 1 ? "sm:order-1" : "sm:order-3"
              }`}
            >
              <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ${RANK_STYLE[idx].chip}`}>
                <RankIcon size={20} />
              </div>
              <div className={`mx-auto mb-3 w-fit rounded-full ring-4 ${RANK_STYLE[idx].ring}`}>
                <WilayahIcon size={64} />
              </div>
              <p className="truncate font-bold text-gray-900">{row.kabupaten_kota}</p>
              <p className="text-xs text-gray-400">Dominan: {row.jenis_sampah_dominan}</p>
              <p className="mt-2 text-2xl font-bold text-(--primary)">{row.jumlah_laporan}</p>
              <p className="text-xs font-medium text-gray-500">laporan</p>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {rest.map((row, idx) => (
            <div
              key={row.kabupaten_kota}
              className="flex items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0"
            >
              <span className="w-6 shrink-0 text-center font-bold text-gray-400">{idx + 4}</span>
              <WilayahIcon size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-gray-800">{row.kabupaten_kota}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Sampah dominan: {row.jenis_sampah_dominan} · Status terbanyak: {row.status_terbanyak}
                </p>
              </div>
              <span className="w-16 shrink-0 text-right text-lg font-bold text-(--primary)">
                {row.jumlah_laporan}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

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

  // Diletakkan DI ATAS useEffect yang memanggilnya. Bukan sekadar soal
  // gaya: kalau fungsinya dideklarasikan di bawah, efek di atas memakai
  // nama yang saat itu belum terikat ke nilai terbaru.
  async function fetchLeaderboard() {
    try {
      setLoading(true);
      setError(null);
      const res = await getLeaderboard();
      setItems(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat papan peringkat.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchWilayahLeaderboard() {
    try {
      setWilayahLoading(true);
      setWilayahError(null);
      const res = await getWilayahLeaderboard();
      setWilayahData(res.data || null);
      setWilayahFetched(true);
    } catch (err) {
      setWilayahError(err.response?.data?.message || "Gagal memuat papan peringkat wilayah.");
    } finally {
      setWilayahLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (tab === "wilayah" && !wilayahFetched) {
      fetchWilayahLeaderboard();
    }
  }, [tab, wilayahFetched]);

  return (
    <div className="relative w-full overflow-hidden bg-[#FAFAFA]">
      <FiturHero
        title="Papan Peringkat Kontributor"
        description="Warga dan wilayah yang paling aktif melapor, jadi kolaborator, mendaftarkan aset, dan berbagi edukasi untuk Sulawesi Utara yang lebih bersih."
        buttonText="Mulai Berkontribusi"
        buttonLink="/laporan/buat"
      />

      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        {/* Tab switcher */}
        <div className="mb-8 flex w-fit gap-1 rounded-full bg-gray-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                tab === t.key
                  ? "bg-(--primary) text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "individu" ? (
          <IndividuTab items={items} loading={loading} error={error} currentUserId={user?.id} />
        ) : (
          <WilayahTab data={wilayahData} loading={wilayahLoading} error={wilayahError} />
        )}
      </div>
    </div>
  );
}

export default LeaderboardPage;

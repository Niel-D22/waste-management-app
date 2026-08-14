import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FileBarChart2, MapPin, Recycle, Map, RefreshCw } from "lucide-react";
import { getAdminAnalitikWilayah } from "../../services/api/routes/dashboard.route";
import StatsCard from "../../components/ui/StatsCard";

// Warna di sini sengaja hardcode hex (bukan var(--token)) karena recharts
// merender SVG presentation attributes yang tidak selalu resolve CSS custom
// property dengan konsisten lintas browser. Nilainya tetap mirror persis
// token di fe/src/index.css supaya tetap konsisten sama palet asli.
const BRAND = {
  primary: "#1e1f78",
  accent: "#5697ff",
};

const STATUS_META = {
  menunggu: { label: "Menunggu", color: "#eab308" },
  diterima: { label: "Diterima", color: "#5697ff" },
  ditindak: { label: "Ditindak", color: "#6366f1" },
  ditolak: { label: "Ditolak", color: "#ef4444" },
  selesai: { label: "Selesai", color: "#22c55e" },
};

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-gray-100 ${className}`} />
  );
}

function LoadingState() {
  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-[80px]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[360px]" />
        <Skeleton className="h-[360px]" />
      </div>
      <Skeleton className="h-[280px]" />
    </div>
  );
}

const AdminAnalitikPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminAnalitikWilayah();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching analitik wilayah:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!stats) return null;

  const statusData = Object.entries(stats.laporan_per_status)
    .map(([key, count]) => ({
      key,
      value: count,
      name: STATUS_META[key]?.label || key,
      color: STATUS_META[key]?.color || "#a7a7a7",
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Analitik per Wilayah
          </h1>
          <p className="mt-1 text-gray-500">
            Sebaran laporan sampah ilegal berdasarkan kabupaten/kota di
            Sulawesi Utara.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
        >
          <RefreshCw size={16} className="text-primary" />
          Refresh Data
        </button>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Laporan"
          value={stats.total_laporan}
          icon={FileBarChart2}
          colorVar="--primary"
          subtitle="Laporan dengan data lokasi"
        />
        <StatsCard
          title="Wilayah Teraktif"
          value={stats.wilayah_teraktif}
          icon={MapPin}
          colorVar="--accent"
          subtitle="Kabupaten/kota terbanyak lapor"
        />
        <StatsCard
          title="Jenis Sampah Dominan"
          value={stats.jenis_sampah_dominan_keseluruhan}
          icon={Recycle}
          colorVar="--cyan"
          subtitle="Paling sering dilaporkan"
        />
        <StatsCard
          title="Wilayah Tercakup"
          value={stats.per_wilayah.length}
          icon={Map}
          colorVar="--indigo"
          subtitle="Kabupaten/kota dengan laporan"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 font-bold text-gray-800">
            Ranking Laporan per Kabupaten/Kota
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={stats.per_wilayah}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
            >
              <defs>
                <linearGradient id="wilayahGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={BRAND.primary} />
                  <stop offset="100%" stopColor={BRAND.accent} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#7c7c7c" }} />
              <YAxis
                type="category"
                dataKey="kabupaten_kota"
                width={100}
                tick={{ fontSize: 11, fill: "#2c2c2c" }}
                tickFormatter={(value) =>
                  value.length > 14 ? `${value.slice(0, 13)}…` : value
                }
              />
              <Tooltip
                formatter={(value) => [`${value} laporan`, "Jumlah"]}
                cursor={{ fill: "rgba(30,31,120,0.05)" }}
              />
              <Bar
                dataKey="jumlah_laporan"
                fill="url(#wilayahGradient)"
                radius={[0, 8, 8, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 font-bold text-gray-800">
            Distribusi Status Laporan
          </h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} laporan`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total_laporan}</p>
              <p className="text-xs font-medium text-gray-500">Total</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {statusData.map((item) => (
              <div key={item.key} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-100 p-6 pb-4">
          <h3 className="font-bold text-gray-800">Ringkasan Laporan per Wilayah</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                <th className="px-6 py-3">Wilayah</th>
                <th className="px-6 py-3">Jumlah Laporan</th>
                <th className="px-6 py-3">Jenis Sampah Dominan</th>
                <th className="px-6 py-3">Status Terbanyak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.per_wilayah.map((item) => (
                <tr key={item.kabupaten_kota} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-gray-800">{item.kabupaten_kota}</td>
                  <td className="px-6 py-3 text-gray-600">{item.jumlah_laporan}</td>
                  <td className="px-6 py-3 text-gray-600">{item.jenis_sampah_dominan}</td>
                  <td className="px-6 py-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: `${STATUS_META[item.status_terbanyak]?.color || "#a7a7a7"}1a`,
                        color: STATUS_META[item.status_terbanyak]?.color || "#696969",
                      }}
                    >
                      {STATUS_META[item.status_terbanyak]?.label || item.status_terbanyak}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.per_wilayah.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    Belum ada laporan dengan data lokasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalitikPage;

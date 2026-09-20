/**
 * Warna dan label untuk setiap status laporan.
 *
 * Dikumpulkan di satu berkas karena status yang sama muncul di banyak tempat —
 * kartu daftar, halaman detail, penanda peta. Sebelumnya tiap tempat menyusun
 * warnanya sendiri dan hasilnya tidak pernah persis sama.
 *
 * Warnanya SOLID dengan teks putih, bukan tempelan pucat berteks tipis. Status
 * adalah informasi terpenting di halaman detail — apakah laporan ini sudah
 * ditangani atau belum — jadi ia harus jadi elemen paling nyaring di sana.
 *
 * Setiap warna sudah diperiksa kontrasnya terhadap teks putih dan lulus WCAG AA
 * (minimal 4,5:1). Nada 700 dipakai, bukan 500, justru karena itu: nada terang
 * seperti #22c55e hanya mencapai 2,2:1 dengan teks putih — angka itu berarti
 * tulisannya nyaris tidak terbaca.
 */
export const STATUS_LAPORAN = {
  menunggu: { label: "Menunggu Verifikasi", warna: "#B45309", denyut: true },
  diterima: { label: "Diterima", warna: "#0369A1", denyut: false },
  ditindak: { label: "Sedang Ditindak", warna: "#1E1F78", denyut: true },
  selesai: { label: "Selesai", warna: "#15803D", denyut: false },
  ditolak: { label: "Ditolak", warna: "#B91C1C", denyut: false },
};

const BAWAAN = { label: "Tidak Diketahui", warna: "#5D6B82", denyut: false };

export function statusLaporan(status) {
  return STATUS_LAPORAN[String(status || "").toLowerCase()] ?? BAWAAN;
}

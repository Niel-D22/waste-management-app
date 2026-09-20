import { formatBeratLaporan } from "../../../../../utils/helpers";

/**
 * Informasi detail laporan.
 *
 * Disusun sebagai daftar definisi berpemisah garis rambut, bukan kisi kartu.
 * Empat nilai pendek seperti ini kalau dibungkus kartu masing-masing akan
 * terbaca sebagai empat hal setara yang penting sendiri-sendiri — padahal
 * fungsinya sekadar keterangan pendukung foto di atasnya.
 */
function DetailLaporanInfo({ laporan, pelaporName, pelapor, namaJenisSampah }) {
  const baris = [
    { label: "Jenis Sampah", nilai: namaJenisSampah },
    { label: "Estimasi Berat", nilai: formatBeratLaporan(laporan.estimasi_berat_kg) },
    laporan.karakteristik && {
      label: "Karakteristik",
      nilai: laporan.karakteristik.replace(/_/g, " "),
    },
    laporan.bentuk_timbulan && {
      label: "Bentuk Timbulan",
      nilai: laporan.bentuk_timbulan,
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-9">
      <section>
        <h2 className="font-display mb-1 text-xl font-extrabold text-(--primary)">
          Informasi Detail
        </h2>
        <dl className="mt-4">
          {baris.map(({ label, nilai }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-6 border-b border-(--primary)/10 py-3.5"
            >
              <dt className="text-sm text-(--dark-text)/65">{label}</dt>
              <dd className="text-right text-sm font-bold text-(--primary) capitalize">
                {nilai}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="font-display mb-3 text-xl font-extrabold text-(--primary)">
          Deskripsi
        </h2>
        <p className="max-w-[62ch] text-[0.95rem] leading-8 text-pretty whitespace-pre-line text-(--dark-text)/80">
          {laporan.deskripsi_laporan || "Tidak ada deskripsi tambahan."}
        </p>
      </section>

      {/* Pelapor diletakkan DI BAWAH, bukan di atas seperti versi sebelumnya.
          Yang dicari orang saat membuka halaman ini adalah apa yang dilaporkan
          dan di mana — siapa pelapornya baru relevan setelah itu terjawab. */}
      <div className="flex items-center gap-4 rounded-xl bg-(--surface-sky) px-5 py-4">
        {pelapor?.avatar_url ? (
          <img
            src={pelapor.avatar_url}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="size-12 shrink-0 rounded-full object-cover ring-2 ring-white"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white font-bold text-(--primary) uppercase ring-2 ring-white"
          >
            {pelaporName.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold text-(--primary)">{pelaporName}</p>
          <p className="text-sm text-(--dark-text)/65">
            {pelapor?.role === "admin" ? "Admin" : "Pelapor"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DetailLaporanInfo;

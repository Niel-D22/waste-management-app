import { statusLaporan } from "./statusLaporan";

/**
 * Riwayat tindak lanjut sebuah laporan.
 *
 * Digambar sebagai garis waktu vertikal sungguhan — satu garis tegak dengan
 * titik-titik di atasnya — bukan tumpukan kartu berpemisah seperti sebelumnya.
 * Halaman ini bernama "Pelacakan Laporan", dan bentuk garis waktu itulah yang
 * langsung memberi tahu bahwa isinya berurutan: apa yang terjadi lebih dulu,
 * apa yang menyusul.
 *
 * Entri paling atas adalah yang terbaru dan diberi titik lebih besar berwarna
 * status, sisanya titik kecil pucat. Bedanya sengaja mencolok: yang dicari
 * orang saat membuka halaman ini adalah "sekarang bagaimana", bukan seluruh
 * riwayatnya.
 */

function Foto({ url, alt }) {
  return (
    <button
      type="button"
      onClick={() => window.open(url, "_blank", "noopener")}
      className="shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-(--primary)/10 transition hover:opacity-85 motion-reduce:transition-none"
    >
      <img src={url} alt={alt} loading="lazy" className="size-20 object-cover" />
    </button>
  );
}

function Kelompok({ judul, urls }) {
  if (!urls?.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-[0.7rem] font-bold tracking-wide text-(--dark-text)/55 uppercase">
        {judul}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {urls.map((url, i) => (
          <Foto key={url + i} url={url} alt={`${judul} ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

function DetailLaporanTimeline({ tindakLanjutList, laporanStatus }) {
  const status = statusLaporan(laporanStatus);

  if (!tindakLanjutList?.length) {
    const selesai = laporanStatus?.toLowerCase() === "selesai";
    return (
      <div className="flex gap-4">
        <span
          aria-hidden="true"
          className="mt-1.5 size-3.5 shrink-0 rounded-full ring-4 ring-white"
          style={{ backgroundColor: status.warna }}
        />
        <div>
          <p className="font-display font-extrabold text-(--primary)">
            {selesai ? "Penanganan Selesai" : "Menunggu Tindakan"}
          </p>
          <p className="mt-1.5 text-sm leading-7 text-(--dark-text)/70">
            {selesai
              ? "Titik sampah telah berhasil dievakuasi."
              : "Laporan sedang disiarkan ke jaringan kolaborator dan Bank Sampah di sekitar Kota Manado."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className="relative flex flex-col">
      {/* Garis tegaknya digambar sebagai satu elemen tunggal di belakang semua
          titik, bukan sebagai border kiri di tiap entri. Dengan border per
          entri, garisnya terputus di setiap jarak antar-entri dan tidak pernah
          terbaca sebagai satu alur yang menyambung. inset-y diberi jarak
          supaya garisnya berhenti di titik pertama dan terakhir, tidak
          menjulur ke luar. */}
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-1.5 w-0.5 bg-(--primary)/20"
      />

      {tindakLanjutList.map((tl, index) => {
        const terbaru = index === 0;
        const nama =
          tl.tim_penindak || tl.penindak?.full_name || "Kolaborator";

        return (
          <li
            key={tl.id || index}
            className="relative flex gap-4 pb-7 last:pb-0"
          >
            <span
              aria-hidden="true"
              className={`relative z-10 mt-1.5 shrink-0 rounded-full ring-4 ring-white ${
                terbaru ? "size-3.5" : "size-2.5 translate-x-0.5"
              }`}
              style={{
                backgroundColor: terbaru ? status.warna : "var(--surface-sky-deep)",
              }}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                {tl.penindak?.avatar_url ? (
                  <img
                    src={tl.penindak.avatar_url}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="size-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--surface-sky) text-xs font-bold text-(--primary) uppercase"
                  >
                    {nama.charAt(0)}
                  </span>
                )}
                <p className="font-display leading-tight font-extrabold text-(--primary)">
                  {nama}
                </p>
              </div>

              {tl.created_at && (
                <p className="mt-1.5 text-xs font-medium text-(--dark-text)/55 tabular-nums">
                  {new Date(tl.created_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}

              <p className="mt-1.5 text-sm leading-7 text-(--dark-text)/80">
                {tl.tindak_lanjut_penanganan}
              </p>

              {tl.catatan && (
                <p className="mt-2.5 rounded-xl bg-(--surface-sky) px-3.5 py-2.5 text-sm leading-6 text-(--dark-text)/75 italic">
                  “{tl.catatan}”
                </p>
              )}

              <div className="mt-3.5 flex flex-wrap gap-5">
                <Kelompok judul="Sebelum" urls={tl.foto_sebelum_tindakan_urls} />
                <Kelompok
                  judul={
                    tl.foto_sebelum_tindakan_urls?.length
                      ? "Sesudah"
                      : "Bukti Tindakan"
                  }
                  urls={tl.foto_setelah_tindakan_urls}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default DetailLaporanTimeline;

import React from "react";
import TujuanItem from "./TujuanItem";
 
import { motion } from "motion/react";

const Tujuan = () => {
  const tujuan = [
    {
      title: "Sampah ilegal? Laporkan dalam hitungan detik",
    },
    {
      title: "Bingung buang sampah pilahan? Temukan titik terdekat",
    },
    {
      title: "Punya barang bekas? Bagikan ke yang membutuhkan",
    },
    {
      title: "Ingin bergerak? Daftar Menjadi Kolabolator",
    },
  ];
  return (
    <div className="relative flex w-full justify-center overflow-x-clip bg-(--surface-sky) px-4 py-16 md:px-10 md:py-24">
        {/* Ornamen latar. Diletakkan sebagai anak PERTAMA supaya tercat di
            lapisan paling belakang tanpa perlu z-index — isi section setelahnya
            otomatis menimpanya. pointer-events-none supaya tidak pernah mencuri
            klik. Disembunyikan di bawah md: di layar sempit ruangnya sudah
            sesak, ornamen di situ jadi mengganggu, bukan menghias. */}
      <img
        src="/images/ornamen/ornamen-daun.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute -bottom-8 -left-10 hidden w-[22%] opacity-60 select-none md:block"
      />
      <img
        src="/images/ornamen/ornamen-ombak.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute top-24 -right-12 hidden w-[24%] opacity-45 select-none md:block"
      />

      <div className="mx-auto flex w-full max-w-7xl">
        <div className="flex w-full flex-col items-center justify-between gap-12 md:flex-row md:gap-30">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full flex-col gap-5"
          >
            <h2 className="font-display text-center text-[clamp(1.75rem,5.5vw,3.75rem)] leading-tight font-extrabold tracking-tight text-slate-900 md:text-left">
              Hadir Untuk Sulawesi Utara
            </h2>
            <p className="text-center text-[clamp(1rem,3.4vw,1.75rem)] leading-relaxed font-semibold tracking-tight text-slate-700 md:text-left">
              Satu platform. Satu tujuan. Sulawesi Utara bebas sampah dimulai
              dari kita semua
            </p>
          </motion.div>
          <div className="flex w-full flex-col items-center gap-5">
            {tujuan.map((item, index) => (
              <TujuanItem key={index} index={index} title={item.title} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tujuan;

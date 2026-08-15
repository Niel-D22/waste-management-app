import React from "react";
import TujuanItem from "./TujuanItem";
// eslint-disable-next-line no-unused-vars
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="relative flex w-full justify-center overflow-x-clip bg-(--surface-sky) px-4 pt-5 pb-25 md:px-6 md:pt-40 md:pb-75"
    >
        {/* Ornamen latar. Diletakkan sebagai anak PERTAMA supaya tercat di
            lapisan paling belakang tanpa perlu z-index — isi section setelahnya
            otomatis menimpanya. pointer-events-none supaya tidak pernah mencuri
            klik. Disembunyikan di bawah md: di layar sempit ruangnya sudah
            sesak, ornamen di situ jadi mengganggu, bukan menghias. */}
      <img
        src="/images/ornamen/ornamen-daun.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute -bottom-8 -left-10 hidden w-[22%] opacity-60 select-none md:block"
      />
      <img
        src="/images/ornamen/ornamen-ombak.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute top-24 -right-12 hidden w-[24%] opacity-45 select-none md:block"
      />

      <div className="mx-auto flex w-full max-w-6xl">
        <div className="flex w-full flex-col items-center justify-between gap-12 md:flex-row md:gap-30">
          <div className="flex w-full flex-col gap-5">
            <h2 className="text-center text-3xl font-bold tracking-tight text-black text-shadow-sm sm:text-6xl md:text-left">
              Hadir Untuk Sulawesi Utara
            </h2>
            <p className="text-center text-lg font-semibold tracking-tight text-gray-700 text-shadow-sm sm:text-[1.75rem] md:text-left">
              Satu platform. Satu tujuan. Sulawesi Utara bebas sampah dimulai
              dari kita semua
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-5">
            {tujuan.map((item, index) => (
              <TujuanItem key={index} title={item.title} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Tujuan;

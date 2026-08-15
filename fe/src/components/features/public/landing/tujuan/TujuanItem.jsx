import React from "react";
import { motion } from "motion/react";

// react icons checklist
import { IoCheckmarkCircle } from "react-icons/io5";

const TujuanItem = ({ title, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      // Masuk dari KANAN, bukan dari bawah. Daftar ini berdiri di kolom kanan
      // di sebelah judulnya, jadi arah masuk dari luar tepi kanan terbaca
      // seperti kartu yang digeser masuk ke tempatnya — sedangkan naik dari
      // bawah akan bertabrakan arah dengan gerakan scroll pengguna sendiri.
      transition={{
        duration: 0.55,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ x: -6 }}
      className="relative flex h-[clamp(3rem,7.5vw,3.75rem)] w-full max-w-[475px] cursor-default items-center gap-3 rounded-full bg-white py-3 pr-5 pl-[clamp(3.25rem,10vw,4.5rem)] shadow-[0px_0px_20px_5px_rgba(0,0,0,0.1)]"
    >
      {/* Centangnya menyusul SETELAH kartunya duduk, bukan bersamaan. Urutan
          ini yang membuatnya terbaca sebagai "tercentang", bukan sekadar ikut
          meluncur bersama kartunya. Pantulan spring-nya memberi penekanan. */}
      <motion.span
        initial={{ scale: 0, rotate: -45 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 14,
          delay: index * 0.12 + 0.3,
        }}
        className="absolute left-[-6px]"
      >
        <IoCheckmarkCircle className="text-[clamp(2.75rem,8.5vw,4.5rem)] font-bold text-(--accent)" />
      </motion.span>

      <p className="text-[clamp(0.72rem,2.7vw,1rem)] leading-snug font-medium">
        {title}
      </p>
    </motion.div>
  );
};

export default TujuanItem;

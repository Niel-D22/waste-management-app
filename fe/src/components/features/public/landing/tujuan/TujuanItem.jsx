import React from "react";

// react icons checklist
import { IoCheckmarkCircle } from "react-icons/io5";

const TujuanItem = ({ title }) => {
  return (
    <div className="relative flex h-[50px] w-full max-w-[475px] items-center gap-3 rounded-full bg-white px-5 py-3 pl-15 shadow-[0px_0px_20px_5px_rgba(0,0,0,0.1)] sm:h-[60px] sm:pl-18">
      <IoCheckmarkCircle className="absolute left-[-6px] text-6xl font-bold text-(--accent) sm:text-7xl" />
      <p className="text-xs leading-4 font-medium sm:text-[1rem] sm:leading-5">
        {title}
      </p>
    </div>
  );
};

export default TujuanItem;

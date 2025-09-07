import React from "react";
import { useNavigate } from "react-router-dom";
import Btn from "../components/Btn";

const Page404 = () => {
  const navigate = useNavigate();

  const btninfo = [
    {
      label: "Go Home",
      onclick: () => navigate("/"),
    },
    {
      label: "Contact Us",
      onclick: () => navigate("/contact"),
    },
  ];

  return (
    <div
      className=" pt-32 select-none flex flex-col justify-center items-center text-center px-4 py-20  
      relative overflow-hidden transition-all ease-in-out duration-500"
    >
      {/* Background pulse animation */}
      <div className="absolute inset-0  opacity-30 animate-pulse z-0" />

      {/* Main content */}
      <div className="z-10">
        <p className="text-[120px] sm:text-[160px] md:text-[200px] font-extrabold leading-none transform scale-110 animate-bounce">
          404
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 tracking-wide">
          Oops! Page Not Found
        </h1>
        <p className="max-w-xl text-base sm:text-lg text-black dark:text-gray-400 mb-8">
          The page you're looking for might have been removed, renamed, or never
          existed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 z-10">
          {btninfo.map((ele, idx) => (
            <Btn key={idx} btninfo={ele} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page404;

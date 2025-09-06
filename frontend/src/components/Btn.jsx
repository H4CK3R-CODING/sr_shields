import React, { useRef } from "react";
import Loading from "./Loading";
// import Loading from "../../components/Loading";

const Btn = ({ btninfo, loading }) => {
  const btnRef = useRef();

  const baseClasses = "px-6 py-3 bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 text-white font-semibold rounded-full shadow-md hover:scale-105 hover:from-sky-600 hover:to-purple-600 transition-all duration-300 ease-in-out w-full mx-auto";
  const enabledClasses = "bg-heading text-background hover:shadow-lg cursor-pointer";
  const disabledClasses = "bg-heading text-background opacity-60 cursor-not-allowed";

  return (
    <button
      ref={btnRef}
      disabled={loading}
      onClick={btninfo.onclick}
      className={`${baseClasses} ${loading ? disabledClasses : enabledClasses}`}
    >
      {loading ? <Loading size="small" /> : btninfo.label}
    </button>
  );
};

export default Btn;

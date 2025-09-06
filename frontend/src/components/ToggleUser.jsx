import React, { useState } from "react";

const ToggleUser = () => {
  const [role, setRole] = useState("user"); // local state instead of Recoil

  return (
    <div className="flex justify-center mb-8">
      <div
        className="relative w-[240px] h-14 
        bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-300 
        dark:from-indigo-900 dark:via-indigo-950 dark:to-indigo-900
        border border-indigo-200/60 dark:border-indigo-900/60
        rounded-full flex items-center px-1 shadow-xl
        transition-all duration-500"
        style={{
          boxShadow:
            "0 4px 24px 0 rgba(99, 102, 241, 0.15), 0 4px 24px 0 rgba(55, 48, 163, 0.30)",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* Sliding glassmorphic background */}
        <div
          className={`absolute top-1 left-1 h-12 w-[115px] rounded-full transition-transform duration-500 ease-in-out shadow-lg
          ${role === "admin" ? "translate-x-[120px]" : "translate-x-0"}
          bg-white/60 dark:bg-indigo-400/20 border border-indigo-300/40 dark:border-indigo-800/60
          backdrop-blur-md`}
          style={{
            boxShadow:
              "0 2px 8px 0 rgba(99, 102, 241, 0.10), 0 2px 8px 0 rgba(55, 48, 163, 0.25)",
          }}
        ></div>

        {/* Options */}
        {["user", "admin"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`z-10 w-1/2 h-full text-base font-bold tracking-wide uppercase rounded-full
            transition-all duration-300 focus:outline-none active:scale-95
            ${role === r
              ? "text-indigo-900 dark:text-white"
              : "text-indigo-600 hover:text-indigo-800 dark:text-indigo-200 dark:hover:text-white"}`}
            style={{ letterSpacing: "0.08em" }}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToggleUser;

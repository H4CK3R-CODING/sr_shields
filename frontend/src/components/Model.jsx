import React from "react";
import { useNavigate } from "react-router-dom";

const Model = ({ show, closeFun }) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex justify-center items-center px-4">
        <div className="rounded-2xl shadow-xl max-w-md w-full p-6 transition-all
                        bg-gradient-to-tr from-sky-200 via-indigo-100 to-purple-100
                        dark:bg-gradient-to-tr dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 dark:text-white">
          <h2 className="text-2xl font-semibold text-center mb-4">Welcome Back</h2>
          <p className="text-center mb-6 text-sm">
            Please login or sign up to continue, or choose to stay logged out.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                navigate("/signin");
                closeFun();
              }}
              className="w-full py-2 px-4 rounded-lg text-white font-medium bg-indigo-500 hover:bg-indigo-600 transition"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate("/register");
                closeFun();
              }}
              className="w-full py-2 px-4 rounded-lg text-white font-medium bg-sky-500 hover:bg-sky-600 transition"
            >
              Sign Up
            </button>
            <button
              onClick={closeFun}
              className="w-full py-2 px-4 rounded-lg font-medium border border-indigo-400 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-300 dark:text-indigo-100 dark:hover:bg-indigo-900 transition"
            >
              Stay Logged Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Model;

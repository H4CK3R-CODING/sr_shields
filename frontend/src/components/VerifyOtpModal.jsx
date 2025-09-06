import React, { useState } from "react";
import Btn from "./Btn";

const VerifyOtpModal = ({ onClose, onVerify }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onVerify(otp); // parent handles the API verification
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40">
      <div
        className="w-[90%] sm:w-[400px] p-6 rounded-2xl shadow-xl 
        bg-gradient-to-tr from-sky-200 via-indigo-100 to-purple-100 text-gray-900 
        dark:from-sky-900 dark:via-indigo-950 dark:to-purple-900 dark:text-white"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Verify OTP</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="p-3 text-lg rounded-md outline-none 
              bg-white text-gray-800 placeholder-gray-500 border border-indigo-200 
              focus:ring-2 focus:ring-indigo-400 
              dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-700"
            placeholder="Enter 5-digit OTP"
            required
          />

          <Btn
            btninfo={{ label: "Verify", onclick: handleSubmit }}
            loading={loading}
          />
        </form>

        <button
          onClick={onClose}
          className="mt-4 text-sm underline hover:text-red-500 text-center w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpModal;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../InputField";
import Btn from "../Btn";
import toast from "react-hot-toast";
import axios from "axios";

const SetPassword = ({ onClose, gmail }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setIsLoading] = useState(false);

  const inputs = [
    {
      label: "Email",
      name: "email",        // changed from id
      type: "email",        // changed from inputType
      value: gmail,
      readOnly: true,
    },
    {
      label: "OTP",
      name: "otp",
      type: "text",
      placeholder: "Enter OTP",
      value: otp,
      onChange: (e) => setOtp(e.target.value),  // changed from onchange
    },
    {
      label: "Set New Password",
      name: "password",
      type: "password",
      placeholder: "********",
      value: password,
      onChange: (e) => setPassword(e.target.value),
    },
  ];

  const btninfo = {
    label: "Set Password",
    onclick: async (e) => {
      e.preventDefault();

      if (!otp || !password) {
        toast.error("All fields are required.");
        return;
      }

      if (password.length < 6 || password.length > 20) {
        toast.error("Password must be 6–20 characters long.");
        return;
      }

      setIsLoading(true);
      try {
        const config = { headers: { "Content-Type": "application/json" } };
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKENDURL}/api/v1/auth/reset-password`,
          { email: gmail, otp, newPassword: password },
          { withCredentials: true },
          config
        );

        if (data) {
          toast.success(data.message);
          onClose();
          navigate("/signin");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } catch (error) {
        // console.error("SetPassword error:", error);
        toast.error(error.response?.data?.message || "Backend not responding.");
      } finally {
        setIsLoading(false);
      }
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40 px-4 py-10">
      <div className="w-full max-w-xl p-6 rounded-2xl shadow-xl transition-all duration-300 bg-white/90 text-gray-900 backdrop-blur border border-indigo-100 dark:bg-gray-900/80 dark:text-white dark:border-indigo-800">
        <h2 className="text-3xl font-bold mb-6 text-center">Set New Password</h2>
        <form className="space-y-5">
          {inputs.map((input, idx) => (
            <InputField key={idx} {...input} /> 
          ))} {/* Spread props directly */}
          <Btn btninfo={btninfo} loading={loading} />
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

export default SetPassword;

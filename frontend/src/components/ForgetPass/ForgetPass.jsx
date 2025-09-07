import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import SetPassword from "./SetPassword";
import InputField from "../InputField";
import Btn from "../Btn";

const ForgetPass = () => {
  const [loading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [setPassword, setSetPassword] = useState(false);
  const navigate = useNavigate();

  const inputs = [
    {
      label: "Verify Email",
      name: "email",          // must match InputField prop
      placeholder: "yourname@example.com",
      type: "email",           // use type, not inputType
      value: email,
      onChange: (e) => setEmail(e.target.value), // use onChange, not onchange
      required: true,
    },
  ];

  const btninfo = {
    label: "Send OTP",
    onclick: async (e) => {
      e.preventDefault();

      if (!email) {
        toast.error("Please enter your email.");
        return;
      }

      setIsLoading(true);
      try {
        const config = { headers: { "Content-Type": "application/json" } };

        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKENDURL}/api/v1/auth/forgot-password`,
          { email },
          { withCredentials: true },
          config
        );

        if (data) {
          toast.success(data.message);
          setSetPassword(true);
        } else {
          toast.error("Unexpected response. Try again.");
        }
      } catch (error) {
        console.error("ForgetPass error:", error);
        toast.error(error.response?.data?.message || "Backend not responding.");
      } finally {
        setIsLoading(false);
      }
    },
  };

  return (
    <div className="flex justify-center items-center pt-32 px-4 py-20">
      {setPassword && <SetPassword onClose={() => setSetPassword(false)} gmail={email} />}
      <div className="w-full max-w-xl p-6 rounded-2xl shadow-xl bg-white/90 backdrop-blur border border-indigo-100 dark:bg-gray-900/80 dark:text-white dark:border-indigo-800">
        <h2 className="text-3xl font-bold mb-6 text-center">Forgot Password? 🔑</h2>
        <form className="space-y-5">
          {inputs.map((input, idx) => (
            <InputField key={idx} {...input} /> 
          ))}{/* Spread props directly */}
          <Btn btninfo={btninfo} loading={loading} />
        </form>
        <p className="mt-6 text-sm text-center">
          Remembered password?{" "}
          <Link to="/signin" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgetPass;

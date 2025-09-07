import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import ToggleUser from "../components/ToggleUser";
import Btn from "../components/Btn";
import { useSetRecoilState } from "recoil";
import { authState } from "../recoil/globalAtom";

const SignIn = ({ isLoggedIn, setIsLoggedIn, setUserId, setActiveUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // from toggle
  const [isLoading, setIsLoading] = useState(false);
  const setState = useSetRecoilState(authState);

  const navigate = useNavigate();

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     navigate("/");
  //     return;
  //   }
  // }, [isLoggedIn, navigate]);

  const btninfo = {
    label: "Sign In",
    onclick: async (event) => {
      try {
        event.preventDefault();
        setIsLoading(true);

        if (!username || !password) {
          toast.error("Please fill in all fields.");
          return;
        }

        if (password.length < 6 || password.length > 20) {
          toast.error("Password length must be between 6-20");
          return;
        }

        const config = {
          headers: { "Content-Type": "application/json" },
        };

        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKENDURL}/api/v1/auth/signin`,
          { email : username, password, role },
          { withCredentials: true },
          config
        );

        if (data) {
          toast.success(data.message);
          // setIsLoggedIn(true);
          // setUserId(data.userId);
          // setActiveUser(data.activeUser);
          localStorage.setItem("token", data.token);
          setState({ user: data.user, loading: false });
          navigate("/");
        } else {
          toast.error(data.message || "Something went wrong.");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Backend not responding.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen py-20 pt-28 px-4 
      "
    >
      <div
        className="w-full max-w-md p-6 rounded-2xl shadow-lg transition-all duration-300 
        bg-white/90 dark:bg-gray-900/80 backdrop-blur 
        border border-indigo-100 dark:border-indigo-800 text-gray-900 dark:text-white"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>

        {/* ToggleUser for switching role */}
        <div
          onClickCapture={(e) => {
            if (
              e.target.innerText.toLowerCase() === "user" ||
              e.target.innerText.toLowerCase() === "admin"
            ) {
              setRole(e.target.innerText.toLowerCase());
            }
          }}
        >
          <ToggleUser />
        </div>

        {/* Form */}
        <form className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="gaurav@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none 
              transition duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none 
              transition duration-200"
            />
          </div>

          <Link
            to={"/forgetpass"}
            className="text-blue-500 text-sm underline text-right block"
          >
            Forgot password?
          </Link>

          <Btn btninfo={btninfo} loading={isLoading} />
        </form>

        <p className="mt-6 text-sm text-center">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;

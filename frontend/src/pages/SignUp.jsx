import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import ToggleUser from "../components/ToggleUser";
import Btn from "../components/Btn";
import VerifyOtpModal from "../components/VerifyOtpModal";
import { useSetRecoilState } from "recoil";
import { authState } from "../recoil/globalAtom";

const SignUp = ({ isLoggedIn, setIsLoggedIn, setUserId, setActiveUser }) => {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPass: "",
    course: "",
    college: "",
    session: "",
    phone_number: "",
  });

  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const setState = useSetRecoilState(authState);

  const navigate = useNavigate();

  // redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  // validation
  const validateForm = () => {
    const {
      name,
      email,
      password,
      confirmPass,
      course,
      college,
      session,
      phone_number,
    } = signupData;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPass ||
      !course ||
      !college ||
      !session ||
      !phone_number
    ) {
      toast.error("Please fill in all fields.");
      return false;
    }

    if (password.length < 6 || password.length > 20) {
      toast.error("Password length must be between 6-20 characters.");
      return false;
    }

    if (password !== confirmPass) {
      toast.error("Passwords do not match!");
      return false;
    }

    if (!/^\d{10}$/.test(phone_number)) {
      toast.error("Phone number must be 10 digits.");
      return false;
    }

    return true;
  };

  // submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { confirmPass, ...payload } = signupData; // remove confirmPass
      payload.role = role;

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKENDURL}/api/v1/auth/signup`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (data) {
        toast.success(data.message || "Signup successful!");
        // setIsLoggedIn(true);
        // setUserId(data.userId);
        // setActiveUser(data.activeUser);

        setShowOtpModal(true);
        // setState({ user: data.user, loading: false });
        // localStorage.setItem("token", data.jwt);
        // navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Backend not responding.");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 " +
    "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
    "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-200";

  return (
    <div
      className="flex justify-center items-center min-h-screen py-20 pt-28 px-4 
      "
    >
      {showOtpModal && (
        <VerifyOtpModal
          onClose={() => setShowOtpModal(false)}
          onVerify={async (otp) => {
            const email = signupData.email;
            if (!otp || !email) {
              toast.error("Please Enter OTP");
              setIsLoading(false);
              return;
            }

            try {
              const config = {
                headers: { "Content-Type": "application/json" },
              };

              const { data } = await axios.post(
                `${import.meta.env.VITE_BACKENDURL}/api/v1/auth/verify-otp`,
                { email, otp: otp.toString() },
                { withCredentials: true },
                config
              );

              if (data) {
                toast.success(data.message);
                if (data.role === "admin") {
                  toast.error(
                    "Your account is awaiting ChiefAdmin approval. You’ll be able to log in once approved.",
                    { duration: 5000 }
                  );
                }
                setShowOtpModal(false);
                setState({ user: data.user, loading: false });
                localStorage.setItem("token", data.token);
                navigate("/signin");
              } else {
                toast.error("Something went wrong.");
              }
            } catch (error) {
              toast.error(
                error.response?.data?.msg || "Backend not responding."
              );
              console.error(error);
            }
          }}
        />
      )}
      <div
        className="w-full max-w-lg p-6 rounded-2xl shadow-lg transition-all duration-300 
        bg-white/90 dark:bg-gray-900/80 backdrop-blur 
        border border-indigo-100 dark:border-indigo-800 text-gray-900 dark:text-white"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>

        {/* Toggle Role */}
        <div
          onClickCapture={(e) => {
            const text = e.target.innerText.toLowerCase();
            if (text === "user" || text === "admin") setRole(text);
          }}
        >
          <ToggleUser />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={signupData.name}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={signupData.email}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={signupData.password}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          <input
            type="password"
            name="confirmPass"
            placeholder="Confirm Password"
            value={signupData.confirmPass}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          <input
            type="text"
            name="course"
            placeholder="Course"
            value={signupData.course}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          <input
            type="text"
            name="college"
            placeholder="College"
            value={signupData.college}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          <input
            type="text"
            name="session"
            placeholder="Session"
            value={signupData.session}
            onChange={handleChange}
            className={inputClasses}
            required
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={signupData.phone_number}
            onChange={handleChange}
            className={inputClasses}
            required
          />

          <Btn btninfo={{ label: "Sign Up" }} loading={isLoading} />
        </form>

        <p className="mt-6 text-sm text-center">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Btn from "../components/Btn";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-in-out" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      setIsLoading(true);

      if (!formData.name || !formData.email || !formData.message) {
        toast.error("⚠️ Please fill in all fields.");
        setIsLoading(false);
        return;
      }

      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKENDURL}/api/v1/sendMessage`,
        formData,
        { withCredentials: true },
        config
      );

      if (data) {
        toast.success(data.message || "✅ Message sent successfully!");
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ Backend not responding.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const btninfo = {
    label: "🚀 Send Message",
    onclick: handleSubmit,
  };

  return (
    <div className="pt-16 flex flex-col items-center justify-center px-4 sm:px-6 relative">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-indigo-500/10 to-purple-600/20 blur-3xl opacity-50 -z-10" />

      <motion.div
        className="w-full max-w-lg sm:max-w-2xl bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-500"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        data-aos="fade-up"
      >
        {/* Heading */}
        <h2
          className="text-3xl sm:text-5xl font-extrabold text-center mb-6 sm:mb-10 
          bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 
          bg-clip-text text-transparent"
          data-aos="zoom-in"
        >
          Contact Us
        </h2>

        {submitted && (
          <motion.p
            className="text-green-600 dark:text-green-400 text-center mb-6 font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            🎉 Thank you! Your message has been sent.
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Name */}
          <div data-aos="fade-right">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 
              bg-white/90 dark:bg-gray-900 text-gray-900 dark:text-white 
              focus:ring-2 focus:ring-sky-500 focus:ring-opacity-60 
              outline-none transition duration-300 shadow-sm hover:shadow-md"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div data-aos="fade-left">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 
              bg-white/90 dark:bg-gray-900 text-gray-900 dark:text-white 
              focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-60 
              outline-none transition duration-300 shadow-sm hover:shadow-md"
              placeholder="Enter your email"
            />
          </div>

          {/* Message */}
          <div data-aos="fade-up">
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 
              bg-white/90 dark:bg-gray-900 text-gray-900 dark:text-white 
              focus:ring-2 focus:ring-purple-500 focus:ring-opacity-60 
              outline-none transition duration-300 shadow-sm hover:shadow-md resize-none"
              placeholder="Write your message..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-2" data-aos="zoom-in">
            <Btn btninfo={btninfo} loading={isLoading} />
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Contact;

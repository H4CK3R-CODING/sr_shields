import React, { useState } from "react";
import { motion } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    setSubmitted(true);

    // Reset form after submit
    setFormData({ name: "", email: "", message: "" });

    setTimeout(() => setSubmitted(false), 4000); // hide success after 4s
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 relative">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-indigo-500/10 to-purple-600/20 blur-3xl opacity-70 -z-10" />

      <motion.div
        className="w-full max-w-2xl bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-gray-700 rounded-3xl shadow-2xl p-10 transition-colors duration-500"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, rotateX: 4, rotateY: -4 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <h2 className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Contact Us
        </h2>

        {submitted && (
          <motion.p
            className="text-green-600 dark:text-green-400 text-center mb-5 font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ✅ Thank you! Your message has been sent.
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
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
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition transform focus:scale-[1.02] shadow-md"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
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
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition transform focus:scale-[1.02] shadow-md"
              placeholder="Enter your email"
            />
          </div>

          {/* Message */}
          <div>
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
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition transform focus:scale-[1.02] shadow-md"
              placeholder="Write your message..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 Send Message
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Contact;

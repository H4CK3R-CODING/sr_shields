import React, { useState } from "react";

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
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl bg-white/60 dark:bg-black/40 backdrop-blur-lg border border-white/30 dark:border-gray-700 rounded-2xl shadow-xl p-8 transition-colors duration-500">
        <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 text-center mb-6">
          Contact Us
        </h2>

        {submitted && (
          <p className="text-green-600 dark:text-green-400 text-center mb-4">
            ✅ Thank you! Your message has been sent.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Enter your email"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Write your message..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold hover:opacity-90 hover:scale-[1.02] transition shadow-md"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;

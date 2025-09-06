import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="w-[95vw] max-w-[1400px] mx-auto mt-20 p-12 rounded-3xl shadow-2xl
        bg-gradient-to-br from-white/60 via-sky-50/50 to-purple-50/40
        dark:from-gray-900/70 dark:via-gray-800/60 dark:to-gray-900/80
        backdrop-blur-xl border border-white/30 dark:border-gray-700
        transition-colors duration-500"
    >
      {/* Footer Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* About Section */}
        <div>
          <h3
            className="text-3xl font-extrabold mb-4
              bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600
              dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400
              bg-clip-text text-transparent"
          >
            About Us
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            SR-Shields keeps you updated with the latest notices, events, and
            academic activities. Join our platform to stay informed, empowered,
            and ahead of the curve.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3
            className="text-3xl font-extrabold mb-4
              bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600
              dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400
              bg-clip-text text-transparent"
          >
            Quick Links
          </h3>
          <ul className="space-y-3 text-gray-800 dark:text-gray-200">
            {[
              { name: "Registration", link: "/registration" },
              { name: "Job Fair", link: "/jobs" },
              { name: "Hackathon", link: "/hackathon" },
              { name: "Guest Lecture", link: "/lecture" },
            ].map((item, idx) => (
              <li key={idx}>
                <a
                  href={item.link}
                  className="group relative inline-block font-medium"
                >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                    {item.name}
                  </span>
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-500 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Links */}
        <div className="text-center md:text-left">
          <h3
            className="text-3xl font-extrabold mb-4
              bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600
              dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400
              bg-clip-text text-transparent"
          >
            Follow Us
          </h3>
          <div className="flex justify-center md:justify-start space-x-6 flex-wrap gap-3">
            <a
              href="https://www.youtube.com/@mrsrshield"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 shadow-md
                hover:scale-110 hover:shadow-lg hover:shadow-red-400/30 transition-all duration-300"
            >
              <Youtube size={24} />
            </a>
            <a
              href="https://www.instagram.com/iam_sr______/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400 shadow-md
                hover:scale-110 hover:shadow-lg hover:shadow-pink-400/30 transition-all duration-300"
            >
              <Instagram size={24} />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-md
                hover:scale-110 hover:shadow-lg hover:shadow-blue-400/30 transition-all duration-300"
            >
              <Facebook size={24} />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-500 dark:text-sky-300 shadow-md
                hover:scale-110 hover:shadow-lg hover:shadow-sky-400/30 transition-all duration-300"
            >
              <Twitter size={24} />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-md
                hover:scale-110 hover:shadow-lg hover:shadow-indigo-400/30 transition-all duration-300"
            >
              <Linkedin size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-12 pt-6 border-t border-white/30 dark:border-gray-700 text-center py-1 relative">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-blue-500 dark:text-blue-400">
            SR-Shields
          </span>
          . All rights reserved.
        </p>
        {/* Gradient strip animation */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-1 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 animate-pulse"></div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import { Instagram, Youtube } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { IoMailOpenOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

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

        {/* Publisher Section */}
        <div>
          <h3
            className="text-3xl font-extrabold mb-4
              bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600
              dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400
              bg-clip-text text-transparent"
          >
            Publisher
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Published & Managed by{" "}
            <Link to={"/developer"}><span className="font-semibold underline text-blue-500 dark:text-blue-400">
              Gaurav Rathour
            </span></Link>
            . Dedicated to providing accurate and timely updates for students
            and professionals.
          </p>
        </div>

        {/* Resources Section */}
        <div>
          <h3
            className="text-3xl font-extrabold mb-4
              bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600
              dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400
              bg-clip-text text-transparent"
          >
            Resources
          </h3>
          <ul className="space-y-3 text-gray-800 dark:text-gray-200">
            {[
              { name: "Privacy Policy", link: "/privacy" },
              { name: "Terms & Conditions", link: "/terms" },
              { name: "Help & Support", link: "/help" },
              { name: "Contact Us", link: "/contact" },
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
      </div>

      {/* Social Links */}
      <div className="mt-12 flex justify-center gap-5 flex-wrap">
        <a
          href="https://www.youtube.com/@mrsrshield"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 shadow-md
            hover:scale-110 hover:shadow-lg hover:shadow-red-400/30 transition-all duration-300"
        >
          <Youtube size={28} />
        </a>
        <a
          href="https://www.instagram.com/iam_sr______/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400 shadow-md
            hover:scale-110 hover:shadow-lg hover:shadow-pink-400/30 transition-all duration-300"
        >
          <Instagram size={28} />
        </a>
        <a
          href="https://wa.me/+918607550898"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 shadow-md
            hover:scale-110 hover:shadow-lg hover:shadow-green-400/30 transition-all duration-300"
        >
          <SiWhatsapp size={28} />
        </a>
        <a
          href="mailto:souravrathour02@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 shadow-md
            hover:scale-110 hover:shadow-lg hover:shadow-blue-400/30 transition-all duration-300"
        >
          <IoMailOpenOutline size={28} />
        </a>
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

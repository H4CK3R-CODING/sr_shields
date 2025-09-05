import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="w-[90vw] max-w-[1400px] mx-auto mt-16 p-10 rounded-3xl shadow-2xl
        bg-white/50 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-gray-700
        transition-colors duration-500"
    >
      {/* Footer Top */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start space-y-10 md:space-y-0">
        
        {/* About Section */}
        <div className="flex-1">
          <h3 className="text-3xl font-extrabold mb-4
            bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600
            dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400
            bg-clip-text text-transparent"
          >
            About Us
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            SR-Shields keeps you updated with the latest notices, events, and academic activities. 
            Join our platform to stay informed, empowered, and ahead of the curve.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex-1">
          <h3 className="text-3xl font-extrabold mb-4
            bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600
            dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400
            bg-clip-text text-transparent"
          >
            Quick Links
          </h3>
          <ul className="space-y-3 text-gray-800 dark:text-gray-200">
            <li>
              <a className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300" href="/registration">
                Registration
              </a>
            </li>
            <li>
              <a className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300" href="/jobs">
                Job Fair
              </a>
            </li>
            <li>
              <a className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300" href="/hackathon">
                Hackathon
              </a>
            </li>
            <li>
              <a className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300" href="/lecture">
                Guest Lecture
              </a>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl font-extrabold mb-4
            bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600
            dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400
            bg-clip-text text-transparent"
          >
            Follow Us
          </h3>
          <div className="flex justify-center md:justify-start space-x-6">
            
            <a href="https://www.youtube.com/@mrsrshield" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300 text-blue-400 dark:text-blue-300">
              <Youtube size={28} />
            </a>
            <a href="https://www.instagram.com/iam_sr______/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300 text-pink-500 dark:text-pink-400">
              <Instagram size={28} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-12 border-t border-white/30 dark:border-gray-700 pt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
        © {new Date().getFullYear()} <span className="font-semibold">SR-Shields</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

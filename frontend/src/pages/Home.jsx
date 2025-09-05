import React from "react";
import { ArrowRight } from "lucide-react";
import AnnouncementBar from "../components/Announcement";
import NewsTicker from "../components/Announcement";
import Announcement from "../components/Announcement";
import AnnouncementSection from "../components/Announcement";

const Home = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center text-center px-6 space-y-10 transition-colors duration-500
      "
    >
      {/* Heading */}
      <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent animate-fadeIn drop-shadow-lg">
        Welcoϻe 𝐓𝐨 <span className="italic">✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆</span>
      </h2>

      {/* Subtext */}
      <p className="max-w-2xl text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed animate-fadeIn delay-200">
        Explore our services, learn new skills, and stay ahead with technology.  
        Join us on a journey of <span className="font-semibold text-blue-600 dark:text-blue-400">knowledge</span>,  
        <span className="font-semibold text-purple-600 dark:text-purple-400"> innovation</span>, and  
        <span className="font-semibold text-indigo-600 dark:text-indigo-400"> empowerment</span>.
      </p>

      {/* Card Style Section */}
      <div
        className="w-full max-w-3xl p-6 rounded-2xl shadow-xl backdrop-blur-lg transition-colors duration-500
        bg-white/60 dark:bg-black/40 border border-white/30 dark:border-gray-700 animate-fadeIn delay-400"
      >
        <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
          Why Choose Us?
        </h3>
        <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-lg">
          <li>🚀 Fast & Reliable Cyber Services</li>
          <li>📚 Learn Digital Skills with Expert Guidance</li>
          <li>🔒 Secure & Trusted Platform for All</li>
        </ul>
      </div>

      {/* Call-to-Action Buttons */}
      <div className="flex flex-wrap gap-4 animate-fadeIn delay-600">
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-lg hover:scale-105 duration-300">
          Get Started <ArrowRight size={18} />
        </button>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-lg hover:scale-105 duration-300">
          Learn More
        </button>
      </div>
      <div>
        <AnnouncementSection/>
      </div>
    </div>
  );
};

export default Home;

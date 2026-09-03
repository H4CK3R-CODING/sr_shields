import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import AnnouncementSection from "../components/Announcement";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import StatsSection from "../components/StatsSection";
import ImportantLinksSection from "../components/ImportantLinksSection";
import { useRecoilValue } from "recoil";
import { authState } from "../recoil/globalAtom";

// Animation variants for framer-motion (optional)
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay },
  }),
};

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);
  const { user } = useRecoilValue(authState);

  const userRole = user?.role;

  const stats = [
    { label: "Active Users", value: 1240 },
    { label: "Announcements Posted", value: 325 },
    { label: "Notices Published", value: 87 },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center text-center px-6 space-y-10 transition-colors duration-500">
      <div className="w-full flex flex-col justify-center items-center text-center px-4 py-10">
        {/* Heading */}
        <motion.h2
          data-aos="zoom-in"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold 
        bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 
        dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400 
        bg-clip-text text-transparent drop-shadow-lg leading-snug"
        >
          Welcoϻe 𝐓𝐨{" "}
          <span className="italic">✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          data-aos="fade-up"
          data-aos-delay="200"
          className="max-w-2xl mt-4 text-base sm:text-lg md:text-xl text-gray-700 
        dark:text-gray-300 leading-relaxed mx-auto"
        >
          Explore our services, learn new skills, and stay ahead with
          technology. Join us on a journey of{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            knowledge
          </span>
          ,{" "}
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            innovation
          </span>
          , and{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            empowerment
          </span>
          .
        </motion.p>

        {/* Call-to-Action Buttons */}
        <motion.div
          data-aos="fade-up"
          data-aos-delay="500"
          className="flex flex-wrap justify-center gap-4 mt-6"
        >
          <Link to={"/join"}>
            <motion.button
              whileHover={{ scale: 1.07, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl 
      bg-gradient-to-r from-sky-500 to-indigo-500 
      text-white font-semibold shadow-lg flex items-center gap-2 
      transition-all duration-300"
            >
              Join WhatsApp Groups <ArrowRight size={18} />
            </motion.button>
          </Link>

          <Link to={"/receipt"}>
            <motion.button
              whileHover={{ scale: 1.07, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl 
      bg-gradient-to-r from-pink-500 to-red-500 
      text-white font-semibold shadow-lg flex items-center gap-2 
      transition-all duration-300"
            >
              Generate Receipt <ArrowRight size={18} />
            </motion.button>
          </Link>

          <Link to={"/about"}>
            <motion.button
              whileHover={{ scale: 1.07, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl 
      bg-gradient-to-r from-purple-500 to-indigo-500 
      text-white font-semibold shadow-lg flex items-center gap-2 
      transition-all duration-300"
            >
              Learn More
            </motion.button>
          </Link>

          {/* ADD TRANSACTION */}
          {userRole === "admin" && (
            <Link to={"/cashbook"}>
              <motion.button
                whileHover={{ scale: 1.07, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl 
      bg-gradient-to-r from-emerald-500 to-teal-500 
      hover:from-emerald-600 hover:to-teal-600
      text-white font-semibold shadow-lg 
      shadow-emerald-500/20
      flex items-center gap-2 
      transition-all duration-300"
              >
                Add Transaction
              </motion.button>
            </Link>
          )}

          {/* SALES REPORT */}
          {userRole === "admin" && (
            <Link to={"/sales-report"}>
              <motion.button
                whileHover={{ scale: 1.07, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl 
      bg-gradient-to-r from-blue-600 to-cyan-500 
      hover:from-blue-700 hover:to-cyan-600
      text-white font-semibold shadow-lg 
      shadow-blue-500/20
      flex items-center gap-2 
      transition-all duration-300"
              >
                View Sales Report
              </motion.button>
            </Link>
          )}

          {userRole === "admin" && (
            <Link to="/send-notification">
              <motion.button
                whileHover={{ scale: 1.07, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl
      bg-gradient-to-r from-blue-600 to-cyan-500
      hover:from-blue-700 hover:to-cyan-600
      text-white font-semibold shadow-lg
      shadow-blue-500/20
      flex items-center gap-2
      transition-all duration-300"
              >
                Send Notification
              </motion.button>
            </Link>
          )}
        </motion.div>
      </div>

      {/* Announcements Section */}
      <div
        data-aos="fade-up"
        data-aos-delay="300"
        className="w-full flex justify-center mt-8"
      >
        <AnnouncementSection />
      </div>

      <div
        data-aos="fade-up"
        data-aos-delay="300"
        className="w-full flex justify-center mt-8"
      >
        <ImportantLinksSection />
      </div>

      {/* ...existing content... */}

      <StatsSection />

      {/* ...rest of the page... */}

      {/* Why Choose Card */}
      <div
        data-aos="zoom-in"
        data-aos-delay="400"
        className="w-full max-w-3xl p-6 rounded-2xl shadow-xl backdrop-blur-lg transition-colors duration-500
        bg-white/60 dark:bg-black/40 border border-white/30 dark:border-gray-700"
      >
        <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
          Why Choose SR-Shields?
        </h3>
        <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-lg">
          <li>📰 Stay Updated with Latest University Notices & Events</li>
          <li>💼 Access Job Alerts and Internship Opportunities Quickly</li>
          <li>📝 Submit Forms Easily for Scholarships, Jobs & More</li>
          <li>🔒 Reliable & Secure Platform for All Educational Updates</li>
          <li>🚀 User-Friendly Interface for Faster Information Access</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;

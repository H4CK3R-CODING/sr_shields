import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import AnnouncementSection from "../components/Announcement";
import { Link } from "react-router-dom";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay },
  }),
};

const Home = () => {
  return (
    <div className="min-h-screen mt-20 flex flex-col items-center text-center px-6 space-y-10 transition-colors duration-500">
      {/* Heading */}
      <motion.h2
        initial="hidden"
        animate="visible"
        custom={0.1}
        variants={fadeInUp}
        className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 
        dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-lg"
        whileHover={{ rotateX: 10, rotateY: -10, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        Welcoϻe 𝐓𝐨 <span className="italic">✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆</span>
      </motion.h2>

      {/* Subtext */}
      <motion.p
        initial="hidden"
        animate="visible"
        custom={0.3}
        variants={fadeInUp}
        className="max-w-2xl text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed"
        whileHover={{ scale: 1.02 }}
      >
        Explore our services, learn new skills, and stay ahead with technology.
        Join us on a journey of{" "}
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          knowledge
        </span>
        ,
        <span className="font-semibold text-purple-600 dark:text-purple-400">
          {" "}
          innovation
        </span>
        , and
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
          {" "}
          empowerment
        </span>
        .
      </motion.p>

      {/* Card Style Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0.5}
        variants={fadeInUp}
        whileHover={{ rotateY: 6, rotateX: -6, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 120 }}
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
      </motion.div>

      {/* Call-to-Action Buttons */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0.7}
        variants={fadeInUp}
        className="flex flex-wrap gap-4"
      >
        <motion.button
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold 
          shadow-lg flex items-center gap-2"
          whileHover={{ scale: 1.08, rotateX: 5, rotateY: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          Get Started <ArrowRight size={18} />
        </motion.button>

        <Link to={"/about"}>
        <motion.button
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold 
          shadow-lg flex items-center gap-2"
          whileHover={{ scale: 1.08, rotateX: -5, rotateY: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          Learn More
        </motion.button></Link>
      </motion.div>

      {/* Announcements Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0.9}
        variants={fadeInUp}
        className="w-full max-w-4xl mt-8"
        whileHover={{ scale: 1.02 }}
      >
        <AnnouncementSection />
      </motion.div>
    </div>
  );
};

export default Home;

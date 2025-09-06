import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Sample announcement data
const announcements = [
  { id: 1, title: "New Semester Registration Open", url: "/registration" },
  { id: 2, title: "Job Fair on 15th Sept", url: "/jobs" },
  { id: 3, title: "Hackathon Registration Deadline", url: "/hackathon" },
  { id: 4, title: "Guest Lecture on AI", url: "/lecture" },
  { id: 5, title: "Library Books Return Date Extended", url: "/library" },
];

const AnnouncementSection = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className="w-[90vw] max-w-[1200px] h-[620px] rounded-3xl overflow-hidden shadow-2xl relative 
  bg-gradient-to-br from-sky-100/90 via-indigo-200/80 to-purple-200/80 
  dark:from-gray-900/95 dark:to-gray-800/90 
  backdrop-blur-lg border border-gray-200 dark:border-gray-700 mx-auto flex flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <h2
        className="text-3xl font-extrabold p-5 border-b dark:border-gray-700 
  text-gray-900 dark:text-gray-100 flex items-center gap-3"
      >
        Announcements
      </h2>

      {/* Scrolling List */}
      <div className="relative flex-1 overflow-hidden">
        {/* Fade effect top */}
        <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-sky-100/90 dark:from-gray-900 to-transparent z-10" />

        <div
          className={`flex flex-col space-y-6 animate-scroll-smooth`}
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {[...announcements, ...announcements].map((item, index) => (
            <motion.a
              key={item.id + "_" + index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-2xl relative
            bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
            dark:from-blue-700 dark:via-indigo-800 dark:to-purple-700
            text-white font-semibold shadow-lg
            hover:shadow-2xl transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.05,
                rotateX: 6,
                rotateY: -6,
                boxShadow: "0px 12px 30px rgba(59,130,246,0.6)",
              }}
              whileTap={{ scale: 0.96 }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/30 to-pink-500/30 blur-xl opacity-0"
                whileHover={{ opacity: 1, scale: 1.15 }}
                transition={{ duration: 0.4 }}
              />
              <span className="relative z-10">{item.title}</span>
            </motion.a>
          ))}
        </div>

        {/* Fade effect bottom */}
        <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-sky-100/90 dark:from-gray-900 to-transparent z-10" />
      </div>

      {/* View All Button */}
      <div className="p-4 border-t dark:border-gray-700 text-center">
        <Link
          to="/announcements"
          className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 
      text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] transition-all"
        >
          View All Announcements
        </Link>
      </div>
    </div>
  );
};

export default AnnouncementSection;

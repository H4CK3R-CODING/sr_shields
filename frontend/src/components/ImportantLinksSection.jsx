import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { authState } from "../recoil/globalAtom";
import { useRecoilValue } from "recoil";

const ImportantLinksSection = () => {
  const { user } = useRecoilValue(authState);
  const [isPaused, setIsPaused] = useState(false);

  // Dummy Links (Backend से लाना हो तो API कॉल कर सकते हो)
  const links = [
    { _id: "1", title: "Official Website", url: "https://example.com" },
    { _id: "2", title: "Student Portal", url: "https://portal.example.com" },
    { _id: "3", title: "E-Library", url: "https://library.example.com" },
    { _id: "4", title: "Help Desk", url: "https://help.example.com" },
    { _id: "5", title: "Exam Notices", url: "https://exam.example.com" },
  ];

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-out-cubic" });
  }, []);

  return (
    <div
      className="w-full max-w-[1200px] min-h-[400px] md:h-[620px] rounded-3xl overflow-hidden shadow-2xl relative 
      bg-gradient-to-br from-pink-100/90 via-purple-200/80 to-indigo-200/80 
      dark:from-gray-900/95 dark:to-gray-800/90 
      backdrop-blur-lg border border-gray-200 dark:border-gray-700 mx-auto flex flex-col p-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-aos="fade-up"
    >
      {/* Header */}
      <h2
        className="text-3xl font-extrabold p-5 border-b dark:border-gray-700 
        text-gray-900 dark:text-gray-100 flex items-center gap-3"
        data-aos="fade-down"
        data-aos-delay="100"
      >
        📌 Important Links
      </h2>

      {/* If user not logged in */}
      {!user ? (
        <div
          className="flex-1 flex items-center justify-center text-center"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          <div className="p-10 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl">
            <h3 className="text-2xl font-bold mb-3">🔒 Access Restricted</h3>
            <p className="text-lg">You must be logged in to view important links.</p>
            <Link
              to="/signin"
              className="mt-5 inline-block px-6 py-2 rounded-xl bg-white text-indigo-600 font-semibold shadow-md hover:shadow-lg hover:scale-[1.05] transition-all duration-300"
            >
              Login Now
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Links Scroll */}
          <div className="relative flex-1 overflow-hidden mt-4">
            <div
              className="flex flex-col gap-4 animate-vertical-scroll"
              style={{ animationPlayState: isPaused ? "paused" : "running" }}
            >
              {links.length > 0 ? (
                [...links, ...links].map((item, index) => (
                  <motion.div
                    key={item._id + "_" + index}
                    whileHover={{
                      scale: 1.05,
                      rotateX: 6,
                      rotateY: -6,
                      boxShadow: "0px 12px 30px rgba(236,72,153,0.5)",
                    }}
                    whileTap={{ scale: 0.96 }}
                    data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                    data-aos-delay={index * 100}
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-6 rounded-2xl relative
                      bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
                      dark:from-pink-700 dark:via-purple-800 dark:to-indigo-700
                      text-white font-semibold shadow-lg
                      hover:shadow-2xl transition-all duration-500 cursor-pointer"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/30 to-pink-500/30 blur-xl opacity-0"
                        whileHover={{ opacity: 1, scale: 1.15 }}
                        transition={{ duration: 0.4 }}
                      />
                      <span className="relative z-10">{item.title}</span>
                    </a>
                  </motion.div>
                ))
              ) : (
                <p
                  className="text-center text-gray-600 dark:text-gray-300 text-lg mt-8"
                  data-aos="fade-up"
                >
                  😔 No links available.
                </p>
              )}
            </div>
          </div>

          {/* View All Button */}
          <div
            className="p-4 border-t dark:border-gray-700 text-center"
            data-aos="zoom-in"
            data-aos-delay="400"
          >
            <Link
              to="/important-links"
              className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 
              text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.05] transition-all duration-300"
            >
              View All Links
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ImportantLinksSection;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch announcements from backend
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = { limit: 10 }; // add pagination/search if needed
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKENDURL}/api/v1/announcement`,
        { params, withCredentials: true }
      );
      setAnnouncements(data.data || []);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
      AOS.refresh(); // refresh AOS after updating
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    AOS.init({ duration: 1000, once: true, easing: "ease-out-cubic" });
  }, []);

  // Skeleton loader
  const Skeleton = () => (
    <div className="animate-pulse p-6 rounded-2xl bg-gray-300 dark:bg-gray-700 h-20 w-full" />
  );

  return (
    <div
      className="w-full max-w-[1200px] min-h-[400px] md:h-[620px] rounded-3xl overflow-hidden shadow-2xl relative 
      bg-gradient-to-br from-sky-100/90 via-indigo-200/80 to-purple-200/80 
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
        Latest Updates
      </h2>

      {/* Announcements Scroll */}
      <div className="relative flex-1 overflow-hidden mt-4">
        <div
          className="flex flex-col gap-4 animate-vertical-scroll"
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, idx) => <Skeleton key={idx} />)
          ) : announcements.length > 0 ? (
            [...announcements, ...announcements].map((item, index) => (
              <motion.div
                key={item._id + "_" + index}
                whileHover={{
                  scale: 1.05,
                  rotateX: 6,
                  rotateY: -6,
                  boxShadow: "0px 12px 30px rgba(59,130,246,0.6)",
                }}
                whileTap={{ scale: 0.96 }}
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                data-aos-delay={index * 100}
              >
                <Link
                  to={`/announcement/${item._id}`}
                  className={`block p-6 rounded-2xl relative
      bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
      dark:from-blue-700 dark:via-indigo-800 dark:to-purple-700
      text-white font-semibold shadow-lg
      hover:shadow-2xl transition-all duration-500 cursor-pointer`}
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/30 to-pink-500/30 blur-xl opacity-0"
                    whileHover={{ opacity: 1, scale: 1.15 }}
                    transition={{ duration: 0.4 }}
                  />
                  <span className="relative z-10">{item.title}</span>
                </Link>
              </motion.div>
            ))
          ) : (
            <p
              className="text-center text-gray-600 dark:text-gray-300 text-lg mt-8"
              data-aos="fade-up"
            >
              😔 No announcements found.
            </p>
          )}
        </div>

        {/* Vertical Scroll CSS */}
        <style>{`
          @keyframes vertical-scroll {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .animate-vertical-scroll {
            display: flex;
            flex-direction: column;
            animation: vertical-scroll 20s linear infinite;
          }
        `}</style>
      </div>

      {/* View All Button */}
      <div
        className="p-4 border-t dark:border-gray-700 text-center"
        data-aos="zoom-in"
        data-aos-delay="400"
      >
        <Link
          to="/announcements"
          className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 
          text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.05] transition-all duration-300"
        >
          View All Announcements
        </Link>
      </div>
    </div>
  );
};

export default AnnouncementSection;

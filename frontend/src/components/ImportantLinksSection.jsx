import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const links = [
  {
    title: "Student Login – KUK University",
    url: "https://iums.kuk.ac.in/login.htm?type=login&failure=true",
    description:
      "Access your personalized student dashboard at Kurukshetra University. Log in to check attendance, internal marks, notices, and official updates anytime.",
  },
  {
    title: "Syllabus – Kurukshetra University",
    url: "https://kuk.ac.in/syllabi/",
    description:
      "Download the latest course syllabus for all programs at Kurukshetra University. Stay updated with your academic curriculum, exam patterns, and subject outlines.",
  },
  {
    title: "Exam Results – KUK University",
    url: "https://iums.kuk.ac.in/anon_studentResultReport.htm",
    description:
      "View your semester and annual results instantly on the Kurukshetra University portal. Get accurate, updated marks and performance reports securely.",
  },
];

const ImportantLinks = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div
      className="w-full max-w-[1200px] min-h-[400px] rounded-3xl overflow-hidden shadow-2xl relative 
      bg-gradient-to-br from-sky-100/90 via-indigo-200/80 to-purple-200/80 
      dark:from-gray-900/95 dark:to-gray-800/90 
      backdrop-blur-lg border border-gray-200 dark:border-gray-700 mx-auto flex flex-col p-4"
      data-aos="fade-up"
    >
      {/* Header */}
      <h2
        className="text-2xl sm:text-3xl font-extrabold p-4 border-b dark:border-gray-700 
        text-gray-900 dark:text-gray-100 flex items-center gap-3"
        data-aos="fade-down"
        data-aos-delay="100"
      >
        🔗 Important Links
      </h2>

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {links.map((link, index) => (
          <motion.div
            key={index}
            whileHover={{
              scale: 1.05,
              rotateX: 4,
              rotateY: -4,
              boxShadow: "0px 15px 40px rgba(99,102,241,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
            data-aos-delay={index * 150}
            className="relative group"
          >
            {/* Card */}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative p-6 rounded-2xl 
                bg-white/80 dark:bg-gray-800/30
                border border-gray-200 dark:border-gray-700
                backdrop-blur-md
                text-gray-900 dark:text-gray-100 shadow-lg overflow-hidden
                hover:border-indigo-400/60 hover:shadow-2xl
                transition-all duration-500"
            >
              {/* Gradient Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />

              {/* Card Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  {link.title}
                  <ExternalLink className="h-4 w-4 text-indigo-500 group-hover:rotate-12 transition-transform duration-300" />
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {link.description}
                </p>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ImportantLinks;

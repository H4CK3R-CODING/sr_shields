import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { SiInstagram, SiWhatsapp } from "react-icons/si";
import { IoMailOpenOutline } from "react-icons/io5";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay },
  }),
};

const About = () => {
  const features = [
    {
      title: "University Updates",
      desc: "Stay updated with notices, announcements, and academic alerts from your university.",
      icon: <CheckCircle size={28} className="text-blue-500" />,
    },
    {
      title: "Job Notifications",
      desc: "Get notified about state and central government jobs, internships, and career opportunities.",
      icon: <CheckCircle size={28} className="text-green-500" />,
    },
    {
      title: "Forms & Applications",
      desc: "Easily fill scholarship forms, government forms, and job applications online without hassle.",
      icon: <CheckCircle size={28} className="text-purple-500" />,
    },
    {
      title: "Trusted & Secure",
      desc: "We ensure that all the information is verified and reliable to keep you safe online.",
      icon: <CheckCircle size={28} className="text-red-500" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-16 space-y-12">
      {/* Heading */}
      <motion.h1
        initial="hidden"
        animate="visible"
        custom={0.1}
        variants={fadeInUp}
        className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 dark:from-sky-300 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent text-center drop-shadow-lg"
        whileHover={{ rotateX: 10, rotateY: -10, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        About <span className="italic">✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆</span>
      </motion.h1>

      {/* Profile Section */}
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial="hidden"
        animate="visible"
        custom={0.2}
        variants={fadeInUp}
      >
        {/* Profile Image with Hover Overlay */}
        <div className="relative group">
          <img
            src="/profile.jpeg" // 👉 replace with your profile image path
            alt="Profile"
            className="w-56 h-56 rounded-full border-4 border-indigo-500 shadow-2xl object-cover"
          />

          {/* Social Icons on Hover */}
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="flex gap-6">
              <SiInstagram
                onClick={() =>
                  window.open("https://www.instagram.com/iam_sr______/")
                }
                className="w-8 h-8 cursor-pointer text-pink-500 hover:scale-110 transition-transform"
              />
              <SiWhatsapp
                onClick={() => window.open("https://wa.me/+918607550898")}
                className="w-8 h-8 cursor-pointer text-green-500 hover:scale-110 transition-transform"
              />
              <IoMailOpenOutline
                onClick={() => window.open("mailto:souravrathour02@gmail.com")}
                className="w-8 h-8 cursor-pointer text-blue-500 hover:scale-110 transition-transform"
              />
            </div>
          </div>
        </div>

        {/* Profile Name */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Mr. Sourav Rathour
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Founder of ✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆
        </p>
      </motion.div>

      {/* Subheading */}
      <motion.p
        initial="hidden"
        animate="visible"
        custom={0.3}
        variants={fadeInUp}
        className="max-w-3xl text-lg md:text-xl text-gray-700 dark:text-gray-300 text-center leading-relaxed"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        We provide{" "}
        <b>
          all the latest updates about jobs, university notifications, and
          different types of forms
        </b>{" "}
        such as scholarships, government forms, and job applications. Our goal
        is to keep you informed, save your time, and empower you with reliable
        and trustworthy information.
      </motion.p>

      {/* Features / Services */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full"
        initial="hidden"
        animate="visible"
        custom={0.5}
        variants={fadeInUp}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex flex-col p-6 rounded-3xl bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-xl border border-white/30 dark:border-gray-700 cursor-pointer will-change-transform"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index, type: "spring", stiffness: 100 }}
            whileHover={{
              rotateX: 2,
              rotateY: -2,
              scale: 1.03,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="mt-8"
        initial="hidden"
        animate="visible"
        custom={0.9}
        variants={fadeInUp}
      >
        <motion.div
          whileHover={{
            scale: 1.05,
            rotateX: 3,
            rotateY: -3,
            transition: { duration: 0.3, ease: "easeOut" },
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/contact"
            className="inline-block px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all will-change-transform"
          >
            Contact Us
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;

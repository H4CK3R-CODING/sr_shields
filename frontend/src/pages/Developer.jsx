import React from "react";
import { motion } from "framer-motion";
import { SiInstagram, SiWhatsapp, SiGithub, SiLinkedin } from "react-icons/si";
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

const Developer = () => {
  const skills = [
    {
      title: "Full Stack Development",
      desc: "Building scalable web apps with modern frontend & backend tech.",
      icon: "💻",
      color: "from-sky-500 to-indigo-500",
    },
    {
      title: "UI/UX Enthusiast",
      desc: "Designing smooth, user-friendly and attractive interfaces.",
      icon: "🎨",
      color: "from-pink-500 to-purple-500",
    },
    {
      title: "Cloud & Security",
      desc: "Exploring AWS, Azure and focusing on secure applications.",
      icon: "☁️",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Problem Solving",
      desc: "Strong in DSA & passionate about solving real-world challenges.",
      icon: "⚡",
      color: "from-yellow-500 to-orange-500",
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
        Meet The <span className="italic">Developer 🚀</span>
      </motion.h1>

      {/* Profile Image with hover socials */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0.2}
        variants={fadeInUp}
        className="relative group"
      >
        <img
          src="/developer.jpg" // 👉 replace with your image
          alt="Developer"
          className="w-56 h-56 md:w-72 md:h-72 rounded-full border-4 border-indigo-500 shadow-2xl object-cover"
        />

        {/* Hover Social Overlay */}
        <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="flex flex-wrap justify-center items-center gap-7 w-48">
            <SiInstagram
              onClick={() =>
                window.open("https://www.instagram.com/mr.gaurav_rathour/")
              }
              className="w-9 h-9 cursor-pointer text-pink-500 hover:scale-125 transition-transform"
            />
            <SiWhatsapp
              onClick={() => window.open("https://wa.me/+919306341448")}
              className="w-9 h-9 cursor-pointer text-green-500 hover:scale-125 transition-transform"
            />
            <IoMailOpenOutline
              onClick={() => window.open("mailto:gauravrathour0786@gmail.com")}
              className="w-9 h-9 cursor-pointer text-blue-500 hover:scale-125 transition-transform"
            />
            <SiGithub
              onClick={() => window.open("https://github.com/H4CK3R-CODING")}
              className="w-9 h-9 cursor-pointer text-gray-200 hover:scale-125 transition-transform"
            />
            <SiLinkedin
              onClick={() =>
                window.open("https://www.linkedin.com/in/gaurav-rathour-85b878264/")
              }
              className="w-9 h-9 cursor-pointer text-sky-500 hover:scale-125 transition-transform"
            />
          </div>
        </div>
      </motion.div>

      {/* Name, Title & Permanent Socials */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0.3}
        variants={fadeInUp}
        className="text-center space-y-4"
      >
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Gaurav Rathour
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Full Stack Developer | UI/UX Enthusiast | Cyber Security Learner
        </p>

        {/* Permanent Social Icons */}
        <div className="flex justify-center gap-8 mt-4">
          <SiInstagram
            onClick={() =>
              window.open("https://www.instagram.com/mr.gaurav_rathour/")
            }
            className="w-8 h-8 cursor-pointer text-pink-500 hover:scale-125 transition-transform"
          />
          <SiWhatsapp
            onClick={() => window.open("https://wa.me/+919306341448")}
            className="w-8 h-8 cursor-pointer text-green-500 hover:scale-125 transition-transform"
          />
          <IoMailOpenOutline
            onClick={() => window.open("mailto:gauravrathour0786@gmail.com")}
            className="w-8 h-8 cursor-pointer text-blue-500 hover:scale-125 transition-transform"
          />
          <SiGithub
            onClick={() => window.open("https://github.com/H4CK3R-CODING")}
            className="w-8 h-8 cursor-pointer text-gray-200 hover:scale-125 transition-transform"
          />
          <SiLinkedin
            onClick={() =>
              window.open("https://www.linkedin.com/in/gaurav-rathour-85b878264/")
            }
            className="w-8 h-8 cursor-pointer text-sky-500 hover:scale-125 transition-transform"
          />
        </div>
      </motion.div>

      {/* About Developer */}
      <motion.p
        initial="hidden"
        animate="visible"
        custom={0.5}
        variants={fadeInUp}
        className="max-w-3xl text-center text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
      >
        Hi 👋, I’m <span className="font-semibold">Gaurav</span>, a{" "}
        <span className="text-indigo-500 font-semibold">
          passionate full-stack developer
        </span>{" "}
        from India. I love building{" "}
        <span className="text-purple-500 font-semibold">modern web apps</span>{" "}
        with clean UI/UX, real-time features, and scalable backend systems. My
        interests also lie in{" "}
        <span className="text-green-500 font-semibold">
          cloud computing & cyber security
        </span>
        . Always eager to learn, create, and collaborate 🌟.
      </motion.p>

      {/* Call To Action */}
      <motion.p
        initial="hidden"
        animate="visible"
        custom={0.6}
        variants={fadeInUp}
        className="max-w-2xl text-center text-xl font-medium text-indigo-600 dark:text-indigo-400 mt-6"
      >
        💡 If you want to <span className="font-bold">develop a website</span> or{" "}
        <span className="font-bold">create an app for your business</span>, feel
        free to <span className="underline cursor-pointer">contact me</span> 🚀
      </motion.p>

      {/* Skills / Feature Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full"
        initial="hidden"
        animate="visible"
        custom={0.7}
        variants={fadeInUp}
      >
        {skills.map((skill, index) => (
          <motion.div
            key={index}
            className={`flex flex-col p-6 rounded-3xl bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-xl border border-white/30 dark:border-gray-700 cursor-pointer will-change-transform`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index, type: "spring", stiffness: 100 }}
            whileHover={{
              rotateX: 2,
              rotateY: -2,
              scale: 1.05,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
          >
            <div
              className={`w-12 h-12 flex items-center justify-center text-2xl rounded-full bg-gradient-to-r ${skill.color} text-white mb-4`}
            >
              {skill.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {skill.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{skill.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Developer;

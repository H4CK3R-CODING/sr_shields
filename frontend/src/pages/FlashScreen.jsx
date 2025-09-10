import React from "react";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import rocketAnimation from "../assets/rocket.json"; // Lottie file

const FlashScreen = () => {
  return (
    <div
      className="relative flex flex-col justify-center items-center h-screen 
      bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500
      dark:from-blue-300 dark:via-purple-400 dark:to-pink-400 overflow-hidden"
    >
      {/* Background Floating Stars */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute bg-white rounded-full opacity-70"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Animated Rocket */}
      <motion.div
        initial={{ scale: 0, y: 200, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]"
        >
          <Lottie
            animationData={rocketAnimation}
            loop={true}
            style={{ height: 260, width: 260 }}
          />
        </motion.div>
      </motion.div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-6 text-white text-2xl font-semibold tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
      >
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Launching...
        </motion.span>
      </motion.p>
    </div>
  );
};

export default FlashScreen;

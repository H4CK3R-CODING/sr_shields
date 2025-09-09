import React from "react";
import Lottie from "lottie-react";
import rocketAnimation from "../assets/rocket.json"; // download JSON from LottieFiles

const FlashScreen = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-sky-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <Lottie
        animationData={rocketAnimation}
        loop={true}
        style={{ height: 300, width: 300 }}
      />
    </div>
  );
};

export default FlashScreen;

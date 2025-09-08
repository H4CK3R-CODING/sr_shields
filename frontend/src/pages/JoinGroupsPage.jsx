import React, { useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const JoinGroupsPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      {/* Title */}
      <h1
        className="text-4xl font-bold mb-6 text-center text-green-600 dark:text-green-400"
        data-aos="fade-down"
      >
        Join Our WhatsApp Community
      </h1>

      {/* Intro Content */}
      <p
        className="text-center text-lg text-gray-700 dark:text-gray-300 mb-10"
        data-aos="fade-up"
      >
        Stay connected with our community! 🚀  
        Join our WhatsApp groups to get the latest announcements, important
        updates, job opportunities, and event notifications directly on your
        phone.  
        <br />
        Choose a group below and become part of our growing network. 💬
      </p>

      {/* Groups Section */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Group 1 */}
        <a
          href="https://chat.whatsapp.com/YOUR_GROUP_LINK_1"
          target="_blank"
          rel="noopener noreferrer"
          data-aos="zoom-in"
          className="block p-6 rounded-2xl relative bg-gradient-to-r 
                     from-green-400 via-green-500 to-green-600 
                     text-white font-semibold shadow-lg 
                     hover:shadow-2xl transition-all duration-500 cursor-pointer"
        >
          <FaWhatsapp className="text-4xl mb-2" />
          <h3 className="text-lg">WhatsApp Group 1</h3>
          <p className="text-sm opacity-90">
            Get instant notifications about updates, forms, and events.
          </p>
        </a>

        {/* Group 2 */}
        <a
          href="https://chat.whatsapp.com/YOUR_GROUP_LINK_2"
          target="_blank"
          rel="noopener noreferrer"
          data-aos="zoom-in"
          className="block p-6 rounded-2xl relative bg-gradient-to-r 
                     from-green-400 via-green-500 to-green-600 
                     text-white font-semibold shadow-lg 
                     hover:shadow-2xl transition-all duration-500 cursor-pointer"
        >
          <FaWhatsapp className="text-4xl mb-2" />
          <h3 className="text-lg">WhatsApp Group 2</h3>
          <p className="text-sm opacity-90">
            Join this group for discussions, Q&A, and community networking.
          </p>
        </a>
      </div>

      {/* Closing Note */}
      <div
        className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md text-center"
        data-aos="fade-up"
      >
        <h2 className="text-xl font-bold mb-2 text-green-600 dark:text-green-400">
          Why Join?
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          🔹 Be the first to know about announcements  
          🔹 Connect with like-minded peers  
          🔹 Stay informed about jobs, events & opportunities  
          🔹 Quick support and community engagement  
        </p>
      </div>
    </div>
  );
};

export default JoinGroupsPage;

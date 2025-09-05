import React from "react";

// Sample announcement data
const announcements = [
  { id: 1, title: "New Semester Registration Open", url: "/registration" },
  { id: 2, title: "Job Fair on 15th Sept", url: "/jobs" },
  { id: 3, title: "Hackathon Registration Deadline", url: "/hackathon" },
  { id: 4, title: "Guest Lecture on AI", url: "/lecture" },
  { id: 5, title: "Library Books Return Date Extended", url: "/library" },
];

const AnnouncementSection = () => {
  return (
    <div className="w-[80vw] max-w-[1200px] h-[400px] border rounded-3xl overflow-hidden shadow-2xl relative bg-white dark:bg-gray-900 mx-auto">
      <h2 className="text-3xl font-extrabold p-5 border-b dark:border-gray-700 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        📢 Announcements
      </h2>

      <div className="absolute top-[5.5rem] w-full h-[calc(100%-5.5rem)] overflow-hidden group">
        <div className="animate-scroll flex flex-col space-y-5 group-hover:pause">
          {announcements.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="block p-5 rounded-2xl bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 text-gray-800 dark:text-gray-100 font-semibold shadow-lg hover:scale-105 hover:from-blue-300 hover:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 transition-all duration-300 cursor-pointer"
            >
              {item.title}
            </a>
          ))}
          {/* Duplicate for seamless scrolling */}
          {announcements.map((item) => (
            <a
              key={item.id + "_duplicate"}
              href={item.url}
              className="block p-5 rounded-2xl bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 text-gray-800 dark:text-gray-100 font-semibold shadow-lg hover:scale-105 hover:from-blue-300 hover:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 transition-all duration-300 cursor-pointer"
            >
              {item.title}
            </a>
          ))}
        </div>
      </div>

      {/* Tailwind CSS animation */}
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateY(0%); }
            100% { transform: translateY(-50%); }
          }
          .animate-scroll {
            animation: scroll 25s linear infinite;
          }
          .group-hover\\:pause:hover {
            animation-play-state: paused;
          }
        `}
      </style>
    </div>
  );
};

export default AnnouncementSection;

import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// Sample announcements (replace with real data)
const allAnnouncements = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  title: `Announcement #${i + 1} - Important Update`,
  url: `/announcement/${i + 1}`,
}));

const ITEMS_PER_PAGE = 10;


const AnnouncementsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allAnnouncements.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = allAnnouncements.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
        Announcements
      </h1>

      {/* Page Numbers */}
      <div className="flex justify-center items-center mb-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageClick(i + 1)}
            className={`px-3 py-1 rounded-md font-semibold ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-300 dark:hover:bg-blue-600"
            } transition`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {currentItems.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl shadow-lg bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 dark:from-blue-700 dark:via-indigo-800 dark:to-purple-700 text-white font-semibold transition transform hover:scale-105 hover:shadow-2xl"
          >
            {item.title}
          </a>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 items-center">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-blue-300 dark:hover:bg-blue-600 transition disabled:opacity-50"
        >
          <FaArrowLeft /> Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-blue-300 dark:hover:bg-blue-600 transition disabled:opacity-50"
        >
          Next <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementsPage;

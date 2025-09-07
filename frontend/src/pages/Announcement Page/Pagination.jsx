import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between mt-6 items-center gap-2 sm:gap-0">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-blue-300 dark:hover:bg-blue-600 transition disabled:opacity-50 w-full sm:w-auto justify-center"
      >
        <FaArrowLeft /> Previous
      </button>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-blue-300 dark:hover:bg-blue-600 transition disabled:opacity-50 w-full sm:w-auto justify-center"
      >
        Next <FaArrowRight />
      </button>
    </div>
  );
};

export default Pagination;

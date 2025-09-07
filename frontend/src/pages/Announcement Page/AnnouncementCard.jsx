import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

const AnnouncementCard = ({ item, onEdit, onDelete }) => {
  return (
    <div
      className="p-4 rounded-xl shadow-lg bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 dark:from-blue-700 dark:via-indigo-800 dark:to-purple-700 text-white font-semibold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4"
      data-aos="fade-up"
    >
      <Link
        to={`/announcement/${item._id}`}
        rel="noopener noreferrer"
        className="flex-1"
      >
        {item.title} <span className="italic">({item.category})</span>
      </Link>
      <div className="flex gap-2 mt-2 sm:mt-0">
        <button
          onClick={() => onEdit(item._id)}
          className="px-3 py-1 bg-yellow-500 rounded-lg hover:bg-yellow-600 transition"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementCard;

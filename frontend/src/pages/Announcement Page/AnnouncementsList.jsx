import React from "react";
import SkeletonCard from "./SkeletonCard";
import AnnouncementCard from "./AnnouncementCard";

const AnnouncementsList = ({ announcements, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center mt-12 p-8 rounded-2xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg space-y-4"
      >
        <div className="text-6xl animate-bounce">📭</div>
        <h2 className="text-2xl font-bold">No Announcements Found</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-md">
          There are currently no announcements to display. Check back later or
          add a new announcement using the “Add Announcement” button above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((item) => (
        <AnnouncementCard
          key={item._id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AnnouncementsList;

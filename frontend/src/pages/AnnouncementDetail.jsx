import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaArrowLeft, FaLink, FaInfoCircle } from "react-icons/fa";

// Skeleton Loader
const SkeletonDetail = () => (
  <div className="max-w-3xl mx-auto my-12 p-6 bg-gray-200 dark:bg-gray-700 rounded-2xl shadow-lg animate-pulse space-y-4">
    <div className="h-10 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
    <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
    <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
    <div className="h-6 w-5/6 bg-gray-300 dark:bg-gray-600 rounded"></div>
  </div>
);

const AnnouncementDetail = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKENDURL}/api/v1/announcement/${id}`,
          { withCredentials: true }
        );
        setAnnouncement(data.data);
      } catch (error) {
        console.error("Failed to fetch announcement:", error);
      } finally {
        setLoading(false);
        AOS.refresh();
      }
    };
    fetchAnnouncement();
  }, [id]);

  if (loading) return <SkeletonDetail />;
  if (!announcement)
    return (
      <p className="text-center mt-12 text-gray-500 dark:text-gray-400 text-lg">
        Announcement not found.
      </p>
    );

  return (
    <div
      className="max-w-3xl mx-auto my-12 p-8 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
      data-aos="fade-up"
    >
      {/* Back Button */}
      <Link
        to="/announcements"
        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-6 hover:underline"
      >
        <FaArrowLeft /> Back to Announcements
      </Link>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-wide">
        {announcement.title}
      </h1>

      {/* Category Badge */}
      <span className="inline-block bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 font-semibold px-3 py-1 rounded-full text-sm mb-6">
        {announcement.category.toUpperCase()}
      </span>

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-lg leading-relaxed border-l-4 border-blue-400 dark:border-blue-500 pl-4 py-2 mb-6">
        {announcement.content}
      </p>

      {/* URLs */}
      {announcement.urls?.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FaLink /> Related Links:
          </h2>
          <ul className="space-y-2">
            {announcement.urls.map((u, index) => (
              <li key={index}>
                <Link
                  to={u.url}
                  className="block px-4 py-2 bg-blue-50 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                >
                  {u.heading || u.url}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta */}
      {announcement.meta?.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FaInfoCircle /> Additional Info:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {announcement.meta.map((m, index) => (
              <div
                key={index}
                className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
              >
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {m.key}:
                </span>{" "}
                <span className="text-gray-700 dark:text-gray-300">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementDetail;

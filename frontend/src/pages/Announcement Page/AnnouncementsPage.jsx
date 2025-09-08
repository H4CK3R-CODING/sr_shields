import React, { useState, useEffect } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaPlus } from "react-icons/fa";

import AnnouncementsList from "./AnnouncementsList";
import Pagination from "./Pagination";
import AnnouncementForm from "./AnnouncementForm";
import { useRecoilValue } from "recoil";
import { authState } from "../../recoil/globalAtom";

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const {user} = useRecoilValue(authState);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, filter, search]);
  // Refresh AOS whenever announcements change
  useEffect(() => {
    AOS.refresh(); // ensures dynamically added elements animate
  }, [announcements]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {
        category: filter !== "all" ? filter : undefined,
        search: search || undefined,
        page: currentPage,
        limit: 10,
      };
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKENDURL}/api/v1/announcement`,
        { params, withCredentials: true }
      );
      setAnnouncements(data.data || []);
      setTotalPages(data.pagination.pages || 1);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
      AOS.refresh(); // <-- refresh AOS after updating announcements
    }
  };

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handleAddClick = () => {
    setFormMode("create");
    setSelectedAnnouncementId(null);
    setShowForm(true);
  };
  const handleEditClick = (id) => {
    setFormMode("edit");
    setSelectedAnnouncementId(id);
    setShowForm(true);
  };
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKENDURL}/api/v1/announcement/${id}`,
          { withCredentials: true }
        );
        fetchAnnouncements();
      } catch (error) {
        console.error("Failed to delete announcement:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 px-4 relative">
      <h1
        className="text-4xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400"
        data-aos="fade-down"
      >
        Latest Updates
      </h1>

      {/* Top Controls */}
      <div
        className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"
        data-aos="fade-up"
      >
        {user?.role === "admin" && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition w-full sm:w-auto justify-center"
          >
            <FaPlus /> Add Announcement
          </button>
        )}

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-gray-200 w-full sm:w-auto"
        />

        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-gray-200 w-full sm:w-auto"
        >
          <option value="all">All</option>
          <option value="notice">Notice</option>
          <option value="update">Update</option>
          <option value="job">Jobs</option>
          <option value="form">Forms</option>
        </select>
      </div>

      <AnnouncementsList
        announcements={announcements}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* Form Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm z-40 pointer-events-none"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="rounded-xl w-full max-w-3xl shadow-lg flex flex-col max-h-[90vh]">
              <div className="overflow-y-auto p-6 flex-1">
                <AnnouncementForm
                  mode={formMode}
                  announcementId={selectedAnnouncementId}
                  onClose={() => setShowForm(false)}
                  onSuccess={() => {
                    setShowForm(false);
                    fetchAnnouncements();
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnnouncementsPage;

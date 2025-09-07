import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
// import InputField from "../components/InputField"; // Your reusable InputField component
import axios from "axios";
import { toast } from "react-hot-toast";
import InputField from "../../components/InputField";

const AnnouncementForm = ({ onClose, mode, announcementId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "notice",
    urls: [{ heading: "", link: "" }],
    meta: [{ key: "", value: "" }],
  });

  const [submitted, setSubmitted] = useState(false);

  // Fetch existing announcement data in edit mode
  useEffect(() => {
    if (mode === "edit" && announcementId) {
      const fetchAnnouncement = async () => {
        try {
          const { data } = await axios.get(
            `${
              import.meta.env.VITE_BACKENDURL
            }/api/v1/announcement/${announcementId}`,
            { withCredentials: true }
          );
          const announcement = data.data;

          const urls = announcement.urls?.map((u) => ({
            heading: u.heading || "",
            link: u.url || "",
          })) || [{ heading: "", link: "" }];

          const meta = announcement.meta?.length
            ? announcement.meta
            : [{ key: "", value: "" }];

          setFormData({
            title: announcement.title || "",
            content: announcement.content || "",
            category: announcement.category || "notice",
            urls,
            meta,
          });
        } catch (error) {
          console.error("Failed to fetch announcement:", error);
          toast.error("Failed to load announcement for editing.");
        }
      };
      fetchAnnouncement();
    }
  }, [mode, announcementId]);

  // Input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUrlChange = (index, e) => {
    const { name, value } = e.target;
    const newUrls = [...formData.urls];
    newUrls[index][name] = value;
    setFormData((prev) => ({ ...prev, urls: newUrls }));
  };

  const addUrl = () => {
    setFormData((prev) => ({
      ...prev,
      urls: [...prev.urls, { heading: "", link: "" }],
    }));
  };

  const handleMetaChange = (index, e) => {
    const { name, value } = e.target;
    const newMeta = [...formData.meta];
    newMeta[index][name] = value;
    setFormData((prev) => ({ ...prev, meta: newMeta }));
  };

  const addMeta = () => {
    setFormData((prev) => ({
      ...prev,
      meta: [...prev.meta, { key: "", value: "" }],
    }));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Filter and transform URLs
    const transformedUrls = formData.urls
      .filter((u) => u.link.trim()) // remove empty links
      .map((u) => ({
        heading: u.heading.trim() || "", // optional heading
        url: u.link.trim(), // required URL
      }));

    // 2️⃣ Filter meta fields (both key and value required)
    const filteredMeta = formData.meta
      .filter((item) => item.key.trim() && item.value.trim())
      .map((item) => ({
        key: item.key.trim(),
        value: item.value.trim(),
      }));

    // 3️⃣ Prepare final data for backend
    const finalData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      urls: transformedUrls.length ? transformedUrls : undefined, // optional
      meta: filteredMeta.length ? filteredMeta : undefined, // optional
      createdBy: formData.createdBy || undefined,
      isActive: formData.isActive || undefined,
    };


    try {
      const url =
        mode === "edit"
          ? `${
              import.meta.env.VITE_BACKENDURL
            }/api/v1/announcement/${announcementId}`
          : `${import.meta.env.VITE_BACKENDURL}/api/v1/announcement`;

      const method = mode === "edit" ? "put" : "post";

      const { data } = await axios({
        method,
        url,
        data: finalData,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      toast.success(data.message || "Announcement saved successfully!");
      setSubmitted(true);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error) {
      console.error("Announcement error:", error);
      toast.error(error.response?.data?.message || "Backend not responding.");
    }
  };

  return (
    <div className="pt-10 flex flex-col items-center justify-center px-6 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 blur-3xl opacity-70 -z-10 bg-gradient-to-br from-sky-400/20 via-indigo-500/10 to-purple-600/20" />

      <motion.div
        className="w-full max-w-3xl bg-white/90 dark:bg-black/50 backdrop-blur-xl border border-white/30 dark:border-gray-700 rounded-3xl shadow-2xl p-10 relative transition-colors duration-500 overflow-y-auto max-h-[90vh]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, rotateX: 4, rotateY: -4 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        {/* Close Button */}
        {onClose && (
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-red-500 hover:text-white transition-shadow shadow-md"
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            title="Close"
          >
            <FaTimes size={18} />
          </motion.button>
        )}

        <h2 className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          {mode === "edit" ? "Edit Announcement" : "Add Announcement"}
        </h2>

        {submitted && (
          <motion.p
            className="text-green-600 dark:text-green-400 text-center mb-5 font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ✅ Announcement has been {mode === "edit" ? "updated" : "added"}{" "}
            successfully!
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <InputField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter announcement title"
          />

          {/* Content */}
          <InputField
            label="Content"
            name="content"
            type="textarea"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Write announcement details..."
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-md"
            >
              <option value="notice">Notice</option>
              <option value="update">Update</option>
              <option value="job">Job</option>
              <option value="form">Form</option>
            </select>
          </div>

          {/* URLs */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              URLs
            </label>
            {formData.urls.map((url, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 mb-3">
                <input
                  type="text"
                  name="heading"
                  value={url.heading}
                  onChange={(e) => handleUrlChange(index, e)}
                  placeholder="Heading (e.g. Apply Link)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition shadow-md"
                />
                <input
                  type="url"
                  name="link"
                  value={url.link}
                  onChange={(e) => handleUrlChange(index, e)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition shadow-md"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addUrl}
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
            >
              ➕ Add another URL
            </button>
          </div>

          {/* Meta Fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Metadata (Key-Value)
            </label>
            {formData.meta.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 mb-3">
                <input
                  type="text"
                  name="key"
                  value={item.key}
                  onChange={(e) => handleMetaChange(index, e)}
                  placeholder="Key (e.g. Company)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition shadow-md"
                />
                <input
                  type="text"
                  name="value"
                  value={item.value}
                  onChange={(e) => handleMetaChange(index, e)}
                  placeholder="Value (e.g. TechCorp)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition shadow-md"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addMeta}
              className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline mt-2"
            >
              ➕ Add another field
            </button>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mode === "edit" ? "💾 Update Announcement" : "🚀 Add Announcement"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AnnouncementForm;

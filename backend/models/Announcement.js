import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true, // for dynamic routing like /announcement/:slug
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String, // e.g., "University", "Job", "Scholarship"
      default: "General",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String], // optional, for search/filter
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
